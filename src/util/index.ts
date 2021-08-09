import * as vscode from "vscode";
import path from "path";
import fs from "fs";
import axios from "axios";
import { IMessage, IPublish, IConfig, IParams, IExtensionConfig } from "../index.d";

let isInitedProjectInfo = false;
const HOST = "https://tools.shurongdai.cn";
const workFolder = vscode.workspace.workspaceFolders;
const URL_ENVRIONMENT_INFO = `${HOST}/api/awp/getDeployServerInfo.do`;
const URL_PUBLISH_CODE = `${HOST}/api/awp/publishNoTag.do`;
const URL_SHOW_LOG = (appName: string, publishKey: string) => `${HOST}/awp/logmonitor?f=${appName}/${publishKey}.log`;

export function checkWorkspace() {
  if (!workFolder) {
    vscode.window.showWarningMessage("请在目录中使用插件");
    return false;
  } else {
    const pageRoot = path.join(workFolder[0].uri.fsPath, "src/p");
    if (!fs.existsSync(pageRoot) || !fs.statSync(pageRoot).isDirectory()) {
      vscode.window.showErrorMessage("请在bid工具构建的项目中使用muse，'src/p'目录不存在");
      return false;
    }
  }
  return true;
}

/** 以string方式，读取html的内容 */
export function getWebViewContent(context: vscode.ExtensionContext, templatePath: string) {
  const resourcePath = path.join(context.extensionPath, templatePath);
  return fs.readFileSync(resourcePath, "utf-8");
}

export function initWebviewDate(context: vscode.ExtensionContext) {
  initUserInfo(context);
  initEnvrionmentInfo();
  initProjectInfo(context);
}

function initUserInfo(context: vscode.ExtensionContext) {
  const info = context.globalState.get<IMessage["data"]>("userInfo");
  console.log("\n读取缓存信息, userInfo:\n", JSON.stringify(info));
  vscode.commands.executeCommand("muse.postInfo", { cmd: "updateUserInfo", data: info });
}

// 初始化项目之前需要先 checkWorkspace， 在非bid工具构建的项目中不能使用
export async function initProjectInfo(context: vscode.ExtensionContext) {
  // 这里只使用第一个，同时打开多个workspace的情况暂时不处理
  console.log("\n当前workspace信息:\n", JSON.stringify(workFolder![0]));
  const uri = workFolder![0].uri;
  const res = fs.readFileSync(path.join(uri.fsPath, "config.json"), { encoding: "utf-8" });
  const { appName, version, remotes, cdnhost, websiteHost } = JSON.parse(res) as IConfig;
  console.log("\n读取config.json:\n", res);
  vscode.commands.executeCommand("muse.postInfo", { cmd: "updateProjectInfo", data: { appName, version } });
  context.workspaceState.update("projectConfig", { appName, version, remotes, cdnhost, websiteHost });
  initPageInfo(context);
  if (!isInitedProjectInfo) {
    isInitedProjectInfo = true;
    fs.watchFile(path.join(uri.fsPath, "config.json"), () => initProjectInfo(context));
  }
}

async function initEnvrionmentInfo() {
  axios.post(URL_ENVRIONMENT_INFO).then((res) => {
    console.log("\n环境信息:\n", res);
    if (res.status !== 200 || res.data.code !== 0) {
      console.error("获取环境信息失败");
      return vscode.window.showErrorMessage("获取环境信息失败");
    }
    // 过滤出在使用的环境
    const envFilter = [
      { name: "日常环境", key: "daily" },
      { name: "灰度环境", key: "gray" },
      { name: "线上环境", key: "productionNoTag" },
    ];
    vscode.commands.executeCommand("muse.postInfo", {
      cmd: "updateEnvInfo",
      data: { envFilter, data: res.data.data },
    });
  });
}

function initPageInfo(context: vscode.ExtensionContext) {
  // 如果不是在目录中打开的则不处理
  if (workFolder) {
    const extensionConfig = vscode.workspace.getConfiguration("muse") as IExtensionConfig;
    // 读取初始化项目信息的时候保存的version
    const config = context.workspaceState.get<IConfig>("projectConfig");
    const pageRoot = path.join(workFolder[0].uri.fsPath, "src/p");
    const { version } = config || {};
    const pages: string[] = [];

    // 递归查找项目src/p目录
    const searchDir = (root: string) => {
      try {
        fs.readdirSync(root).forEach((fileOrDir) => {
          const subPath = path.join(root, fileOrDir);
          const state = fs.statSync(subPath);
          if (state.isDirectory()) {
            return searchDir(subPath);
          } else if (state.isFile() && /\.html$/.test(fileOrDir)) {
            const relativeDir = /\/(src\/p.*)\/.*?\.html$/.exec(subPath);
            if (relativeDir && relativeDir[1]) {
              pages.push(`${relativeDir[1]}/${version}/index`);
            }
          }
        });
      } catch (error) {
        vscode.window.showErrorMessage(error);
      }
    };

    console.log(`\n\npageRoot: ${pageRoot}\n`);
    searchDir(pageRoot);

    vscode.commands.executeCommand("muse.postInfo", {
      cmd: "updatePagesInfo",
      data: {
        pages: pages.sort(),
        hideDisabledFilter: extensionConfig.hideDisabledFilter,
      },
    });
  }
}

