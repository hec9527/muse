import * as vscode from 'vscode';
import * as Types from './index.d';
import * as path from 'path';
import * as cmd from './commands';
import * as fs from 'fs';
import api from './api';

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
        default:
          console.log('未知的消息类型');
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
    const hideDisabledFilter = this.context.workspaceState.get<boolean>('hideDisabledFilter') || false;
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
