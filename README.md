# Muse publish tool

`muse` 工具是用于 `bid` 所构建项目的发布工具，区别于 `bid` 的命令行模式， `muse` 基于 `vscode` 扩展提供了 `GUI` 操作界面，更加简单高效，告别了繁琐的输入选择发布的繁琐流程，让代码发布以及重新发布变得更加 `human friendly`

## 插件截图

![shortcat.png](https://img.shurongdai.cn/group1/M00/00/27/wKgX2GDQUJuAUg6wAAZh7T-Bij0010.png)

## 插件使用

> `注意`: 过滤器只是展示过滤。过滤某个首字母之后，全选或者反选针对所有页面操作的，而不是过滤展示出来的页面

1. 打开 `bid` 工具构建的工程

2. 按下 `ctrl+p ctrl+p` 或者点击 `statusBar` 的小松鼠按钮打开插件

3. 输入用户名以及密码（只需要输入一次，以后自动填充）

4. 选择发布/检查的环境

5. 选择发布/检查的页面

6. 点击 `发布` 按钮或者按下 `enter` 键，在确认发布窗口核对发布信息并选择 `取消/发布`

7. 点击 `分支检查` 按钮，查询在线页面代码版本（弹窗展示）

8. 在右下角的消息弹窗确认是否查看发布日志（如果已经配置自动打开发布日志则不会弹窗）

## Muse 插件安装

### 一键安装

> 本项目采用 `yarn` 管理依赖，安装依赖请使用 `yarn install`，如果使用 `npm` 安装依赖，打包后将无法运行，如果已经使用 `npm` 安装依赖，请删除 `node_modules` 后使用 `yarn` 重新安装

```zsh
# 克隆仓库
git clone http://gitlab.100credit.cn/fed/muse.git

# 安装依赖
yarn install

# 一键安装最新版本
yarn run vsix
```

### 手动安装

```bash
# 安装插件打包工具
npm i -g vsce

# <vscode插件项目根目录> 打包插件
vsce package

# 使用命令行安装插件
code --install-extension xxx.vsix
```
