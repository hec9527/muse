/**
 *  插件加载时，初始化并且缓存项目信息，当webview启动之后，发送消息给插件，插件收到消息后再发送这些信息给webview
 *    - 项目配置信息（config.js）
 *    - 发布环境信息
 *    - 发布页面信息
 */

import * as vscode from 'vscode';
import * as Types from '../index.d';
import Api from './api';
import fs from 'fs';
import path from 'path';

let isInitedProjectInfo = false;
const workFolder = vscode.workspace.workspaceFolders;

export function initEnvrionmentInfo(context: vscode.ExtensionContext) {
  Api.axios.post(Api.URL.getEnvInfo).then((res) => {
    console.log('\n环境信息:\n', res);
    if (res.status !== 200 || res.data.code !== 0) {
      console.error('获取环境信息失败');
      return vscode.window.showErrorMessage('获取环境信息失败');
    }
    // 过滤出在使用的环境
    const envFilter = [
      { name: '日常环境', key: 'daily' },
      { name: '灰度环境', key: 'gray' },
      { name: '线上环境', key: 'productionNoTag' },
    ];
    context.workspaceState.update('envInfo', { envFilter, data: res.data.data });
  });
}

// 初始化项目之前需要先 checkWorkspace， 在非bid工具构建的项目中不能使用
export function initProjectInfo(context: vscode.ExtensionContext) {
  // 这里只使用第一个，同时打开多个workspace的情况暂时不处理
  console.log('\n当前workspace信息:\n', JSON.stringify(workFolder![0]));
  const uri = workFolder![0].uri;
  const res = fs.readFileSync(path.join(uri.fsPath, 'config.json'), { encoding: 'utf-8' });
  const { appName, version, remotes, cdnhost, websiteHost } = JSON.parse(res) as Types.IProjectConfig;
  console.log('\n读取config.json:\n', res);
  context.workspaceState.update('projectConfig', {
    appName,
    version,
    remotes,
    cdnhost,
    websiteHost,
  });
  initPageInfo(context);
  // 切换分支的时候需要重新读取config.js，重新渲染页面信息
  if (!isInitedProjectInfo) {
    isInitedProjectInfo = true;
    fs.watchFile(path.join(uri.fsPath, 'config.json'), () => initProjectInfo(context));
  }
}

function initPageInfo(context: vscode.ExtensionContext) {
  // 如果不是在目录中打开的则不处理
  if (!workFolder) return;
  const config = context.workspaceState.get<Types.IProjectConfig>('projectConfig');
  const pageRoot = path.join(workFolder[0].uri.fsPath, 'src/p');
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

  context.workspaceState.update('pageInfo', {
    pages: pages.sort(),
  });

  // TODO 主动发送信息给webview
}
