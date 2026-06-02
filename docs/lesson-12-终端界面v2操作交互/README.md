# 第 12 课：终端界面 v2 — 操作交互

## 本节课目标

让玩家可以通过命令行输入指令来操作游戏（拿取标记、购买卡牌），实现完整的双人轮流交互流程。

---

## 1. 为什么要做交互？

第 11 课只能**看**不能**玩**。游戏的核心是"玩家做出选择 → 游戏更新状态 → 显示新状态 → 下一位玩家"。我们需要一个循环来处理这个过程。

---

## 2. 设计思路

交互流程：

```
1. 显示当前游戏状态
2. 显示当前玩家可用的操作选项
3. 等待玩家输入命令
4. 解析命令，更新游戏状态
5. 检查胜利条件
6. 切换玩家
7. 回到步骤 1
```

---

## 3. 新增文件：`src/game-loop.ts`

### 3.1 初始化游戏状态

```typescript
function createInitialState(): GameState {
  // 25 个标记（每种颜色 4 个 + 珍珠 2 个 + 黄金 3 个）
  // 洗牌 → 按螺旋顺序放到版图上
  // 金字塔：等级 1 发 5 张，等级 2 发 4 张，等级 3 发 3 张
  // 玩家初始无标记、无卡牌
}
```

和之前硬编码的测试数据不同，现在每次启动都是**随机开局**。

### 3.2 命令解析

用 Node.js 的 `readline` 模块读取用户输入：

```typescript
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
```

`readline` 是 Node.js 内置模块，不需要额外安装。它提供了 `rl.question(prompt, callback)` 方法，在终端显示提示文字后等待用户输入。

**类比**：
- Python 的 `input()` 函数
- C++ 的 `std::cin >>`

### 3.3 支持的命令

| 命令 | 用法 | 说明 |
|------|------|------|
| `take` | `take r,c [r,c [r,c]]` | 拿取 1-3 个标记 |
| `buy` | `buy <卡牌ID>` | 购买金字塔中的卡牌 |
| `show` | `show` | 重新显示游戏状态 |
| `pass` | `pass` | 跳过当前回合 |
| `quit` | `quit` | 退出游戏 |

#### take 命令的校验逻辑

```typescript
if (cmd === "take") {
  // 1. 解析坐标，格式验证
  // 2. 检查每个位置是否可拿取（getFreePositions）
  // 3. 拿 2 个 → 必须同色
  // 4. 拿 3 个 → 必须不同色
  // 5. 执行 takeTokens，更新玩家标记
  // 6. 检查标记上限（最多 10 个），超出需归还
  // 7. 切换玩家
}
```

#### buy 命令的校验逻辑

```typescript
if (cmd === "buy") {
  // 1. 查找卡牌是否在金字塔中
  // 2. 计算实际费用（扣除奖励折扣）
  // 3. 检查玩家宝石是否足够（含 gold 万能抵扣）
  // 4. 扣除宝石，添加卡牌到玩家手牌
  // 5. 检查是否满足皇室卡牌条件
  // 6. 检查胜利条件
  // 7. 切换玩家
}
```

### 3.4 回合循环

```typescript
function loop() {
  if (state.winner) {
    console.log(`\n🏆 ${state.winner.name} 获胜！`);
    rl.close();
    return;
  }

  renderGameState(...);          // 显示当前状态
  console.log("可拿取位置:", ...); // 提示可用操作

  rl.question(`\n${player.name} 的操作 > `, (input) => {
    const result = processCommand(state, input.trim());
    state = result.state;        // 更新游戏状态
    if (result.message) console.log(result.message);
    loop();                      // 递归调用，进入下一回合
  });
}
```

这里用**递归**而不是 `while` 循环，是因为 `rl.question` 是**异步**的——它不会阻塞等待用户输入（类比 Python 的 `asyncio` 或 C++ 的异步回调）。如果写成 `while(true) { rl.question(...) }`，所有 `question` 调用会瞬间同时触发，完全乱掉。

---

## 4. 修改文件：`src/board.ts`

