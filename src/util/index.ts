import * as vscode from "vscode";
import path from "path";
import fs from "fs";
import axios from "axios";
import { IMessage } from "../index.d";

const URL_GET_ENVRIONMENT_INFO = "https://tools.shurongdai.cn/api/awp/getDeployServerInfo.do";

/** 以string方式，读取html的内容 */
export function getWebViewContent(context: vscode.ExtensionContext, templatePath: string) {
  const resourcePath = path.join(context.extensionPath, templatePath);
  return fs.readFileSync(resourcePath, "utf-8");
}

export function initWebviewDate(context: vscode.ExtensionContext) {
  initUserInfo(context);
  initProjectInfo(context);
  initEnvrionmentInfo();
}

function initUserInfo(context: vscode.ExtensionContext) {
  const info = context.globalState.get<IMessage["data"]>("userInfo");
  console.log("load cache data, userInfo:", JSON.stringify(info));
  vscode.commands.executeCommand("muse.postInfo", { cmd: "updateUserInfo", data: info });
}

function initProjectInfo(context: vscode.ExtensionContext) {
  const workFolder = vscode.workspace.workspaceFolders;
  if (!workFolder) {
    return vscode.window.showWarningMessage("请在目录中使用插件");
  }
  // 这里只使用第一个，同时打开多个workspace的情况暂时不处理
  console.log("current workspace:", JSON.stringify(workFolder));
  const uri = workFolder?.[0].uri;
  import(path.join(uri.fsPath, "config.json")).then((res) => {
    const { appName, version, remotes, cdnhost, websiteHost } = res;
    console.log("读取config.json:", res);
    vscode.commands.executeCommand("muse.postInfo", { cmd: "updateProjectInfo", data: { appName, version } });
    context.workspaceState.update("projectConfig", { appName, version, remotes, cdnhost, websiteHost });
  });
}

async function initEnvrionmentInfo() {
  axios.post(URL_GET_ENVRIONMENT_INFO).then((res) => {
    console.log("环境信息：", res);
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
