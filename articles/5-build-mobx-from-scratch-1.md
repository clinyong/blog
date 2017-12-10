title: 从零实现一个 MobX （上）
date: 2017.11.16
---

[MobX](https://github.com/mobxjs/mobx) 是一个状态管理的库，作用和 redux 类似，不过更适用于中小应用。先看一个基本的使用例子。

```js
const { observable, autorun } = require("mobx");

const o = observable({
    name: "clinyong"
})

autorun(() => {
    console.log(o.name)
})

o.name = "leo"

// output:
// clinyong
// leo
```

可以看到，当每次修改 `name` 的时候，都会自动把名字打印出来。更多关于 MobX 的用法，可以看下官方文档，我们这里主要来看下如何实现上面这种效果。在开始分析之前还要说明一下

- 需要你知道 [Object.defineProperty](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 的用法
- 以下的实现代码都是用 [TypeScript](https://www.typescriptlang.org/) 实现的，不过用到的语法都是比较基础，懂 JS 的也都能看懂

先来看下 `observable` 这个 api

```ts
export function observable(v: any) {
	if (typeof arguments[1] === "string") {
		return observableClassProp(v, arguments[1]);
	}

	if (v && isObservable(v)) return v;

	if (Array.isArray(v)) return new ObservableArray(v);

	if (typeof v === "object") return ObservableObject(v);

	return v;
}
```

`observable` 先判断传进来的参数类型，去执行对应的操作。我们这里是一个对象，所以会调用 `ObservableObject`。

```ts
export function ObservableObject(props) {
	const res = {};

	Object.keys(props).forEach(k => {
		addObservableProp(res, k, props[k]);
	});

	addObservableFlag(res);
	return res;
}
```

`ObservableObject` 会创建一个新的对象，然后遍历传进来的旧对象，对每个字段调用 `addObservableProp` 方法。在这之后，会调用 `addObservableFlag`，来标示这个新创建的对象已经被处理完了，也就是被 observable 化了。来看下 `addObservableProp` 具体做了什么事情

```ts
export function addObservableProp(target: any, propName: string, v?: any) {
	const value = new ObservableValue(v);
	Object.defineProperty(target, propName, {
		configurable: true,
		enumerable: true,
		get: value.get.bind(value),
		set: value.set.bind(value)
	});
}
```

`v` 就是旧对象上面每个字段的值，这里把每个值都转成一个 `ObservableValue` 的类，然后调用 `Object.defineProperty`，把旧对象上面的属性定义到新对象上面。这里要特别注意 `get` 和 `set` 方法，会分别调用 `ObservableValue` 类上面的 `get` 和 `set`。

```ts
class ObservableValue extends Atom {
	value: any;
	constructor(value) {
		super();
		this.value = observable(value);
	}

	get() {
		this.reportObserved();
		return this.value;
	}

	set(value) {
		if (isStateAllowChange()) {
			this.value = observable(value);
			this.reportChanged();
		} else {
			reportStrictError();
		}
	}
}
```

`ObservableValue` 在初始化的时候，又会调用最开始的 `observable` 方法，来递归地处理字段，然后把处理完的值存到自身的 `value` 字段里面。当需要获取 `value` 的值的时候，就会调 `get` 方法，在返回之前，会先调用 `this.reportObserved`。`set` 方法也类似，会先调用 `this.reportChanged`（这里的 isStateAllowChange 可以先不管）。而这两个方法都是继承自 `Atom`，这个我们稍后再讲。

在这里，我们就完成了对一个对象的 observable 化，当然这里只讲了 `object` 这种类型，其它的包括 `Array`，`Map` 等也是类似，就不具体展开讲了。然后来看下另外一个核心方法，`autorun`

```ts
export function autorun(view: () => any) {
	const reaction = new Reaction(function() {
		this.track(view);
	});
	reaction.schedule();
	return reaction.dispose.bind(reaction);
}
```

`autorun` 比较简单，会先创建一个 `Reaction` 类，然后执行上面的 `schedule` 方法，重点来看下 `Reaction`

```ts
export class Reaction {
	private onInvalidate: Function;
	observing: Observable[] = [];
	id: number;

	constructor(onInvalidate: () => void) {
		this.id = id++;
		this.onInvalidate = onInvalidate;
	}

	schedule() {
		this.onInvalidate();
	}

	track(fn: Function) {
		globalState.trackingDerivation = this;
		return fn.call(this, arguments);
	}

	dispose() {
		this.observing.forEach(o => {
			delete o.observers[this.id.toString()];
		});
		this.observing = [];
	}
}
```

一开始初始化的时候，会给每个 `Reaction` 分配一个 id，然后把传进来的方法赋值给 `this.onInvalidate`。然后是 `schedule` 方法，直接调用之前保存的 `onInvalidate`，而在 `autorun` 的方法中能看到，`onInvalidate` 实际上是调用了 `track` 方法。

`track` 方法做的事情，先把当前的 `Reaction` 保存到 `globalState.trackingDerivation` 里面，然后再执行传进来的 `fn`。这个 `fn` 实际就是我们传给 `autorun` 的方法。在我们最开始的例子当中就是输出 `name`。

而当我们打印 `name` 的时候，其实是要先取出对象上面 `name` 这个字段，这就会调用到 `ObservableValue` 上面的 `get` 方法。在取出这个字段之前，会调用 `reportObserved`

```ts
export class Atom {
	observers: { [index: string]: Reaction } = {};

	reportObserved() {
		const derivation = globalState.trackingDerivation;
		if (derivation) {
			const id = derivation.id.toString();
			if (!this.observers[id]) {
				derivation.observing.push(this);
				this.observers[id] = derivation;
			}
			globalState.trackingDerivation = null;
		}
	}

	reportChanged() {
		const keys = Object.keys(this.observers);
		if (keys.length > 0) {
			keys.forEach(k => {
				this.observers[k].schedule();
			});
		}
	}
}
```

`reportObserved` 会取出 `globalState.trackingDerivation`，也就是我们刚刚存的 `Reaction`。`derivation.observing.push(this)` 会把我们当前的对象，也就是我们最开始例子里面的 `o`，放到 `Reaction` 的 `observing` 数组里面。然后 `this.observers[id] = derivation` 又会把 `Reaction` 保存到到对象的 `observers` 里面。这样就完成了一次双向数据绑定！

同样的，当要给 `name` 字段赋值的时候，会调用 `ObservableValue` 上面的 `set` 方法，当赋值之后，会调用 `Atom` 上面的 `reportChanged`。这个方法会拿出在上面双向数据绑定过程中保存好的 `Reaction`，然后调用上面的 `schedule` 方法。而 `schedule` 最终就会调用我们传给 `autorun` 的方法。

这样子，也就是最开始例子的整个过程。

这篇文章只是单独实现了 mobx，而在实际项目单中，我们更多地是结合 react 一起用。在下一篇文章中，我们将实现一个 `mobx-react` 的库。
