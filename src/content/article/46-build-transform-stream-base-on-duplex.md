title: 基于 Duplex 实现 Transform Stream
date: 2019.12.07
---

Stream 是 Node.js 当中一个很重要的概念，有下面四种基本类型

- Writable
- Readable
- Duplex
- Transform

这篇文章要实现的是最后一种。先来看一个 Transform Stream 的例子

```js
const { Transform } = require('stream');

const upperCaseTr = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});

process.stdin.pipe(upperCaseTr).pipe(process.stdout);
```

上面的例子会把标准输入转成大写之后，输出到标准输出。关于 Stream 的概念不多做介绍，具体可以看看下面的文章

> [Node.js Streams: Everything you need to know](https://www.freecodecamp.org/news/node-js-streams-everything-you-need-to-know-c9141306be93/)

官方文档对于 Transform 的定义

> Transform: Duplex streams that can modify or transform the data as it is written and read

也就是说 Transform 也是一种 Duplex Stream。这个在其它介绍 Stream 的文章也有提到，但大都是一笔带过，或者只给个使用 Transform 的例子。

既然 Transform 也是 Duplex，为什么要把它作为一种 Stream 的基本类型。笔者自己想的一个答案比较简单粗暴，输出基于输入这类场景很常见。而对于 Transform，使用者只需要像文章一开始的例子一样，定义好一个 `transform` 函数即可。

到了这里终于可以进入正题，那能不能自己动手基于 Duplex 实现一个 Transform 呢？当然是可以，一开始笔者还认为很简单，最后还是参考了源码才实现出来。

```js
const { Duplex } = require("stream");

class Transform extends Duplex {
  constructor(options) {
    super(options);

    this._resetState();
    this._transform = options.transform;
    this._afterTransform = this._afterTransform.bind(this);
  }

  _resetState() {
    this._transformState = {
      writechunk: null,
      writeencoding: "",
      writecb: null
    };
  }

  _transform(chunk, encoding, cb) {
    cb(new Error("transform method is not implemented."));
  }

  _afterTransform(er, data) {
    this._transformState.writecb();
    this._resetState();
  }

  _write(chunk, encoding, callback) {
    this._transformState.writechunk = chunk;
    this._transformState.writeencoding = encoding;
    this._transformState.writecb = callback;
    this._read();
  }

  _read() {
    const { writechunk, writeencoding } = this._transformState;
    if (writechunk) {
      this._transform(writechunk, writeencoding, this._afterTransform);
    }
  }
}
```

实际的源码要更加复杂，但是上面给的实现已经足够跑起文章开头的例子。这里来看下两个核心的流程 `_write` 和 `_read`。

当从标准输入接收到数据的时候，会调用 `_write` 方法。Transform 会先把标准输入的内容存起来。

当标准输出尝试读取数据的时候，会调用 `_read` 方法。这时候会先判断有没有数据，有的话把数据传给用户定义的 `transform` 方法。（数据真正到标准输出，要等到执行了 transform 方法当中的 this.push 这一行。）执行完之后，清除掉数据。

上面是对 Transform 基于 Duplex 的简单实现，希望通过这篇文章读者能对 Transform 有更好的理解。

（完）
