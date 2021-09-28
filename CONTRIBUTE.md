# 如何添加新的特新

## Muse 插件说明

1. 该插件使用 `yarn` 管理依赖，如果采用 `npm` 安装依赖，打包的时候可能会导致打包失败

2. `src` 目录为插件的源码，其中 `src/app` 目录下为插件 `webview` 的源码。因为 `vscode` 插件使用 `commonjs`，`webview` 内容使用 `Esmodule`，所以他们有单独的 `tsconfig.json` 文件
3.

4. `script/webpack.config.js` 用于打包 `webview` 中的内容，`script/webpack.extension.config.js`用于打包 `vscode` 扩展本身

5. `src/status-bar-item.ts` 用于在状态栏添加启动图标

6. `src/extension.ts` 扩展的入口文件

7. `src/viewManager.ts` 为 `webview` 的管理模块，用于创建、管理以及与 `webview` 进行通信

8. 本地调试需要先执行 `npm run dev` 命令开启 `webpack` 打包代码，然后使用 `F5` 打开调试窗口。如果修改了 `webview` 以外的内容需要重启调试窗口(win+R)。如果是修改了 `webview` 的内容，只需要关闭 `webview` 重新打开

## 如何在本地安装测试

一般来说在调试窗口中就可以测试插件的功能，如果想要在本地安装使用，可以使用 `npm run vsix` 命令。 该脚本会自动打包代码并且在本地安装。也可以自己手动安装 `vsix` 文件`code --install-extension xxx.vsix`（需要在 `path` 中安装 `vscode` 命令）

## 如何发布插件

发布插件到 `vscode` 插件市场有点类似于发布 `npm` 包。

1. 前往[Azure](https://dev.azure.com)注册账号，因为 vscode 插件市场是使用 Azure 托管的。然后创建私有 Key，`Work Items`选择`Read, Write & Manage`。有效期选择最大

2. 前往[vscode 插件市场](https://marketplace.visualstudio.com/manage/createpublisher)创建账号。输入 `Name` 和 `ID` 即可

3. 安装 `vsce` 包

   ```zsh
   # 全局安装vsce
   npm i -g vsce
   # 登录发布者
   vsce login <publisher>
   # 可选参数自动更新 主要版本 | 次要版本 | 补丁版本  类似与npm的版本命名规则
   vsce publish [major | minor | patch]
   ```

::: Tip
值得注意的是，`vscode` 的版本号和 `npm` 包一样只能增加且不能重复，发布之前请检查确认，发布之后所有安装了该插件的用户会在联网的情况下自动更新。
:::
