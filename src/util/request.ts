import _request, { CoreOptions } from 'request';

const HOST = 'https://tools.shurongdai.cn';

const Api = {
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

function request<T extends any = any>(config: CoreOptions & { url: string }) {
  return new Promise<T>((resolve, reject) => {
    console.log('123');

    _request(config.url, { ...config }, (error, response, body) => {
      console.log({ error, response, body });

      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
}

export default Api;
