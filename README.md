# Muse publish tool

`muse` 工具是用于 `bid` 所构建项目的发布工具，区别于 `bid` 的命令行模式， `muse` 基于 `vscode` 扩展提供了 `GUI` 操作界面，更加简单高效，告别了繁琐的输入选择发布的繁琐流程，让代码发布以及重新发布变得更加 `human friendly`

## 插件使用

1. 克隆仓库 / 拉取最新代码，使用 `yarn install` 安装依赖，然后使用 `npm run vsix` 命令一键安装

2. 在使用 `bid` 工具构建的项目中点击窗口 `statusBar` 的 <img src='https://img.shurongdai.cn/group1/M00/00/25/wKgX2WA3HfeAfVt6AAAZmcoJ3Ak529.png' style="display:inline; width:60px;margin-bottom:-5px"> `松鼠` 图标打开插件，或者在使用 `bid` 工具构建的项目中使用快捷键`ctrl+p ctrl+p` 打开插件

3. 插件会展示当前项目名称和当前分支名称

   1. 输入用户名和密码（插件会自动保存，下次自动填充），
   2. 选择发布环境和发布页面
   3. 点击右上角发布按钮或者按 `enter` 键选择信息
   4. 在展开的弹窗中核对发布信息，确认或者取消发布

![shortcat.png](https://img.shurongdai.cn/group1/M00/00/24/wKgX2WAiPk2ANgYrAAYCGIlWCmg017.png)

4. 页面选择中提供`过滤器`，根据 `src/p` 目录下的文件(夹)首字母进行过滤，方便快速找到想要发布的页面

  > **注意过滤器只是展示过滤，其它页面`display:none`。过滤某个首字母之后，全选或者反选针对所有页面操作的，而不是过滤展示出来的页面**

5. 发布完成后，右下角提示信息可以快速跳转到发布日志页面

## Muse 插件安装

muse 项目依赖中已经添加了 vsce，使用如下方式即可一键安装最新版本 muse 插件到本机

**_特别注意：_**

> 本项目采用 `yarn` 管理依赖，安装依赖请使用 `yarn install`，如果使用 `npm` 安装依赖，打包后将无法运行，如果已经使用 `npm` 安装依赖，请使用 `rm -rf node_modules` 删除

```zsh
# 安装依赖
yarn install

# 一键安装最新版本
yarn run vsix
```

## vscode 插件安装过程

```bash
# 安装插件打包工具
npm i -g vsce

# <vscode插件项目根目录> 打包插件
vsce package

# 使用命令行安装插件
code --install-extension xxx.vsix
```

vscode 插件安装方式有很多，不仅可以通过命令行安装，还有图形化操作界面，甚至可以将打包后的插件直接复制到 vscode 的插件安装目录。当然最主流的安装方式还是通过插件市场安装，但是本插件因为涉及到内部服务器的域名和一些其它不宜公布的信息，所以不发布到应用市场，采用离线安装

- 离线安装

  - 在终端中执行 `code --install-extension xxx.vsix`

  - 在应用商店中点击更多菜单，选择`install from vsix`然后选择安装的`vsix`程序

  - 在 `vscode` 资源管理器中，右键 `vsix` 文件，选择`安装扩展vsix`

  - 将打包后的插件直接拷贝到 vscode 的插件安装目录

