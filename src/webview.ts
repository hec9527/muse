import * as vscode from 'vscode';
import path from 'path';
import { IMessage } from './index.d';

let view: vscode.WebviewPanel | undefined = undefined;

export default function getWebview(context: vscode.ExtensionContext): vscode.WebviewPanel {
  if (view) {
    view.reveal(vscode.ViewColumn.One);
    return view;
  }

  view = vscode.window.createWebviewPanel('Muse', 'muse', vscode.ViewColumn.One, {
    enableScripts: true,
    enableFindWidget: true, // 启用搜索部件
    retainContextWhenHidden: true,
  });
  view.iconPath = vscode.Uri.file(path.join(context.extensionPath, 'logo.png'));
  view.webview.html = getWebviewHtml(context);

  view.webview.onDidReceiveMessage((msg: IMessage) => {
    console.info('vscode extension recice msg:', JSON.stringify(msg));
    switch (msg.cmd) {
      default:
        break;
    }
  });

  view.onDidDispose(() => (view = undefined), null, context.subscriptions);
  return view;
}

function getWebviewHtml(context: vscode.ExtensionContext) {
  const resourcePath = path.join(context.extensionPath, 'dist/main.js');
  const resourceUrl = vscode.Uri.file(resourcePath).with({ scheme: 'vscode-resource' }).toString();

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
        <script src="${resourceUrl}"></script>
      </body>
      </html>`;
  return html;
}
