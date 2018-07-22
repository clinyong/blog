title: var 在 JavaScript 循环中的问题
date: 2018.07.22
---

这个问题也是 JS 里面比较经典的问题，在网上也有很多回答。下午又偶然看到，重新想了一下，感觉才真正明白为什么。先看具体的例子

```js
var helpText = [
  { id: "email", help: "Your e-mail address" },
  { id: "name", help: "Your full name" },
  { id: "age", help: "Your age (you must be over 16)" }
];

const cbs = [];

for (var i = 0; i < helpText.length; i++) {
  var item = helpText[i];
  cbs.push(function() {
    console.log(item.id);
  });
}

cbs.forEach(cb => cb());
// age
// age
// age
```

上面的输出都是 `age`，而没有我们期望的 `email` 和 `name`。开始分析这个问题前，需要知道两点

- `var` 的作用域是什么
- 在同一个作用域内，多次重复声明会发生什么事情

先来看第一点

> The scope of a variable declared with var is its current execution context, which is either the enclosing function or, for variables declared outside any function, global.

根据 MDN 的文档可以知道，`var` 的作用域只限定在函数或者全局当中。`for`，`while`，`if` 这些并不会重新创建作用域。

> If you re-declare a JavaScript variable, it will not lose its value.

也是文档中的描述，说明了在同个作用域内，是允许多次重复声明的。

```js
var age = 1;
console.log(age);
var age = 2;
console.log(age);
var age = 3;
console.log(age);

// 1
// 2
// 3
```

之所以能这样做，也是因为 `var` 存在变量提升，不过这里就不展开说。只要知道能重复定义就行。所以文章一开始的例子，可以用下面更直观的形式展现

```js
var helpText = [
  { id: "email", help: "Your e-mail address" },
  { id: "name", help: "Your full name" },
  { id: "age", help: "Your age (you must be over 16)" }
];

const cbs = [];

var item = helpText[0];
cbs.push(function() {
  console.log(item.id);
});
var item = helpText[1];
cbs.push(function() {
  console.log(item.id);
});
var item = helpText[2];
cbs.push(function() {
  console.log(item.id);
});

cbs.forEach(cb => cb());
```

数组里面的三个函数都是指向同一个 `item`，而 `item` 最终是指向 `helpText` 里面的最后一个元素。

在 ES6 引入的 `let` 可以很好地解决这个问题，所以如果你平时都是用 `let` 的话，也不会遇到这种情况。不过这里我们还是看下 babel 是怎样处理的

```js
"use strict";

var helpText = [
  { id: "email", help: "Your e-mail address" },
  { id: "name", help: "Your full name" },
  { id: "age", help: "Your age (you must be over 16)" }
];

var cbs = [];

var _loop = function _loop() {
  var item = helpText[i];
  cbs.push(function() {
    console.log(item.id);
  });
};

for (var i = 0; i < helpText.length; i++) {
  _loop();
}

cbs.forEach(function(cb) {
  return cb();
});
```

上面是把 `item` 换成 `let` 声明之后，babel 转换的代码。可以看到，这里把循环的内容放到一个 `_loop` 函数里面，从而给每个 `item` 创建一个独立的作用域。

（完）
