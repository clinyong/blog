title: 由 allowSyntheticDefaultImports 引起的思考
date: 2018.12.01
---

这段时间团队开始在使用 TypeScript，有些童鞋会像下面这样写

```ts
import React from "react";

console.log(React);
```

因为 `react` 是以 commonJS 的形式导出的，所以上面的代码会报错

```
Module '"react"' has no default export.
```

提示 `react` 并没有 `default` 字段导出。这个问题解决也很简单，换成下面这种形式的写法就可以了。

```ts
import * as React from "react";
```

当时和同事在讨论，说 babel 允许第一种写法，因为帮你做了兼容。而 TS 是不能这样写的。后面仔细看了文档，发现自己的观点是不对的。

TS 是允许你这么写的，但是需要在 `tsconfig.json` 中配置两个字段

```json
{
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
}
```

先说下 `allowSyntheticDefaultImports`，这个字段实际只起到检查的作用，不会对编译后的代码有任何影响。

而 `esModuleInterop` 就不一样，实际上开启这个字段的时候，默认也是会开启 `allowSyntheticDefaultImports`，并且对于编译后的代码也做了兼容。还要注意的是这个字段只有当把代码编译成 commonJS 的时候才会起作用。

所以对于第一种写法，如果配置是下面这样

```json
{
    "module": "commonjs",
    "esModuleInterop": true
}
```

编译之后的代码为

```js
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
console.log(react_1.default);
```

可以看到加了很多兼容性的代码，如果配置换成下面这样

```json
{
    "module": "es2015",
     "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
}
```

因为导出模块是 `es2015`，实际会忽略 `esModuleInterop` 字段，所以要加上 `allowSyntheticDefaultImports` 防止报错，输出的代码为

```js
import React from "react";
console.log(React);
```

可以看到和源代码一模一样。实际上 babel 的行为也是这样的，只有当导出 commonjs 的时候，才会加上兼容性的代码，如果是 ES6 的格式则原样输出。

因为 webpack 的 tree shaking，所以一般我们都会让 babel 或者 TS 把模块导出成 ES6。而 npm 上面绝大部分的包都是 commonjs 形式的，那是谁做了这个兼容呢。答案也很明显，就是 webpack。

只要是 webpack 能识别的模块格式，不管是 commonjs，ES6 还是 amd，webpack 都能让它们正常地相互引用。

（完）
