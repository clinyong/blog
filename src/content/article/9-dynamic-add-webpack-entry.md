title: 动态加载 webpack entry
date: 2017.09.06
---

在多页面的项目中，一般我们会把每个页面作为一个 webpack 的 entry，比如像下面这样的配置文件

```js
module.exports = {
    entry: {
        page1: "./page1",
        page2: "./page2"
    }
}
```

当一个项目很庞大的时候，比如有上百个 entry，如果我们只是要改其中一个页面，但是却要把全部 entry 都打包，势必速度就会大大降低。
所以会先让用户选择某一个，然后让 webpack 只打包这个 entry。

这也带来另外一个问题，如果我们要改另外的页面，就得结束当前的程序，重新运行命令选择 entry。

## next.js

前几天把博客用 `next.js` 生成，发现 `next.js` 是根据路由去动态加载 entry。也就是当你访问某个页面，如果这个 entry 之前已经编译过，就直接返回。没有的话，就把这个页面加进去让 webpack 重新编译。这种方式就很好地解决了上面说的问题。 那 `next.js` 里面是怎样实现的呢？如果你也跑过 demo，应该能在终端看到类似下面的提示

```
> Building page: xxx
```

在源码里面搜下，可以很快的定位到 [on-demand-entry-handler.js](https://github.com/zeit/next.js/blob/3.2.1/server/on-demand-entry-handler.js#L151) 里面的 `ensurePage`

```js
{
    async ensurePage (page) {
      await this.waitUntilReloaded()
      page = normalizePage(page)

      const pagePath = join(dir, 'pages', page)
      const pathname = await resolvePath(pagePath)
      const name = join('bundles', pathname.substring(dir.length))

      const entry = [`${pathname}?entry`]

      await new Promise((resolve, reject) => {
        const entryInfo = entries[page]

        if (entryInfo) {
          if (entryInfo.status === BUILT) {
            resolve()
            return
          }

          if (entryInfo.status === BUILDING) {
            doneCallbacks.on(page, processCallback)
            return
          }
        }

        console.log(`> Building page: ${page}`)

        entries[page] = { name, entry, pathname, status: ADDED }
        doneCallbacks.on(page, processCallback)

        invalidator.invalidate()

        function processCallback (err) {
          if (err) return reject(err)
          resolve()
        }
      })
    }
}
```

参数 `page` 是当前访问的路径，先从 `entries` 取对应的 `entryInfo`

```js
if (entryInfo) {
    if (entryInfo.status === BUILT) {
        resolve()
        return
    }

    if (entryInfo.status === BUILDING) {
        doneCallbacks.on(page, processCallback)
        return
    }
}
```

如果存在的话，判断下这个 `entryInfo` 的状态。如果是已经编译过的，直接返回。如果是正在编译，则监听以这个页面为名字的事件。这里猜想当编译完之后，就会触发对应的事件。这里的 `doneCallbacks` 是一个 `EventEmitter` 实例。

```js
import { EventEmitter } from 'events'

let doneCallbacks = new EventEmitter()
```

如果不存在这个 entry 的话，打印提示，初始化 entry，加到 `entries` 当中。同样的也要监听这个页面事件。

```js
console.log(`> Building page: ${page}`)

entries[page] = { name, entry, pathname, status: ADDED }
doneCallbacks.on(page, processCallback)

invalidator.invalidate()
```

最后面一句的作用是让 webpack 重新编译，`invalidator` 是 `Invalidator` 实例，用于维护 webpack 打包时候的状态。

```js
class Invalidator {
  constructor (devMiddleware) {
    this.devMiddleware = devMiddleware
    this.building = false
    this.rebuildAgain = false
  }

  invalidate () {
    if (this.building) {
      this.rebuildAgain = true
      return
    }

    this.building = true
    this.devMiddleware.invalidate()
  }

  startBuilding () {
    this.building = true
  }

  doneBuilding () {
    this.building = false
    if (this.rebuildAgain) {
      this.rebuildAgain = false
      this.invalidate()
    }
  }
}
```

这个类中初始化传入的 `devMiddleware` 就是我们平时用的 [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware)，项目的 [README](https://github.com/webpack/webpack-dev-middleware#advanced-api) 也有对 `invalidate` 进行说明。上面我们只是把 entry 加到了 `entries` 里面，而 `entries` 只是一个很普通的全局对象，那 webpack 的配置是怎样被更改的呢？

在这个文件往上翻的话，可以看到初始化了下面这个插件

```js
compiler.plugin('make', function (compilation, done) {
    invalidator.startBuilding()

    const allEntries = Object.keys(entries).map((page) => {
        const { name, entry } = entries[page]
        entries[page].status = BUILDING
        return addEntry(compilation, this.context, name, entry)
    })

    Promise.all(allEntries)
        .then(() => done())
        .catch(done)
})
```

写过 webpack 插件的应该对上面的代码很熟悉了，这里调用了 `invalidator.startBuilding`，保证 webpack 只有在编译完成后才能再次编译。然后遍历 `entries` 这个全局对象，给每个 entry 调用 `addEntry` 这个方法。

```js
import DynamicEntryPlugin from 'webpack/lib/DynamicEntryPlugin'

function addEntry (compilation, context, name, entry) {
  return new Promise((resolve, reject) => {
    const dep = DynamicEntryPlugin.createDependency(entry, name)
    compilation.addEntry(context, dep, name, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}
```

`addEntry` 返回一个 `Promise`，调用 webpack 内置的 `DynamicEntryPlugin` 插件创建真正的 entry，并加入到 `compilation` 中。到此，你新加入的 `entry` 就会被编译了。那编译成功之后呢，我们还监听了对应页面的事件。

这里面其实还初始化了另外一个插件

```js
compiler.plugin('done', function (stats) {
    // Call all the doneCallbacks
    Object.keys(entries).forEach((page) => {
      const entryInfo = entries[page]
      if (entryInfo.status !== BUILDING) return

      entryInfo.status = BUILT
      entries[page].lastActiveTime = Date.now()
      doneCallbacks.emit(page)
    })

    invalidator.doneBuilding()
})
```

源码里面还做了一些错误处理，这里只看我们关心的部分。在 webpack 编译完成后，先遍历 `entries`，找到其中状态为 `BUILDING` 的 entry，把状态改为 `BUILT`，然后触发对应的事件，`doneCallbacks.emit(page)`，这样之前监听在这个页面的回调函数就被会被触发。

完成上面的事情之后，还调用了 `doneBuilding`。这个其实是检查一下在刚刚 webpack 的编译过程中，有没有新的 entry 要求被重新编译，有的话，再次调用 `invalidate`，让 webpack 再编译一次。

## 后记

在实际的项目当中，可以把上面的处理过程封装成一个 express 的中间件，这样子我们平时开发只要运行一下 `make dev`，启动一下服务器，然后根据访问的路由去编译对应的 entry 就可以。

最后，还剩下一个问题。一开始的 entry 要初始化成什么呢，如果 webpack 接受到的是一个空的 entry，会直接抛出错误。我的做法是随机选一个 entry 初始化，如果第一次访问到这个随机 entry，还可以加多一个彩蛋效果。比如在终端输出

```
Boom!!! You have hit the random entry.
```

(完)
