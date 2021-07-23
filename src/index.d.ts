/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';

export type IUserInfo = {
  userName: string;
  passwd: string;
};

export type IMessage =
  | {
      cmd: 'updateUserInfo';
      data: {
        name: string;
        passwd: string;
      };
    }
  | {
      cmd: 'showInfo';
      data: string;
    }
  | {
      cmd: 'publish';
      data: IParams;
    }
  | {
      cmd: 'queryBranch';
      data: Pick<IParams, 'env' | 'page'>;
    };

export interface IConfig {
  appName: string;
  version: string;
  remotes: string;
  cdnhost: string;
  websiteHost: string;
}

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
