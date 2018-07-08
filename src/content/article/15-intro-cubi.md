title: Cubi 的由来
date: 2018.03.31

---

博客建立到现在一年多，已经重构了两次，之前也写了两篇文章简单地介绍博客的构建过程

*   [Hello World](https://blog.leodots.me/post/1-hello-world.html)
*   [用 next.js 构建博客](https://blog.leodots.me/post/7-nextjs-static.html)

在第二篇文章的末尾也提到，用 `next.js` 包含了很多功能，生成出来的静态文件也复杂得多。最直观的感受就是，用 `next.js` 构建完之后，用 [PageSpeed](https://developers.google.com/speed/pagespeed/insights/?hl=zh-CN) 测试出来的得分反而降低了。

而用 `next.js` 的目的就是为了能用 React 来写博客页面，并且第一次加载的时候能有内容（其实就是 React 的服务器端渲染）。考虑清楚之后，觉得难度不大，加上想自己造造轮子，便写了 [Cubi](https://github.com/clinyong/cubi)，一个用 React 生成静态博客的工具。这个名字的由来，也是取自火影当中九尾的谐音。

![](http://g.udn.com.tw/upfiles/B_ME/meatball2/PSN_PHOTO/615/f_17000615_1.JPG)

写这个工具，主要碰到了两个问题

*   怎样静态输出 React 组件
*   怎样处理样式
*   怎样处理路由

### 静态输出 React 组件

`react-dom` 这个包提供了一个 `renderToString` 的方法，可以把组件以字符串的形式输出

```ts
import * as ReactDOMServer from "react-dom/server";
import Component from "...";

const ins = React.createElement(Component, props);
const componentStr = ReactDOMServer.renderToString(ins);

console.log(componentStr);
```

只需要把输出的字符串，插入到我们的 HTML 模板里面，就可以正常显示了。输出完之后，还有一个问题，就是上面绑定的事件都没有了。这是因为 `renderToString` 只是做静态输出，并不会把事件绑定上去。还好 ReactDOM 提供了另外一个方法，(hydrate)[https://reactjs.org/docs/react-dom.html#hydrate]，来做这件事情。

`hydrate` 的用法基本和 `render` 一样，官方的文档已经说的很清楚了

> Same as render(), but is used to hydrate a container whose HTML contents were rendered by ReactDOMServer. React will attempt to attach event listeners to the existing markup.

博客总共有 3 个[入口文件](https://github.com/clinyong/blog/tree/master/src/view)，Cubi 读取了这三个入口文件之后，会通过一个 [Hydrate](https://github.com/clinyong/cubi/blob/master/src/ReactHydrate.ts) 的插件，在每个入口文件里面加多一句

```ts
ReactDOM.funcName(<componentName />, document.getElementById("app"));
```

这里的 `componentName` 就是每个入口文件 `export default` 对应的组件名称，`funcName` 有两种情况，在开发模式下为 `render`，在编译发布的时候，是 `hydrate`。

### 添加样式

样式是采用 `styled-component`，这个库本身也是支持服务器端渲染，[官方文档](https://www.styled-components.com/docs/advanced#server-side-rendering) 也有很好的说明。`styled-component` 提供了一个 `getStyleTags`的 api，可以把整个页面用到的类都提取出来

```ts
import * as ReactDOMServer from "react-dom/server";
import Component from "...";
import { ServerStyleSheet } from "styled-components";

const ins = React.createElement(Component, props);
const sheet = new ServerStyleSheet();
ReactDOMServer.renderToString(sheet.collectStyles(ins));

initStyles = sheet.getStyleTags();
console.log(initStyles);
```

`initStyles` 就是整个组件，包括其子组件对应的样式，我们只需要把这部分直接插入到 HTML 模板的 head 头部就可以了。

> 这里也比较偷懒，直接把 Cubi 和 `styled-component` 绑定在一起，使的要用 Cubi 去生成页面的话，样式一定采用 `styled-component`。更好的做法应该像
> `next.js` 那样，可以自由选择第三方样式库。

### 路由处理

路由处理是比较麻烦的事情，在这里也是借鉴了 `next.js` 的做法。在 Cubi 的[配置文件](https://github.com/clinyong/blog/blob/master/cubi.config.js)里面，有个 `exportPathMap` 用于配置路由

```js
{
    async exportPathMap() {
        const files = await readArticles();
        const pages = files.reduce(
            (pages, file) =>
                Object.assign({}, pages, {
                    [file.link]: {
                        page: "post",
                        query: { content: file.result }
                    }
                }),
            {}
        );

        return Object.assign({}, pages, {
            index: {
                page: "index",
                query: {
                    articles: files.slice(0, 10).map(item => ({
                        link: item.link + ".html",
                        title: item.title
                    }))
                }
            },
            archive: {
                page: "index",
                query: {
                    articles: files.map(item => ({
                        link: item.link + ".html",
                        title: item.title
                    }))
                }
            },
            about: {
                page: "about"
            }
        });
    }
}
```

`readArticles` 是把某个目录下面的文章全部读出来，转成一个 `pages` 对象。这个对象的每个 key 值就是文章的路径，比如这篇文章就是 `post/15-intro-cubi`。每个 key 对应的字段又是一个对象，这个对象里面的 `page` 是指定要选用哪个模板组件，`query` 是组件一开始加载的参数。

`pages` 包含了所有的文章页面，除此之外还要再加上首页，归档和关于页面。上面这些就是博客的全部路由。

Cubi 内部是通过一个 HTML [插件](https://github.com/clinyong/cubi/blob/master/src/HTMLPlugin.ts)来处理路由的

```ts
const routesMap = await exportPathMap();

Object.keys(routesMap).forEach(k => {
    const routeItem = routesMap[k];
    const entryItem = entry[routeItem.page] as string;

    if (entryItem) {
        const entryPath = findEntryPath(entryItem);
        const props = routeItem.query;

        if (entryPath) {
            let initContent = "";
            let initStyles = "";
            let initProps = props ? JSON.stringify(props) : "{}";
            let entryList = [routeItem.page + ".js"];
            if (isProd) {
                // 静态输出组件，拿到 initContent 和 initStyles
                const sheet = new ServerStyleSheet();
                const Component = require(entryPath).default;
                const ins = React.createElement(Component, props);
                initContent = ReactDOMServer.renderToString(
                    sheet.collectStyles(ins)
                );
                initStyles = sheet.getStyleTags();
            }
        }

        const content = ejs.render(templateContent, {
            initProps
            // 传进模板里面的各种参数
        });

        compilation.assets[`${k}.html`] = {
            source: () => content,
            size: () => content.length
        };
    }
});
```

这个插件会遍历整个路由对象，根据每个路由上面定义的 `page` 字段找到对应的模板组件路径 `entryPath`，然后就是之前说的，静态输出这个组件，拿到对应的内容和样式，插入到 ejs 的模板里面。然后再把模板生成的内容，添加到 webpack 输出的 `assets` 里面。

当在服务器端静态输出组件的时候，我们直接把 `initProps` 传给 `React.createElement`，让组件能正常输出。但是当页面加载完，我们调用 `ReactDOM.render` 或者 `ReactDOM.hydrate` 时，怎样把参数传给组件呢？这里会把要初始化的 props 传给 ejs 模板，[模板里面](https://github.com/clinyong/cubi/blob/master/config/template.html#L17)会创建一个全局变量 `INIT_PROPS`，最上面介绍的 [Hydrate](https://github.com/clinyong/cubi/blob/master/src/ReactHydrate.ts#L64) 插件会在创建组件的时候，去读取这个值，类似下面这样

```tsx
ReactDOM.hydrate(
    React.createElement(Post, INIT_PROPS),
    document.getElementById("app")
);
```

上面就是 Cubi 基本的构建过程，更详细的实现，可以看下项目的源码。
