import * as vscode from "vscode";
import { checkWorkspace, getCodeBranchFromRemote, getWebViewContent, initWebviewDate, publish } from "./util/";
import path from "path";
import { IMessage } from "./index.d";

export function activate(context: vscode.ExtensionContext) {
  let panel: vscode.WebviewPanel | undefined = undefined;
  console.log("muse is active!");

  if (!checkWorkspace()) {
    return false;
  }

  // 注册statusbar
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
  statusBarItem.text = "$(squirrel) Muse";
  statusBarItem.command = "muse.start";
  statusBarItem.tooltip = "publish code with muse";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
  // 注册命令
  context.subscriptions.push(
    vscode.commands.registerCommand("muse.start", () => {
      if (panel) {
        return panel.reveal(vscode.ViewColumn.One);
      }
      panel = vscode.window.createWebviewPanel("musePanel", "muse", vscode.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true,
      });

      panel.iconPath = vscode.Uri.file(path.join(context.extensionPath, "logo.png"));
      panel.onDidDispose(() => (panel = undefined), null, context.subscriptions);
      panel.webview.html = getWebViewContent(context, "view/index.html");
      panel.webview.onDidReceiveMessage((msg: IMessage) => {
        console.log("webview recive msg:", JSON.stringify(msg));
        switch (msg.cmd) {
          case "updateUserInfo":
            context.globalState.update("userInfo", msg.data);
            vscode.commands.executeCommand("muse.postInfo", { cmd: "updateUserInfo", data: msg.data });
            break;
          case "showInfo":
            vscode.window.showErrorMessage(msg.data);
            break;
          case "publish":
            publish(context, msg.data);
            break;
          case "queryBranch":
            getCodeBranchFromRemote(msg.data);
            break;
          default:
            vscode.window.showWarningMessage(`未知的cmd类型:${(msg as any).cmd}`);
            break;
        }
      });
      initWebviewDate(context);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("muse.postInfo", (info) => {
      console.log("executeCommand command muse.postInfo", JSON.stringify(info));
      if (panel) {
        panel.webview.postMessage(info);
      }
    })
  );
}