新增 `getFreePositions` 函数，判断哪些 token 可以被拿取：

```typescript
export function getFreePositions(board: (TokenType | null)[][]): [number, number][] {
  const free: [number, number][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const token = board[r][c];
      if (token === null || token === "gold") continue;  // 空位和 gold 不可拿

      // 检查 8 个相邻方向，只要有一个为空或出界，这个 token 就可拿
      for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE || board[nr][nc] === null) {
          free.push([r, c]);
          break;
        }
      }
    }
  }
  return free;
}
```

**规则原理**：在璀璨宝石对决中，一个 token 只有**至少一个相邻格为空**时才能拿取。这模拟了"从边缘拿取"的物理直觉——你不能跳过其他 token 去拿里面的。

---

## 5. 修改文件：`src/index.ts`

入口从硬编码测试数据改为启动游戏循环：

```typescript
export * from "./types";
export * from "./card-pool";
export * from "./board";
export * from "./purchase";
export * from "./game";

import { startGame } from "./game-loop";

startGame();
```

---

## 6. 运行

```bash
npm start
```

示例操作：

```
玩家 1 的操作 > take 0,1 0,2 0,3    # 拿取 3 个不同颜色的标记
玩家 2 的操作 > take 4,0 4,1        # 拿取 2 个同色标记
玩家 1 的操作 > buy 7               # 购买卡牌 ID 为 7 的卡
玩家 2 的操作 > pass                 # 跳过回合
```

---

## 7. 关键概念讲解

### 7.1 readline 的异步模型

`rl.question()` 不会让程序停下来等你输入。它注册一个回调函数，当用户按下回车时触发。这就是为什么我们需要用递归来模拟循环。

```typescript
// ❌ 错误写法：所有 question 会同时触发
while (true) {
  rl.question("> ", (input) => { ... });
}

// ✅ 正确写法：每次输入完成后才调用下一次 question
function loop() {
  rl.question("> ", (input) => {
    // 处理输入...
    loop();  // 处理完后递归调用自身
  });
}
```

### 7.2 不可变性（Immutability）

在整个代码中，我们不直接修改对象的属性，而是创建新对象：

```typescript
// ❌ 直接修改（会引发难以追踪的 bug）
player.tokens.red += 1;

// ✅ 创建新对象
const newPlayer = { ...player, tokens: { ...player.tokens } };
newPlayer.tokens.red = (newPlayer.tokens.red || 0) + 1;
```

这在函数式编程中叫"不可变性"。好处是：
- 每次状态变更都产生一个新对象，旧状态不变
- 方便调试（可以保存历史状态）
- 避免多个函数共享同一对象时的意外修改

### 7.3 递归 vs 迭代

递归实现游戏循环在这里是必要的，因为 `readline` 是异步的。如果你学过 C++ 或 Python 的同步编程，可能会觉得不习惯。后面进入 Web 开发（React/Vue）后，这种"事件驱动"的编程模式会更常见。

### 7.4 VS Code 报错 "Cannot find name 'readline'" 的解决

写完 `game-loop.ts` 后，VS Code 可能会出现红色波浪线：

```
Cannot find name 'readline'. Do you need to install type definitions for node?
Try `npm i --save-dev @types/node` and then add 'node' to the types field in your tsconfig.
```

同时 `process` 也可能报同样的错。但代码用 `tsx` 运行却完全正常。这是怎么回事？

#### 7.4.1 为什么会报错？

**根本原因**：TypeScript 不认识 Node.js。

TypeScript 是一个跨平台的语言工具，它只认识标准 JavaScript/TypeScript 语法。像 `readline`、`process`、`fs` 这些都是 Node.js **运行时**提供的内置模块——它们不是 JS 语言本身的组成部分。

所以当你在 `.ts` 文件中写 `import * as readline from "readline"` 时，TypeScript 说："`readline` 是什么？我没听说过这个模块。" 于是报错。

