/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';

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

export type IWebviewMessage =
  | { cmd: 'GET_PAGE_INFO' }
  | { cmd: 'GET_ENV_INFO' }
  | { cmd: 'GET_PROJECT_INFO' }
  | { cmd: 'SHOW_CACHE_LIST' }
  | { cmd: 'SAVE_CACHE_INFO'; data: any };

type IEnvInfo = {
  [K in 'daily' | 'gray' | 'productionNoTag']: {
    name: string;
    value: {
      env: K;
      group_id: number;
      host: boolean | string;
      name: string;
    } & {
      [S in 'cdnHost' | 'htmlHost' | 'server']?: { ip: string; path: string }[];
    };
  }[];
};

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

export type IMessage =
  | { cmd: 'showInfo'; data: string }
  | { cmd: 'publish'; data: IParams }
  | { cmd: 'queryBranch'; data: Pick<IParams, 'env' | 'page'> };

export interface IPublish {
  username: string;
  password: string;
  appName: string;
  remotes: string;
  version: string;
  websiteHost: string;
  cdnhost: string;
  env: string;
  publish:
    | {
        env: string;
        group_id: number;
        host: string;
        name: string;
        server: { ip: string; path: string }[];
      }
    | {
        cdnHost: { ip: string; path: string }[];
        env: string;
        group_id: number;
        host: boolean;
        htmlHost: { ip: string; path: string }[];
        name: string;
      };
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
