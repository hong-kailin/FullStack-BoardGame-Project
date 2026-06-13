# 第 62 课：拆分代码并跑通

## 学习目标

- 把现有代码搬进三个子包
- 修复所有 import 路径
- 清理根 package.json，把依赖分到各自子包
- 验证 `npm run dev` 和 `npm run server` 都能正常工作

---

## 核心概念讲解

### 1. 上节课回顾

上节课我们搭好了三个空壳包，软链接生效。本课把真正的代码搬进去。

### 2. 拆分策略

遵循**最小改动**原则：先复制，再修 import，最后清理旧文件。

```
旧位置                           →  新位置
───────────────────────────────────────────────────
src/game/types.ts               →  packages/core/src/types.ts
src/game/board.ts               →  packages/core/src/board.ts
src/game/card-pool.ts           →  packages/core/src/card-pool.ts
src/game/purchase.ts            →  packages/core/src/purchase.ts
src/game/game.ts                →  packages/core/src/game.ts
src/game/gameState.ts           →  packages/core/src/gameState.ts
                                  packages/core/src/index.ts  (新增，统一导出)

src/App.tsx                     →  packages/web/src/App.tsx
src/App.css                     →  packages/web/src/App.css
src/index.css                   →  packages/web/src/index.css
src/main.tsx                    →  packages/web/src/main.tsx
src/components/Board.tsx        →  packages/web/src/components/Board.tsx
src/components/Pyramid.tsx      →  packages/web/src/components/Pyramid.tsx
src/components/PlayerInfo.tsx   →  packages/web/src/components/PlayerInfo.tsx
vite.config.ts                  →  packages/web/vite.config.ts
index.html                      →  packages/web/index.html
public/                         →  packages/web/public/

server/index-express.ts         →  packages/server/src/index.ts
server/data.db                  →  packages/server/data.db
```

### 3. core 包的 index.ts — 统一导出

`packages/core/src/index.ts` 是整个 core 包的"门面"。它把所有模块的导出重新汇聚到一起：

```ts
export type { GemColor, TokenType, Card, RoyalCard, Player, GameState } from "./types";
export { shuffleDeck, getLevelDeck, dealCards } from "./card-pool";
export { createBoard, getAdjacentTokens, validateTakePositions, validateCellSelection, takeTokens } from "./board";
export { getPlayerBonuses, getActualCost, getTotalTokenCost, canAfford, purchaseCard } from "./purchase";
export { getTotalPoints, getTotalCrowns, getPointsByGemColor, checkWinCondition, switchPlayer, checkRoyalCardEligibility, enforceTokenLimit } from "./game";
export { createInitialState, handleTakeTokens, handleDiscardTokens, handleBuyCard, handlePass, handleTakeGold } from "./gameState";
```

**为什么需要这个文件？**

如果没有 `index.ts`，外部要这样用：

```ts
import { Card, GameState } from "@splendor/core/src/types";
import { createBoard } from "@splendor/core/src/board";
import { purchaseCard } from "@splendor/core/src/purchase";
```

问题是：使用者必须知道 core 内部有哪些文件、每个函数在哪个文件里。而且 core 内部重构（比如把 `game.ts` 拆成两个文件），所有外部 import 路径都要跟着改。

有了 `index.ts` 之后，外部统一写：

```ts
import { Card, GameState, createBoard, purchaseCard } from "@splendor/core";
```

使用者完全不需要知道 core 内部的文件结构。`package.json` 里的 `"main": "./src/index.ts"` 告诉 Node.js：当别人 `import "@splendor/core"` 时，去找这个文件。

**类比 Python**：这就是 Python 包里 `__init__.py` 的作用。你在 `__init__.py` 里写 `from .board import create_board`，外部就能直接 `from my_package import create_board`，不需要写 `from my_package.board import create_board`。`index.ts` 就是 TypeScript 的 `__init__.py`——包的"门面"，控制对外暴露什么、隐藏什么。

