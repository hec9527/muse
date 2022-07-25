import * as vscode from 'vscode';
import * as Types from './index.d';
import * as path from 'path';
import * as util from './util';
import * as cmd from './commands';
import * as fs from 'fs';
import api from './api';

type CacheItem = {
  title: string;
  env: Types.IEnvConfig;
  pages: string[];
  branch: string;
};

export default class ViewManager implements vscode.Disposable {
  private viewType = 'Muse';
  private viewTitle = 'muse';
  /** 可视化页面编译后的js */
  private distPath = 'dist/view.js';
  private webview: vscode.WebviewPanel | undefined;
  private workFolder: vscode.WorkspaceFolder;
  private envData: Types.IEnvInfo | undefined;
  private projectConfig: Types.IProjectConfig | undefined;
  private pageInfo: string[] = [];
  // 本地git分支
  private branch: string | undefined;
  private outputChannel = vscode.window.createOutputChannel('Muse');

  constructor(private context: vscode.ExtensionContext) {
    this.outputChannel.clear();
    const res = this.checkWorkSpace();
    if (res) {
      throw res;
    }
    // 不考虑多个workspace的情况
    this.workFolder = vscode.workspace.workspaceFolders![0];
    this.init();
    this.outputChannel.appendLine('[Start] muse is active!');
  }

  private checkWorkSpace() {
    if (!vscode.workspace.workspaceFolders) {
      return '请在目录中使用插件';
    } else {
      const pageRoot = path.join(vscode.workspace.workspaceFolders?.[0].uri.fsPath, 'src/p');
      if (!fs.existsSync(pageRoot) || !fs.statSync(pageRoot).isDirectory()) {
        return '未找到可以发布的页面，请在bid工具构建的项目中使用muse';
      }
    }
    return false;
  }

  private init() {
    this.bindCommand();
    this.initGitInfo();
    this.watchFile();
    this.initEnvInfo();
    this.initProjectInfo();
    this.initPageInfo();
  }

  private watchFile() {
    fs.watchFile(path.join(this.workFolder.uri.fsPath, 'config.json'), () => {
      this.initProjectInfo();
      this.postProjectInfo();
      this.initPageInfo();
      this.postPageInfo();
    });
    fs.watchFile(path.join(this.workFolder.uri.fsPath, '.git/HEAD'), () => {
      this.initGitInfo();
    });
  }

  private initEnvInfo() {
    return api
      .request<Types.IEnvInfo>({ url: api.URL.getEnvInfo, method: 'post' })
      .then(res => {
        console.log('环境信息：', JSON.stringify(res));
        this.outputChannel.appendLine(`\n[环境信息]\n${JSON.stringify(res)}`);
        if (res) {
          this.envData = res;
        }
      })
      .catch(() => {
        console.error(`获取数据失败:${api.URL.getEnvInfo}`);
      });
  }

  private initProjectInfo() {
    const option = { encoding: 'utf-8' };
    const fPath = path.join(this.workFolder.uri.fsPath, 'config.json');
    if (!fs.existsSync(fPath) || !fs.statSync(fPath).isFile) {
      return this.showMessage('项目中未找到config.json');
    }
    const file = fs.readFileSync(path.join(this.workFolder.uri.fsPath, 'config.json'), option);
    console.log('config.json', JSON.parse(file));
    this.projectConfig = JSON.parse(file);
  }

  private initPageInfo() {
    const { version } = this.projectConfig!;
    const pageRoot = path.join(this.workFolder.uri.fsPath, 'src/p');
    const pages: string[] = [];

    // 递归查找项目src/p目录
    const searchDir = (root: string) => {
      try {
        fs.readdirSync(root).forEach(fileOrDir => {
          const subPath = path.join(root, fileOrDir);
          const state = fs.statSync(subPath);
          if (state.isDirectory()) {
            return searchDir(subPath);
          } else if (state.isFile() && /index\.html$/.test(fileOrDir)) {
            const relativeDir = /\/(src\/p.*)\/index\.html$/.exec(subPath);
            if (relativeDir && relativeDir[1]) {
              pages.push(`${relativeDir[1]}/${version}/index`);
            }
          }
        });
      } catch (error) {
        vscode.window.showErrorMessage(error as string);
      }
    };

    searchDir(pageRoot);

    this.pageInfo = pages.sort();
  }

  private initGitInfo() {
    this.getGitBranch()
      .then(branch => {
        console.log('git分支:', branch);
        this.outputChannel.appendLine(`\n[Git分支] ${branch}`);
        this.branch = branch;
      })
      .catch(error => {
        this.showMessage(error, 'error');
      });
  }

