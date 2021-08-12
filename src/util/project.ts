import * as vscode from 'vscode';
import * as Types from '../index.d';
import Api from './api';
import fs from 'fs';
import path from 'path';

let isInitedProjectInfo = false;
const workFolder = vscode.workspace.workspaceFolders;

export async function initEnvrionmentInfo() {
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
    vscode.commands.executeCommand('muse.postInfo', {
      cmd: 'UPDATE_ENV_INFO',
      data: { envFilter, data: res.data.data },
    });
  });
}

// 初始化项目之前需要先 checkWorkspace， 在非bid工具构建的项目中不能使用
export async function initProjectInfo(context: vscode.ExtensionContext) {
  // 这里只使用第一个，同时打开多个workspace的情况暂时不处理
  console.log('\n当前workspace信息:\n', JSON.stringify(workFolder![0]));
  const uri = workFolder![0].uri;
  const res = fs.readFileSync(path.join(uri.fsPath, 'config.json'), { encoding: 'utf-8' });
  const { appName, version, remotes, cdnhost, websiteHost } = JSON.parse(res) as Types.IConfig;
  console.log('\n读取config.json:\n', res);
  vscode.commands.executeCommand('muse.postInfo', {
    cmd: 'UPDATE_PROJECT_INFO',
    data: { appName, version },
  });
  context.workspaceState.update('projectConfig', {
    appName,
    version,
    remotes,
    cdnhost,
    websiteHost,
  });
  initPageInfo(context);
  if (!isInitedProjectInfo) {
    isInitedProjectInfo = true;
    fs.watchFile(path.join(uri.fsPath, 'config.json'), () => initProjectInfo(context));
  }
}

function initPageInfo(context: vscode.ExtensionContext) {
  // 如果不是在目录中打开的则不处理
  if (!workFolder) return;
  const extensionConfig = vscode.workspace.getConfiguration('muse') as Types.IExtensionConfig;
  // 读取初始化项目信息的时候保存的version
  const config = context.workspaceState.get<Types.IConfig>('projectConfig');
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

  vscode.commands.executeCommand('muse.postInfo', {
    cmd: 'UPDATE_PAGE_INFO',
    data: {
      pages: pages.sort(),
      hideDisabledFilter: extensionConfig.hideDisabledFilter,
    },
  });
}
