# 03. Node 类型定义

## 1. VS Code 报错 `Cannot find name 'readline'` 的解决

写完 `game-loop.ts` 后，VS Code 可能会出现红色波浪线：

```text
Cannot find name 'readline'. Do you need to install type definitions for node?
Try `npm i --save-dev @types/node` and then add 'node' to the types field in your tsconfig.
```

同时 `process` 也可能报同样的错。但代码用 `tsx` 运行却完全正常。

### 1.1 为什么会报错？

根本原因：TypeScript 不认识 Node.js。

TypeScript 只认识标准 JavaScript/TypeScript 语法。像 `readline`、`process`、`fs` 这些都是 Node.js **运行时**提供的内置模块，它们不是 JS 语言本身的组成部分。

所以当你在 `.ts` 文件中写 `import * as readline from "readline"` 时，TypeScript 会说："我不知道这个模块长什么样。"

类比：
- Node.js 的 `readline` 像 C++ 标准库里的 `std::vector`
- `@types/node` 像头文件，告诉 TypeScript 这些模块有哪些 API、参数和返回值是什么

### 1.2 为什么 `tsx` 能运行？

- `tsx` 的核心工作是把 TS 转成 JS，再交给 Node.js 执行
- 转成 JS 后，类型信息就没了
- Node.js 在运行时本来就认识 `readline`
- 所以**类型检查能不能通过**和**程序能不能运行**是两回事

### 1.3 解决步骤

第一步：安装 `@types/node`

```bash
npm i --save-dev @types/node
```

这里的 `--save-dev` 是什么意思？

- `save`：表示把这个依赖记录到 `package.json`
- `dev`：表示这是**开发阶段依赖（devDependency）**，不是运行时依赖

安装后，npm 会把它写到 `package.json` 的 `devDependencies` 里，而不是 `dependencies` 里。

你可以把依赖简单分成两类：

- `dependencies`：程序运行时真的要用到的包
- `devDependencies`：开发、测试、构建、类型检查时要用到的包

像 `@types/node` 这种包，只是给 TypeScript 和编辑器提供类型信息，程序真正运行时并不需要它，所以放在 `devDependencies` 更合适。

类比：

- `dependencies` 像是做菜时真正要下锅的食材
- `devDependencies` 像菜谱、量杯、厨房秤，做菜时有帮助，但最终不会被端上桌

补充一点：

- `npm i --save-dev @types/node`
- 也可以简写成 `npm i -D @types/node`

这两个命令是等价的。

`@types/node` 是一个 npm 包，由 DefinitelyTyped 社区维护。它包含 Node.js 内置模块的类型定义。

安装后，`node_modules/@types/node/` 目录下会出现很多 `.d.ts` 文件。`.d.ts` 是类型声明文件，只描述类型，不包含真正的实现代码。

### 1.4 `@types/node` 里的 `@` 是什么意思？

`@types/node` 中的 `@types` 叫做 **npm scope（作用域）**。要理解 scope，先要知道 npm 上的包名是怎么工作的。

#### 1.4.1 普通包名

像 `react`、`lodash`、`express` 这种没有 `@` 的包，叫**非作用域包（unscoped package）**。它们的名字是**全局唯一**的——全世界只能有一个叫 `react` 的包。谁先注册谁用，后注册的不能用同名。

这就像注册域名：`google.com` 只能有一个，你先注册了别人就不能再注册。

#### 1.4.2 作用域包名

有 `@` 的包叫**作用域包（scoped package）**，格式是 `@作用域名/包名`。名字只在作用域内唯一，不同作用域可以有同名的包。

类比：

| 概念 | 类比 |
|------|------|
| 普通包 `react` | 全局变量名 `int react`，整个程序只能有一个 |
| 作用域包 `@types/node` | C++ 的 `std::vector`，`std` 是命名空间，`vector` 在 `std` 内唯一 |
| 作用域包 `@types/react` | C++ 的 `boost::vector`，`boost` 是另一个命名空间，和 `std::vector` 不冲突 |
| 作用域包 `@angular/core` | Python 的 `os.path`，`os` 是模块，`path` 是它里面的子模块 |

换个更生活化的类比：

> 想象一个城市里有很多叫"张三"的人。如果只叫"张三"，你分不清是哪个。但如果你说"美团公司的张三"、"饿了么公司的张三"，加上公司名（scope）就能区分了。
>
> - `@meituan/waimai` 和 `@eleme/waimai` 可以同时存在
> - 但 `waimai`（无 scope）只能有一个

