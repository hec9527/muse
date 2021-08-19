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
};

export default class ViewManager implements vscode.Disposable {
  private viewType = 'Muse';
  private viewTitle = 'muse';
  /** 可视化页面编译后的js */
  private distPath = 'dist/webview/main.js';
  private webview: vscode.WebviewPanel | undefined;
  private workFolder: vscode.WorkspaceFolder;
  private envData: Types.IEnvInfo | undefined;
  private projectConfig: Types.IProjectConfig | undefined;
  private pageInfo: string[] = [];

  constructor(private context: vscode.ExtensionContext) {
    const res = this.checkWorkSpace();
    if (res) {
      throw res;
    }
    // 不考虑多个workspace的情况
    this.workFolder = vscode.workspace.workspaceFolders![0];
    this.init();
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
    this.watchProjectConfig();
    this.initEnvInfo();
    this.initProjectInfo();
    this.initPageInfo();
  }

  private watchProjectConfig() {
    fs.watchFile(path.join(this.workFolder.uri.fsPath, 'config.json'), () => {
      this.initProjectInfo();
      this.initPageInfo();
      this.postPageInfo();
    });
  }

  private initEnvInfo() {
    api.request<{ data: Types.IEnvInfo }>({ url: api.URL.getEnvInfo, method: 'post' }).then((res) => {
      console.log('环境信息：', res);
      if (res) {
        this.envData = res.data;
      }
    });
  }

  private initProjectInfo() {
    const option = { encoding: 'utf-8' };
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
        fs.readdirSync(root).forEach((fileOrDir) => {
          const subPath = path.join(root, fileOrDir);
          const state = fs.statSync(subPath);
          if (state.isDirectory()) {
            return searchDir(subPath);
          } else if (state.isFile() && /\.html$/.test(fileOrDir)) {
            const relativeDir = /\/(src\/p.*)\/.*?\.html$/.exec(subPath);
            if (relativeDir && relativeDir[1]) {
              pages.push(`${relativeDir[1]}/${version}/index`);
            }
          }
        });
      } catch (error) {
        vscode.window.showErrorMessage(error);
      }
    };

    searchDir(pageRoot);

    this.pageInfo = pages.sort();
  }

  private bindCommand() {
    const showWebview = vscode.commands.registerCommand(cmd.webview, () => this.getWebview());
    const postInfo = vscode.commands.registerCommand(cmd.postInfo, (info) => {
      if (this.webview) {
        this.webview.webview.postMessage(info);
      }
    });

    this.context.subscriptions.push(showWebview, postInfo);
  }

  private bindWebviewReceiveMessage() {
    this.webview!.webview.onDidReceiveMessage((msg: Types.IWebviewMessage) => {
      console.log('来自webview的消息:', msg);

      switch (msg.cmd) {
        case 'GET_ENV_INFO':
          this.postEnvInfo();
          break;
        case 'GET_PAGE_INFO':
          this.postPageInfo();
          break;
        case 'GET_PROJECT_INFO':
          this.postProjectInfo();
          break;
        case 'SHOW_MESSAGE':
          if (typeof msg.data === 'string') {
            this.showMessage(msg.data);
          } else {
            this.showMessage(msg.data.message, msg.data.type);
          }
          break;
        case 'SHOW_CACHE_LIST':
          this.showCashList();
          break;
        case 'SAVE_CACHE_INFO':
          this.saveCacheList(msg.data);
          break;
        case 'QUERY_ONLINE_CODE_BRANCH':
          this.queryOnlineCodeBranch();
          break;
        case 'PUBLISH_CODE':
          break;
        default:
          console.error('未知的消息类型');
      }
    });
  }

  private postInfo(info: Types.IExtensionMessage) {
    return vscode.commands.executeCommand(cmd.postInfo, info);
  }

  private postEnvInfo() {
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

  private postPageInfo() {
    const hideDisabledFilter = this.context.globalState.get<boolean>('hideDisabledFilter') || false;
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

  private queryOnlineCodeBranch() {
    //
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
      const CacheItem = this.context.globalState.get<{ [K in string]: CacheItem[] }>('cacheData') || {};
      const appName = this.projectConfig?.appName;
      if (!appName) {
        return this.showMessage('未知的项目名称，请检查项目中的config.json文件', 'error');
      }
      this.context.globalState
        .update('cacheData', {
          ...CacheItem,
          [appName]: [...(CacheItem[appName] || []), { title, ...data }],
        })
        .then(() => {
          this.showMessage('保存成功', 'info');
        });
    }
  }

  private async showCashList() {
    const appName = this.projectConfig?.appName;
    if (!appName) {
      return this.showMessage('未知的项目名称，请检查项目中的config.json文件', 'error');
    }

    const cacheData = this.context.globalState.get<{ [K in string]: CacheItem[] }>('cacheData') || {};
    const cacheList = cacheData[appName] || [];

    console.log('cacheData', cacheData);

    if (!cacheList.length) {
      return this.showMessage('没有找到保存的发布数据~', 'warning');
    }
    const title = await vscode.window.showQuickPick(
      cacheList.map((c) => c.title),
      {
        placeHolder: '请选择将要发布的缓存数据',
        ignoreFocusOut: false,
        canPickMany: false,
      }
    );
    if (title) {
      const item = cacheList.find((c) => c.title === title);
      if (item) {
        this.postInfo({
          cmd: 'QUICK_PUBLISH',
          data: item,
        });
      }
    }
  }

  private showMessage(message: string, type: Types.INoticeType = 'info') {
    const types = {
      error: 'showErrorMessage',
      info: 'showInformationMessage',
      warning: 'showWarningMessage',
    } as const;
    vscode.window[types[type]](message);
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
