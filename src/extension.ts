import * as vscode from 'vscode';
import * as Tools from './util/';
import * as User from './util/user';
import * as Project from './util/project';
import path from 'path';
import { IMessage } from './index.d';
import StatusBarItem from './status-bar-item';
import getWebview from './webview';

export function activate(context: vscode.ExtensionContext) {
  let view: vscode.WebviewPanel | undefined = undefined;
  console.log('muse is active!');

  if (!Tools.checkWorkspace()) {
    return false;
  }

  // 初始化
  Project.initEnvrionmentInfo();
  Project.initProjectInfo(context);

  // 注册statusbar
  new StatusBarItem(context);

  // 注册命令
  context.subscriptions.push(
    // 启动webview
    vscode.commands.registerCommand('muse.webview', () => {
      view = getWebview(context);
    }),
    // 登录账号
    vscode.commands.registerCommand('muse.login', () => {
      User.login(context);
    }),
    // 发送信息到webview
    vscode.commands.registerCommand('muse.postInfo', (info) => {
      if (view) {
        view.webview.postMessage(info);
      }
    })

    // vscode.window.setStatusBarMessage('今天也要快乐鸭！~', 3000)
  );
}
