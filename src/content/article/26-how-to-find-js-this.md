title: 如何找到 JavaScript 中的 this
date: 2018.07.17
---

这一篇是阅读 You-Dont-Know-JS 中 [this](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch2.md) 章节的笔记。也是我读过的讲 `this` 最好的教程。

### 什么是 this

首先来看下什么是 `this`。`this` 是一个函数调用时候的上下文，注意这里是调用，不是声明。只有当一个函数被调用的时候，`this` 才会被创建。

### Call-site

然后来看一个叫 call-site 的概念。call-site 是函数被调用时的位置。看下下面的例子。

```js
function baz() {
    // call-stack is: `baz`
    // so, our call-site is in the global scope

    console.log( "baz" );
    bar(); // <-- call-site for `bar`
}

function bar() {
    // call-stack is: `baz` -> `bar`
    // so, our call-site is in `baz`

    console.log( "bar" );
    foo(); // <-- call-site for `foo`
}

function foo() {
    // call-stack is: `baz` -> `bar` -> `foo`
    // so, our call-site is in `bar`

    console.log( "foo" );
}

baz(); // <-- call-site for `baz`
```

从上面也可以看到，如果要快速定位到 call-site 的话，通过打断点，看 call-stack 的方式最简单了。

### 规则

了解了上面的基础之后，剩下的都是规则了。不用担心，规则也只有下面这几条。

- 默认绑定
- 隐式绑定
- 显式绑定

#### 默认绑定

默认绑定是最简单的规则，优先级也是最低的。只有其它规则不适用的时候，这条规则才会起作用。看下下面的代码。

```js
function foo() {
	console.log( this.a );
}

var a = 2;

foo(); // 2
```

调用 `foo` 时的 call-site 是全局对象，所以这里输出 2。

#### 隐式绑定

当 call-site 有一个额外的上下文对象的时候，就需要考虑这条规则。上面这样说比较抽象，直接上代码

```js
function foo() {
	console.log( this.a );
}

var obj = {
	a: 2,
	foo: foo
};

obj.foo(); // 2
```

这里的 `obj` 就是额外的上下文对象，所以 `this` 就指向了 `obj`。如果这个对象前面还有对象的话

```js
function foo() {
	console.log( this.a );
}

var obj2 = {
	a: 42,
	foo: foo
};

var obj1 = {
	a: 2,
	obj2: obj2
};

obj1.obj2.foo(); // 42
```

这里的 `this` 还是指向 `obj2`。接下来是这篇文章的重点，也是判断 `this` 最容易出错的地方，就是这个上下文对象是有可能丢失的。最常见的就是回调函数的场景。

```js
function foo() {
	console.log( this.a );
}

function doFoo(fn) {
	// `fn` is just another reference to `foo`

	fn(); // <-- call-site!
}

var obj = {
	a: 2,
	foo: foo
};

var a = "oops, global"; // `a` also property on global object

doFoo( obj.foo ); // "oops, global"
```

看下 `doFoo` 里面的 `fn` 调用，这里的额外上下文对象已经丢失了，需要运用上面第一条规则，默认绑定。就可以顺利找到 `this` 是指向 `doFoo`。

所以，只有看到 `xxx.func()` 这种形式的调用时，才会运用第二条规则。

#### 显式绑定

这条规则的优先级最高，当用了 `call/apply/bind` 这些函数显示指定 `this` 的时候，需要用这条规则。当然这时候的 `this` 也很明显了。

最后要注意的一点，上面三条规则并不适用于 ES6 中的箭头函数。

（完）