#### 1.4.3 安装后的路径差异

作用域包安装后，在 `node_modules` 里的目录结构也不一样：

```text
# 普通包
node_modules/
  react/              # 直接放在 node_modules 下
  lodash/

# 作用域包
node_modules/
  @types/             # 先建一个 @types 目录
    node/             # 再在里面放具体的包
    react/
  @angular/
    core/
```

这就是为什么安装命令也要带 `@`：

```bash
npm install @types/node     # 安装后出现在 node_modules/@types/node/
npm install react           # 安装后出现在 node_modules/react/
```

#### 1.4.4 为什么要有 scope？

scope 最初的设计目的是为了解决两个问题：

1. **命名冲突**：大公司或组织发布很多包时，不用抢名字。Angular 团队的所有包都放在 `@angular/` 下，比如 `@angular/core`、`@angular/common`、`@angular/router`。

2. **私有包**：企业可以发布 `@公司名/包名` 的私有包，只有公司内部能访问，不会和公共包冲突。

#### 1.4.5 `@types` 这个特殊的 scope

`@types` 是 DefinitelyTyped 社区专用的 scope，专门用来发布类型定义包。规律很简单：

- 如果一个 JS 库本身没有类型定义，社区就会在 `@types/` 下发布对应的类型包
- `@types/node` → Node.js 内置模块的类型
- `@types/express` → Express 框架的类型
- `@types/react` → React 的类型

#### 1.4.6 一句话总结

`@types/node` 中的 `@types` 相当于"类型说明书"这个分类的文件夹，`node` 是这个文件夹里的具体说明书。`@` 表示"这是一个作用域包"，`/` 后面的才是真正的包名。

### 1.5 一句话理解 @types/node 的本质

Node.js 本身是用 JavaScript 写的。JavaScript 不需要类型，所以 Node.js 的代码里没有类型信息。

但 TypeScript 需要类型才能做检查、给提示。所以我们需要一个"翻译层"，告诉 TypeScript 这些 Node.js 模块的 API 长什么样。

`@types/node` 就是这个翻译层。它不提供任何功能代码，只提供类型信息。

```text
Node.js（JS 写的，没有类型）
    ↓ 需要类型信息
@types/node（纯类型定义，没有功能代码）
    ↓ TypeScript 读取后
VS Code 能自动补全、类型检查、参数提示
```

反过来，如果一个库本身是用 TypeScript 写的（比如后面可能会用到的 `tsx`），它发布到 npm 时会自带 `.d.ts` 类型文件，就不需要额外安装 `@types/xxx` 了。

**规律总结：**
- 库是 JS 写的 → 需要 `@types/库名` 来补类型
- 库是 TS 写的 → 自带类型，不需要额外安装

