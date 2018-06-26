title: Redux 中间件笔记
date: 2018.06.26
---

这两天重新看下 Redux 的源码，这篇是阅读中间件源码的笔记。`applyMiddleware` 的源码中用到了一个 `compose` 方法

```js
function compose(...funcs) {
  if (funcs.length === 0) {
    return args => args;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}
```

这个 `compose` 方法也是 Redux 暴露出来的 api，但是看了文档之后，还是不怎么理解上面的 `reduce` 部分，干脆就自己写了个例子。

```js
function test1(arg) {
  console.log(arg);
  console.log("test1");
}

function test2(arg) {
  console.log(arg);
  console.log("test2");
}

compose(
  test1,
  test2
)("arg");

// output:
// arg
// test2
// undefined
// test1
```

从输出可以看出，函数的执行顺序是从 compose 的最后一个函数到第一个函数。并且最后一个函数能接收到外部传进的参数。为什么能做到这样子呢？因为 `reduce` 里面，也就是 `(a, b) => (...args) => a(b(...args)` 这部分，返回的是一个函数，并不会立即执行。

明白了 `compose` 的用法之后，来看一个简略版的 `applyMiddleware`。

```js
function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    const store = createStore(...args);

    const chain = middlewares.map(middleware =>
      middleware({
        getState: store.getState
      })
    );

    const dispatch = compose(...chain)(store.dispatch);

    return {
      ...store,
      dispatch
    };
  };
}
```

一开始不理解这里为什么要用 `compose` 的返回值去覆盖原先的 `dispatch`。要回答这个问题，得先来看下 Redux 中间件的定义。以下面两个 log 中间件为例子

```js
function logger1() {
    return function next1(next) {
        return function action1(action) {
            console.log("logger1");
            return next(action);
        }
    }
}

function logger2() {
    return function next2(next) {
        return function action2(action) {
            console.log("logger2");
            return next(action);
        }
    }
}

applyMiddleware(logger1, logger2)
```

当执行 `const dispatch = compose(...chain)(store.dispatch)` 的时候，`store.dispatch` 就是 `next2` 里面的 `next` 参数。而 `action2` 就是 `next1` 里面的 `next` 参数。新的 `dispatch` 实际就是 `action1`。

所以当 dispatch 一个 action 的时候，就会先执行 `action1`，然后是 `action2`，最后才是真正的 `dispatch` 函数。输出则是先输出 `logger1`，再输出  `logger2`。

（完）
