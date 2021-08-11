import * as vscode from 'vscode';

export default class StatusBarItem {
  constructor(context: vscode.ExtensionContext) {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    statusBarItem.text = '$(squirrel) Muse';
    statusBarItem.command = 'muse.webview';
    statusBarItem.tooltip = 'publish code with muse';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
  }
}
