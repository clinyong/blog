title: Webpack DLL 用法
date: 2017.05.21
---

## 前言

在用 Webpack 打包的时候，对于一些不经常更新的第三方库，比如 `react`，`lodash`，我们希望能和自己的代码分离开，Webpack 社区有两种方案

- CommonsChunkPlugin
- DLLPlugin

对于 `CommonsChunkPlugin`，webpack 每次打包实际还是需要去处理这些第三方库，只是打包完之后，能把第三方库和我们自己的代码分开。而
`DLLPlugin` 则是能把第三方代码完全分离开，即每次只打包项目自身的代码。

## 用法

要使用 `DLLPlugin`，需要额外新建一个配置文件。所以对于用这种方式打包的项目，一般会有下面两个配置文件

- webpack.config.js
- webpack.dll.config.js

先来看下 `webpack.dll.config.js`

```js
const webpack = require('webpack')
const library = '[name]_lib'
const path = require('path')

module.exports = {
  entry: {
    vendors: ['react', 'lodash']
  },

  output: {
    filename: '[name].dll.js',
    path: 'dist/',
    library
  },

  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, 'dist/[name]-manifest.json'),
      // This must match the output.library option above
      name: library
    }),
  ],
}
```

再改下 `webpack.config.js` 文件

```js
const webpack = require('webpack')

module.exports = {
  entry: {
    app: './src/index'
  },
  output: {
    filename: 'app.bundle.js',
    path: 'dist/',
  },
  plugins: [
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./dist/vendors-manifest.json')
    })
  ]
}
```

`manifest: require('./dist/vendors-manifest.json')` 这里的路径要和 `webpack.dll.config.js` 里面的对应。

然后运行

```
$ webpack --config webpack.dll.config.js
$ webpack --config webpack.config.js
```

然后你的 html 文件像下面这样引用

```html
<script src="/dist/vendors.dll.js"></script>
<script src="/dist/app.bundle.js"></script>
```

## DLL Link Plugin

上面的用法也存在一些不方便的地方，比如在 `webpack.config.js` 中要明确指出对应的 `manifest.json` 文件。还有当 DLL 需要更新的时候，比如 `react` 升级了，或者加入新的第三方库，都需要手动像下面这样编译一次。

```
$ webpack --config webpack.dll.config.js
```

因为上面这些问题，所以基于官方的 `DllReferencePlugin`，我写了一个打包的插件，[Dll Link Plugin](https://github.com/clinyong/dll-link-webpack-plugin)。

使用这个插件，只需要对 `webpack.config.js` 作下小小的改动

```js
const webpack = require('webpack')
const DllLinkPlugin = require('dll-link-webpack-plugin')

module.exports = {
  // ...
  plugins: [
    new DllLinkPlugin({
      config: require('webpack.dll.config.js')
    })
  ]
}
```

直接替换掉 `DllReferencePlugin`，然后传入对应的 DLL 配置文件就可以了。每次打包的时候，只需要运行

```
$ webpack --config webpack.config.js
```

上面的命令便会自动生成对应的 vendors 文件，需要更新的时候，也会自动更新。
