import * as vscode from 'vscode';
import StatusBarItem from './status-bar-item';
import ViewManager from './viewManager';

export async function activate(context: vscode.ExtensionContext) {
  console.log('muse is active');

  try {
    new ViewManager(context);
  } catch (error) {
    vscode.window.showErrorMessage(error);
    console.log(error);
  }

  new StatusBarItem(context);
}
