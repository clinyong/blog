title: 用 next.js 构建博客
date: 2017.08.26
---

之前的博客是通过模板去生成 HTML，模板引擎用的是 [art-template](https://github.com/aui/art-template)。用 PostCSS 去处理 `scss` 文件，手动去压缩生成后的静态文件。

传统的静态博客生成工具大概都是这样子。平时工作中都是在用 `React`，所以也一直想着能把上面的流程都改成用 `React` 来构建。刚好前不久，`next.js` 出了 [3.0](https://zeit.co/blog/next3) 版本，其中一个主要的特性就是支持静态文件输出，特别适合拿来生成静态博客。
当然社区里面已经有基于 `next.js` 的博客生成工具，不过还是想自己去实现一套。

根据官方文档，安装需要的依赖，这里的 css 方案选择现在比较热门的 [styled-components](https://www.styled-components.com/)。`pages` 目录下对应着每个页面文件，比如 `index.js` 就会生成 `index.html`。我们这里需要三个文件

- _document.js
- index.js
- post.js

`_document.js` 用来改写 `<html>`，`<body>` 的默认行为。另外两个文件，一个是首页，一个是文章页面。因为要生成静态文件，所以这里要额外的配置一下 `next.js`。配置的内容放在 `next.config.js` 中

```js
const readArticles = require("./lib/readArticles");

module.exports = {
	async exportPathMap() {
		const files = await readArticles();
		const pages = files.reduce(
			(pages, file) =>
				Object.assign({}, pages, {
					[file.link]: {
						page: "/post",
						query: { content: file.result }
					}
				}),
			{}
		);

		return Object.assign({}, pages, {
			"/": {
				page: "/",
				query: {
					articles: files.map(item => ({
						link: item.link,
						title: item.title
					}))
				}
			}
		});
	}
};
```

先来看下每个路由对象，这里以首页和某一篇文章为例

```js
{
    "/": {				
        page: "/",
        query: {
            articles: files.map(item => ({
                link: item.link,
                title: item.title
            }))
        }
    },
    "/post/1-hello-world/": {
        page: "/post",
        query: { content: file.result }
    },
    // more...
}
```

每个 `key` 是具体的路径，`page` 是选择对应了哪个组件，比如这里的首页是 `pages` 目录下的 `index.js` 组件。`query` 是要传给组件的参数，这个参数会在组件的 `getInitialProps` 方法接收。比如首页这个组件

```js
export default class Index extends React.PureComponent {
	static async getInitialProps({ query }) {
		return { articles: query.articles || [] };
	}

    render() {
        return (
            <ul>
                {
                   articles.map(item => (
                       <li>
                            <a href={item.link}>{item.title}</a>
                       </li>
                   ))
                }
            </ul>
        )
    }
}
```

`getInitialProps` 这个方法会在生成 HTML 的时候执行。最早的时候，是以下面的方式去读取所有的文章

```js
import fs from "fs-extra";

export default class Index extends React.PureComponent {
	static async getInitialProps() {
        const files = await fs.readDir(/*...*/)
		return { articles: query.articles || [] };
	}

    render() {
        // ...
    }
}
```

后面编译的时候总是会报各种奇怪的错误，考虑到 `fs` 并不是浏览器和服务器通用的模块，所以最后面还是把读取所有文章的操作放到了 `next.config.js` 中。上面这样的配置，编译成 HTML 已经没有什么大问题了。然后开始来考虑开发模式。

直接用 `next.js` 的开发模式是不可行的，比如我们的首页组件这些都是需要接受路由参数的，而当我们直接访问 `http://localhost:3000/` 是没有带参数的。所以需要重写一下 devServer

```js
const files = await readArticles();
const server = express();
const app = next();

server.get("/post/:name", (req, res) => {
    const file = files.find(item => item.link === req.path);
    return app.render(req, res, "/post", {
        content: file.result
    });
});

server.get("*", (req, res) => {
    return app.render(req, res, "/", {
        articles: files.map(item => ({
            link: item.link,
            title: item.title
        }))
    });
});
```

这里同样是伪代码，用来说明一下 `express` 的路由配置。可以看到，这里调用 `app.render`，手动给组件传所需要的参数。

配置到这里之后，基本整个流程都能跑通了，看下生成出来的静态文件，比以前复杂许多。不过这也很正常，`next.js` 包含了很多功能，不止用来生成博客。后期也会考虑自己实现一个简易的 `React` 服务器端渲染方案来替代 `next.js`。
