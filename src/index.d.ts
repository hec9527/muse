/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';

export type INoticeType = 'error' | 'warn' | 'info';

export type IEnvType = 'daily' | 'gray' | 'productionNoTag';

export type ISystemNoticeInfo = {
  title: string;
  subTitle: string;
  type: INoticeType;
};

/** 发布日志结果： 成功、关键字匹配、发布状态错误、身份校验错误 */
export type IPublishStatus = {
  type: 'success' | 'keyword' | 'statusError' | 'tokenError';
  data: string;
};

export type ILoginResponse = {
  name: string;
  token: string;
  code: number;
  message: string;
  uid: number;
  email: null | string;
  authMap: { [K in number]: number };
};

export type IPublishLogoInfo = {
  info: string;
  isFinishDeploy: boolean;
  success: boolean;
};

export type IPagesInfo = {
  name: string;
  version: string;
  env: string;
  updateTime: string;
};

export type IProjectInfo = {
  appName?: string;
  version?: string;
};

export type IUserInfo = {
  username: string;
  password: string;
};

export type IProjectConfig = {
  appName: string;
  version: string;
  remotes: string;
  cdnhost: string;
  websiteHost: string;
};

export type IEnvConfig = {
  name: string;
  value: {
    env: K;
    group_id: number;
    host: boolean | string;
    name: string;
  } & {
    [S in 'cdnHost' | 'htmlHost' | 'server']?: { ip: string; path: string }[];
  };
};

export type IEnvInfo = {
  [K in IEnvType]: IEnvConfig[];
};

/** webview发送给扩展的消息类型 */
export type IWebviewMessage =
  | { cmd: 'GET_EXTENSION_CONFIG' }
  | { cmd: 'GET_PAGE_INFO'; refresh?: boolean }
  | { cmd: 'GET_ENV_INFO'; refresh?: boolean }
  | { cmd: 'GET_PROJECT_INFO' }
  | { cmd: 'DELETE_CACHE_INFO' }
  | { cmd: 'SHOW_CACHE_LIST' }
  | { cmd: 'SAVE_CACHE_INFO'; data: { env: IEnvConfig; pages: string[] } }
  | { cmd: 'SHOW_MESSAGE'; data: string | { message: string; type: INoticeLevel } }
  | { cmd: 'PUBLISH_CODE'; data: { env: IEnvConfig; pages: string[] } }
  | { cmd: 'QUERY_ONLINE_CODE_BRANCH'; data: { env: IEnvConfig; pages: string[] } };

/** 扩展发送到webview的消息类型 */
export type IExtensionMessage =
  | {
      cmd: 'UPDATE_ENV_INFO';
      data: { envFilter: { name: string; key: IEnvType }[]; data: IEnvInfo };
    }
  | {
      cmd: 'UPDATE_PROJECT_INFO';
      data: IProjectInfo;
    }
  | {
      cmd: 'UPDATE_PAGE_INFO';
      data: { pages: string[]; hideDisabledFilter: boolean };
    }
  | {
      cmd: 'QUICK_PUBLISH';
      data: { env: IEnvConfig; pages: string[] };
    }
  | {
      cmd: 'UPDATE_QUERY_CODE_BRANCH_RESULT';
      data: IPagesInfo[];
    }
  | {
      cmd: 'UPDATE_EXTENSION_CONFIG';
      data: IExtensionConfig;
    };

export interface IPublish {
  username: string;
  password: string;
  appName: string;
  remotes: string;
  version: string;
  websiteHost: string;
  cdnhost: string;
  env: string;
  publish: IEnvConfig['value'];
  /** [ './src/p/xxxx/....' ] */
  htmlEntry: string[];
  /** { 'src/p/xxxx': './src/p/xxxx'} */
  jsEntry: { [key: string]: string };
  /** [ 'src/p/xxxxx' ] */
  selectedEntry: string[];
}

export type IExtensionConfig = vscode.WorkspaceConfiguration & {
  /** 发布成功后的操作
   * - default：每次发布后展示弹窗，自行决定。
   * - openInBrowse：在浏览器中查看发布记录。
   * - detectLogo：自动探测发布结果，成功、失败后系统通知。
   * - none 不进行任何操作 */
  publishAction: 'default' | 'openInBrowse' | 'detectLogo' | 'none';
  /** 日志内容关键字匹配，匹配到相关文案则提示发布失败 */
  logKeyWord: string[];
  /** 发布结果通知方式，vscode集成通知、系统通知 */
  publishResultNoticeType: 'integration' | 'system';
  /** 发布成功后自动在浏览器中查看日志 */
  autoOpenLog: boolean;
  /** 隐藏禁用的页面过滤器 */
  hideDisabledFilter: boolean;
  /** 快速发布时，自动打开确认发布弹窗 */
  autoOpenQuickPublishModal: boolean;
};

export type IPublishResponse = {
  data: {
    appName: string;
    publishKey: string;
    timestamp: number;
    uid: number;
  };
};