  private bindCommand() {
    const showWebview = vscode.commands.registerCommand(cmd.webview, () => this.getWebview());
    const postInfo = vscode.commands.registerCommand(cmd.postInfo, info => {
      if (this.webview) {
        this.webview.webview.postMessage(info);
      }
    });

    this.context.subscriptions.push(showWebview, postInfo);
  }

  private bindWebviewReceiveMessage() {
    this.webview!.webview.onDidReceiveMessage((msg: Types.IWebviewMessage) => {
      console.log('来自webview的消息:', msg);
      this.outputChannel.appendLine(`\n[来自webview的消息]\n${JSON.stringify(msg)}`);

      switch (msg.cmd) {
        case 'GET_ENV_INFO':
          this.postEnvInfo(msg.refresh);
          break;
        case 'GET_PAGE_INFO':
          this.postPageInfo(msg.refresh);
          break;
        case 'GET_PROJECT_INFO':
          this.postProjectInfo();
          break;
        case 'GET_EXTENSION_CONFIG':
          this.postExtensionConfig();
          break;
        case 'SHOW_MESSAGE':
          this.showMessage(msg.data);
          break;
        case 'SHOW_CACHE_LIST':
          this.showCashList();
          break;
        case 'SAVE_CACHE_INFO':
          this.saveCacheList(msg.data);
          break;
        case 'DELETE_CACHE_INFO':
          this.deleteCacheList();
          break;
        case 'QUERY_ONLINE_CODE_BRANCH':
          this.queryOnlineCodeBranch(msg.data);
          break;
        case 'PUBLISH_CODE':
          this.publishCode(msg.data);
          break;
        default:
          console.error('未知的消息类型');
          this.outputChannel.appendLine('[未知类型]');
      }
    });
  }

  private postInfo(info: Types.IExtensionMessage) {
    return vscode.commands.executeCommand(cmd.postInfo, info);
  }

  private async postEnvInfo(refresh?: boolean) {
    if (!this.envData || refresh) {
      await this.initEnvInfo();
    }
    this.postInfo({
      cmd: 'UPDATE_ENV_INFO',
      data: {
        envFilter: [
          { name: '日常环境', key: 'daily' },
          { name: '灰度环境', key: 'gray' },
          { name: '线上环境', key: 'productionNoTag' },
        ],
        data: this.envData!,
      },
    });
  }

  private postPageInfo(refresh?: boolean) {
    const hideDisabledFilter = this.context.globalState.get<boolean>('hideDisabledFilter') || false;
    if (refresh) {
      this.initPageInfo();
    }
    this.postInfo({
      cmd: 'UPDATE_PAGE_INFO',
      data: {
        pages: this.pageInfo,
        hideDisabledFilter,
      },
    });
  }

  private postProjectInfo() {
    const { appName, version } = this.projectConfig || {};
    this.postInfo({
      cmd: 'UPDATE_PROJECT_INFO',
      data: {
        appName,
        version,
      },
    });
  }

  private postExtensionConfig() {
    const data = vscode.workspace.getConfiguration('muse') as Types.IExtensionConfig;
    this.postInfo({
      cmd: 'UPDATE_EXTENSION_CONFIG',
      data,
    });
  }

  private async queryOnlineCodeBranch(queryInfo: { env: Types.IEnvConfig; pages: string[] }) {
    if (!this.projectConfig) return Promise.resolve([]);
    const data = await util.getOnlineCodeBranch(queryInfo, this.projectConfig);
    console.log('查询结果', data);
    this.outputChannel.appendLine(`\n[在线分支查询]\n${JSON.stringify(data)}`);
    this.postInfo({
      cmd: 'UPDATE_QUERY_CODE_BRANCH_RESULT',
      data,
    });
  }

  private inputUserInfo() {
    return new Promise<Types.IUserInfo>((resolve, reject) => {
      util.inputUserInfo().then(info => {
        if (!util.checkUserInfo(info)) {
          this.showMessage('输入错误，稍后请重新输入');
          reject();
        } else {
          this.context.globalState.update('userInfo', info).then(() => {
            resolve(info as Types.IUserInfo);
          });
        }
      });
    });
  }