### 1.5 再配一个 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "node16",
    "moduleResolution": "node16",
    "strict": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts"]
}
```

关键配置：`"types": ["node"]`。

## 2. 深入理解：`@types` 机制

前面我们只是先把 `@types/node` 装上，让编辑器别报错。现在再深入一点：`@types` 到底在 TypeScript 生态里扮演什么角色？

### 2.1 TypeScript 为什么需要类型定义？

TypeScript 做类型检查时，并不会去执行你的代码。它只能根据源码和类型声明来推断：

- 这个模块存不存在
- 这个函数接收什么参数
- 返回值是什么类型
- 这个对象上有哪些属性

如果一个库本身只有 JavaScript 实现，没有提供类型信息，那么 TypeScript 就像拿到一个只有机器、没有说明书的设备：能运行，但不知道怎么正确使用。

这时就需要**类型定义文件**来补上“说明书”。

### 2.2 什么是类型定义文件？

类型定义文件通常长这样：

```typescript
declare function add(a: number, b: number): number;
```

或者像模块声明这样：

```typescript
declare module "some-lib" {
  export function hello(name: string): string;
}
```

这类文件的后缀是 `.d.ts`，可以把它理解成：

- `.ts`：既有实现，也有类型
- `.d.ts`：只有类型，没有实现

所以 `@types/node` 并没有把 Node.js 又“安装了一遍”，它只是把 Node.js API 的类型信息告诉了 TypeScript。

### 2.3 `@types/xxx` 是一个什么约定？

在 TypeScript 生态中，`@types` 是一个约定：很多**没有自带类型**的 JavaScript 库，会由社区提供一个对应的类型包，名字通常叫 `@types/库名`。

| npm 包 | 作用 |
|--------|------|
| `@types/node` | Node.js 内置模块的类型 |
| `@types/express` | Express 的类型 |
| `@types/react` | React 的类型 |
| `@types/lodash` | Lodash 的类型 |

这些包大多来自 DefinitelyTyped 社区。你可以把 DefinitelyTyped 理解成一个大型“类型说明书仓库”，专门给 JS 世界里的各种库补类型。

### 2.4 TypeScript 是怎么用到这些类型的？

比如你写：

```typescript
import * as readline from "readline";
```

TypeScript 需要回答几个问题：

1. `readline` 这个模块是否合法？
2. `createInterface` 存不存在？
3. 它的参数和返回值是什么？

安装 `@types/node` 之后，TypeScript 就能在 `node_modules/@types/node/` 里找到对应的声明文件，然后知道：

- `readline` 是 Node.js 的内置模块
- 它暴露了哪些函数
- 这些函数怎么调用

所以编辑器才会恢复：

- 自动补全
- 参数提示
- 类型检查
- 跳转定义

### 2.5 为什么有些库不需要装 `@types`？

不是所有库都要额外装 `@types`。

规律总结：

- 库本身是 TS 写的 -> 往往自带类型
- 库本身是 JS 写的 -> 往往要额外装 `@types/库名`

比如一个 TypeScript 写的库，发布到 npm 时通常会顺带发布自己的 `.d.ts` 文件。这样你安装它时，类型信息已经一起带过来了，就不需要再额外安装 `@types/...`。

而很多老一点的 JavaScript 库，本身没有类型信息，于是社区就单独维护一个 `@types/...` 包来补齐。

### 2.6 如果没有类型定义，会发生什么？

通常会出现几种情况：

- TypeScript 直接报错：找不到模块或找不到声明文件
- TypeScript 把它当成 `any`
- 编辑器几乎不给智能提示

这三种情况里，最糟的其实不是“报错”，而是“变成 `any`”。因为一旦变成 `any`，TypeScript 就基本放弃检查了，很多本来能提前发现的问题会一路漏过去。

### 2.7 `@types` 和 `tsconfig.json` 里的 `types` 有什么关系？

这是两个很容易混淆的概念：

- `@types/node`：真正安装到 `node_modules` 里的类型包
- `tsconfig.json` 里的 `"types": ["node"]`：告诉 TypeScript 要加载哪些类型包

也就是说：

1. 先安装 `@types/node`
2. 再通过 `"types": ["node"]"` 告诉 TS：请把它纳入当前项目的类型环境

**但这两步其实不是缺一不可的。**

只装 `@types/node` 就够了。TypeScript 默认会自动扫描 `node_modules/@types/` 下的所有包并加载，所以只要装了 `@types/node`，TS 就会自动找到它。

那 `"types": ["node"]` 是干什么的？

它是在说："**只**加载 `@types/node`，忽略 `@types/` 下其他所有包"。

如果你不写 `"types"` 这一项，TS 会加载 `@types/` 下**所有**包。在小项目里这没什么问题，但在大项目里 `@types/` 下可能有几十个包，全部加载会让 TS 变慢。显式写 `"types": ["node"]` 就是告诉 TS："我只需要 node 的类型，其他的别管"。

**一句话总结**：装 `@types/node` 是"安装"，写 `"types": ["node"]"` 是"精确指定"。前者必须，后者可选（但推荐写上，更清晰）。

### 2.8 一个最重要的理解

你可以把整个机制记成一句话：

- **JavaScript 库提供“功能实现”**
- **`@types` 包提供“类型说明书”**

运行代码靠前者，类型检查靠后者。

这也是为什么：

- 没装 `@types/node` 时，程序可能仍然能运行
- 但 TypeScript 和 VS Code 会“不知道你在写什么”

## 4. 一个小技巧：类型定义文件长什么样？

你可以打开 `node_modules/@types/node/readline.d.ts` 看看：

```typescript
declare module 'readline' {
  function createInterface(options: ReadLineOptions): Interface;

  interface Interface {
    question(query: string, callback: (answer: string) => void): void;
    close(): void;
  }

  interface ReadLineOptions {
    input: NodeJS.ReadableStream;
    output: NodeJS.WritableStream;
  }
}
```

这类文件的作用，就是告诉 TypeScript：这个模块存在，它有哪些 API，它们的参数和返回值分别是什么。
