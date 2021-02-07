import * as vscode from "vscode";
import path from "path";
import fs from "fs";
import axios from "axios";
import { IMessage, IPublish, IConfig, IParams } from "../index.d";

let isInitedProjectInfo = false;
const workFolder = vscode.workspace.workspaceFolders;
const URL_ENVRIONMENT_INFO = "https://tools.shurongdai.cn/api/awp/getDeployServerInfo.do";
const URL_PUBLISH_CODE = "https://tools.shurongdai.cn/api/awp/publishNoTag.do";
const URL_SHOW_LOG = (appName: string, publishKey: string) =>
  `https://tools.shurongdai.cn/awp/logmonitor?f=${appName}/${publishKey}.log`;

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

export async function initProjectInfo(context: vscode.ExtensionContext) {
  if (!workFolder) {
    return vscode.window.showWarningMessage("请在目录中使用插件");
  }
  // 这里只使用第一个，同时打开多个workspace的情况暂时不处理
  console.log("\n当前workspace信息:\n", JSON.stringify(workFolder[0]));
  const uri = workFolder[0].uri;
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
    const pageRoot = path.join(workFolder[0].uri.fsPath, "src/p");
    if (!fs.existsSync(pageRoot) || !fs.statSync(pageRoot).isDirectory()) {
      const msg = "请在bid工具构建的项目中使用该插件，'src/p'目录不存在";
      return vscode.window.showErrorMessage(msg);
    }
    // 读取初始化项目信息的时候保存的version
    const config = context.workspaceState.get<IConfig>("projectConfig");
    const { version } = config || {};
    const pages: string[] = [];

    const traverseFolder = (root: string, prefix = "src/p") => {
      try {
        const dirs = fs.readdirSync(root);
        dirs.forEach((str) => {
          const fPath = path.join(root, str, "index.html");
          if (fs.existsSync(fPath) && fs.statSync(fPath).isFile()) {
            pages.push(`${prefix}/${str}/${version}/index`);
          } else {
            const subDir = path.join(root, str);
            fs.statSync(subDir).isDirectory() && traverseFolder(subDir, prefix + `/${str}`);
          }
        });
      } catch (error) {
        vscode.window.showErrorMessage(error);
      }
    };
    traverseFolder(pageRoot);

    vscode.commands.executeCommand("muse.postInfo", {
      cmd: "updatePagesInfo",
      data: pages,
    });
  }
}

export function publish(context: vscode.ExtensionContext, params: IParams) {
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

  console.log("\n发布信息\n", JSON.stringify(data));

  axios.post(URL_PUBLISH_CODE, data, { headers: { "content-type": "application/json" } }).then((res) => {
    console.log("---------------发布结果----------------");
    console.log(res);

    if (res.data.code === 403) {
      vscode.window.showErrorMessage("权限不足，请检查用户名和密码");
    } else if (res.data.code === 200) {
      const url = URL_SHOW_LOG(res.data.data.appName, res.data.data.publishKey);
      vscode.window.showInformationMessage("发布成功，是否查看发布日志?", "立即查看").then(() => {
        vscode.env.openExternal(vscode.Uri.parse(url));
      });
    } else {
      vscode.window.showErrorMessage("发布失败，请到 https://tools.shurongdai.cn 查看失败原因");
    }
  });
}