  private getCacheData() {
    const CacheData = this.context.globalState.get<{ [K in string]: CacheItem[] }>('cacheData') || {};
    const appName = this.projectConfig?.appName;
    if (!appName) {
      throw '未知的项目名称，请检查项目中的config.json文件';
    }
    console.log('缓存数据', { CacheData, appName });
    this.outputChannel.appendLine(`\n[读取缓存数据]\n${JSON.stringify({ CacheData, appName })}`);

    return [CacheData || {}, appName] as const;
  }

  private async saveCacheList(data: Pick<CacheItem, 'env' | 'pages'>) {
    const placeholder = util.formatDate('yyyy/MM/dd hh:mm:ss ') + data.env.name;
    const title = await vscode.window.showInputBox({
      value: placeholder,
      ignoreFocusOut: false,
      placeHolder: '请输入保存数据的标题',
      prompt: '给保存的数据起一个名字吧~~ ',
    });
    if (title) {
      try {
        const [CacheItems, appName] = this.getCacheData();
        const branch = this.branch;
        this.context.globalState
          .update('cacheData', {
            ...CacheItems,
            [appName]: [...(CacheItems[appName] || []), { title, ...data, branch }],
          })
          .then(() => this.showMessage('保存成功', 'info'));
      } catch (error) {
        return this.showMessage(error as string, 'error');
      }
    }
  }

