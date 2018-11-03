title: TypeScript 第三方库定义
date: 2018.11.03
---

当你在 `tsconfig.json` 里面设置 `noImplicitAny` 为 `true` 的时候，如果引入的第三方库没有定义，则 TS 在编译的时候会报错。比如我们项目里面用到了 `react`

```ts
import * as React from "react";
```

编译的时候会报错

```
Could not find a declaration file for module 'react'.
```

对于 `react` 这样流行的库，你只需要

```
$ yarn add @types/react -D
```

安装一下社区提供的依赖就可以了。而对于一些不怎么流行的库，就需要你自己手写定义了。当然给第三方库的每个字段都定义好，想想也是一件很麻烦的事情。所以你可以在你的 `.d.ts` 文件里面把这个库显式声明为 `any`。

```ts
declare module "react";
```

这样编译就可以通过了。

（完）
