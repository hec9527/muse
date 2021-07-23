import * as vscode from 'vscode';
import { checkWorkspace, getCodeBranchFromRemote, getWebViewContent, initWebviewDate, publish } from './util/';
import path from 'path';
import { IMessage } from './index.d';
import StatusBarItem from './status-bar-item';
import getWebview from './webview';

export function activate(context: vscode.ExtensionContext) {
  let view: vscode.WebviewPanel | undefined = undefined;
  console.log('muse is active!');

  if (!checkWorkspace()) {
    return false;
  }

  // vscode.window.setStatusBarMessage('今天也要快乐鸭！~',3000);

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
      //
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('muse.postInfo', (info) => {
      if (view) {
        view.webview.postMessage(info);
      }
    })
  );

  // 注册命令
  // console.log("webview recive msg:", JSON.stringify(msg));
  // switch (msg.cmd) {
  //   case "updateUserInfo":
  //     context.globalState.update("userInfo", msg.data);
  //     vscode.commands.executeCommand("muse.postInfo", { cmd: "updateUserInfo", data: msg.data });
  //     break;
  //   case "showInfo":
  //     vscode.window.showErrorMessage(msg.data);
  //     break;
  //   case "publish":
  //     publish(context, msg.data);
  //     break;
  //   case "queryBranch":
  //     getCodeBranchFromRemote(msg.data);
  //     break;
  //   default:
  //     vscode.window.showWarningMessage(`未知的cmd类型:${(msg as any).cmd}`);
  //     break;
  // }
  // initWebviewDate(context);
}