**类比**：
- Node.js 的 `readline` 就像 C++ 标准库的 `std::vector`——C++ 编译器需要标准库的头文件才能知道 `std::vector` 的定义
- `@types/node` 就像 C++ 标准库的头文件（`<vector>`、`<iostream>` 等）——它告诉 TypeScript："Node.js 的 `readline` 模块有哪些函数、参数类型是什么"
- Python 没有这个概念，因为 Python 的类型检查器（mypy、pyright）会在运行时自动推断模块的类型

**为什么 tsx 能运行？**
- `tsx` 的核心工作是"把 TS 转成 JS 再交给 Node.js 执行"
- 转成 JS 后，类型信息就没了。JS 代码中 `readline.createInterface(...)` 就是一个普通的函数调用
- Node.js 在运行时就认识 `readline` 了，因为它就是 Node.js 自带的模块
- 所以 **TypeScript 的类型检查** 和 **代码能否运行** 是两回事

#### 7.4.2 解决步骤

**第一步：安装 @types/node**

```bash
npm i --save-dev @types/node
```

`@types/node` 是一个 npm 包，由 DefinitelyTyped 社区维护。它包含了 Node.js 所有内置模块的类型定义。

安装后，`node_modules/@types/node/` 目录下会出现很多 `.d.ts` 文件（`.d.ts` 是"类型声明文件"，只包含类型信息，不包含实现代码）。

> **补充：`@xxx/yyy` 这种包名是什么意思？**
>
> `@types/node` 中的 `@types` 叫做 **npm scope（作用域）**。`@` 开头表示这个包属于某个组织或命名空间，`/` 后面是具体的包名。
>
> **类比**：
> - GitHub 上的 `组织名/仓库名`，比如 `facebook/react`、`angular/angular`
> - Docker 镜像的 `命名空间/镜像名`，比如 `node:18` 其实是 `library/node:18`
> - C++ 的 `namespace std`、Python 的 `import os.path`
>
> 没有 `@` 的包叫"非作用域包"，名字全局唯一。比如 `react`、`lodash`、`express` —— 谁先注册谁用，后注册的不能用同名。
>
> 有 `@` 的包叫"作用域包"，名字只在作用域内唯一。比如 `@types/node` 和 `@types/react` 中的 `node` 和 `react` 可以重名，因为属于不同的 scope。
>
> 安装作用域包时，路径也会带 `@`：
> ```bash
> npm install @types/node    # 安装后出现在 node_modules/@types/node/
> npm install react          # 安装后出现在 node_modules/react/
> ```
>
> `@types` 这个 scope 是 DefinitelyTyped 社区专用的——所有第三方库的类型定义都发布在这个 scope 下。

**第二步：创建 tsconfig.json 并配置 "types"**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "strict": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts"]
}
```

关键配置：`"types": ["node"]`。

#### 7.4.3 深入理解：@types 机制

在 TypeScript 生态中，`@types` 是一个约定——所有类型定义包都以 `@types/xxx` 命名：

| npm 包 | 作用 |
|--------|------|
| `@types/node` | Node.js 内置模块（readline, process, fs, http 等）的类型 |
| `@types/express` | Express 框架的类型 |
| `@types/react` | React 框架的类型 |
| `@types/lodash` | Lodash 工具库的类型 |

**为什么有些库不需要 @types？**

如果一个库本身是用 TypeScript 写的，编译时会自动生成 `.d.ts` 文件，安装后 TypeScript 就能直接识别，不需要额外的 `@types` 包。比如我们后面会引入的 `tsx` 就是这样。

**规律总结：**
- 库本身是 TS 写的 → 自带类型，直接安装即可
- 库本身是 JS 写的 → 需要额外安装 `@types/库名` 来补充类型

#### 7.4.4 tsconfig.json 的其他配置说明

| 配置项 | 值 | 作用 |
|--------|----|------|
| `target` | `ES2020` | 编译成哪个 JS 版本。ES2020 支持 `?.` 可选链、`??` 空值合并等现代语法 |
| `module` | `commonjs` | 模块系统。Node.js 默认用 CommonJS（`require`/`module.exports`） |
| `strict` | `true` | 开启所有严格类型检查。建议一直开着，能帮你提前发现很多潜在 bug |
| `types` | `["node"]` | 告诉 TS 加载 `@types/node`，这样 `readline`、`process` 等就不会报错 |
| `include` | `["src/**/*.ts"]` | 只检查 `src/` 目录下的 `.ts` 文件 |

#### 7.4.5 一个小技巧：类型定义文件长什么样？

你可以打开 `node_modules/@types/node/readline.d.ts` 看看，里面定义了 `readline` 模块所有 API 的类型：

```typescript
// node_modules/@types/node/readline.d.ts (简化)
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

