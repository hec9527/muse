/* eslint-disable @typescript-eslint/naming-convention */
export type IMessage =
  | {
      cmd: "updateUserInfo";
      data: {
        name: string;
        passwd: string;
      };
    }
  | {
      cmd: "showInfo";
      data: string;
    }
  | {
      cmd: "publish";
      data: IParams;
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
  publish: {
    env: string;
    group_id: number;
    host: string;
    name: string;
    server: { ip: string; path: string }[];
  };
  /* ./src/p/about/.... */
  htmlEntry: string[];
  /** { 'src/p/xxxx': './src/p/xxxx'} */
  jsEntry: { [key: string]: string };
  /** src/p/xxxxx */
  selectedEntry: string[];
}

/** 发布时 前端传递给webivew的参数 */
export interface IParams {
  name: string;
  passwd: string;
  env: {
    name: string;
    value: IPublish["publish"];
  };
  page: string[];
}
