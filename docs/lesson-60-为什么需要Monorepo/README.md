# 第 60 课：为什么需要 Monorepo？

## 学习目标

- 发现当前项目结构的一个**真实痛点**
- 理解 monorepo 是什么、解决了什么问题
- 了解 npm workspaces 的原理
- 画出拆分后的目标结构

---

## 核心概念讲解

### 1. 先看当前项目结构

```
splendor-react/
├── package.json              # 混合了前端（React）和后端（Express）的依赖
├── src/
│   ├── game/                 # 游戏逻辑（types, board, purchase, game, gameState, card-pool）
│   │   ├── types.ts
│   │   ├── board.ts
│   │   ├── card-pool.ts
│   │   ├── purchase.ts
│   │   ├── game.ts
│   │   └── gameState.ts
│   ├── components/           # React 组件
│   │   ├── Board.tsx
│   │   ├── Pyramid.tsx
│   │   └── PlayerInfo.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── server/
│   ├── index-express.ts      # Express 后端
│   └── data.db               # SQLite 数据库
├── tsconfig.app.json         # 只 include "src"
├── tsconfig.server.json      # 只 include "server"
└── vite.config.ts
```

### 2. 痛点：server 无法引用游戏逻辑

现在后端只做用户注册/登录，不需要知道游戏规则。但接下来要实现 **AI 对手** 和 **在线联机**：

- **AI 对手**：后端需要模拟游戏状态、计算最佳操作 → 需要调用 `board.ts`、`purchase.ts`、`gameState.ts`
- **在线联机**：后端需要校验玩家的操作是否合法 → 需要调用 `validateCellSelection`、`canAfford` 等函数

**问题来了**：`server/index-express.ts` 怎么 import `src/game/` 里的代码？

```ts
// server/index-express.ts
import { createInitialState } from "../src/game/gameState";  // ❌ tsconfig.server.json 只 include "server"
```

TypeScript 编译器不认这个路径——`tsconfig.server.json` 的 `include` 是 `["server"]`，`src/` 不在它的管辖范围内。

### 3. 两种"笨办法"及其问题

#### 方案 A：复制代码

把 `src/game/` 复制一份到 `server/game/`。

```
src/game/          ← 前端用
server/game/       ← 后端用（复制品）
```

**问题**：两份代码需要保持同步。改了一个 bug，要改两个地方。忘记同步 → 前后端行为不一致 → 诡异 bug。

#### 方案 B：用相对路径强行 import

修改 `tsconfig.server.json`，把 `src/` 也 include 进来。

```json
{ "include": ["server", "src"] }
```

**问题**：
- `src/` 里有 React 组件（`.tsx`），server 的 tsconfig 没有配置 JSX 支持，编译会报错
- 依赖混乱：`package.json` 里 React 和 Express 的依赖混在一起，分不清谁依赖谁
- 构建时也会把 server 代码打进前端 bundle，或者反过来

**核心矛盾**：游戏逻辑是**纯 TypeScript**，既不属于前端也不属于后端，但两者都需要它。

### 4. Monorepo 是什么？

**Monorepo** = **Mono**（单一）+ **Repo**（仓库）= 把多个相关的包放在同一个 Git 仓库里管理。

```
splendor-duel/                    # 一个 Git 仓库
├── packages/
│   ├── core/                     # 包 A：纯游戏逻辑
│   ├── web/                      # 包 B：React 前端
│   └── server/                   # 包 C：Express 后端
```

每个包有自己的 `package.json`，可以独立声明依赖。但它们在同一个仓库里，可以互相引用。

**类比**：

| 概念 | 类比 |
|------|------|
| Monorepo | 一个小区里有三栋楼（core 楼、web 楼、server 楼） |
| 每个包 | 一栋独立的楼，有自己的门牌号（`package.json` 里的 `name`） |
| 包之间引用 | A 楼的住户可以去 B 楼串门（`import { ... } from "@splendor/core"`） |
| npm workspaces | 小区物业，管理三栋楼之间的关系 |

### 5. npm workspaces 的原理

npm workspaces 是 npm 内置的 monorepo 管理工具。核心机制是**软链接（symlink）**。

**步骤**：

1. 根 `package.json` 声明 `"workspaces": ["packages/*"]`
2. `npm install` 时，npm 发现 `packages/core/` 是一个子包
3. npm 在 `node_modules/@splendor/core` 创建一个**软链接**，指向 `packages/core/`

```
node_modules/
└── @splendor/
    └── core/  →  ../../packages/core/    ← 软链接！
```

效果：在 `packages/web/` 里写 `import { Card } from "@splendor/core"`，Node.js 顺着软链接找到 `packages/core/`，就像它是一个已安装的 npm 包一样。

**类比 Python**：

```bash
# Python 的 editable install
pip install -e ./packages/core

# npm workspaces 等价于
# 在 package.json 里声明 workspaces，然后 npm install
```