这就是类型定义文件的工作方式——它告诉 TypeScript："有一个叫 `readline` 的模块，它有一个 `createInterface` 函数，参数长这样，返回值长这样"。TS 有了这些信息，就能在你写代码时提供智能提示和类型检查了。

### 7.5 tsconfig.json 详解

解决了 `@types/node` 的问题后，VS Code 的报错消失了。但后来又出现了一个新问题——`tsconfig.json` 中的 `"moduleResolution": "node"` 被 TypeScript 标记为弃用：

```
Option 'moduleResolution=node10' is deprecated and will stop functioning in TypeScript 7.0.
```

这个警告不是 Bug，而是 TypeScript 自身的配置项过时了。我们需要理解 `tsconfig.json` 的各项配置才能真正理解发生了什么。

#### 7.5.1 tsconfig.json 是什么？

`tsconfig.json` 是 TypeScript 的配置文件。它告诉 TypeScript（和 VS Code）"这个项目的 TS 要怎么工作"。

**类比**：想象 TS 是一台电视机：
- 没有 `tsconfig.json` → 电视机用出厂默认设置（能看，但可能画面偏色、音量不合适）
- 有 `tsconfig.json` → 你调好了亮度、对比度、音量，每次开机都是你习惯的设置

具体来说，`tsconfig.json` 控制三件事：
1. **检查规则**：TS 对代码的严格程度（比如是否允许变量没有类型）
2. **编译输出**：TS 转成 JS 时用什么格式（哪个 JS 版本、哪种模块系统）
3. **作用范围**：哪些文件要检查、哪些要忽略

#### 7.5.2 我们项目的 tsconfig.json

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

下面逐行解释每一项。

#### 7.5.3 target — 输出哪个 JS 版本

```json
"target": "ES2020"
```

TypeScript 代码最终要转成 JavaScript 才能运行。`target` 决定转成哪个版本的 JS。

| 值 | 含义 | 支持的特性 |
|----|------|-----------|
| `ES5` | 2009 年的 JS | 兼容所有浏览器，但不支持箭头函数、`const`/`let` 等 |
| `ES2015` (即 ES6) | 2015 年的 JS | 支持箭头函数、class、Promise |
| `ES2020` | 2020 年的 JS | 支持 `?.` 可选链、`??` 空值合并、`Promise.allSettled` |
| `ESNext` | 最新 | 使用最新提案的特性 |

**选哪个？** Node.js 22 支持 ES2020 的所有特性，所以我们用 `ES2020`。不需要为了兼容老旧浏览器而降级到 ES5。

**类比**：就像 C++ 编译器的 `-std=c++17` 选项——指定用哪个语言标准来编译。

#### 7.5.4 module — 模块系统

```json
"module": "node16"
```

决定 TS 转成 JS 时用什么模块系统。模块系统决定了 `import`/`export` 怎么转成 JS 代码。

| 值 | 转译结果 | 说明 |
|----|---------|------|
| `commonjs` | `const x = require("./x")` | Node.js 传统方式 |
| `ES2020` | `import x from "./x"` | 浏览器原生支持，Node.js 需要特殊处理 |
| `node16` | 根据文件后缀决定 | `.mts` → ES module，`.cts` → CommonJS，`.ts` → 看 package.json 的 `type` 字段 |

**为什么从 `commonjs` 改成了 `node16`？**

