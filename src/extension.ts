import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "muse" is now active!');

  context.subscriptions.push(
    vscode.commands.registerCommand('muse.helloWorld', () => {
      vscode.window.showInformationMessage('Hello World from muse!');
    })
  );
}
