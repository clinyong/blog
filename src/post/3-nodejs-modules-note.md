title: NodeJS 模块笔记
date: 2017.02.23
---

转前端大半年，对 NodeJS 一知半解，看了官方的[文档](https://nodejs.org/api/modules.html)，发现了之前存在的一些盲点。

## Accessing the main module

```js
require.main === module
```

上面能判断文件是直接通过命令行运行还是被其它文件引用，比如我们有下面两个文件

```js
// a.js
console.log('a: ', require.main === module)

// b.js
const a = require('./a)
console.log('b: ', require.main === module)
```

在命令行运行 `b.js`

```
$ node ./b.js
a:  false
b:  true
```

## The module wrapper

每个模块在被执行之前，会被包裹成像下面这样

```js
(function (exports, require, module, __filename, __dirname) {
    // 实际的模块代码
});
```

被包裹成这样一个函数之后，模块的全局变量的作用域被限制在了函数内部，也就是模块内部。而函数的形参，就是我们在模块内部经常用的几个关键字。
这几个参数都是在函数被调用时从外部传进来的。执行过程大概像下面这样

```js

function require() {}
let module = {}
module.exports = {}

(function (exports, require, module, __filename, __dirname) {
    // 实际的模块代码
})(module.exports, require, module);
```

我们能看到 `exports` 是定义在 `module` 上面的，当我们想让整个模块变成一个函数的时候，只能赋值给 `module.exports` 而不是 `exports`。

## 依赖查找顺序

官方给的查找顺序伪代码

```
require(X) from module at path Y
1. If X is a core module,
   a. return the core module
   b. STOP
2. If X begins with './' or '/' or '../'
   a. LOAD_AS_FILE(Y + X)
   b. LOAD_AS_DIRECTORY(Y + X)
3. LOAD_NODE_MODULES(X, dirname(Y))
4. THROW "not found"

LOAD_AS_FILE(X)
1. If X is a file, load X as JavaScript text.  STOP
2. If X.js is a file, load X.js as JavaScript text.  STOP
3. If X.json is a file, parse X.json to a JavaScript Object.  STOP
4. If X.node is a file, load X.node as binary addon.  STOP

LOAD_AS_DIRECTORY(X)
1. If X/package.json is a file,
   a. Parse X/package.json, and look for "main" field.
   b. let M = X + (json main field)
   c. LOAD_AS_FILE(M)
2. If X/index.js is a file, load X/index.js as JavaScript text.  STOP
3. If X/index.json is a file, parse X/index.json to a JavaScript object. STOP
4. If X/index.node is a file, load X/index.node as binary addon.  STOP

LOAD_NODE_MODULES(X, START)
1. let DIRS=NODE_MODULES_PATHS(START)
2. for each DIR in DIRS:
   a. LOAD_AS_FILE(DIR/X)
   b. LOAD_AS_DIRECTORY(DIR/X)

NODE_MODULES_PATHS(START)
1. let PARTS = path split(START)
2. let I = count of PARTS - 1
3. let DIRS = []
4. while I >= 0,
   a. if PARTS[I] = "node_modules" CONTINUE
   b. DIR = path join(PARTS[0 .. I] + "node_modules")
   c. DIRS = DIRS + DIR
   d. let I = I - 1
5. return DIRS
```

- `core module` 指的是像 `fs`，`path` 这样的库，这种库的优先级也是最高
- 在找文件的时候，之前只是认为会自动补全 `js` 后缀，其实还会补全 `json`，`node`两种后缀
- 在找目录的时候，还会找 `package.json`，通过里面的 `main` 字段去找文件
- `NODE_MODULES_PATHS` 说明了在找 `NODE_MODULES` 的时候，会一级一级目录**往上**找，直到 `/node_modules` 这个路径

## NODE_PATH

如果设置了 `NODE_PATH` 这个环境变量，当上面的算法找不到模块之后，NodeJS 就会从 `NODE_PATH` 里面查找。不过这个变量官方不建议设置。

## 缓存

当第一次引用某个模块之后，这个模块就会被缓存，之后每次调用都会返回相同的对象。这里的相同模块不是指名字一样，而是要求通过上面算法求出来的路径是一样的。

这里的路径是区分大小写的，即使 `./foo` 和 `./FOO` 是指向相同的文件，但是还是会被分开缓存。

## 循环引用

考虑有下面的情况

a.js

```js
console.log('a starting');
exports.done = false;
const b = require('./b.js');
console.log('in a, b.done = %j', b.done);
exports.done = true;
console.log('a done');
```

b.js

```js
console.log('b starting');
exports.done = false;
const a = require('./a.js');
console.log('in b, a.done = %j', a.done);
exports.done = true;
console.log('b done');
```

main.js

```js
console.log('main starting');
const a = require('./a.js');
const b = require('./b.js');
console.log('in main, a.done=%j, b.done=%j', a.done, b.done);
```

可以看到，上面 `a.js` 加载了 `b.js`，然后 `b.js` 里面又加载了 `a.js`，这样就造成了循环引用。
NodeJS 为了让程序能正常运行，当 `b.js` 加载 `a.js` 的时候，`a.js` 会导出当前的 `exports`，让 `b.js` 能顺利加载完。

当我们运行 `main.js` 的时候，可以看到下面的输出结果

```
$ node main.js
main starting
a starting
b starting
in b, a.done = false
b done
in a, b.done = true
a done
in main, a.done=true, b.done=true
```

虽然 NodeJS 能帮我们解决循环引用的问题，但是在实际代码中还是尽量避免这种情况发生比较好。
