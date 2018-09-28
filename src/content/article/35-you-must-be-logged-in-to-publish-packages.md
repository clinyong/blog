title: 解决 You must be logged in to publish packages
date: 2018.09.28
---

好久没更新 [dll-link-plugin](https://www.npmjs.com/package/dll-link-webpack-plugin)，今天合了两个 PR 之后，执行 `npm publish` 一直提示我

```
You must be logged in to publish packages. : dll-link-webpack-plugin
```

一开始以为是 npm 抽风，换了 yarn 之后还是有同样的问题。有点怀疑是不是 npm 账号有问题，后面查了下谷歌，发现项目下面会产生一个 `.npmrc` 的文件。里面大概有下面这样的内容

```
//registry.npmjs.org/:_authToken=xxx
```

删掉这个文件或者去掉这行之后，重新 `npm publish` 就发布成功了。
