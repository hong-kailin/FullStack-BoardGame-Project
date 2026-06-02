# 04. tsconfig.json 详解

## 1. 背景

在配置 `@types/node` 后，VS Code 又出现了一个新警告：

```text
Option 'moduleResolution=node10' is deprecated and will stop functioning in TypeScript 7.0.
```

这不是 Bug，而是旧配置过时了。要理解这个警告，需要先了解 `tsconfig.json` 的各项配置。

## 2. tsconfig.json 是什么？

`tsconfig.json` 是 **TypeScript** 的配置文件。它决定三件事：

1. 检查规则有多严格
2. 编译输出用什么 JS / 模块格式
3. 哪些文件要被检查

### 2.1 它到底是对谁的配置？

`tsconfig.json` 既不是对 `tsx` 的配置，也不是对 VS Code 的配置——它是对 **TypeScript 语言本身**的配置。

但实际使用中，三个东西都会读它：

| 工具 | 会不会读 tsconfig.json | 为什么 |
|------|----------------------|--------|
| **TypeScript 编译器（`tsc`）** | ✅ 直接读取 | 它是 TS 的官方编译器，tsconfig.json 就是为它设计的 |
| **VS Code** | ✅ 自动读取 | VS Code 内置了 TypeScript 语言服务，用它来提供编辑器提示和类型检查 |
| **tsx** | ✅ 也会读取 | `tsx` 底层依赖 TypeScript，所以也会参考 tsconfig.json 的配置 |

### 2.2 用一张图理解

```text
你写的 tsconfig.json
        │
        ├──→ TypeScript 编译器（tsc）
        │      └── 编译时使用这里的规则
        │
        ├──→ VS Code 内置的 TS 语言服务
        │      └── 编辑器提示、类型检查、红色波浪线
        │
        └──→ tsx（运行时）
               └── 转译 TS 到 JS 时参考这里的配置
```

### 2.3 那之前没写这个文件，为什么也能正常运行？

这是个很好的问题。之前没有 `tsconfig.json` 时，`tsx` 和 VS Code 都能正常工作，原因很简单：

**它们都有默认配置。**

就像电视机出厂时已经有一套默认设置——亮度 50、对比度 50、音量 30。不调也能看，只是不一定是最佳效果。

具体来说：

- **`tsx`**：没有 `tsconfig.json` 时，`tsx` 用自己的内置默认值。它不在乎类型检查是否严格，它的工作是"把 TS 转成 JS 并执行"。所以即使类型有问题，只要 JS 语法正确就能跑。

- **VS Code**：没有 `tsconfig.json` 时，VS Code 内置的 TypeScript 语言服务也用默认配置。默认配置下，`readline`、`process` 这些 Node.js 模块不被识别，所以会报红。但报红不影响运行——类型错误和运行时错误是两回事。

### 2.4 那为什么后来又创建了它？

因为遇到了**具体的问题**，默认配置搞不定：

1. **VS Code 报错 `Cannot find name 'readline'`** — 默认配置不加载 `@types/node`，需要 `"types": ["node"]` 来解决
2. **VS Code 报错 `moduleResolution=node10` 已弃用** — 默认配置用的是旧版规则，需要改成 `"node16"`

这两个问题都是 **VS Code 的类型检查报的错**，不是运行时错误。`tsx` 运行时完全不受影响。

**所以结论是**：没有 `tsconfig.json` 也能跑，但有了它才能让 VS Code 的类型检查和实际运行环境保持一致，消除误报。就像电视机出厂设置能看，但调一下亮度和对比度画面更舒服。

**类比**：
- 没有 `tsconfig.json` ≈ 用 Python 写代码但不装 `mypy`，能跑，但没有类型检查
- 有 `tsconfig.json` ≈ 装了 `mypy` 并配了 `mypy.ini`，类型检查更准确，提前发现潜在问题

## 3. 我们项目的配置

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

## 4. target — 输出哪个 JS 版本

```json
"target": "ES2020"
```

它决定 TS 最终转成哪个版本的 JavaScript。

| 值 | 含义 | 支持的特性 |
|----|------|-----------|
| `ES5` | 2009 年的 JS | 兼容很老的环境，但不支持箭头函数、`const`/`let` |
| `ES2015`（ES6） | 2015 年的 JS | 支持箭头函数、class、Promise |
| `ES2020` | 2020 年的 JS | 支持 `?.`、`??` 等现代语法 |
| `ESNext` | 最新 | 尽量使用最新标准 |

Node.js 22 已经很好地支持 `ES2020`，所以这里选它。

**类比**：就像 C++ 编译器的 `-std=c++17` 选项，指定用哪个语言标准来编译。

## 5. module — 模块系统

```json
"module": "node16"
```

它决定 `import` / `export` 在编译后按什么模块规则处理。

| 值 | 说明 |
|----|------|
| `commonjs` | Node.js 传统方式，用 `require` / `module.exports` |
| `ES2020` | 偏原生 ES Module |
| `node16` | 按现代 Node.js 规则处理 |

之所以从以前常见的 `commonjs` / `node` 组合改成 `node16`，是因为旧的 `node` 解析规则已经被 TypeScript 标记为弃用。

## 6. moduleResolution — 模块查找规则

```json
"moduleResolution": "node16"
```

它决定 TS 在看到 `import "./utils"` 时，去哪里找这个模块。

