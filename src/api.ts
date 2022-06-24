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
    /** 发布日志地址 */
    publishLog: (appName: string, publishKey: string) => `${HOST}/page/awp/deployDetail?f=${appName}/${publishKey}.log`,
  },
  request,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function request<T extends any = any>(config: AxiosRequestConfig) {
  return _axios.request(config).then(res => {
    // console.log('请求结果', res);

    if (res.status === 302) {
      return { code: 0, message: 'login' };
    } else {
      return res.data;
    }
  }) as unknown as Promise<T & { code: number; message: string }>;
}

export default Api;
