import * as vscode from 'vscode';
import axios, { AxiosRequestConfig } from 'axios';

const _axios = axios.create();
// const HOST = 'https://tools.shurongdai.cn';
const HOST = 'http://toolsdev.shurongdai.cn:3005';
// const USERCENTER = 'https://innerspore.shurongdai.cn';

_axios.interceptors.request.use((config) => {
  if (config.method?.toLocaleLowerCase() === 'post') {
    config.headers['Content-Type'] = 'x-www-form-urlencoded';
    config.headers['Content-Length'] = JSON.stringify(config.data).length;
    config.headers['host'] = HOST;
  }

  console.log('request', JSON.parse(JSON.stringify(config)));
  return config;
});

_axios.interceptors.response.use((res) => {
  console.log('res', res);
  return res;
});

const Api = {
  axios,
  HOST,
  URL: {
    /** 用户中心登录 */
    // userLogin: `${USERCENTER}/innerspore/userCenter/login.do`,
    /** 用户登录 */
    login: `${HOST}/api/system/login.do`,
    /** 获取发布环境信息 */
    getEnvInfo: `${HOST}/api/awp/getDeployServerInfo.do`,
    /** 发布，提交代码 */
    publish: `${HOST}/api/awp/publishNoTag.do`,
  },
  request,
};

function request<T extends any = any>(config: AxiosRequestConfig) {
  return _axios
    .request<T>(config)
    .then((res) => {
      if (res.status >= 200 && res.status < 300) {
        return res.data;
      } else if (res.status === 302) {
        return { code: 0, message: 'login' };
      }
      vscode.window.showErrorMessage(`请求错误：${config.url}`);
      return '';
    })
    .catch((error) => {
      console.error(error);
      vscode.window.showErrorMessage(`请求错误：${config.url}`);
      return '';
    });
}

export default Api;