| 值 | 说明 |
|----|------|
| `node`（已弃用） | 旧版规则，2014 年 Node.js 10 时代的产物 |
| `node16` | 新版规则，更贴近现代 Node.js |
| `classic` | 很老，基本不用 |

**为什么 "node" 被弃用了？**

`"moduleResolution": "node"` 的全名其实是 `"node10"`——它是 2014 年 TypeScript 1.x 时代为 Node.js 10 设计的规则。十年过去了，Node.js 的模块系统已经发生了巨大变化（原生支持 ES modules、新增 exports/imports 字段等），`node10` 已经无法正确反映 Node.js 的实际行为了。

TypeScript 5.x 开始推荐使用 `node16`（对应 Node.js 16+）或 `bundler`（对应打包工具如 webpack/esbuild），旧版 `node` 将在 TypeScript 7.0 中彻底移除。

## 7. strict — 严格模式

```json
"strict": true
```

这是最值得一直打开的配置。它会开启一整套严格类型检查，帮助你尽早发现潜在 bug。

可以把它类比成：
- C++ 里的 `-Wall -Wextra` 编译警告
- Python 里的 `mypy --strict`

### 7.1 strict 影响的是什么？

**`strict` 只影响类型检查，不影响代码能不能执行。**

这是 TypeScript 最核心的一个概念：**类型检查和代码执行是两回事。**

```typescript
// strict: true 时，这行会报红
const a: number = "hello";  // ❌ Type 'string' is not assignable to type 'number'

// 但 tsx 照样能运行，因为转成 JS 后就是：
// const a = "hello";
```

`strict` 控制的 7 个子选项全部都是**编译时的类型规则**，没有一个会影响 JS 运行时的行为。

**所以结论**：`strict: true` 和 `strict: false` 之间，不存在"一个能跑一个不能跑"的情况。它只影响 VS Code 里红色波浪线的多少。

但有一个例外——如果你用 `tsc` 编译而不是 `tsx` 运行：

```typescript
const a: number = "hello";
```

| 工具 | strict: true | strict: false |
|------|-------------|--------------|
| `tsx src/index.ts` | ✅ 正常运行 | ✅ 正常运行 |
| `tsc src/index.ts` | ❌ 编译报错，不生成 `.js` | ✅ 编译通过，生成 `.js` |

`tsc` 的职责就是"类型检查 + 编译"，类型不对它就不干活。`tsx` 的职责是"快速跑起来"，类型对不对它不管。

所以严格来说，`strict: true` 不会让你的程序"跑不起来"，但会让 `tsc` **编译不通过**。

### 7.2 那 tsx 和 tsc 有什么区别？

既然上面提到了 `tsx` 和 `tsc`，这里解释一下两者的区别。

| | `tsc` | `tsx` |
|--|-------|-------|
| 全称 | TypeScript Compiler | TypeScript Execute |
| 做什么 | 把 `.ts` 编译成 `.js` 文件 | 直接运行 `.ts` 文件 |
| 类型检查 | ✅ 严格检查，类型错误就报错 | ❌ 不检查类型，直接转译执行 |
| 产出 | 生成 `.js` 文件 | 不生成文件，直接在内存中转译执行 |
| 使用场景 | 构建项目、发布代码 | 开发时快速跑 TS 文件 |

**`tsc` 的工作方式：**

```bash
tsc src/index.ts          # 编译，生成 src/index.js
node src/index.js          # 再用 node 运行生成的 JS
```

**`tsx` 的工作方式：**

```bash
tsx src/index.ts           # 一步到位：转译 + 执行，不生成文件
```

`tsx` 内部也用了 TypeScript，但它把类型检查关掉了，只做"转译"。所以即使代码有类型错误，`tsx` 也能运行。

这就是为什么之前没有 `tsconfig.json` 时，`tsx` 能正常运行，但 VS Code 会报红——VS Code 用的是完整的 TypeScript 语言服务（类似 `tsc`），它会做类型检查；而 `tsx` 只管转译执行，不管类型对不对。

**类比**：
- `tsc` ≈ 编译 C++ 的 `g++`，编译时报错就不生成可执行文件
- `tsx` ≈ Python 解释器，不管类型注解对不对，直接跑

## 8. types — 加载哪些类型定义

```json
"types": ["node"]
```

它告诉 TypeScript：加载 `@types/node`。

如果不写，TS 可能会默认尝试加载 `node_modules/@types/` 下更多内容。显式写出来更清楚，也更可控。

## 9. include — 检查范围

```json
"include": ["src/**/*.ts"]
```

意思是：只检查 `src/` 目录下的所有 `.ts` 文件。

如果以后你还想检查 `scripts/` 目录，可以改成：

```json
"include": ["src/**/*.ts", "scripts/**/*.ts"]
```

## 10. 其他常见配置（先眼熟）

| 配置项 | 作用 |
|--------|------|
| `outDir` | 编译后的 JS 输出目录 |
| `rootDir` | TS 源码根目录 |
| `sourceMap` | 生成 sourcemap，方便调试 |
| `esModuleInterop` | 改善部分 CommonJS 包的导入体验 |
| `skipLibCheck` | 跳过 `.d.ts` 检查，加快速度 |
| `noUnusedLocals` | 未使用变量时报错 |
| `noUnusedParameters` | 未使用参数时报错 |
