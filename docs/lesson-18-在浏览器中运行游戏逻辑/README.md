# 第 18 课：在浏览器中运行游戏逻辑

## 本节课目标

把游戏逻辑代码放到浏览器中运行，在控制台中调用游戏函数。

---

## 1. 问题：浏览器不认识 TypeScript

到目前为止，我们的游戏逻辑（`board.ts`、`purchase.ts` 等）都是 TypeScript 文件。但浏览器只认识 JavaScript，不认识 TypeScript。

所以要在浏览器中运行游戏逻辑，需要把 TS 代码转成 JS 代码。

---

## 2. 创建浏览器入口文件

我们的 TS 代码中，`game-loop.ts` 依赖 Node.js 的 `readline` 模块（浏览器没有这个），`renderer.ts` 用了终端颜色代码。所以不能直接把所有 TS 文件编译到浏览器。

解决方案：创建一个**浏览器专用的入口文件**，只导出浏览器能用的函数。

创建 `src/browser-entry.ts`：

```typescript
export { takeTokens } from "./board";
export { getPlayerBonuses, getActualCost, canAfford, purchaseCard } from "./purchase";
export { getTotalPoints, getTotalCrowns, getPointsByGemColor, checkWinCondition } from "./game";
export { shuffleDeck, getLevelDeck } from "./card-pool";
```

这个文件只导出了不依赖 Node.js 的纯逻辑函数。

---

## 3. 用 esbuild 编译 TS 到 JS

### 3.1 安装 esbuild

esbuild 是一个 npm 包，需要先安装：

```bash
npm install --save-dev esbuild
```

`--save-dev` 表示这是开发依赖——编译时才需要，运行时不需要。

### 3.2 esbuild 是什么？

esbuild 是一个"打包工具"。它的工作就是把多个 TS/JS 文件合并成一个文件，同时把 TypeScript 转成 JavaScript。

你可能会问：为什么需要合并？因为浏览器加载文件是按 `<script>` 标签一个一个加载的。如果每个 TS 文件都编译成一个独立的 JS 文件，HTML 里就要写十几个 `<script>` 标签，而且还要自己保证加载顺序。esbuild 的 `--bundle` 就是解决这个问题的——它从入口文件开始，追踪所有 `import`，把依赖的代码全部合并到一个文件里。

**类比**：esbuild 就像 C++ 的编译器——你把多个 `.cpp` 文件交给编译器，它编译链接后输出一个可执行文件。esbuild 把多个 `.ts` 文件编译链接后输出一个 `.js` 文件。

### 3.3 运行命令

```bash
npx esbuild src/browser-entry.ts --bundle --outfile=docs/lesson-18-在浏览器中运行游戏逻辑/game.js --format=esm
```

逐项解释：

| 参数 | 作用 |
|------|------|
| `npx esbuild` | 运行 esbuild（npx 会自动找 node_modules 里的包） |
| `src/browser-entry.ts` | 入口文件，esbuild 会从这里开始追踪所有 import |
| `--bundle` | 把所有文件合并成一个文件 |
| `--outfile=...` | 输出到哪个 JS 文件 |
| `--format=esm` | 输出 ES Module 格式 |

### 3.5 什么是 ES Module？

ES Module 是 JavaScript 官方的模块标准。它用 `import` 和 `export` 来组织代码。

```javascript
// 导出
export function hello() { ... }

// 导入
import { hello } from "./file.js";
```

你可能注意到了——我们的 TS 代码里已经在用 `import`/`export` 了。没错，ES Module 就是 TypeScript 的 `import`/`export` 在 JavaScript 中的对应。

**那为什么还要指定 `--format=esm`？**

因为 JavaScript 不止一种模块标准。还有另一种叫 CommonJS，用 `require` 和 `module.exports`：

```javascript
// CommonJS 格式
const hello = require("./file.js");
module.exports = { hello };
```

Node.js 默认用的是 CommonJS（所以 `tsconfig.json` 里之前配了 `"module": "commonjs"`）。但**浏览器不认识 CommonJS**，浏览器只认识 ES Module。

所以 `--format=esm` 就是告诉 esbuild："输出浏览器能识别的 ES Module 格式，不要输出 Node.js 的 CommonJS 格式"。

**类比**：就像你写了一段文字，可以保存为 `.docx`（Word 格式）或 `.pdf`（通用格式）。`--format=esm` 相当于"保存为 PDF，确保浏览器能打开"。

