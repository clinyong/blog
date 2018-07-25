title: JavaScript 中三种 prototype 的区别和联系
date: 2018.06.09
---

三种 prototype 指的是

- `[[Prototype]]`
- `__proto__`
- `prototype`

先说第一种，先看下为什么要加上一个 `[[]]`。根据规范的[定义](https://www.ecma-international.org/ecma-262/5.1/#sec-8.6.2)

> These internal properties are not part of the ECMAScript language. They are defined by this specification purely for expository purposes.

`[[Prototype]]` 直接从字面上理解可以是一个内部的属性，它们的存在只是为了在规范里面起到说明的作用。所以我们并没办法通过这个字段取到对应的值

```js
const o = {};

console.log(o["[[Prototype]]"]); // undefined
```

然后说下 `__proto__`，`__proto__` 在 ES6 之前，只是浏览器厂商提供的一个接口，在语言规范里面并没有标准化。到了 ES6 的时候才正式加入进来。主要用于获取和设置 `[[Prototype]]` 的值。`__proto__` 等价于 `Object.getPrototypeOf` 和 `Object.setPrototypeOf`。

最后一种 `prototype`，只存在函数当中，是函数上面一个默认的属性，也是指向 `[[Prototype]]`，主要用于在创建实例的时候，原型链的继承。

```js
const o = {};

console.log(typeof o.prototype) // undefined
console.log(typeof Object.prototype) // object
console.log(typeof Object) // function
console.log(o.__proto__ === Object.prototype) // true
```

（完）
