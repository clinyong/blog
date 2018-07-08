title: JavaScript 中的继承
date: 2018.06.10
---

用 prototype 实现继承的一点笔记。首先要明白，继承之后会发生什么事情。例如类 B 继承了类 A 之后，

- 类 B 能获得类 A 的原型链方法，实例方法和静态方法
- 类 B 能覆盖上面的方法，又不会影响到类 A
- 类 B 生成出来的实例能用 `instanceof` 判断来自类 A

有了方向之后，我们就能写出下面的代码

```js
function inherit(Parent, childConstructor) {
  function Child(...args) {
    // 实例方法继承
    Parent.apply(this, args);
    childConstructor.apply(this, args);
  }

  // 创建一个 Temp 的中间变量，是为了让子类不会影响到父类的原型
  function Temp() {}
  Temp.prototype = Parent.prototype;

  // 原型链继承
  Child.prototype = new Temp();
  Child.prototype.constructor = childConstructor;

  // 类方法（静态方法）继承
  Object.keys(Parent).forEach(k => {
    Child[k] = Parent[k];
  });

  return Child;
}
```

写个例子测试一下上面的代码

```js
function Animal(name) {
    const name = name;
    this.species = "animal"

    this.getName = function() {
        return name;
    }
}

Animal.prototype.say = function() {
    return "";
}

function Cat() {
    this.species = "cat"
}
Cat = inherit(Animal, Cat);
Cat.prototype.say = function() {
    return "Miao~";
}

const c = new Cat("LALA");

console.log(c.species) // cat
console.log(c.getName()) // LALA
console.log(c.say()) // Miao~
console.log(c instanceof Animal) // true
```

上面的方法不太好的一点是必须在执行了 `inherit` 之后，才能开始写子类的原型方法和静态方法。在 ES6 中，引入了类的概念，继承也可以通过 `extend` 去实现。但是一般我们都会用 Babel 或者 TypeScript 去编译成 ES5。所以我们来看下这两个工具是怎样实现继承的。以下面这段代码为例

```js
class Animal {}
class Cat extends Animal {}
```

先看看 Babel 是怎么做的

```js
"use strict";

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  }
  return call && (typeof call === "object" || typeof call === "function")
    ? call
    : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError(
      "Super expression must either be null or a function, not " +
        typeof superClass
    );
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass)
    Object.setPrototypeOf
      ? Object.setPrototypeOf(subClass, superClass)
      : (subClass.__proto__ = superClass);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Animal = function Animal() {
  _classCallCheck(this, Animal);
};

var Cat = (function(_Animal) {
  _inherits(Cat, _Animal);

  function Cat() {
    _classCallCheck(this, Cat);

    return _possibleConstructorReturn(
      this,
      (Cat.__proto__ || Object.getPrototypeOf(Cat)).apply(this, arguments)
    );
  }

  return Cat;
})(Animal);
```

这里的原型继承，`Object.create` 去实现，根据 MDN 文档的 polyfill，其实就是类似我们自己实现的中间变量 `Temp`。通过 setPrototypeOf 这段去掉，结果也是正常的。

看下 TypeScript 的实现

```js
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Animal = /** @class */ (function () {
    function Animal() {
    }
    return Animal;
}());
var Cat = /** @class */ (function (_super) {
    __extends(Cat, _super);
    function Cat() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Cat;
}(Animal));
```

这里一个比较有趣的是，通过 `({ __proto__: [] } instanceof Array` 去判断浏览器是不是支持 `__proto__`。
