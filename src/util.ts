import * as vscode from 'vscode';
import * as Types from './index.d';
import * as path from 'path';
import * as fs from 'fs';
import Api from './api';
import Md5 from '@bairong/lib-util/es/crypto';
import notifier from 'node-notifier';
import io from 'socket.io-client';

/**
 * 检查用户名和密码
 */
export function checkUserInfo(info?: Partial<Types.IUserInfo>) {
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
): Promise<Types.IPagesInfo[]> {
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
 * 从html中解析代码版本号
 */
function parseHTML(url: string, isGray: boolean) {
  const config = isGray ? { headers: { uid: 6593329, Cookie: 'uid=6593329' } } : {};
  const pageRes = /\/src\/p\/(.*?)\/index\.html/.exec(url);
  return new Promise<Types.IPagesInfo>(resolve => {
    let name = '';
    let version = '';
    let env = '';
    let updateTime = '';
    return Api.request<string>({ url, ...config, timeout: 20 * 1000 })
      .then((response: string) => {
        const versionRes = /\/([\d*.?]+)\/index\.js/gi.exec(response);
        const envRes = /<meta name="env" content="(.*?)">/.exec(response);
        const updateRef = /<meta update-time="(.*?)">/.exec(response);

        name = pageRes?.[1] || '-';
        version = versionRes?.[1] || '-';
        env = envRes?.[1] || '-';
        updateTime = updateRef?.[1] || '-';
      })
      .finally(() => {
        resolve({ name, version, env, updateTime });
      });
  });
}

/**
 * 从本地git文件中读取当前分支
 */
export function getCurrentBranch(gitPath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (fs.statSync(gitPath).isDirectory()) {
      const refFile = path.join(gitPath, 'HEAD');
      if (fs.existsSync(refFile) && fs.statSync(refFile).isFile()) {
        const data = fs.readFileSync(refFile, 'utf8');
        const reg = /^ref: refs\/heads.*\/([^\s]*)$/;
        const res = reg.exec(data.trimEnd());

        if (res?.[1]) {
          return resolve(res[1]);
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

export function userLogin(userInfo: Types.IUserInfo) {
  // console.log({ userName: userInfo.username, password: Md5(userInfo.password) });
  return Api.request<Types.ILoginResponse>({
    url: Api.URL.login,
    method: 'post',
    data: { username: userInfo.username, password: Md5(userInfo.password), platform: 2 },
  }).then(res => {
    if (!res.uid) {
      vscode.window.showErrorMessage(`获取token出错，错误信息： ${res.message}`);
      return;
    }
    return res;
  });
}

export function detectPublishLogo(context: vscode.ExtensionContext, fileName: string): Promise<Types.IPublishStatus> {
  return new Promise<Types.IPublishStatus>(resolve => {
    // 校验用户信息
    const userInfo = (context.globalState.get('userInfo') || {}) as Types.IUserInfo;
    if (!checkUserInfo(userInfo)) {
      return inputUserInfo().then(res => {
        if (checkUserInfo(res)) {
          userInfo.username = res.username || userInfo.username;
          userInfo.password = res.password || userInfo.password;
          context.globalState.update('userInfo', res).then(() => {
            return detectPublishLogo(context, fileName);
          });
        }
      });
    }

    vscode.window.withProgress(
      {
        cancellable: false,
        location: vscode.ProgressLocation.Window,
        title: 'publish logo detecting...',
      },
      async () => {
        return new Promise<Types.IPublishStatus>(_resolve => {
          userLogin(userInfo).then(res => {
            if (!res?.token || !res.uid) {
              _resolve({ type: 'tokenError', data: `uid=${res?.uid}, token=${res?.token}` });
            }

            const log = (...args: any[]) => console.log('%c [websocket log]', 'color:green', ...args);
            const socket = io(Api.URL.webSocketUrl, {
              query: res,
              transports: ['websocket'],
            });

            socket.on('connect', () => {
              log('连接成功...');
              socket.emit('accessUser', res);
            });
            socket.on('accessSuccess', () => {
              log('用户身份认证成功...');
              socket.emit('startCheckLog', { fileName });
            });
            socket.on('accessFailed', () => {
              const str = '用户身份认证失败...';
              log(str);
              vscode.window.showErrorMessage(str);
            });
            socket.on('updateLog', (data: Types.IPublishLogoInfo) => {
              log('更新日志', data);
              if (!data.isFinishDeploy) {
                setTimeout(() => socket.open(), 5000);
              } else {
                const { logKeyWord } = vscode.workspace.getConfiguration('muse') as Types.IExtensionConfig;
                let keyWord = '';
                logKeyWord.some(k => {
                  if (data.info.indexOf(k) !== -1) {
                    keyWord = k;
                    return true;
                  }
                });
                if (keyWord) {
                  _resolve({ type: 'keyword', data: keyWord });
                } else {
                  _resolve(
                    data.success ? { type: 'success', data: '发布成功' } : { type: 'statusError', data: '发布失败' }
                  );
                }
              }
            });
            socket.on('loadFailed', (data: { msg: string }) => {
              log('加载失败', data.msg);
              vscode.window.showErrorMessage(data.msg);
            });
            socket.on('disconnect', () => log('断开链接'));
            socket.on('error', () => log('出错了'));
            socket.open();
          });
        }).then(resolve);
      }
    );
  });
}

export function showSystemNotice(data: Types.ISystemNoticeInfo) {
  notifier.notify({
    ...data,
  });
}