  private async showCashList() {
    try {
      const [cacheData, appName] = this.getCacheData();
      const cacheList = cacheData[appName] || [];
      if (!cacheList.length) {
        return this.showMessage('没有找到保存的发布数据~', 'warn');
      }
      const title = await vscode.window.showQuickPick(
        cacheList.map(c => c.title),
        {
          placeHolder: '请选择将要发布的缓存数据',
          ignoreFocusOut: false,
          canPickMany: false,
        }
      );
      if (title) {
        const data = cacheList.find(c => c.title === title);
        const branch = this.branch || '';
        if (data) {
          if (data.branch !== branch) {
            const res = await this.showConfirmMessage(
              `当前分支(${branch})和缓存数据时分支(${data.branch})不同，是否继续发布?`,
              '继续发布',
              '取消发布'
            );
            if (res !== '继续发布') {
              return false;
            }
          }
          // 当前分支和保存发布信息时的分支不同时，无法选择页面，这里做一下替换，比如保存信息时在0.0.1分支，但是现在我们在0.0.2分支，替换后才能选择页面快速发布
          data.pages = data.pages.map(p => p.replace(/\/((\d+\.?)*)\//, `/${branch}/`));
          // console.log({ data });
          this.postInfo({ cmd: 'QUICK_PUBLISH', data });
        }
      }
    } catch (error) {
      this.showMessage(error as string, 'error');
    }
  }

  private async deleteCacheList() {
    try {
      const [CacheDate, appName] = this.getCacheData();
      const CacheList = CacheDate[appName] || [];

      if (!CacheList.length) {
        return this.showMessage('没有找到可以删除的发布记录', 'info');
      }

      const titles = await vscode.window.showQuickPick(
        CacheList.map(c => c.title),
        {
          placeHolder: '请选择要删除的发布记录',
          canPickMany: true,
          ignoreFocusOut: false,
        }
      );
      if (titles?.length) {
        this.context.globalState
          .update('cacheData', {
            ...CacheDate,
            [appName]: CacheList.filter(c => !titles.includes(c.title)),
          })
          .then(() => this.showMessage('删除成功', 'info'));
      }
    } catch (error) {
      return this.showMessage(error as string, 'error');
    }
  }

  private async publishCode(data: { env: Types.IEnvConfig; pages: string[] }) {
    let userInfo = this.context.globalState.get<Types.IUserInfo>('userInfo');

    if (!this.branch) {
      this.branch = await this.getGitBranch();
    }
    if (this.branch !== this.projectConfig?.version) {
      const res = await this.showConfirmMessage(
        `当前git所在分支(${this.branch})和config.json分支(${this.projectConfig?.version})不一致，是否继续发布（采用config.json分支）`,
        '继续发布',
        '取消发布'
      );
      if (res !== '继续发布') {
        return;
      }
    }

    if (!util.checkUserInfo(userInfo)) {
      userInfo = await this.inputUserInfo();
      if (!util.checkUserInfo(userInfo)) {
        return;
      }
    }

    util.publishCode(data, this.projectConfig!, userInfo as Types.IUserInfo).then(
      res => {
        this.outputChannel.appendLine(`\n[发布成功] ${res}`);
        const openInBrowser = () => vscode.env.openExternal(vscode.Uri.parse(res));
        const { publishAction } = vscode.workspace.getConfiguration('muse') as Types.IExtensionConfig;
        const fileName = res.split('?')?.[1].substring(2) || '';

        switch (publishAction) {
          case 'default':
            this.showConfirmMessage('发布成功是否立即查看日志？', '浏览器中查看', '监听日志(实验中)').then(res => {
              if (res === '浏览器中查看') {
                openInBrowser();
              } else if (res === '监听日志(实验中)') {
                this.detectPublishLogo(fileName);
              }
            });
            break;
          case 'detectLogo':
            this.detectPublishLogo(fileName);
            break;
          case 'openInBrowse':
            openInBrowser();
            break;
          case 'none':
            break;
          default:
            // eslint-disable-next-line
            const NEVER: never = publishAction;
            console.log(NEVER);
        }
      },
      reason => {
        console.log({ reason });
        this.outputChannel.appendLine(`\n[发布失败] ${JSON.stringify({ reason })}}`);
        if (typeof reason === 'number' && reason === 403) {
          // 输入成功后重新发布
          this.showMessage('权限不足，请重新输入用户名和密码', 'error');
          this.inputUserInfo().then(() => this.publishCode(data));
        } else if (typeof reason === 'string') {
          this.showMessage(reason, 'error');
        }
      }
    );
  }

  private showMessage(message: string): void;
  private showMessage(message: string, type: Types.INoticeType): void;
  private showMessage(data: { message: string; type: Types.INoticeType }): void;
  private showMessage(data: string | { message: string; type: Types.INoticeType }): void;
  private showMessage(message: string | { message: string; type: Types.INoticeType }, type?: Types.INoticeType) {
    if (typeof message === 'object') {
      type = message.type;
      message = message.message;
    }
    if (typeof type === 'undefined') {
      type = 'info';
    }
    const types = {
      error: 'showErrorMessage',
      info: 'showInformationMessage',
      warn: 'showWarningMessage',
    } as const;
    vscode.window[types[type]](message);
  }

  private detectPublishLogo(fileName: string) {
    util.detectPublishLogo(this.context, fileName).then(res => {
      console.log('%c 获取结果', 'color: abf', res);
      const data: Types.ISystemNoticeInfo = {
        title: '发布失败',
        subTitle: '',
        type: 'error',
      };

      switch (res.type) {
        case 'keyword':
          data.subTitle = `发布失败，关键字匹配：${res.data}`;
          break;
        case 'statusError':
        case 'success':
          data.subTitle = res.data;
          res.type === 'success' && (data.title = '发布成功');
          break;
        case 'tokenError':
          data.subTitle = `token校验失败${res.data}`;
          break;
        default:
          const NEVER: never = res.type;
          console.log(NEVER);
      }

      this.showMessage({ message: data.subTitle, type: data.type });

      // TODO 系统通知
      // const { publishResultNoticeType } = vscode.workspace.getConfiguration('muse') as Types.IExtensionConfig;

      // if (publishResultNoticeType === 'integration') {
      //   this.showMessage({ message: data.subTitle, type: data.type });
      // } else {
      //   util.showSystemNotice(data);
      // }
    });
  }

  private async showConfirmMessage(message: string, ...items: string[]) {
    return new Promise<string | undefined>(resolve => {
      vscode.window.showInformationMessage(message, ...items).then(res => {
        resolve(res);
      });
    });
  }

  private async getGitBranch() {
    return util.getCurrentBranch(path.join(this.workFolder.uri.fsPath, '.git'));
  }

  private getWebview() {
    if (this.webview) {
      this.webview.reveal(vscode.ViewColumn.One);
      return this.webview;
    }
    const resourceJsPath = vscode.Uri.file(path.join(this.context.extensionPath, this.distPath))
      .with({ scheme: 'vscode-resource' })
      .toString();
    this.webview = vscode.window.createWebviewPanel(this.viewType, this.viewTitle, vscode.ViewColumn.One, {
      enableScripts: true,
      enableFindWidget: true,
      enableCommandUris: true,
      retainContextWhenHidden: true,
    });
    this.webview.iconPath = vscode.Uri.file(path.join(this.context.extensionPath, 'logo.png'));
    this.webview.webview.html = this.getWebviewHtml(resourceJsPath);
    this.webview.onDidDispose(() => {
      this.webview = undefined;
    });
    this.bindWebviewReceiveMessage();
  }

  private getWebviewHtml(path: string) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>muse</title>
      </head>
      <body>
        <div id="app" />
        <script src="${path}"></script>
      </body>
      </html>`;
    return html;
  }

  public dispose() {
    this.webview?.dispose();
  }
}
