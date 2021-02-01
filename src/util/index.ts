import * as vscode from 'vscode';
import path from 'path';
import fs from 'fs';

/**
 *  获取view的内容，并且修改其中的链接
 */
// export function getWebViewContent(context: vscode.ExtensionContext, htmlPath: string) {
//     const resourcePath = path.join(context.extensionPath, htmlPath);
//     const dirPath = path.dirname(resourcePath);
//     const html = fs.readFileSync(resourcePath, "utf-8");

//     const REG = /(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g;
//     console.log(resourcePath);

//     // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
//     return html.replace(REG, (m, $1, $2) => {
//         return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: "vscode-resource" }).toString() + '"';
//     });
// }

export function getWebViewContent(
  context: vscode.ExtensionContext,
  templatePath: string
) {
  const resourcePath = path.join(context.extensionPath, templatePath);
  const dirPath = path.dirname(resourcePath);
  let html = fs.readFileSync(resourcePath, 'utf-8');
  // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
  html = html.replace(
    /(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g,
    (m: any, $1: string, $2: string) => {
      return (
        $1 +
        vscode.Uri.file(path.resolve(dirPath, $2))
          .with({ scheme: 'vscode-resource' })
          .toString() +
        '"'
      );
    }
  );
  return html;
}
