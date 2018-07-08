title: 阅读 React 源码之 Transaction
date: 2017.08.19
---

调试过 React 的童鞋一定见过下面这样的调用栈

![](http://ol07x5ssf.bkt.clouddn.com/Screen%20Shot%202017-08-19%20at%2017.10.07.png)

图中的 `perform` 就是事务的核心方法（在这里把 Transaction 翻译为事务）。事实上，整个 React 的更新，渲染都是处在事务当中。那到底什么是事务呢？

在 React 的源码中有一副图形象地解释了事务

```js
/**
 *
 * <pre>
 *                       wrappers (injected at creation time)
 *                                      +        +
 *                                      |        |
 *                    +-----------------|--------|--------------+
 *                    |                 v        |              |
 *                    |      +---------------+   |              |
 *                    |   +--|    wrapper1   |---|----+         |
 *                    |   |  +---------------+   v    |         |
 *                    |   |          +-------------+  |         |
 *                    |   |     +----|   wrapper2  |--------+   |
 *                    |   |     |    +-------------+  |     |   |
 *                    |   |     |                     |     |   |
 *                    |   v     v                     v     v   | wrapper
 *                    | +---+ +---+   +---------+   +---+ +---+ | invariants
 * perform(anyMethod) | |   | |   |   |         |   |   | |   | | maintained
 * +----------------->|-|---|-|---|-->|anyMethod|---|---|-|---|-|-------->
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | +---+ +---+   +---------+   +---+ +---+ |
 *                    |  initialize                    close    |
 *                    +-----------------------------------------+
 * </pre>
 *
 */
```

一个事务开始的时候，会执行所有 wrapper 的 `initialize` 的方法，做一些初始化的工作。然后再执行我们传入的方法。最后会执行所有 wrapper 的 `close` 方法，做一些收尾的工作。看个例子。

```js
const Transaction = require("./Transaction");

const TEST_WRAPPER = {
	initialize: function() {
		console.log("initialize...");
	},
	close: function() {
		console.log("close...");
	}
};

const TRANSACTION_WRAPPERS = [TEST_WRAPPER];

function TestTransaction() {
	this.reinitializeTransaction();
}

// 注入 wrapper
Object.assign(TestTransaction.prototype, Transaction, {
	getTransactionWrappers: function() {
		return TRANSACTION_WRAPPERS;
	}
});

const testTransaction = new TestTransaction();
testTransaction.perform(function() {
    console.log("perform!!!");
});
```

运行上面的代码，会得到下面这样的输出

```
$ node ./index.js
initialize...
perform!!!
close...
```

这个例子的完整代码已经放到 [gist](https://gist.github.com/clinyong/ae17889b6037a590f99dd35308d2f53e)，这里还要注意一点的是，事务是可以嵌套的，比如我在事务 A 的 perform 里面调用事务 B。

知道了事务是什么之后，我们再来看看[内部](https://github.com/facebook/react/blob/master/src/renderers/shared/stack/reconciler/Transaction.js)是怎样实现的。

```js
function perform(method, scope, a, b, c, d, e, f) {
  if (this._isInTransaction) {
      // 不能同时执行同一个事务
      console.error("Transaction.perform(...): Cannot initialize a transaction when there is already an outstanding transaction.");
      return;
  }

  var errorThrown;
  try {
    this._isInTransaction = true;
    errorThrown = true;
    this.initializeAll(0); // 执行所有 Wrapper 的初始化方法
    ret = method.call(scope, a, b, c, d, e, f); // 执行我们传入的方法
    errorThrown = false;
  } finally {
    try {
      if (errorThrown) {
        try {
          this.closeAll(0);
        } catch (e) {} 
      } else {
         this.closeAll(0);
      }
    } finally {
      this._isInTransaction = false;
    }
  }
}
```

上面是简化过完的代码，逻辑和源码里面是一样的。可以看到，整个 perform 也很简单。细心的童鞋应该能发现，这里大部分函数的执行并没有用 `catch` 来捕获异常，而是用了 `errorThrown` 这个标志来判断函数的执行情况。官方在代码里面的注释是说直接用 `catch` 的方式会让 Debug 变得很困难。再来看下初始化部分的代码

```js
function initializeAll(startIndex) {
  for (var i = startIndex; i < transactionWrappers.length; i++) {
    var wrapper = transactionWrappers[i];
    try {
      this.wrapperInitData[i] = OBSERVED_ERROR;
      this.wrapperInitData[i] = wrapper.initialize
        ? wrapper.initialize.call(this)
        : null;
    } finally {
      if (this.wrapperInitData[i] === OBSERVED_ERROR) {
        // 如果某个初始化的过程出错，让这个错误一直往上抛，但是继续执行剩下的初始化函数
        try {
          this.initializeAll(i + 1);
        } catch (err) {}
      }
    }
  }
}
```

这里也是对错误进行了特殊处理，抛出第一个出错的 wrapper 之后，会继续执行剩下的 wrapper。每个 wrapper 执行完的返回值会保存到 `this.wrapperInitData[i]` 当中。

```js
function closeAll(startIndex) {
  for (var i = startIndex; i < transactionWrappers.length; i++) {
    var wrapper = transactionWrappers[i];
    var initData = this.wrapperInitData[i];
    var errorThrown;
    try {
      errorThrown = true;
      if (initData !== OBSERVED_ERROR && wrapper.close) {
        // 初始化拿到的返回值会作为参数传给 close
        wrapper.close.call(this, initData);
      }
      errorThrown = false;
    } finally {
      if (errorThrown) {
        try {
          this.closeAll(i + 1);
        } catch (e) {}
      }
    }
  }

  this.wrapperInitData.length = 0;
}
```

这里的逻辑和初始化的基本一致，只是会把初始化拿到的返回值会作为参数传给 `close`。把三个主要是执行方法都看了一遍之后，还有最后一个问题，wrappers 是怎么初始化的呢？答案就在 `reinitializeTransaction` 这个方法里面。

```js
function reinitializeTransaction() {
    this.transactionWrappers = this.getTransactionWrappers();
    if (this.wrapperInitData) {
        this.wrapperInitData.length = 0;
    } else {
        this.wrapperInitData = [];
    }
    this._isInTransaction = false;
}
```

直接调用 `getTransactionWrappers` 就能拿到我们传入的 wrappers，接着是各种状态的初始化。这里用 `this.wrapperInitData.length = 0` 的方式把数组清空，可以避免重复创建数组。
