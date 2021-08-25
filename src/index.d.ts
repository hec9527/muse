/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';

export type INoticeType = 'error' | 'warning' | 'info';

export type IEnvType = 'daily' | 'gray' | 'productionNoTag';

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
  | { cmd: 'GET_EXTENSIONCONFIG' }
  | { cmd: 'GET_PAGE_INFO' }
  | { cmd: 'GET_ENV_INFO' }
  | { cmd: 'GET_PROJECT_INFO' }
  | { cmd: 'DELETE_CACHE_INFO' }
  | { cmd: 'SHOW_CACHE_LIST' }
  | { cmd: 'SAVE_CACHE_INFO'; data: { env: IEnvConfig; pages: string[] } }
  | { cmd: 'SHOW_MESSAGE'; data: string | { message: string; type: INoticeType } }
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
      data: string[];
    }
  | {
      cmd: 'UPDATE_EXTENSIONCONFIG';
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