两者都是"把本地目录当作已安装的包来用"，修改源代码立即生效，不需要重新安装。

### 6. 目标结构

```
splendor-duel/
├── package.json                 # root: 只声明 workspaces + 公共脚本
├── packages/
│   ├── core/                    # @splendor/core
│   │   ├── package.json         # name: "@splendor/core", 零外部依赖
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── types.ts         # 所有类型定义
│   │       ├── board.ts         # 版图逻辑
│   │       ├── card-pool.ts     # 卡牌池
│   │       ├── purchase.ts      # 购买逻辑
│   │       ├── game.ts          # 胜利条件等
│   │       └── gameState.ts     # 状态管理纯函数
│   │
│   ├── web/                     # @splendor/web
│   │   ├── package.json         # name: "@splendor/web", 依赖 react + @splendor/core
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── App.css
│   │       ├── index.css
│   │       └── components/
│   │           ├── Board.tsx
│   │           ├── Pyramid.tsx
│   │           └── PlayerInfo.tsx
│   │
│   └── server/                  # @splendor/server
│       ├── package.json         # name: "@splendor/server", 依赖 express + better-sqlite3 + @splendor/core
│       ├── tsconfig.json
│       └── src/
│           └── index.ts
```

### 7. 三个包的职责和依赖关系

```
@​splendor/core          ← 纯 TypeScript，零外部依赖
    ↑           ↑
    │           │
@​splendor/web    @​splendor/server
(React 前端)     (Express 后端)
```

| 包 | 职责 | 依赖 |
|----|------|------|
| `@splendor/core` | 游戏类型、规则、状态管理 | 无 |
| `@splendor/web` | 浏览器 UI（React 组件） | `react`, `react-dom`, `@splendor/core` |
| `@splendor/server` | HTTP 接口、数据库、AI、联机 | `express`, `better-sqlite3`, `@splendor/core` |

**关键**：`core` 不依赖任何外部包。这样它可以在浏览器（前端）和 Node.js（后端）两个完全不同的环境里运行。

### 8. 为什么不在阶段一开始就拆？

这是**奥卡姆剃刀原则**的体现：

- 阶段一～四：只有前端需要游戏逻辑，一个 `src/game/` 目录就够了
- 阶段五：后端也需要游戏逻辑了，共享痛点**真正出现**了，此时拆才有意义

> 提前拆 = 提前引入复杂度（三个 tsconfig、三个 package.json、软链接调试），但当时没有收益。
>
> 现在拆 = 痛点真实存在，拆了能解决问题，付出的复杂度代价是值得的。

这就是"先跑起来，再优化"——等到**真的痛了**再重构，而不是一开始就"设计完美架构"。

---

## 本课产出

本课是**纯概念课**，没有代码改动。你需要理解：

1. 当前项目结构的问题：server 无法 import 游戏逻辑
2. 两种笨办法为什么不行：复制代码（同步问题）、相对路径（编译报错）
3. Monorepo 的思路：把共享代码抽成独立包，前后端都依赖它
4. npm workspaces 的原理：软链接，类比 Python 的 `pip install -e .`
5. 目标结构：三个包，core 零依赖，web 和 server 依赖 core

---

## 思考题

1. 如果不拆 monorepo，还有什么办法让 server 和 web 共享游戏逻辑？（提示：npm 发布）
2. `@splendor/core` 为什么必须是"零外部依赖"？
3. 如果将来还有一个 `packages/ai/` 包（AI 算法），它应该依赖谁？

---

## 思考题答案

### 1. 还有什么办法共享？

可以把 `core` 发布到 npm（公开或私有），然后 `web` 和 `server` 都 `npm install @splendor/core`。

**问题**：每次改一行代码都要重新发布，开发体验极差。Monorepo + workspaces 让你改 `core` 的代码后，`web` 和 `server` 立即生效，不需要发布。

### 2. 为什么 core 必须零外部依赖？

`core` 要同时跑在浏览器（前端）和 Node.js（后端）两个环境里。

- 如果 `core` 依赖了 `express`（Node.js 专属），浏览器里就跑不了
- 如果 `core` 依赖了 `react`（浏览器专属），Node.js 里就跑不了

纯 TypeScript 逻辑（类型定义、数组操作、数学计算）在两个环境都能跑。

### 3. AI 包应该依赖谁？

`packages/ai/` 只需要游戏逻辑来计算最佳操作，不需要 UI，不需要 HTTP 接口。

```
@​splendor/core
    ↑
@​splendor/ai
```

它依赖 `@splendor/core`，被 `@splendor/server` 调用（server 收到"AI 回合"请求时，调 AI 包计算下一步操作）。

---

## 下一课预告

第 61 课：动手搭建 Monorepo 骨架——创建三个子包的空壳，配置 npm workspaces，验证软链接生效。
