import * as vscode from "vscode";
import { getWebViewContent } from "./util/";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "muse" is now active!');
  let panel: vscode.WebviewPanel;

  context.subscriptions.push(
    vscode.commands.registerCommand("muse.start", () => {
      vscode.window.showInformationMessage("Hello World from muse!");

      panel = vscode.window.createWebviewPanel("musePanel", "muse", vscode.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true,
      });

      // panel.webview.html = getWebViewContent(context, './view/index.html');
      panel.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>muse</title>
        </head>
        <body>
          <!--  -->
          <!--  -->
          hello world
        </body>
      </html>
      `;
    })
  );
}
