title: 阅读 React 源码之 setState
date: 2017.08.20
---

这篇文章介绍一下，当运行了 `setState` 之后，具体发生了什么事情。`setState` 的具体代码在 [ReactComponent.js](https://github.com/facebook/react/blob/v15.4.2/src/isomorphic/modern/class/ReactComponent.js) 中

```js
ReactComponent.prototype.setState = function(partialState, callback) {
  this.updater.enqueueSetState(this, partialState);
  if (callback) {
    this.updater.enqueueCallback(this, callback, 'setState');
  }
};
```

这里的 `updater` 是哪里来的，在源文件中，有下面这样一句

```js
// We initialize the default updater but the real one gets injected by the renderer.
this.updater = updater || ReactNoopUpdateQueue;
```

官方的注释写着真正的 `updater` 不是在这里初始化的。全局搜索了一圈。发现在 [ReactCompositeComponent.js](https://github.com/facebook/react/blob/v15.4.2/src/renderers/shared/stack/reconciler/ReactCompositeComponent.js) 中有下面这样一段

```js
inst.props = publicProps;
inst.context = publicContext;
inst.refs = emptyObject;
inst.updater = updateQueue;
```

可以看到 `updater` 是在这时候才真正初始化。 `updateQueue` 来自

```js
var updateQueue = transaction.getUpdateQueue();
```

而这里的 transaction 来自 [ReactMount.js](https://github.com/facebook/react/blob/v15.4.2/src/renderers/dom/client/ReactMount.js) 中的 `ReactReconcileTransaction`

```js
function batchedMountComponentIntoNode(componentInstance, container, shouldReuseMarkup, context) {
  var transaction = ReactUpdates.ReactReconcileTransaction.getPooled(
  !shouldReuseMarkup && ReactDOMFeatureFlags.useCreateElement);
  transaction.perform(mountComponentIntoNode, null, componentInstance, container, transaction, shouldReuseMarkup, context);
  ReactUpdates.ReactReconcileTransaction.release(transaction);
}
```

在 [ReactReconcileTransaction.js](https://github.com/facebook/react/blob/v15.4.2/src/renderers/dom/client/ReactReconcileTransaction.js) 中能看到 `getUpdateQueue` ，所以这里的 `updater` 就是 `ReactUpdateQueue`。费了这样一大圈才算找到了 `updater`，真是不知道为什么要这样写。。。

接着看看一开始的 `enqueueSetState` ，在 [ReactUpdateQueue.js](https://github.com/facebook/react/blob/v15.4.2/src/renderers/shared/stack/reconciler/ReactUpdateQueue.js) 中

```js
enqueueSetState: function (publicInstance, partialState) {
  var internalInstance = getInternalInstanceReadyForUpdate(publicInstance, 'setState');
  if (!internalInstance) {
    return;
  }

  var queue = internalInstance._pendingStateQueue || (internalInstance._pendingStateQueue = []);
  queue.push(partialState);

  enqueueUpdate(internalInstance);
},
```

每个 react component 都有一个内部实例 `internalInstance`，`enqueueUpdate` 会把要更新的 state 加到 `_pendingStateQueue` 数组里面。看下最后一句，调用了 [ReactUpdates.js](https://github.com/facebook/react/blob/v15.4.2/src/renderers/shared/stack/reconciler/ReactUpdates.js) 中的

```js
function enqueueUpdate(component) {
  dirtyComponents.push(component);
  if (component._updateBatchNumber == null) {
    component._updateBatchNumber = updateBatchNumber + 1;
  }
}
```

把这个需要更新的组件加到 `dirtyComponents` 里面。所以`setState` 其实就做了两件事

- 把 state 加到组件的 _pendingStateQueue
- 把这个组件加到 dirtyComponents

这里也可以知道 `setState` 是异步的，每次 `setState` 只是先保存下状态，不会立即更新界面。

那究竟是什么时候才更新界面呢？我们继续往下看。事实上，整个 `setState` 是包含在 `ReactDefaultBatchingStrategy` 当中，这个事务有一个 `FLUSH_BATCHED_UPDATES` 的 wrapper 用来在最后面更新 state。在 [ReactUpdates.js](https://github.com/facebook/react/blob/v15.4.2/src/renderers/shared/stack/reconciler/ReactUpdates.js) 中的

```js
var flushBatchedUpdates = function() {
  while (dirtyComponents.length) {
    var transaction = ReactUpdatesFlushTransaction.getPooled();
    transaction.perform(runBatchedUpdates, null, transaction);
    ReactUpdatesFlushTransaction.release(transaction);
  }
};
```

上面的代码就是找出 `dirtyComponents` ，执行 `runBatchedUpdates`

```js
function runBatchedUpdates() {
	// ...

	ReactReconciler.performUpdateIfNecessary(
		component,
		transaction.reconcileTransaction,
		updateBatchNumber
	);

	// ...
}
```

主要来看下其中的 `performUpdateIfNecessary`，在 [ReactReconciler.js](https://github.com/facebook/react/blob/v15.4.2/src/renderers/shared/stack/reconciler/ReactReconciler.js)

```js
function performUpdateIfNecessary() {
	// ...

	internalInstance.performUpdateIfNecessary(transaction);

	// ...
}
```

react 的源码特别绕，去除了一大堆 Debug 代码之后，其实是执行内部实例的 `performUpdateIfNecessary`，[ReactCompositeComponent.js](https://github.com/facebook/react/blob/v15.4.2/src/renderers/shared/stack/reconciler/ReactCompositeComponent.js)

```js
function performUpdateIfNecessary() {
	if (this._pendingElement != null) {
		ReactReconciler.receiveComponent(
			this,
			this._pendingElement,
			transaction,
			this._context
		);
	} else if (this._pendingStateQueue !== null || this._pendingForceUpdate) {
		this.updateComponent(
			transaction,
			this._currentElement,
			this._currentElement,
			this._context,
			this._context
		);
	} else {
		this._updateBatchNumber = null;
	}
}
```

在这里会执行 `updateComponent` 这个方法

```js
function updateComponent(params) {
	// ...

	// use Object.assign to update state
	var nextState = this._processPendingState(nextProps, nextContext);
	var shouldUpdate = true;

	if (!this._pendingForceUpdate) {
		if (inst.shouldComponentUpdate) {
			shouldUpdate = inst.shouldComponentUpdate(
				nextProps,
				nextState,
				nextContext
			);
		} else {
			if (this._compositeType === CompositeTypes.PureClass) {
				shouldUpdate =
					!shallowEqual(prevProps, nextProps) ||
					!shallowEqual(inst.state, nextState);
			}
		}
	}

	if (shouldUpdate) {
		this._pendingForceUpdate = false;
		this._performComponentUpdate(
			nextParentElement,
			nextProps,
			nextState,
			nextContext,
			transaction,
			nextUnmaskedContext
		);
	} else {
		// ...
	}
}
```

这个方法比较复杂，还包含了一些 `props` 和 `context` 的判断，已经被省略了。这里通过 `_processPendingState` 来更新 state，这个方法内部比较简单，主要是用了 `Object.assign`。

还要继续判断 `shouldUpdate` ，如果组件有 `shouldComponentUpdate` 则运行，没有的话还要判断是不是 `PureComponent`。如果经过这个检查之后，`shouldUpdate` 还是为 true 的话，就执行 `_performComponentUpdate`

```js
function _performComponentUpdate(
	nextElement,
	nextProps,
	nextState,
	nextContext,
	transaction,
	unmaskedContext
) {
	var inst = this._instance;

	var hasComponentDidUpdate = Boolean(inst.componentDidUpdate);
	var prevProps;
	var prevState;
	var prevContext;
	if (hasComponentDidUpdate) {
		// save pre status
		prevProps = inst.props;
		prevState = inst.state;
		prevContext = inst.context;
	}

	if (inst.componentWillUpdate) {
		// ...
	}

	this._currentElement = nextElement;
	this._context = unmaskedContext;
	inst.props = nextProps;
	inst.state = nextState;
	inst.context = nextContext;

	this._updateRenderedComponent(transaction, unmaskedContext);

	if (inst.componentDidUpdate) {
		// ....
	}
}
```

这里判断两个生命周期函数，`componentWillUpdate` 和 `componentDidUpdate`。然后把下一个状态的 state，props 和 context 更新到实例上。执行 `_updateRenderedComponent`

```js
function _updateRenderedComponent(transaction, context) {
	var prevComponentInstance = this._renderedComponent;
	var prevRenderedElement = prevComponentInstance._currentElement;
	// only call inst.render, no magic
	var nextRenderedElement = this._renderValidatedComponent();

	if (shouldUpdateReactComponent(prevRenderedElement, nextRenderedElement)) {
		ReactReconciler.receiveComponent(
			prevComponentInstance,
			nextRenderedElement,
			transaction,
			this._processChildContext(context)
		);
	} else {
		// ...
	}
}
```

上面的 `_renderValidatedComponent` 调用了组件的 `render` 方法，把新生成的元素和之前的比较，如果需要更新，则调用 `ReactReconciler.receiveComponent` 。先来看看 `shouldUpdateReactComponent`

```js
function shouldUpdateReactComponent(prevElement, nextElement) {
	var prevEmpty = prevElement === null || prevElement === false;
	var nextEmpty = nextElement === null || nextElement === false;
	if (prevEmpty || nextEmpty) {
		return prevEmpty === nextEmpty;
	}

	var prevType = typeof prevElement;
	var nextType = typeof nextElement;
	if (prevType === "string" || prevType === "number") {
		return nextType === "string" || nextType === "number";
	} else {
		return (
			nextType === "object" &&
			prevElement.type === nextElement.type &&
			prevElement.key === nextElement.key
		);
	}
}
```

上面就是源码里面完整的代码，可以看出非常简单。更新部分的代码 `ReactReconciler.receiveComponent` 调用了 [ReactDOMComponent.js](https://github.com/facebook/react/blob/v15.4.2/src/renderers/dom/shared/ReactDOMComponent.js) 里面的 `updateComponent`

```js
function updateComponent(transaction, prevElement, nextElement, context) {
	// ...

	this._updateDOMProperties(lastProps, nextProps, transaction);
	this._updateDOMChildren(lastProps, nextProps, transaction, context);

	// ...
}
```

`_updateDOMProperties` 是更新 DOM 节点上的属性，`_updateDOMChildren` 是更新内容。当运行完 `_updateDOMChildren` 之后，就会发现界面已经发生了改变。因为这整一个过程都在事务当中，而且还是嵌套事务，所以最后面就需要执行所有 wrapper 的 `close` 方法。

整个 `setState` 的过程大致就是这样，跳过了很多细节的代码，也没有涉及到 DOM Diff 算法。这部分应该可以重新写篇文章。
