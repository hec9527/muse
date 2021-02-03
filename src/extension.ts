import * as vscode from "vscode";
import { getWebViewContent, initWebviewDate } from "./util/";
import { IMessage } from "./index.d";

export function activate(context: vscode.ExtensionContext) {
  console.log('"muse" is active!');
  let panel: vscode.WebviewPanel;

  context.subscriptions.push(
    vscode.commands.registerCommand("muse.start", () => {
      panel = vscode.window.createWebviewPanel("musePanel", "muse", vscode.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true,
      });

      panel.webview.html = getWebViewContent(context, "src/view/index.html");
      initWebviewDate(context);
      panel.webview.onDidReceiveMessage((msg: IMessage) => {
        console.log("webview recive msg:", JSON.stringify(msg));
        switch (msg.cmd) {
          case "updateUserInfo":
            context.globalState.update("userInfo", msg.data);
            break;
          case "showInfo":
            vscode.window.showErrorMessage(msg.data);
            break;
          default:
            vscode.window.showWarningMessage(`未知的cmd类型:${(msg as any).cmd}`);
            break;
        }
      });
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