### 3.6 添加 npm 脚本

当你运行这个命令时，esbuild 会：

1. 读取 `src/browser-entry.ts`
2. 发现它 `import` 了 `./board`、`./purchase` 等文件
3. 读取这些文件，发现它们又 `import` 了 `./types`
4. 把所有文件合并成一个 `game.js`
5. 同时把 TypeScript 语法（类型注解、interface 等）去掉，转成纯 JavaScript

### 3.5 添加 npm 脚本

每次编译都要打这么长的命令太麻烦。我们在 `package.json` 的 `scripts` 里加了一条：

```json
"build:web": "esbuild src/browser-entry.ts --bundle --outfile=web/game.js --format=esm"
```

以后只需运行：

```bash
npm run build:web
```

就能重新编译了。

---

## 4. 在 HTML 中引入 JS 文件

创建 `docs/lesson-18-在浏览器中运行游戏逻辑/index.html`：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>游戏逻辑测试</title>
</head>
<body>
  <h1>璀璨宝石对决 — 浏览器版</h1>
  <p>打开控制台 (F12) 看测试结果</p>

  <script type="module">
    import { takeTokens, getPlayerBonuses, getActualCost, canAfford } from "../../web/game.js";

    // 测试拿取标记
    const board = [
      ["red", "blue", null, "green", "white"],
      ["black", "pearl", "gold", "red", "blue"],
      ["green", null, "black", "white", "red"],
      ["blue", "green", "white", "black", "pearl"],
      ["red", "blue", "green", "white", "black"]
    ];

    const result = takeTokens(board, [[0, 0], [0, 1]]);
    console.log("拿取结果:", result);

    // 测试购买卡牌
    const card = {
      id: 1, level: 1, gem: "red",
      points: 1, crowns: 0, bonusCount: 1,
      cost: { red: 0, blue: 0, green: 2, white: 1, black: 0, pearl: 0 }
    };

    const player = {
      id: 0, name: "测试玩家",
      tokens: { red: 0, blue: 0, green: 1, white: 0, black: 0, pearl: 0, gold: 2 },
      cards: [
        { id: 3, gem: "green", bonusCount: 1 },
        { id: 7, gem: "white", bonusCount: 1 }
      ],
      royalCards: [], reservedCards: [], privileges: 0
    };

    const bonuses = getPlayerBonuses(player);
    console.log("奖励折扣:", bonuses);

    const actualCost = getActualCost(card, bonuses);
    console.log("实际费用:", actualCost);

    const affordable = canAfford(player, actualCost);
    console.log("能否购买:", affordable);

    console.log("所有测试完成！");
  </script>
</body>
</html>
```

注意 `<script type="module">`——因为 esbuild 输出的是 ES Module 格式，需要用 `type="module"` 来引入，并用 `import { ... } from "./game.js"` 来导入函数。

---

## 5. 动手

**第一步**：在终端运行 esbuild 编译命令（已执行，`game.js` 已生成）

**第二步**：用 Live Preview 打开 `index.html`：
1. 按 `Cmd + Shift + P` 打开命令面板
2. 输入 `Live Preview: Show Debug Preview` 并回车
3. 选择 `index.html`

> 注意：不能直接双击打开 HTML 文件。因为 `type="module"` 的 ES Module 受浏览器安全策略限制，`file://` 协议下无法加载。必须通过 HTTP 服务器（Live Preview 就是启动了一个本地服务器）来访问。
>
> **为什么？** 浏览器的安全策略禁止 `file://` 页面通过 `import` 加载其他文件——这就像不允许一个本地文档引用另一个本地文档，防止恶意软件读取你电脑上的其他文件。而通过 HTTP 服务器访问时，浏览器知道文件来自一个"可信的来源"，所以允许加载。

**第三步**：按 F12 看控制台输出。

---

## 6. 你学到了什么

| 概念 | 说明 |
|------|------|
| **esbuild** | 把 TS 编译成 JS 的打包工具 |
| **browser-entry.ts** | 浏览器专用的入口文件，只导出不依赖 Node 的函数 |
| **--bundle** | 把多个文件合并成一个 |
| **type="module"** | 在 HTML 中引入 ES Module 的方式 |
| **import { ... } from "./game.js"** | 在浏览器中导入模块 |
