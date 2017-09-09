title: 阅读 React 源码之 Virtual DOM
date: 2017.09.09
---

这是我阅读 React 源码系列笔记，这篇主要讲下 React 最为基础的部分，Virtual DOM。那具体什么是 Virtual DOM 呢，谷歌搜了一圈也没找到官方的定义，这里只能通过自己的理解来给个定义

> Virtual DOM 是一个用来表示 DOM 元素的 JavaScript 对象

这篇文章也是围绕这个定义，说下 React 这个转换的过程，以及这个对象具体是什么样。

我们先来看下一段代码

```jsx
import { Component } from "react";

class Test extends Component {
    render() {
        return (
            <div>
                test
            </div>
        );
    }
}
```

如果你的 React 不是通过全局方式引入的话，上面的组件，打包运行到浏览器，会提示下面的错误

```
Uncaught ReferenceError: React is not defined
```

我们明明已经引入了 `Component`，为什么会提示 `React` 没有定义呢？这里就要说下 jsx 语法了。jsx 语法没办法直接在浏览器运行，得先转换成普通的 js 语法。转换的工作，一般是由 babel 完成的，直接来看下转换后的代码长什么样

```js
import { Component } from "react";

class Test extends Component {
    render() {
        return React.createElement(
            "div",
            null,
            "test"
        );
    }
}
```

