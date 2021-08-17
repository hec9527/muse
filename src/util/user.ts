import * as vscode from 'vscode';
import * as Types from '../index.d';
import SHA256 from 'sha256';
import hex_md5 from 'md5';
import { IUserInfo } from '..';

const USERINFO_STORAGE_KEY = 'userInfo';

function cryptoPassword(passwd: string) {
  const pas256 = SHA256(passwd);
  const md5 = hex_md5(passwd).toUpperCase();
  let newPassHash =
    md5.slice(0, 8) +
    pas256.slice(24, 32) +
    pas256.slice(0, 8) +
    md5.slice(16, 24) +
    md5.slice(8, 16) +
    pas256.slice(8, 16) +
    pas256.slice(16, 24) +
    md5.slice(24, 32);
  newPassHash = SHA256(newPassHash);
  return newPassHash.slice(0, 32);
}

export async function getUserInfo(context: vscode.ExtensionContext) {
  const info = context.globalState.get<Types.IUserInfo>(USERINFO_STORAGE_KEY);
  console.log('缓存用户信息：', JSON.stringify(info));

  if (!info) {
    const _info = await inputUserInfo();
    if (!_info.name) {
      vscode.window.showErrorMessage('输入的用户名为空');
    } else if (!_info.passwd) {
      vscode.window.showErrorMessage('输入的密码为空');
    } else {
      context.globalState.update(USERINFO_STORAGE_KEY, info);
      return _info;
    }
    return null;
  }
  return info;
}

async function inputUserInfo(): Promise<Partial<IUserInfo>> {
  const name = await vscode.window.showInputBox({
    password: false,
    ignoreFocusOut: false,
    placeHolder: '请输入用户名',
    prompt: '1/2: 输入tools系统用户名，发布和查看日志需要登录',
  });

  const passwd = await vscode.window.showInputBox({
    password: true,
    ignoreFocusOut: true,
    placeHolder: '请输入密码',
    prompt: '2/2: 用户名、密码自动保存在vscode插件中，只需登录一次',
  });
  return { name, passwd };
}

export async function login(context: vscode.ExtensionContext) {
  const info = await getUserInfo(context)!;
  // console.log({ name: info?.name, passwd: cryptoPassword(info!.passwd!) });

  if (!info || !info.passwd || !info.name) return;

  // fuck  垃圾axios，请求头添加一个 Content-Type 就尼玛这么难

  const data = {
    name: info.name,
    password: cryptoPassword(info.passwd),
  };
}
