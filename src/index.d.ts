/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';

export type INoticeType = 'error' | 'warning' | 'info';

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
  [K in 'daily' | 'gray' | 'productionNoTag']: IEnvConfig[];
};

/** webview发送给扩展的消息类型 */
export type IWebviewMessage =
  | { cmd: 'GET_PAGE_INFO' }
  | { cmd: 'GET_ENV_INFO' }
  | { cmd: 'GET_PROJECT_INFO' }
  | { cmd: 'SHOW_CACHE_LIST' }
  | { cmd: 'SAVE_CACHE_INFO'; data: any }
  | { cmd: 'SHOW_MESSAGE'; data: string | { message: string; type: INoticeType } }
  | { cmd: 'PUBLISH_CODE'; data: any }
  | { cmd: 'QUERY_ONLINE_CODE_BRANCH'; data: any };

/** 扩展发送到webview的消息类型 */
export type IExtensionMessage =
  | {
      cmd: 'UPDATE_ENV_INFO';
      data: {
        envFilter: { name: string; key: 'daily' | 'gray' | 'productionNoTag' }[];
        data: IEnvInfo;
      };
    }
  | {
      cmd: 'UPDATE_PROJECT_INFO';
      data: IProjectInfo;
    }
  | {
      cmd: 'UPDATE_PAGE_INFO';
      data: {
        pages: string[];
        hideDisabledFilter: boolean;
      };
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
  publish: IEnvConfig;
  /** [ './src/p/xxxx/....' ] */
  htmlEntry: string[];
  /** { 'src/p/xxxx': './src/p/xxxx'} */
  jsEntry: { [key: string]: string };
  /** [ 'src/p/xxxxx' ] */
  selectedEntry: string[];
}

/** 发布时 webview发送给扩展的参数 */
export interface IParams {
  name: string;
  passwd: string;
  env: {
    name: string;
    value: IPublish['publish'];
  };
  page: string[];
}

export type IExtensionConfig = vscode.WorkspaceConfiguration & {
  autoOpenLog: boolean;
  hideDisabledFilter: boolean;
};