可以在 [REPL](https://babeljs.io/repl/#?babili=false&browsers=&build=&builtIns=false&circleciRepo=&code_lz=JYWwDg9gTgLgBAbzgYQuCA7Aph-BfOAMyjTgCIosBDAYxjIG4AoJmgGyoGdO4AVLTvCwAPGDgAmPVOmy5ETOIriUM4rFAAUASnlK9yrDACuUDHA0L9VgDzjgANwB8lq67hjBLt3GsB6O05eelrMenhMeEA&debug=false&evaluate=true&lineWrap=false&presets=react&prettier=false&showSidebar=true&targets=&version=6.26.0) 看到上面的代码输出。
从上面也可以看到，jsx 语法被转换成了调用 `React.createElement` 这个函数，所以才会提示 `React` 没有定义。

如果是 `Test` 这个组件被引用，转换出来是怎样的呢？

```js
class Hello extends Component {
    render() {
        const list = [1, 2];
        return React.createElement(Test, null);
    }
}
```

可以看到，这里传入 `createElement` 的是 `Test` 这个类，而不是字符串。babel 在做转换的时候，如果首字母是大写，则认为是一个 React 组件，否则，则是普通的 html 元素。关于更多 jsx 的介绍，可以看下 preact 作者写的一篇文章，[WTF is JSX](https://jasonformat.com/wtf-is-jsx/)。

经过上面的铺垫之后，我们可以具体来看下 `createElement` 这个函数，在 [src/isomorphic/classic/element/ReactElementValidator.js](https://github.com/facebook/react/blob/v15.4.2/src/isomorphic/classic/element/ReactElementValidator.js) 当中

```js
createElement: function(type, props, children) {
    var validType = typeof type === 'string' || typeof type === 'function';
    if (!validType) {
        warn('React.createElement: type is invalid');
    }

    var element = ReactElement.createElement.apply(this, arguments);
    if (element == null) {
      return element;
    }

    if (validType) {
      for (var i = 2; i < arguments.length; i++) {
        validateChildKeys(arguments[i], type);
      }
    }

    validatePropTypes(element);

    return element;
}
```

先用 `createElement` 创建元素，再检查子元素上面有没有 key，接着再检查创建元素上面的属性类型是否正确。先来看下检查 key，这个检查的方法也挺有趣的。索引是从 `2` 开始，遍历参数列表，为什么是这样的写法呢？假设我们有这样的 jsx

```jsx
<ul>
    <li>1</li>
    <li>2</li>
    <li>3</li>
</ul>
```

转换之后会变成这样

```js
React.createElement(
    "ul",
    null,
    React.createElement(
        "li",
        null,
        "1"
    ),
    React.createElement(
        "li",
        null,
        "2"
    ),
    React.createElement(
        "li",
        null,
        "3"
    )
);
```

可以看到，从 `arguments[2]` 起的参数就是子元素。具体来看下 `validateChildKeys` 这个函数

```js
function validateChildKeys(node, parentType) {
	if (typeof node !== "object") {
		return;
	}
    
	if (Array.isArray(node)) {
		for (var i = 0; i < node.length; i++) {
			var child = node[i];
			if (ReactElement.isValidElement(child)) {
				validateExplicitKey(child, parentType);
			}
		}
	} else if (ReactElement.isValidElement(node)) {
		// This element was passed in a valid location.
		if (node._store) {
			node._store.validated = true;
		}
	} else if (node) {
		var iteratorFn = getIteratorFn(node);
		// Entry iterators provide implicit keys.
		if (iteratorFn) {
			if (iteratorFn !== node.entries) {
				var iterator = iteratorFn.call(node);
				var step;
				while (!(step = iterator.next()).done) {
					if (ReactElement.isValidElement(step.value)) {
						validateExplicitKey(step.value, parentType);
					}
				}
			}
		}
	}
}
```

上面例子的每个子元素都是一个 `ValidElement`，所以这里只会把元素上面的 `validated` 设置为 `true`，不用检查元素上面的 `key`。那什么情况下传进来的 `node` 才是一个数组呢？

```jsx
<ul>
    {
        list.map(item => (
            <li>{item}</li>
        ))
    }
</ul>
```

上面的子元素就是一个数组，会调用 `validateExplicitKey` 检查数组的每个元素，如果没有存在 `key` 的话，就会出现下面这个熟悉的错误

```
Each child in an array or iterator should have a unique "key" prop...
```

如果是下面这样的写法，子元素也是一个数组，也会需要检查 `key`

```jsx
<ul>
    {
        [
            <li>1</li>,
            <li>2</li>,
            <li>3</li>
        ]
    }
</ul>
```

子元素还会存在另外一种情况，是一个 iterator，实际的业务代码基本不会有这种情况，这里也就不展开说了。另外一个检查函数 `validatePropTypes`，如果你的组件上面定义了 `propTypes` 的话，就会在这时候进行检验。然后再来看下最为重点的创建函数，`ReactElement.createElement`，位于 [src/isomorphic/classic/element/ReactElement.js](https://github.com/facebook/react/blob/v15.4.2/src/isomorphic/classic/element/ReactElement.js) 中

```js
ReactElement.createElement = function(type, config, children) {
  var propName;

  // Reserved names are extracted
  var props = {};

  var key = null;
  var ref = null;
  var self = null;
  var source = null;

  if (config != null) {
    if (hasValidRef(config)) {
      ref = config.ref;
    }
    if (hasValidKey(config)) {
      key = '' + config.key;
    }

    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    // Remaining properties are added to a new props object
    for (propName in config) {
      if (hasOwnProperty.call(config, propName) &&
          !RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    if (__DEV__) {
      if (Object.freeze) {
        Object.freeze(childArray);
      }
    }
    props.children = childArray;
  }

  // Resolve default props
  if (type && type.defaultProps) {
    var defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  if (__DEV__) {
      // ...
  }
  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props
  );
};
```

`config` 就是传给组件或者 html 元素的属性，比如 `ref`，`key`，`className`，或者是自定义在组件上面的属性。如果传入的 `config` 不为空的话，会先检测 `ref` 和 `key` 是不是合法的，这里还能看到，我们传入的 `key` 都会被转换成字符串类型。接着遍历传入的 `config`，过滤掉保留的属性 `RESERVED_PROPS`，保存到 `props` 对象里面。

然后处理传进来的子元素和 `defaultProps`，调用 `ReactElement` 方法。

```js
var ReactElement = function(type, key, ref, self, source, owner, props) {
  var element = {
    // This tag allow us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner,
  };

  if (__DEV__) {
      // ...
  }

  return element;
}
```

这是一个简单的工厂方法，根据传进来的参数，创建一个新的 React。到这里，整个 Virtual DOM 转换的过程就算完成了。

所以，假设我们有下面的 DOM 元素

```html
<ul>
    <li>1</li>
    <li>2</li>
</ul>
```

转换为 React 的 Virtual DOM 之后，就变成

```js
{
    $$typeof: REACT_ELEMENT_TYPE,
    type: "ul",
    ref: null,
    key: null,
    props: {
        children: [{
            $$typeof: REACT_ELEMENT_TYPE,
            type: "li",
            ref: null,
            key: null,
            props: {
                children: "1"
            },
            __owner: xxx,
        }, {
            $$typeof: REACT_ELEMENT_TYPE,
            type: "li",
            ref: null,
            key: null,
            props: {
                children: "2"
            },
            __owner: xxx,
        }]
    },
    __owner: xxx,
}
```

如果是自定义的 React 组件，比如 `<Hello />`，转换之后和上面的对象，除了 `type` 不是字符串，而是具体的组件类型，其它都和上面一样。

（完）
