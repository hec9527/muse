# Muse publish tool

`muse` 工具是用于 `bid` 所构建项目的发布工具，区别于 `bid` 的命令行模式， `muse` 基于 `vscode` 扩展提供了 `GUI` 操作界面，更加简单高效，告别了繁琐的输入选择发布的繁琐流程，让代码发布变得`human friendly`

## 使用工具发布

#### screenshot

---

![shortcat.png](https://img.shurongdai.cn/group1/M00/00/24/wKgX2WAiPk2ANgYrAAYCGIlWCmg017.png)

## Muse 插件安装

muse 项目依赖中已经添加了 vsce，使用如下方式即可一键安装最新版本 muse 插件到本机

```zsh
# 安装依赖
npm i

# 一键安装最新版本
npm run vsix
```

## vscode 插件安装过程

```bash
# 安装插件打包工具
npm i -g vsce

# 打包插件
vsce package

# 使用命令行安装插件
code --install-extension xxx.vsix
```

vscode 插件安装方式有很多，不仅可以通过命令行安装，还有图形化操作界面，甚至可以将打包后的插件直接复制到 vscode 的插件安装目录。当然最主要的安装方式还是通过插件市场安装，但是本插件因为涉及到内部服务器的域名和一些其它不宜公布的信息，所以不发布到应用市场，采用离线安装

- 离线安装

  - 在终端中执行`code --install-extension xxx.vsix`

  - 在应用商店中点击更多菜单，选择`install from vsix`然后选择安装的`vsix`程序

  - 在 `vscode` 资源管理器中，右键 `vsix` 文件，选择`安装扩展vsix`

  - 将打包后的插件直接拷贝到 vscode 的插件安装目录
