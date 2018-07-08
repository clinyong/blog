title: ezpack dashboard
date: 2018.05.02
---

ezpack 是公司内部用的一个打包工具，基于 webpack。由 ezpack 构建的项目大部分都是多页面的，存在一种需求就是我想看下项目是跑在哪个端口，或者当前编译了哪些页面。一开始启动开发服务器的时候，还能显示这些信息，但是写着写着，信息就都会像下面这样被 webpack 的编译日志冲掉。

![](http://ol07x5ssf.bkt.clouddn.com/build.png)

针对这个问题，社区已经有了解决方案，就是 [webpack-dashboard](https://github.com/FormidableLabs/webpack-dashboard)。不过 `webpack-dashboard` 没办法定制界面，所以不能直接嵌入到 ezpack 中。最后，我只能参考它的代码，自己从头写一个 dashboard。

`webpack-dashboard` 底层是用 [blessed](https://github.com/chjj/blessed) 去做界面显示。

```js
console.log('hello world');
```

默认情况下，上面打印的语句是会直接输出到终端的。而我们要做的是，不要输出到终端，而是输出到我们界面指定的地方。`console.xxx` 一系列的 API 最终都是调用 `process.stdout.write` 和 `process.stderr.write`。一个是标准输出，一个是标准错误。所以我们可以改写上面两个方法，不让它们直接输出到终端。

`webpack-dashboard` 的做法是用两个进程，一个主进程用来做 UI 显示，另外再 fork 一个子进程来负责 webpack 编译。子进程的输出是不会直接打印到终端的，然后再监听子进程的标准输入和标准错误。

```js
child.stdout.on("data", data => {
    dashboard.setData([{
    type: "log",
    value: data.toString("utf8")
    }]);
});

child.stderr.on("data", data => {
    dashboard.setData([{
    type: "log",
    value: data.toString("utf8")
    }]);
});
```

这样子，输出既不会直接打印到屏幕，而我们又能拿到输出的内容，进行下一步的操作。后面自己在重写的时候，想着能不能在同一个进程里面做这个事情。上面也说了，输出会最终影响到 `process.stdout.write`，而 `blessed` 也是用这个方法来输出终端 UI 的。所以要做的是，在不影响 `blessed` 的情况下，改下 `process.stdout.write`。

还好的是，`blessed` 有个选项来指定标准输入输出。所以我们只要全局搜索一下 `blessed` 的源码，看下用了标准输出上面什么字段，就可以自己创建一个传进去。主要的代码逻辑大概像下面这样

```js
class Dashboard {
    constructor() {
        const stdout = process.stdout;

        this.screen = blessed.screen({
			output: {
				write: stdout.write.bind(stdout),
				isTTY: stdout.isTTY,
				on: stdout.on.bind(stdout),
				removeListener: stdout.removeListener.bind(stdout),
				writable: stdout.writable,
				bytesWritten: stdout.bytesWritten,
				columns: stdout.columns,
				rows: stdout.rows
			}
		});

        stdout.write = this.setLog.bind(this);
		process.stderr.write = stdout.write;
    }

    setLog(content) {
        // 输出到指定的地方
    }
}
```

为了不影响 `blessed` 的输出，`write` 方法还是指向原来的方法。stdout 的其它字段也都是 `blessed` 里面需要用到的。创建完之后，我们就可以把其它所有的输出都指向到 `setLog`。这样就可以拿到输出的内容，做下一步操作。

最后献上一张完整版的界面 ^_^

![](http://ol07x5ssf.bkt.clouddn.com/WechatIMG548.jpeg)
