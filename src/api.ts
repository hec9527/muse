import * as vscode from 'vscode';
import axios, { AxiosRequestConfig } from 'axios';

const _axios = axios.create();
const HOST = 'https://tools.shurongdai.cn';

const Api = {
  axios,
  HOST,
  URL: {
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
    .request(config)
    .then((res) => {
      if (res.status >= 200 && res.status < 300) {
        return res.data;
      } else if (res.status === 302) {
        return { code: 0, message: 'login' };
      }
      vscode.window.showErrorMessage(`请求错误：${config.url}`);
    })
    .catch((error) => {
      console.error(error);
      vscode.window.showErrorMessage(`请求错误：${config.url}`);
    }) as unknown as Promise<T & { code: number; message: string }>;
}

export default Api;
