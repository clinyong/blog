title: webpack 的 sideEffects 作用
date: 2018.11.10
---

这段时间在给脚手架升级 `webpack4`，放到商品项目去跑的时候遇到一个很奇怪的问题。在本地开发的时候，能正常加载 `mui-base` 下面的 `normalize` 样式，而发布到胡桃街环境的时候，这个样式就会丢失。

一开始的时候，以为是 [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin) 的问题，因为只有在发布线上或者胡桃街（也就是执行 `yarn build`）才会加载这个插件，本地开发走的是 `style-loader`。所以花了一点时间看了下 mini-css-extract-plugin 的源码，发现也只看了一知半解，最后也没能找到什么线索。所以想直接断点调试下 webpack 的源码。

直接在商品这个项目调试的话，会多出很多依赖，所以用脚手架重新创建了一个全新的项目进行断点调试。由于自己高估了对 webpack 源码的了解，所以调试了大半天，还是没能找到什么线索。这时候偶然改了下 `yarn build` 的配置文件，把 `style-loader` 换成 `mini-css-extract-plugin`，发现问题还是存在。所以说这个问题应该和 `mini-css-extract-plugin` 无关。

上面的调试过程中，发现用脚手架生成出来的空项目依赖还是太多，所以又是重新建了一个更简单的项目，只包括了 `webpack` 直接的依赖和 `mui-core`。入口文件就像下面这样简单

```js
import Button from "@msfe/mui-core/es/Button";
import "@msfe/mui-core/es/Button/style";

console.log(Button);
```

`webpack` 的配置文件

```js
const genStyleLoaders = require("./style-loader");

const styleLoaders = genStyleLoaders({
  publicPath: "",
  shouldUseSourceMap: false,
  isExtract: false
});

const isProd = true;

module.exports = {
  mode: isProd ? "production" : "development",
  optimization: {
    minimizer: []
  },
  module: {
    rules: [
      styleLoaders.css,
      styleLoaders.cssModule,
      styleLoaders.sass,
      styleLoaders.sassModule,
      {
        exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/, /\.scss$/],
        loader: require.resolve('file-loader'),
        options: {
          name: 'static/media/[name].[hash:8].[ext]',
        },
      }
    ]
  }
};
```

`genStyleLoaders` 是从脚手架复制出来的方法，就是加上各种样式 loader。为了让打包之后的代码不被压缩，把 `minimizer` 设置成空数组。

`webpack4` 支持一个 `mode`，可以默认帮你设置好一些配置项。调试过程中发现，当 `mode` 设置成 `development` 的时候一切正常，当设置成 `production` 的时候就出问题了。所以这里也可以很清楚知道应该是和这个参数有关。

但是 `production` 设置了什么配置项，加载了什么插件，还是不清楚。所以又是只能打断点了。通过编译出来的文件，找了一些比较特殊的字符串，比如下面这段

```js
/***/ "./node_modules/css-loader/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/@msfe/mui-base/stylesheets/main.scss":
/*!**************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader??ref--6-1!./node_modules/sass-loader/lib/loader.js??ref--6-2!./node_modules/@msfe/mui-base/stylesheets/main.scss ***!
  \**************************************************************************************************************************************************/
```

我找了 `!*** ` 这个字符串，全局搜索了下 webpack 的源码，很幸运，马上就定位到了一个文件 `lib/FunctionModuleTemplatePlugin.js` 的 45 行

```js
source.add("  !*** " + req.replace(/\*\//g, "*_/") + " ***!\n");
```

在上面打了个断点，发现在 `mode` 为 `development` 的时候会进到这里，在 `production` 的时候就不会。这时候再通过断点的调用栈，一步步往上调试。发现在生成的 chunk 里面会丢失 `@msfe/mui-core/es/Button/style` 这个依赖。当把源码改成下面这样就不会丢失了

```js
import Button from "@msfe/mui-core/es/Button";
import test from "@msfe/mui-core/es/Button/style";

console.log(test);
console.log(Button);
```

这时候应该大概也知道是和 webpack 的 `treeshaking` 有关系。原以为是 mui 的写法有问题，和 mui 的童鞋沟通了一下发现，antd 也是这么写的。所以又重新把源码改成

```js
import "antd/es/button/style"
import "@msfe/mui-core/es/Button/style"
```

发现 antd 的确实不会丢失，mui 的又再次被丢失。没办法，又是只能断点调试。按照上面的方法，从生成模板的地方按调用栈往上调试，最终在 `lib/Compilation.js` 的 1535 行找到了很关键的一句

```js
const ref = this.getDependencyReference(currentModule, d);
if (!ref) {
    return;
}
```

如果依赖是 `antd` 的话，`ref` 则有值，如果是 `mui` 的话，值则为空。到了这里，找出答案也只是时间上的问题了。

最终的答案是 `antd` 的 `package.json` 加了一个 [sideEffects](https://github.com/ant-design/ant-design/blob/master/package.json#L227-L231)，所以样式才能顺利被 webpack 加载。对于这个字段，官方也有对应的[文档](https://webpack.js.org/guides/tree-shaking/)。

定位这个问题断断续续花了快一周的时间，主要的问题也是因为之前我不太理解 `webpack4` 里面 `sideEffects` 的作用。解决这个问题的过程中，通过一个最简单的例子去定位也是一种很好的手段。

解决这个问题的过程中，也找到了一些不错的 webpack 源码资料。

- <https://medium.com/webpack/contributors-guide/home>
- <https://github.com/thelarkinn/artsy-webpack-tour>
- <https://github.com/webpack/webpack/issues/824>
