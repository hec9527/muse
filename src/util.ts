import * as Types from './index.d';
import Api from './api';

/**
 * 按照指定格式格式化时间
 */
export function formatDate(format: string, date: string | number | Date = new Date()) {
  type Keys = keyof typeof o;

  date = new Date(date);

  var o = {
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
  for (var k in o) {
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
) {
  const { appName, websiteHost } = config;
  const isGray = /灰度/.test(env.name);
  const isDaily = /日常/.test(env.name);
  let uri = 'https:';
  uri += isDaily ? `//${env.value.host}` : websiteHost;
  uri += `/${appName}/`;

  pages = pages.map((p) => p.replace(/(.*?\/)[\d\.]+\/index/, `${uri}$1index.html`));
  return Promise.all(pages.map((p) => parseHTML(p, isGray)));
}

/**
 * 从hmtl中解析代码版本号
 */
function parseHTML(url: string, isGray: boolean) {
  const config = isGray ? { headers: { uid: 6593329 } } : {};
  const page = /\/src\/p\/(.*?)\/index\.html/.exec(url);
  return new Promise<string>((resolve) => {
    return Api.request({ url, ...config, timeout: 10 * 1000 })
      .then((response: string) => {
        const res = /\/([\d*\.?]+)\/index\.js/gi.exec(response);
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

export function getCurrentBranck(gitPath: string) {
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
function publishCode(data: { env: Types.IEnvConfig; pages: string[] }) {
  //
}