### 4. 修复 import 路径

前端组件之前从 `../game/` 或 `./game/` import 游戏逻辑，现在改成从 `@splendor/core` import：

```ts
// 之前
import { createInitialState } from "./game/gameState";
import type { TokenType } from "../game/types";

// 之后
import { createInitialState } from "@splendor/core";
import type { TokenType } from "@splendor/core";
```

**关键**：所有组件不再需要知道游戏逻辑文件的具体位置。它们只需要知道"从 `@splendor/core` 拿"。至于 `@splendor/core` 内部怎么组织，组件不关心。

### 5. 后端数据库路径修正

之前 `server/index-express.ts` 里写的是：

```ts
const db = new Database("server/data.db");
```

这里有个容易踩的坑：`"server/data.db"` 这个路径**不是相对于源代码文件的**，而是**相对于你运行命令的目录**（工作目录）。之前我们在项目根目录运行 `npm run server`，从根目录看 `server/data.db` 确实存在，所以能找到。

拆分后，目录结构变了：

```
splendor-duel/               ← 工作目录（在这里运行 npm run server）
├── packages/
│   └── server/
│       ├── src/
│       │   └── index.ts     ← 代码搬到这了
│       └── data.db          ← 数据库在这
```

如果代码还写 `new Database("server/data.db")`，Node.js 会从根目录找 `server/data.db`——但这个路径已经不存在了，数据库在 `packages/server/data.db`。

你可能会想：那改成 `new Database("packages/server/data.db")` 不就行了？能用，但这依赖于"你一定在根目录运行命令"。换个目录运行就又崩了。

更靠谱的做法是：**不管你在哪里运行命令，都从源代码文件自身的位置出发去找数据库**：

```ts
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(resolve(__dirname, "..", "data.db"));
```

逐行拆解：

| 步骤 | 值 |
|------|-----|
| `import.meta.url` | `file:///.../packages/server/src/index.ts` |
| `fileURLToPath(...)` | `/.../packages/server/src/index.ts` |
| `dirname(...)` | `/.../packages/server/src/` |
| `resolve(__dirname, "..", "data.db")` | `/.../packages/server/data.db` |

**类比 Python**：这就是 `Path(__file__).parent / ".." / "data.db"`。`__file__` 永远指向源代码文件自身的位置，不受工作目录影响。

### 6. 依赖拆分

之前根 `package.json` 混了所有依赖。现在按"谁用谁声明"原则拆分：

| 依赖 | 属于 | 原因 |
|------|------|------|
| `react`, `react-dom` | `@splendor/web` | 只有前端用 |
| `@vitejs/plugin-react`, `vite` | `@splendor/web` (dev) | 前端构建工具 |
| `@types/react`, `@types/react-dom` | `@splendor/web` (dev) | 前端类型 |
| `express` | `@splendor/server` | 后端框架 |
| `better-sqlite3` | `@splendor/server` | 数据库 |
| `@types/express`, `@types/better-sqlite3` | `@splendor/server` (dev) | 后端类型 |
| `tsx` | `@splendor/server` (dev) | 运行 TypeScript |
| `typescript`, `eslint`, ... | 根 (dev) | 全局工具 |

### 7. 根 tsconfig.json 更新

```json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/web" },
    { "path": "./packages/server" }
  ]
}
```

`references` 告诉 TypeScript："这个项目由三个子项目组成，各自有独立的 tsconfig"。

---

## 逐行代码讲解

### packages/core/src/index.ts

```ts
export type { GemColor, TokenType, Card, RoyalCard, Player, GameState } from "./types";
```

`export type { ... } from "..."` 是 TypeScript 的**类型重导出**语法。它只导出类型（编译后消失），不导出运行时的值。

```ts
export { shuffleDeck, getLevelDeck, dealCards } from "./card-pool";
```

普通 `export { ... } from "..."` 导出运行时的函数/变量。

### 前端 import 修改

