import * as vscode from "vscode";
import axios from "./api";
import { IUserInfo } from "..";

const LOGIN_URL = "";

const USERINFO_STORAGE_KEY = "userInfo";

async function inputUserInfo(): Promise<Partial<IUserInfo>> {
  const userName = await vscode.window.showInputBox({
    password: false,
    ignoreFocusOut: false,
    placeHolder: "请输入用户名",
    prompt: "1/2: 输入tools系统用户名，发布和查看日志需要登录",
  });

  const passwd = await vscode.window.showInputBox({
    password: true,
    ignoreFocusOut: true,
    placeHolder: "请输入密码",
    prompt: "2/2: 用户名、密码自动保存在vscode插件中，只需登录一次",
  });
  return { userName, passwd };
}

async function login(userInfo: IUserInfo) {
  //
}

export async function userLogin(context: vscode.ExtensionContext) {
  let userInfo = context.globalState.get<IUserInfo>(USERINFO_STORAGE_KEY);
  if (!userInfo) {
    const info = await inputUserInfo();
    if (!info.userName) {
      return vscode.window.showErrorMessage("输入的用户名为空");
    } else if (!info.passwd) {
      return vscode.window.showErrorMessage("输入的密码为空");
    }
    userInfo = info as IUserInfo;
    context.globalState.update(USERINFO_STORAGE_KEY, userInfo);
  }
  login(userInfo);
}