export function publish(
  context: vscode.ExtensionContext,
  params: IParams,
  /** 检测分支是否匹配 */
  checkVersion = true
) {
  const res = context.workspaceState.get<IConfig>("projectConfig");
  if (!res) {
    return vscode.window.showErrorMessage("发布失败，无法读取项目config.json配置");
  }
  const { version, appName, cdnhost, websiteHost, remotes } = res;
  const rmVersion = (str: string) => str.replace(`\/${version}`, "");

  const data: IPublish = {
    appName,
    cdnhost,
    version,
    websiteHost,
    remotes,
    publish: params.env.value,
    env: params.env.value.env,
    username: params.name,
    password: params.passwd,
    selectedEntry: params.page,
    htmlEntry: params.page.map((str) => rmVersion(`./${str}.html`)),
    jsEntry: params.page.reduce((pre, cur) => ((pre[cur] = rmVersion(`./${cur}.js`)), pre), {} as any),
  };

  const gitBranch = getCurrentBranck();
  console.log(`\n当前分支：\n${gitBranch}`);

  // config.json中分支信息和当前分支不匹配
  if (checkVersion && version !== gitBranch) {
    vscode.window
      .showWarningMessage(
        `当前Git分支(${gitBranch})和配置文件分支(${version})不匹配，是否继续发布`,
        "继续发布",
        "稍后发布"
      )
      .then((res) => {
        if (res === "继续发布") {
          publish(context, params, false);
        }
      }, console.error);
    return false;
  }

  console.log("\n发布信息\n", JSON.stringify(data));

  // return false;

  axios.post(URL_PUBLISH_CODE, data, { headers: { "content-type": "application/json" } }).then((res) => {
    console.log("---------------发布结果----------------");
    console.log(res);

    if (res.data.code === 403) {
      vscode.window.showErrorMessage("权限不足，请检查用户名和密码");
    } else if (res.data.code === 200) {
      const url = URL_SHOW_LOG(res.data.data.appName, res.data.data.publishKey);
      const config = vscode.workspace.getConfiguration("muse") as IExtensionConfig;
      const open = () => vscode.env.openExternal(vscode.Uri.parse(url));
      if (config.autoOpenLog) {
        open();
      } else {
        vscode.window.showInformationMessage("发布成功，是否查看发布日志?", "立即查看").then(open);
      }
    } else {
      vscode.window.showErrorMessage("发布失败，请到 https://tools.shurongdai.cn 查看失败原因");
    }
  });
}

/** 读取当前工作目录的git文件，获取当前分支，注意这个和git的版本耦合，如果git的文件目录改变，可能会出问题 */
function getCurrentBranck() {
  const gitRoot = path.join(workFolder![0].uri.fsPath, ".git");
  if (fs.statSync(gitRoot).isDirectory()) {
    const refFile = path.join(gitRoot, "HEAD");
    if (fs.existsSync(refFile) && fs.statSync(refFile).isFile()) {
      const data = fs.readFileSync(refFile, "utf8");
      const reg = /ref: refs\/heads\/([^\s]*)/;
      const res = reg.exec(data.trimEnd());

      if (res && res[1]) {
        const reg = /\w*\/(.*)/;
        const _res = reg.exec(res[1]);

        // 日常分支/master
        return _res && _res[1] ? _res[1] : res[1];
      }
    }
  }
  vscode.window.showErrorMessage("读取当前分支错误，请切换分支后重试");
  return "";
}

/** 从线上html代码中获取js版本号 */
export function getCodeBranchFromRemote({ env, page }: Pick<IParams, "env" | "page">) {
  const res = fs.readFileSync(path.join(workFolder![0].uri.fsPath, "config.json"), { encoding: "utf-8" });
  const { appName, websiteHost } = JSON.parse(res) as IConfig;
  const isGray = /灰度/.test(env.name);
  const isDaily = /日常/.test(env.name);
  let uri = "https:";
  console.log({ env, page, appName, websiteHost });

  uri += isDaily ? `//${env.value.host}` : websiteHost;
  uri += `/${appName}/`;

  page = page.map((p) => p.replace(/(.*?\/)[\d\.]+\/index/, `${uri}$1index.html`));

  Promise.all(page.map((p) => parseHTML(p))).then((res) => {
    console.log(res);
    vscode.commands.executeCommand("muse.postInfo", { cmd: "showQueryResult", data: res });
  });
}

function parseHTML(url: string) {
  const page = /\/src\/p\/(.*?)\/index\.html/.exec(url);
  return new Promise<string>((resolve, reject) => {
    return axios
      .get(url)
      .then((response) => {
        const res = /\/([\d\.]+)\/index\.js/gi.exec(response.data);
        if (res && res[1]) {
          resolve(`${page?.[1] || ""}|${res[1]}`);
        } else {
          reject(`${page?.[1] || ""}|null`);
        }
      })
      .catch(() => {
        resolve(`${page?.[1] || url}| null`);
      });
  });
}
