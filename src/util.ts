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
  return new Promise<string>((resolve, reject) => {
    return Api.request({ url, ...config })
      .then((response) => {
        const res = /\/([\d\.]+)\/index\.js/gi.exec(response.data);
        if (res && res[1]) {
          resolve(`${page?.[1] || ''}|${res[1]}`);
        } else {
          reject(`${page?.[1] || ''}| null`);
        }
      })
      .catch(() => {
        resolve(`${page?.[1] || url}| null`);
      });
  });
}