```ts
// App.tsx — 之前 4 行分散 import
import { createInitialState, ... } from "./game/gameState";
import { validateCellSelection } from "./game/board";
import { getPlayerBonuses, ... } from "./game/purchase";
import type { TokenType } from "./game/types";

// App.tsx — 之后 4 行统一从 @splendor/core
import { createInitialState, ... } from "@splendor/core";
import { validateCellSelection } from "@splendor/core";
import { getPlayerBonuses, ... } from "@splendor/core";
import type { TokenType } from "@splendor/core";
```

虽然 import 来源变了，但导入的内容完全一样——这就是 `index.ts` 统一导出的好处。

---

## 本课产出

| 操作 | 文件 |
|------|------|
| 新增 | `packages/core/src/` 下 7 个游戏逻辑文件 |
| 新增 | `packages/web/src/` 下前端代码（从 `src/` 搬来） |
| 新增 | `packages/web/vite.config.ts`、`packages/web/index.html` |
| 新增 | `packages/server/src/index.ts`（从 `server/` 搬来） |
| 修改 | `packages/core/src/index.ts` — 统一导出 |
| 修改 | `packages/web/src/App.tsx` 等 4 个文件 — import 路径 |
| 修改 | `packages/server/src/index.ts` — 数据库路径 |
| 修改 | `package.json`（根）— 清理依赖，只保留全局工具 |
| 修改 | `packages/web/package.json` — 加 devDependencies |
| 修改 | `packages/server/package.json` — 加 devDependencies |
| 修改 | `tsconfig.json`（根）— references 指向子包 |
| 删除 | `src/`、`server/`、`vite.config.ts`、`index.html`、`public/`、`tsconfig.app.json`、`tsconfig.node.json`、`tsconfig.server.json` |

### 验证方式

```bash
# TypeScript 编译检查
npx tsc --noEmit -p packages/core/tsconfig.json    # ✅
npx tsc --noEmit -p packages/web/tsconfig.json     # ✅
npx tsc --noEmit -p packages/server/tsconfig.json  # ✅

# 启动前端
npm run dev
# → Vite 启动在 http://localhost:5173

# 启动后端
npm run server
# → Express 启动在 http://localhost:3001
# → curl http://localhost:3001/api/ping → {"message":"pong"}
```

---

## 思考题

1. 为什么 `core` 的 `index.ts` 要用 `export { ... } from "./xxx"` 而不是把所有代码写在一个文件里？
2. 如果将来 `core` 新增了一个模块 `ai.ts`，需要改哪些文件才能让 `web` 和 `server` 用到它？
3. 根 `package.json` 的 `dependencies` 现在为空了，为什么 `npm install` 还能正常工作？

---

## 思考题答案

### 1. 为什么用重导出而不是合并文件？

- **关注点分离**：`board.ts` 只管版图，`purchase.ts` 只管购买，各司其职
- **按需加载**：如果只 import `Card` 类型，不需要加载 `board.ts` 的代码
- **可维护性**：改版图逻辑只改 `board.ts`，不影响其他模块

### 2. 新增模块需要改什么？

1. 创建 `packages/core/src/ai.ts`
2. 在 `packages/core/src/index.ts` 加一行 `export { ... } from "./ai"`
3. 完成。`web` 和 `server` 不需要任何改动——它们只 import `@splendor/core`，不关心内部结构

### 3. 为什么根 package.json 没有 dependencies 也能 npm install？

npm workspaces 会把所有子包的依赖**提升（hoist）**到根 `node_modules/`。`npm install` 时，npm 扫描所有子包的 `package.json`，收集所有依赖，统一安装到根 `node_modules/`。

所以根 `package.json` 不需要声明 `react`——`@splendor/web` 声明了，npm 会自动安装。

---

## 下一课预告

阶段五（Monorepo 拆分）到此结束。下一阶段是**阶段六：AI 对手**——让计算机学会玩璀璨宝石对决。