一开始我们用 `"module": "commonjs"`、`"moduleResolution": "node"`。但在新版 TypeScript（5.x+）中，`moduleResolution: "node"` 被标记为**弃用**，因为它是 2014 年 Node.js 10 时代的产物，已经过时了。

改成 `"module": "node16"` + `"moduleResolution": "node16"` 后：
- 使用 Node.js 16+ 的现代模块解析规则
- 弃用警告消失
- 和 Node.js 实际的行为更一致

> 虽然 `module: "node16"` 听起来和 `module: "commonjs"` 不同，但在 `tsx` 下都能正常工作。`tsx` 内部会自动处理模块转换，不需要我们操心。

#### 7.5.5 moduleResolution — 模块查找规则

```json
"moduleResolution": "node16"
```

当你在代码中写 `import { something } from "./utils"` 时，TS 要去哪里找 `utils` 这个文件？

这就是 `moduleResolution` 控制的内容。

| 值 | 查找规则 |
|----|---------|
| `node`（已弃用） | 旧版 Node.js 规则，先找 `./utils.ts`，再找 `./utils/index.ts`，再找 `./utils/package.json` |
| `node16` | 新版 Node.js 规则，行为更接近实际 Node.js |
| `classic` | 非常老的规则，基本不用 |

**为什么 "node" 被弃用了？**

`"moduleResolution": "node"` 的全名其实是 `"node10"`——它是 2014 年 TypeScript 1.x 时代为 Node.js 10 设计的规则。十年过去了，Node.js 的模块系统已经发生了巨大变化（原生支持 ES modules、新增 exports/imports 字段等），`node10` 已经无法正确反映 Node.js 的实际行为了。

TypeScript 5.x 开始推荐使用 `node16`（对应 Node.js 16+）或 `bundler`（对应打包工具如 webpack/esbuild），旧版 `node` 将在 TypeScript 7.0 中彻底移除。

#### 7.5.6 strict — 严格模式

```json
"strict": true
```

这是 TS 最重要的一个开关。`true` 表示开启所有严格检查，相当于同时开启以下 7 个独立选项：

| 子选项 | 作用 |
|--------|------|
| `noImplicitAny` | 变量没有类型时，TS 推断为 `any` 就报错 |
| `strictNullChecks` | 不能把 `null`/`undefined` 赋值给其他类型 |
| `strictFunctionTypes` | 函数类型参数逆变检查 |
| `strictBindCallApply` | 检查 `bind`/`call`/`apply` 的参数类型 |
| `strictPropertyInitialization` | 类的属性必须在构造函数中初始化 |
| `noImplicitThis` | `this` 没有明确类型时报错 |
| `alwaysStrict` | 转译后的 JS 自动添加 `"use strict"` |

**建议**：永远保持 `"strict": true`。刚开始可能会多一些报错，但这些报错都是在帮你提前发现潜在的 bug。

**类比**：就像 C++ 编译器的 `-Wall -Wextra`，Python 的 `mypy --strict`。一开始觉得烦，习惯了就觉得不可或缺。

#### 7.5.7 types — 加载哪些类型定义

```json
"types": ["node"]
```

告诉 TypeScript："加载 `node_modules/@types/node` 这个包的类型定义"。

如果不写这一项，TypeScript 会默认加载 `node_modules/@types/` 下**所有**包的 `.d.ts` 文件。这在小项目没问题，但大项目会导致类型检查变慢。显式声明 `"types": ["node"]` 告诉 TS：只需要加载 `@types/node`，其他的不用管。

> 如果写 `"types": []`（空数组），TS 不会自动加载任何 `@types/` 包，你需要手动用 `import` 来引入类型。

#### 7.5.8 include — 检查范围

```json
"include": ["src/**/*.ts"]
```

告诉 TypeScript："只检查 `src/` 目录下的 `.ts` 文件"。

`**` 表示递归匹配任意层级的目录。所以 `src/**/*.ts` 匹配 `src/` 下的所有 `.ts` 文件（包括 `src/subdir/file.ts`）。

