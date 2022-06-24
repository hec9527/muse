import * as vscode from 'vscode';
import * as Types from './index.d';
import * as path from 'path';
import * as fs from 'fs';
import Api from './api';

/**
 * 检查用户名和密码
 */
export function checkUserInfo(info?: Partial<Types.IUserInfo>): info is Types.IUserInfo {
  return Boolean(info && info.username && info.password);
}

/**
 * 调用vscode控件输入用户名和密码
 */
export async function inputUserInfo(): Promise<Partial<Types.IUserInfo>> {
  const username = await vscode.window.showInputBox({
    password: false,
    ignoreFocusOut: true,
    placeHolder: '请输入用户名',
    prompt: '1/2: 输入tools系统用户名，发布和查看日志需要登录',
  });

  const password = await vscode.window.showInputBox({
    password: true,
    ignoreFocusOut: true,
    placeHolder: '请输入密码',
    prompt: '2/2: 用户名、密码自动保存在vscode插件中，只需登录一次',
  });
  return { username, password };
}

/**
 * 按照指定格式格式化时间
 */
export function formatDate(format: string, date: string | number | Date = new Date()): string {
  type Keys = keyof typeof o;

  date = new Date(date);

  const o = {
    'M+': date.getMonth() + 1,
    //月份
    'd+': date.getDate(),
    //日
    'h+': date.getHours(),
    //小时
    'm+': date.getMinutes(),
    //分
    's+': date.getSeconds(), //秒
  };

  if (/(y+)/i.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (const k in o) {
    const _k = k as Keys;
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? `${o[_k]}` : ('00' + o[_k]).substr(`${o[_k]}`.length)
      );
    }
  }
  return format;
}

/**
 * 获取在线代码版本号
 */
export function getOnlineCodeBranch(
  { env, pages }: { env: Types.IEnvConfig; pages: string[] },
  config: Types.IProjectConfig
): Promise<string[]> {
  const { appName, websiteHost } = config;
  const isGray = /灰度/.test(env.name);
  const isDaily = /日常/.test(env.name);
  let uri = 'https:';
  uri += isDaily ? `//${env.value.host}` : websiteHost;
  uri += `/${appName}/`;

  pages = pages.map(p => p.replace(/(.*?\/)[\d.]+\/index/, `${uri}$1index.html`));
  return Promise.all(pages.map(p => parseHTML(p, isGray)));
}

/**
 * 从hmtl中解析代码版本号
 */
function parseHTML(url: string, isGray: boolean) {
  const config = isGray ? { headers: { uid: 6593329 } } : {};
  const page = /\/src\/p\/(.*?)\/index\.html/.exec(url);
  return new Promise<string>(resolve => {
    return Api.request<string>({ url, ...config, timeout: 20 * 1000 })
      .then((response: string) => {
        const res = /\/([\d*.?]+)\/index\.js/gi.exec(response);
        if (res && res[1]) {
          resolve(`${page?.[1] || ''}|${res[1]}`);
        } else {
          resolve(`${page?.[1] || ''}| null`);
        }
      })
      .catch(() => {
        resolve(`${page?.[1] || url}| null`);
      });
  });
}

/**
 * 从本地git文件中读取当前分支
 */
export function getCurrentBranck(gitPath: string): Promise<string> {
  return new Promise<string>((resove, reject) => {
    if (fs.statSync(gitPath).isDirectory()) {
      const refFile = path.join(gitPath, 'HEAD');
      if (fs.existsSync(refFile) && fs.statSync(refFile).isFile()) {
        const data = fs.readFileSync(refFile, 'utf8');
        const reg = /^ref: refs\/heads.*\/([^\s]*)$/;
        const res = reg.exec(data.trimEnd());

        if (res?.[1]) {
          return resove(res[1]);
        }
        reject('读取本地git分支出错，请检查git仓库');
      }
    }
    reject('在当前目录中未找到git仓库，请检查git信息');
  });
}

/**
 * 发布代码
 */
export function publishCode(
  { env, pages }: { env: Types.IEnvConfig; pages: string[] },
  config: Types.IProjectConfig,
  user: Types.IUserInfo
): Promise<string> {
  const { appName, version, websiteHost, cdnhost, remotes } = config;
  const removeVersion = (str: string) => str.replace(`/${version}`, '');

  const data: Types.IPublish = {
    appName,
    cdnhost,
    version,
    websiteHost,
    remotes,
    publish: env.value,
    env: env.value.env,
    username: user.username,
    password: user.password,
    selectedEntry: pages,
    htmlEntry: pages.map(p => removeVersion(`./${p}.html`)),
    jsEntry: pages.reduce(
      (pre, cur) => ((pre[cur] = removeVersion(`./${cur}.js`)), pre),
      {} as { [K in string]: string }
    ),
  };

  console.log('发布信息', data);

  return new Promise<string>((resolve, reject) => {
    Api.request<Types.IPublishResponse>({
      url: Api.URL.publish,
      data,
      method: 'POST',
      headers: { 'content-type': 'application/json' },
    }).then(res => {
      console.log('发布结果', res);

      if (res.code === 403) {
        reject(403);
      } else if (res.code === 0) {
        resolve(Api.URL.publishLog(res.data.appName, res.data.publishKey));
      } else {
        reject(`发布失败，请到 ${Api.HOST} 查看发布日志`);
      }
    });
  });
}
