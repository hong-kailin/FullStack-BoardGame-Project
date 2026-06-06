# 第 33 课：把游戏逻辑搬进 React 项目

## 学习目标

- 理解 React 项目如何引入已有的 TypeScript 代码
- 学会区分"类型导入"和"运行时导入"
- 把终端版游戏逻辑文件复制到 React 项目结构中

## 为什么要搬？

在之前的课程中，游戏逻辑代码在 `old/src/` 目录下。现在我们要用 React 重构界面，但**游戏逻辑本身不需要重写**——卡牌数据、版图操作、购买逻辑、胜利条件这些"游戏规则"代码，在终端版已经写好了。

我们要做的只是把它们**搬到 React 项目里**，让 React 组件可以 import 使用。

## 第一步：创建 src/game/ 目录

```bash
mkdir src/game
```

这个目录专门放游戏核心逻辑，和 React 组件（`src/components/`）分开。

## 第二步：复制文件

需要复制 5 个文件：

| 文件 | 作用 |
|------|------|
| `types.ts` | 类型定义（Card、Player、GameState 等） |
| `card-pool.ts` | 卡牌数据和发牌函数 |
| `board.ts` | 版图创建、拿取标记 |
| `purchase.ts` | 购买卡牌、费用计算 |
| `game.ts` | 胜利条件、回合切换、标记上限 |

```bash
cp old/src/types.ts old/src/card-pool.ts old/src/board.ts old/src/purchase.ts old/src/game.ts src/game/
```

## 第三步：验证编译

```bash
npx tsc --noEmit
```

没有报错就说明复制成功。

### 这条命令是什么意思？

拆开来看：

| 部分 | 含义 |
|------|------|
| `npx` | Node Package Execute — 运行项目中安装的命令行工具，不需要全局安装 |
| `tsc` | TypeScript Compiler — TypeScript 编译器，把 `.ts` 文件编译成 `.js` |
| `--noEmit` | "不输出" — 只做类型检查，不生成 `.js` 文件 |

类比一下：

- 就像 Python 的 `mypy --strict` — 只检查类型对不对，不运行代码
- 也像 C++ 的编译过程 — 你可以在编译到一半时只检查语法错误，不生成可执行文件

**为什么需要这一步？**

TypeScript 代码在运行前需要被编译成 JavaScript。如果类型有错误（比如函数参数类型不匹配、导入了不存在的变量），`tsc` 会报错。`--noEmit` 让我们**只检查类型，不生成文件**，这样验证速度更快。

在 Vite 项目中，实际的编译工作是由 esbuild 完成的（不是 tsc），但 tsc 的类型检查更严格。所以我们用 `npx tsc --noEmit` 做类型检查，用 Vite 做实际编译。

## 为什么没有 game-loop.ts 和 renderer.ts？

这两个文件不需要复制：

- **game-loop.ts** — 包含 `createInitialState` 和 `processCommand`，它们是终端版的"胶水代码"。在 React 中我们会用不同的方式管理游戏状态（useState），所以不需要搬过来
- **renderer.ts** — 终端版的渲染函数（用 ANSI 颜色在终端打印文字）。在 React 中我们会用 JSX 组件渲染界面，所以也不需要

## 关于 import type

你可能注意到 `old/src/` 中的文件用的是普通 import：

```typescript
import { TokenType } from "./types";
```

但在 React + Vite 项目中，如果 `types.ts` **只包含类型定义**（type / interface），编译后这些类型会被移除，导致运行时找不到导出。所以需要用 `import type`：

```typescript
import type { TokenType } from "./types";
```

不过这一步我们会在后续课程中处理。现在先把文件复制过来，确保能编译通过就行。

## 本课产出

```
src/game/
├── types.ts        # 类型定义
├── card-pool.ts    # 卡牌池
├── board.ts        # 版图操作
├── purchase.ts     # 购买逻辑
└── game.ts         # 游戏规则
```

运行 `npx tsc --noEmit` 无报错。

## 思考题（附答案）

1. **为什么 `old/src/` 中的文件可以直接用 `import { ... }` 而不是 `import type { ... }`？**

   **答案**：旧项目用 `tsx`（终端运行）和 `esbuild`（浏览器打包）做编译。这两个工具在编译时会**自动检测**导入的东西是不是类型——如果是类型，编译后自动移除，不会在运行时去 `types.ts` 里找导出。所以写 `import { TokenType }` 也没问题。

   但 Vite 用的 esbuild 版本行为不同：如果 `types.ts` 里全是类型定义，编译后变成 `export {};`，这时 `import { TokenType }` 在运行时就会报错"没有导出 TokenType"。所以必须用 `import type` 明确告诉编译器"这只是类型，不要生成运行时导入"。

2. **如果把 `renderer.ts` 也复制过来，会有什么问题？**

   **答案**：`renderer.ts` 中导入了 `"purchase"` 和 `"game"`，但用的是**相对路径** `"./purchase"` 和 `"./game"`。如果直接复制到 `src/game/` 下，这些相对路径仍然有效，所以编译不会报错。

   真正的问题是：`renderer.ts` 里用 ANSI 转义码（`\x1b[31m`）在终端打印彩色文字，这些在浏览器中不工作。如果 React 组件不小心 import 了它，会在浏览器控制台打印一堆乱码。所以不应该搬过来，而是用 JSX 组件替代它的功能。