如果项目根目录还有一个 `scripts/` 目录里面也有 `.ts` 文件，它们不会被检查。如果你希望检查，可以改为：

```json
"include": ["src/**/*.ts", "scripts/**/*.ts"]
```

#### 7.5.9 其他常用配置（了解即可）

下面这些我们没有用到，但你在其他项目中可能会见到：

| 配置项 | 作用 |
|--------|------|
| `outDir` | 编译后的 JS 文件输出到哪个目录。比如 `"outDir": "./dist"` |
| `rootDir` | TS 源码的根目录。比如 `"rootDir": "./src"` |
| `sourceMap` | 生成 `.js.map` 文件，方便调试时定位到 TS 源码行 |
| `esModuleInterop` | 允许 `import x from "react"` 这种写法 |
| `skipLibCheck` | 跳过 `.d.ts` 文件的类型检查，加快编译速度 |
| `noUnusedLocals` | 有未使用的变量时报错 |
| `noUnusedParameters` | 有未使用的参数时报错 |

#### 7.5.10 如何查看当前生效的完整配置？

在终端运行：

```bash
npx tsc --showConfig
```

这会显示经过所有继承和默认值合并后的**最终配置**。你可以看到很多我们没有写但 TS 自动补全的默认值。

> 注意：我们目前没有安装 `typescript` 包（用的是 `tsx`），所以这个命令可能暂时不可用。后面引入 `tsc` 编译时会用到。

---

## 8. 调试问题：VS Code Debug 无法输入

### 8.1 问题描述

按 F5 debug 程序后，`rl.question()` 停在等待输入，但调试控制台无法输入任何字符。

### 8.2 原因

VS Code 的 Node.js debugger 默认使用**调试控制台（Debug Console）**显示程序输出。这个控制台是**只读的**——只能显示 `console.log` 的内容，不能接收 `process.stdin` 的输入。

`rl.question()` 底层依赖 `process.stdin`（标准输入流），所以执行到这里就卡住了——它在等键盘输入，但调试控制台没有键盘。

**类比**：调试控制台就像一台只能看的显示器，没有键盘。

### 8.3 第一次尝试修改launch.json：integratedTerminal

```json
"console": "integratedTerminal"
```

让程序运行在 VS Code **内置终端面板**（`` Ctrl + ` ``）中。终端面板支持 stdin，理论上可以输入。

但实际测试发现仍然不能输入。原因可能是 `tsx` 在某些 macOS 环境下与 VS Code 集成终端存在 stdin 重定向的兼容性问题。

### 8.4 最终方案：externalTerminal

```json
"console": "externalTerminal"
```

让程序运行在**独立弹出的终端窗口**中。这是一个真正的系统终端进程，stdin/stdout 完全独立于 VS Code，没有任何兼容性问题。

**三种方式的对比**：

| 模式 | 位置 | stdin | 适用场景 |
|------|------|-------|---------|
| `internalConsole`（默认） | VS Code 调试控制台 | ❌ 不支持 | 纯输出、不需要输入的程序 |
| `integratedTerminal` | VS Code 内置终端 | ⚠️ 可能有问题 | 简单交互，兼容性好的环境 |
| `externalTerminal` | 独立弹出窗口 | ✅ 完全支持 | 复杂交互、readline 等需要标准输入的程序 |

---

## 9. 总结

| 新增/修改 | 文件 | 作用 |
|-----------|------|------|
| 新增 | `src/game-loop.ts` | 游戏交互主循环 |
| 修改 | `src/board.ts` | 新增 `getFreePositions` |
| 修改 | `src/index.ts` | 入口改为启动游戏 |
| 新增 | `tsconfig.json` | TypeScript 配置文件 |
| 修改 | `.vscode/launch.json` | 修复 debug 无法输入的问题 |

**本章新学知识点：**
- `readline` 模块和异步回调模式
- 递归实现游戏循环
- 正则表达式验证输入格式
- 不可变性（Immutability）
- `@types/node` 和 npm scope
- `tsconfig.json` 各配置项含义
- VS Code debug 的三种 console 模式
