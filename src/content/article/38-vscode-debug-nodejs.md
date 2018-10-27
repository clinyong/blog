title: 用 VSCode 调试 NodeJS
date: 2018.10.27
---

前两天有个同事问到我如何用 VSCode 调试 NodeJS，我自己调试了好几次，每次都是得重新搜下谷歌。所以写个笔记，下次要用就可以直接翻出来。

VSCode 官方的文档已经很详细地介绍了整个过程

> <https://code.visualstudio.com/docs/nodejs/nodejs-debugging>

这里把几个关键步骤讲下。首先在 VSCode 的 debug 那里增加多一个配置

```json
{
    "type": "node",
    "request": "attach",
    "name": "Attach to Remote",
    "address": "127.0.0.1",
    "port": 9229,
    "localRoot": "${workspaceFolder}",
    "remoteRoot": "${workspaceFolder}"
}
```

比如我们有下面的 index.js 文件

```js
function echo() {
    console.log("Hello")
}

echo();
```

在上面的 `console.log` 这一行打个断点，然后在终端执行

```shell
$ node --inspect-brk index.js
```

然后在 VSCode 里面点击启动调试，能看到断点打在了第一行。点击继续往下执行，就能跳到我们上面设置的断点。

（完）
