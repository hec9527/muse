# Muse publish tool

Muse is a publish tool for bid build project, used by bairong fed team

> @author `hec9527`
>
> @time `2020-02-01`
>
> @lastchange `2020-02-07`

> `Muse`是一只英国摇滚乐队，同时在拉丁语中也是希腊神话中主司艺术与科学的女神，当然取名字的是否没想这么多就是瞎取的

## 打包安装

```shell
npm i -g vsce

vsce package

code --install-extension xxx.vsix
```

或者在应用商店中点击更多菜单，选择`install from vsix`

## 说明

`muse` 工具是用于 `bid` 所构建项目的发布工具，区别于 `bid` 的命令行模式， `muse` 基于 `vscode` 扩展提供了 `GUI` 操作界面，更加简单高效，告别了繁琐的输入选择发布的繁琐流程，让代码发布变得`human friendly`
