title: 什么时候应该用 setState 的回调
date: 2018.10.19
---

React 的 setState 支持传一个回调函数，比如像下面这样

```js
this.setState({
    name: "leo"
}, () => {
    console.log("done")
})
```

当这个 state 更新完之后，就会打印出 done。翻下 React 的源码看下这个回调具体是在什么时候被执行的。在 16.5.2 这个版本的 `packages/react-reconciler/src/ReactFiberCommitWork.js` 这个文件当中的 `commitLifeCycles` 函数

```js
function commitLifeCycles(
  finishedRoot: FiberRoot,
  current: Fiber | null,
  finishedWork: Fiber,
  committedExpirationTime: ExpirationTime,
): void {
    switch (finishedWork.tag) {
        case ClassComponent:
        case ClassComponentLazy: {
            if () {
            } else {
                // 执行 componentDidUpdate 函数
                instance.componentDidUpdate(
                    prevProps,
                    prevState,
                    instance.__reactInternalSnapshotBeforeUpdate,
                );
            }
        }
    }

    const updateQueue = finishedWork.updateQueue;
    if (updateQueue !== null) {
        // 执行 setState 回调
    }
}
```

上面省略了大部分代码，这里可以看到回调函数是在 componentDidUpdate 后面执行的。当然也可以在具体的代码当中加一个 componentDidUpdate 测试下。

从一开始用 React 到现在，基本是特别少用过 setState 的回调函数。但是这次团队内部做 codereview，发现很多童鞋喜欢像下面这样写

```js
B() {
    const count = this.state.count
    // 一大堆对 count 的处理逻辑
    this.setState({
        msg: `Count is ${count}`
    })
}

A(count) {
    this.setState({
        count
    }, this.B)
}
```

实际代码要比这个复杂，大概就是 A 中 setState 了一个 state，这里是 count。然后在执行回调里面的函数中再调用另外一个 B 方法。这个 B 方法因为依赖 state 当中的 count，所以要放在回调当中执行。

这里最大的问题就是这个 B 方法后面还会执行 setState，这样导致 A 当中的 setState 根本就没太大作用。而且还有额外的开销，因为要执行一次 render。当然上面还只是嵌套了两层，实际的业务代码当中，有发现嵌套非常多层的。。。也就是在 B 当中的 setState 再设置一个回调 C，然后 C 中又会 setState。。。

对于上面的方法，完全可以改成下面这样

```js
B(count) {
    // 一大堆对 count 的处理逻辑
    this.setState({
        msg: `Count is ${count}`
    })
}

A(count) {
    this.setState({
        count
    })
    this.B(count)
}
```

因为这里的代码比较简单，所以可能会觉得这个改动没什么。但是对于实际的业务代码，本质的问题也和上面一样。**所以会执行到 setState 的方法，一定是不能放到回调函数里面执行！**

那看起来 setState 的回调函数好像没啥作用了。实际上还是有的，比如下面这样的场景

```js
class Test {
    componentDidUpdate(prevProps, prevState) {
        if (prevState.count !== this.state.count) {
            reportCountChange()
        }
    }

    A(count) {
        this.setState({
            count: count+1
        })
    }
}
```

当在 count 发生变化的时候，执行 `reportCountChange`，这里面的逻辑可以是到服务器端打点或者其它一些不会涉及到 setState 的操作。如果把这步操作当作回调，则处理方式会优雅很多。

```js
class Test {
    A(count) {
        this.setState({
            count: count+1
        }, reportCountChange)
    }
}
```

（完）
