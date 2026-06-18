# 🎮 璀璨宝石对决（Splendor Duel）在线版 — 课程大纲

> 本课程面向全栈零基础的学生，项目驱动，从零到一构建完整 Web 应用。

---

## 📚 总览

> ⚠️ 以下课时安排为预设计划，实际教学过程中会根据学习进度和理解情况动态调整（增删课时、调整顺序等），以实际教学为准。

| 阶段 | 名称 | 课时 | 核心产出 |
|------|------|------|----------|
| 零 | 预备知识 | 5 课 | 理解 Web 应用原理、Node.js/npm/TypeScript 基础 |
| 一 | 游戏核心逻辑（终端版） | 12 课 | 可在终端完整进行一局双人对战 |
| 二 | Web 界面（原生 JS + CSS） | 18 课 | 浏览器中可玩的本地双人游戏 |
| 三 | React 重构 | 16 课 | 用 React + TypeScript 重构游戏界面（规则暂未完全实现） |
| 四 | 用户系统（后端入门） | 8 课 | 注册、登录、Session、数据库 |
| 五 | Monorepo 拆分 | 3 课 | 将项目拆分为 core/web/server 子包 |
| 五·五 | 完善游戏规则 | 4 课 | 补全标记回收、特权、卡牌能力、皇室卡牌 |
| 五·六 | 游戏逻辑重构 | 5 课 | 卡牌数据 JSON 化、Action 类型、行动队列、测试、重构 |
| 五·七 | UI 交互优化 | 5 课 | UI 问题梳理、调试工具、组件测试、状态机重构、交互完善 |
| 六 | AI 对手 | 4 课 | 可在浏览器中与 AI 对战 |
| 七 | 在线联机 | 6 课 | 两人通过网络远程对战 |
| 八 | 部署上线 | 2 课 | 让全世界都能玩 |

**总计：约 88 课时**

---

# 阶段零：预备知识（5 课时）

### 第 1 课：认识项目结构
- 了解最终项目长什么样
- 前端/后端/数据库/部署的基本概念
- 用类比理解 Web 应用的全貌

### 第 2 课：Node.js 和 npm
- 安装 Node.js，理解运行时和 npm 包管理器
- 用 npm 初始化项目、安装依赖
- 运行第一个 TypeScript 文件

### 第 3 课：package.json 详解
- package.json 的结构和各字段含义
- dependencies vs devDependencies
- scripts 字段和常用命令

### 第 4 课：TypeScript 速览
- JavaScript vs TypeScript
- 类型注解、interface、type
- 类型带来的好处

### 第 5 课：终端基础与开发环境
- 最常用的终端命令
- 验证开发环境（node、npm、tsx、git）
- VS Code 基本操作

---

# 阶段一：游戏核心逻辑 — 终端版（12 课时）

### 第 6 课：游戏规则概览 + 类型定义
- 讲解璀璨宝石对决的核心规则（三种胜利条件、标记系统、金字塔、皇室卡牌）
- 定义游戏中的基础类型：宝石颜色、卡牌、玩家状态、游戏状态

### 第 7 课：实现卡牌池
- 设计卡牌数据：等级、所需宝石、提供的声望点/宝石
- 卡牌数据写死在代码中（不引入 JSON 或数据库）
- 实现发牌函数：从牌堆随机抽取若干张展示

### 第 8 课：玩家操作 — 拿取宝石
- 实现玩家手牌、宝石持有量
- 实现版图系统：5×5 螺旋摆放、相邻/直线校验
- 实现 takeTokens：从版图移除标记、特权触发条件

### 第 9 课：玩家操作 — 购买卡牌
- 检查玩家宝石是否足够支付
- 扣除宝石、添加卡牌到玩家手牌
- 卡牌提供的宝石折扣生效（bonus 系统）

### 第 10 课：游戏状态管理
- 设计 `GameState` 数据结构
- 实现回合切换（玩家 1 → 玩家 2）
- 实现胜利条件检查（声望 ≥ 20、王冠 ≥ 10、单色声望 ≥ 10）
- 实现标记上限强制归还

### 第 11 课：终端界面 v1 — 纯文本显示
- 用 `console.log` 和 ANSI 颜色显示当前游戏状态
- 渲染版图、金字塔、玩家信息

### 第 12 课：终端界面 v2 — 操作交互
- 用 `readline` 接收玩家输入
- 实现 take / buy / pass / show / quit 命令
- 输入校验（正则表达式、相邻检查、位置合法性）
- 完整的双人轮流操作流程

---

# 阶段二：Web 界面 — 本地双人（22 课时）

> 终端交互体验较差，难以完整测试所有规则。提前引入 Web 界面，用更现代的交互方式继续完善游戏。
>
> 先纯 HTML 搭结构 + 实现交互，再引入 CSS 美化。每课只讲一点点，边做边学。

### 第 13 课：我的第一个 HTML 页面
- HTML 是什么？和 Markdown 类比
- 创建一个最简单的 HTML 文件
- 认识 `<h1>`、`<p>` 标签
- 用浏览器打开本地 HTML 文件
- **产出**：一个显示"璀璨宝石对决"标题的页面

### 第 14 课：用 HTML 搭游戏界面
- 用 `<div>` 划分区域（标题区、版图区、玩家区）
- 用 `<ul>`/`<li>` 显示卡牌列表
- **产出**：游戏页面的 HTML 骨架（全是文字，很丑但能用）

### 第 15 课：按钮和输入
- `<button>` 标签
- `<input>` 标签（文本、数字）
- **产出**：在页面底部加一个"输入坐标"的输入框和"拿取"按钮

### 第 16 课：引入 JavaScript
- 用 `<script>` 标签在 HTML 中写 JS
- `console.log` 在浏览器控制台输出
- 选中元素：`document.getElementById`
- **产出**：点击按钮在控制台打印"按钮被点击了"

### 第 17 课：事件与交互
- `addEventListener` 绑定点击事件
- 读取输入框的值
- **产出**：点击"拿取"按钮，读取输入框中的坐标

### 第 18 课：在浏览器中运行游戏逻辑
- 把 `src/` 下的游戏逻辑编译成 JS
- 用 `<script src="...">` 引入编译后的 JS 文件
- 在浏览器中调用游戏函数
- **产出**：在浏览器控制台中调用 `takeTokens`、`purchaseCard`

### 第 19 课：用 JS 操作页面内容
- `document.createElement` 创建元素
- `textContent` 修改文字
- `appendChild` 添加子元素
- **产出**：把游戏状态渲染到页面上（纯文字版）

### 第 20 课：渲染版图
- 用 JS 动态生成 5×5 网格
- 根据 `boardTokens` 数据填充每个格子
- **产出**：页面上显示 5×5 的版图

### 第 21 课：渲染金字塔和玩家信息
- 用 JS 动态生成卡牌列表
- 显示玩家标记、分数、王冠
- **产出**：页面上显示完整的游戏状态

### 第 22 课：点击版图拿取标记
- 给版图格子绑定点击事件
- 点击格子记录选中的位置
- 点击"确认"执行 take 操作
- **产出**：在页面上点击版图就能拿取标记

### 第 23 课：点击卡牌购买
- 给金字塔中的卡牌绑定点击事件
- 点击卡牌执行购买操作
- **产出**：在页面上点击卡牌就能购买

### 第 24 课：完整游戏流程
- 回合切换、玩家标识
- 禁用非当前玩家的操作
- **产出**：可以在页面上完整玩一局

### 第 25 课：CSS 入门
- 为什么需要 CSS？（现在的页面太丑了）
- 三种写 CSS 的方式
- 基础属性：颜色、字号、背景色
- **产出**：给游戏页面加点颜色

### 第 26 课：CSS 选择器
- 标签选择器、class 选择器、id 选择器
- 优先级规则
- **产出**：用 class 给不同区域设置不同样式

### 第 27 课：盒模型
- margin、padding、border
- 理解"每个元素都是一个盒子"
- **产出**：让游戏页面的元素之间有空隙

### 第 28 课：Flexbox 布局
- `display: flex`
- 主轴/交叉轴、`justify-content`、`align-items`
- **产出**：版图居中、按钮横向排列

### 第 29 课：UI 美化
- 调整颜色方案、字体、间距
- 添加 hover 效果和过渡动画
- **产出**：游戏界面更好看

### 第 30 课：完善游戏规则（金字塔补牌、袋子系统）
- 购买卡牌后从牌库补新卡
- 花费的标记放回袋子
- **产出**：游戏可以持续进行

---

# 阶段三：React 重构（16 课时）

> 当前页面是用原生 JS 操作 DOM 实现的，代码越来越复杂。引入 React，用组件化和声明式的方式重构游戏界面。
>
> **核心思路**：先搬逻辑、再搭组件、最后串联流程。每一步只做一件事，确保可运行。
>
> ⚠️ 当前阶段已暂停规则开发，后续会在系统架构完善后统一重构游戏逻辑。

### 第 31 课：认识 React
- React 是什么？解决了什么问题？
- 对比原生 JS 操作 DOM 的痛点
- 用 Vite 创建第一个 React + TypeScript 项目
- **产出**：一个显示"Hello React"的页面

### 第 32 课：JSX 语法
- JSX = JavaScript + XML
- 在 JS 中写 HTML 标签
- 条件渲染、列表渲染
- **产出**：用 JSX 渲染游戏标题和玩家信息

### 第 33 课：把游戏逻辑搬进 React 项目
- 把 `old/src/` 下的游戏逻辑文件复制到 `src/game/`
- 去掉旧的教学注释，保持代码干净
- 验证 TypeScript 编译通过
- **产出**：`src/game/` 下有 types.ts、card-pool.ts、board.ts、purchase.ts、game.ts

### 第 34 课：创建游戏状态管理函数
- 创建 `src/game/gameState.ts`
- 把 `createInitialState` 搬过来
- 把 `handleTakeTokens`、`handleBuyCard`、`handlePass` 写成纯函数
- **产出**：游戏逻辑函数可在 React 中调用

### 第 35 课：第一个 React 组件 — Board（静态渲染）
- 创建 `src/components/Board.tsx`
- 接收 `boardTokens` 作为 props
- 用 JSX 渲染 5×5 网格
- 在 App.tsx 中调用 `createInitialState()` 获取数据传给 Board
- **产出**：页面上显示版图

### 第 36 课：给 Board 组件添加简单交互
- 点击格子选中/取消选中（单格，不多选）
- 理解 `useState` 的工作原理
- 理解组件函数会反复执行
- **产出**：点击宝石高亮，再点取消高亮

### 第 37 课：Pyramid 组件（静态显示）
- 创建 `src/components/Pyramid.tsx`
- 接收 `pyramid` 作为 props
- 两层 map 渲染三个等级的卡牌
- **产出**：页面上显示金字塔卡牌

### 第 38 课：PlayerInfo 组件（静态显示）
- 创建 `src/components/PlayerInfo.tsx`
- 显示玩家标记、声望、王冠
- **产出**：页面上显示两个玩家的信息面板

### 第 39 课：多选版图格子
- 升级 Board，允许最多选中 3 个格子
- 选中/取消逻辑改为多选模式
- **产出**：可以同时选中 1~3 个宝石

### 第 40 课：给 gameState.ts 添加操作函数
- 把 `handleTakeTokens` 加到 gameState.ts
- 把 `handleBuyCard` 加到 gameState.ts
- 把 `handlePass` 加到 gameState.ts
- **产出**：React 可以调用游戏操作函数

### 第 41 课：实现拿取标记
- 在 App 中添加"拿取标记"按钮
- 把 `selectedPositions` 从 Board 提升到 App
- 调用 `handleTakeTokens`，更新游戏状态
- **产出**：选中宝石后点击按钮即可拿取

### 第 42 课：给 Pyramid 添加购买功能
- 点击卡牌触发购买
- 接入 `handleBuyCard`
- 宝石不足时给提示
- **产出**：点击金字塔卡牌可以购买

### 第 43 课：跳过回合
- 添加"跳过回合"按钮
- 接入 `handlePass`
- **产出**：玩家可以跳过自己的回合

### 第 44 课：回合切换与当前玩家显示
- PlayerInfo 高亮当前回合玩家
- 禁用非当前玩家的操作
- 游戏结束时禁用所有操作
- **产出**：完整的双人轮流操作流程

### 第 45 课：美化卡牌显示（宝石颜色、费用图标）
- 用宝石 emoji 代替文字显示费用
- 卡牌边框用对应宝石颜色
- 让费用一目了然
- **产出**：卡牌显示更直观

### 第 46 课：标记可购买卡牌
- 根据当前玩家持有的宝石和奖励，计算哪些卡牌买得起
- 买得起的卡牌加高亮边框
- **产出**：玩家一眼看出能买哪些卡

### 第 47 课：已购买卡牌按颜色展示
- 在 PlayerInfo 下方展示已购买的卡牌
- 按宝石颜色分组排列
- **产出**：玩家能看到自己和对手的卡牌积累

### 第 48 课：拿取黄金 + 保留卡牌
- 实现黄金的特殊操作：拿 1 个黄金 + 保留 1 张卡牌
- 保留的卡牌放入玩家 reservedCards
- 保留区最多 3 张
- **产出**：黄金操作完整可用

### 第 49 课：金字塔补牌
- 购买卡牌后从牌库补充新卡
- 保留卡牌后从牌库补充新卡
- **产出**：金字塔不会空

### 第 50 课：标记上限强制归还
- 回合结束时检查标记是否超过 10 个
- 超过时弹出选择界面让玩家选择归还哪些
- **产出**：标记上限规则生效

### 第 51 课：CSS 美化 React 版
- 综合美化所有组件
- 响应式布局
- **产出**：React 版游戏界面美观可用

> ⚠️ **关于游戏规则的说明**
>
> 当前游戏规则尚未完全实现（如特权系统、皇室卡牌、卡牌能力结算等）。
> 考虑到目前的开发模式——在 React 组件中混合状态管理和游戏逻辑——不够高效，
> 继续堆规则会让代码越来越难维护。
>
> 因此决定：**先暂停规则开发，继续往后学习系统架构（Monorepo、后端、数据库等）**。
> 等整体系统搭建得差不多了，再回过头来对游戏逻辑进行统一重构，
> 届时用更清晰的数据流和状态管理方式来补全所有规则。
>
> 这样做的目的是：先建立"全栈"的完整认知，再回来打磨"游戏"的细节。

---

# 阶段四：用户系统 — 后端入门（8 课时）

> 游戏在浏览器里能玩了，但一刷新就重来，服务器也认不出"你是谁"。我们需要后端：一个能记住用户、保存数据的服务器。
>
> 这一阶段贯彻两条主线：① **原生 → 框架**（原生 `http` → Express）；② **文件 → 数据库**（JSON 文件 → SQLite）。
>
> ⚠️ 此时前端（游戏 UI）和后端（用户服务）通过 HTTP + JSON 通信，天然解耦，**暂不需要 Monorepo**。等到阶段六/七要在前后端之间共享游戏逻辑时，再正式拆包（见下方阶段五）。

### 第 52 课：Node 原生 HTTP 服务器
- 用 `node:http` 手写最简单的服务器，理解 req/res、端口、监听
- 手动判断 URL 和 method 来做"路由"
- 返回 JSON（设置 `Content-Type`）
- **产出**：访问 `/api/ping` 返回 `{"message":"pong"}`

### 第 53 课：HTTP 四种方法 + POST body 解析
- 讲解 HTTP 的四种方法：GET（读）、POST（创）、PUT（改）、DELETE（删）
- 用原生 `http` 实现 POST 接口，手动拼接 body（`req.on("data")` / `req.on("end")`）
- 理解流式传输：为什么 body 是一块一块到达的
- **产出**：`POST /api/echo` 接收 JSON 并原样返回
- 痛点铺垫：手动读 body 太啰嗦，为引入 Express 做铺垫

### 第 54 课：引入 Express
- 上一课的痛点：路由 if-else 堆叠、手动读 body
- `app.get` / `app.post`、路由、`express.json()` 中间件
- **产出**：用 Express 重写服务器，路由变清爽

### 第 55 课：实现注册（文件存储 + 密码哈希）
- `POST /api/register`，接收 username / password
- 为什么密码**绝不能明文存**？引入哈希（`node:crypto` 的 scrypt）
- 用 `users.json` 文件存储用户
- **产出**：能注册用户，密码以哈希形式落盘

### 第 56 课：实现登录
- `POST /api/login`，取出用户、校验密码哈希
- 痛点：登录成功后，下一个请求服务器怎么知道"还是你"？HTTP 是无状态的
- **产出**：登录成功 / 失败返回不同结果

### 第 57 课：Session 与 Cookie
- 无状态痛点的解法：服务端建 session，浏览器存 cookie（sessionId）
- `Set-Cookie`、读 cookie、内存里的 session 表
- 实现 `GET /api/me`：靠 cookie 认出当前用户
- **产出**：登录后保持登录态，能查到"我是谁"

### 第 58 课：引入 SQLite 数据库
- 文件存储的痛点：并发写覆盖、查询要全量读、没有结构约束
- 引入 SQLite（`better-sqlite3`），建 users 表，迁移注册 / 登录
- **产出**：用户数据存进数据库，注册 / 登录走 SQL

### 第 59 课：前端接入用户系统
- React 加注册 / 登录表单（受控组件）
- `fetch` 调后端，用 Vite 的 `server.proxy` 解决跨域
- 登录后进入游戏；（可选）游戏结束保存对局记录
- **产出**：浏览器里完整走通 注册 → 登录 → 玩游戏

---

# 阶段五：Monorepo 拆分（3 课时）

> 到这里你已经有了**前端**和**后端**两个独立部分。进入 AI / 联机后，后端要复用前端的游戏逻辑和类型——"如何在前后端之间共享 `core`"的痛点真正出现了。这时才正式拆 Monorepo。

### 当前项目结构的问题

```
splendor-react/          # 单一 package
├── src/
│   ├── game/            # 游戏逻辑（types, board, purchase, game, gameState, card-pool）
│   ├── components/      # React 组件（Board, Pyramid, PlayerInfo）
│   └── App.tsx          # 主组件
├── server/
│   └── index-express.ts # Express 后端（独立，不引用游戏逻辑）
├── tsconfig.app.json    # 只 include "src"
├── tsconfig.server.json # 只 include "server"
└── package.json         # 混合了前端+后端依赖
```

**核心痛点**：server 和 src 是隔离的。等实现 AI 对手和在线联机时，server 需要调用游戏逻辑（校验操作、计算状态等），但现在 server 根本 import 不了 `src/game/` 里的代码。

### 目标结构

```
splendor-duel/
├── package.json          # root: workspaces 声明
├── packages/
│   ├── core/             # @splendor/core — 纯游戏逻辑，零依赖
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── types.ts
│   │       ├── board.ts
│   │       ├── card-pool.ts
│   │       ├── purchase.ts
│   │       ├── game.ts
│   │       └── gameState.ts
│   ├── web/              # @splendor/web — React 前端
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── App.tsx
│   │       ├── components/
│   │       └── ...
│   └── server/           # @splendor/server — Express 后端
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── index.ts
```

### 关键设计决策

| 决策 | 选择 | 原因 |
|------|------|------|
| 包名 | `@splendor/core` | npm scope 避免命名冲突，语义清晰 |
| core 依赖 | 零外部依赖 | 纯 TypeScript 逻辑，前后端都能用 |
| 构建工具 | 暂不引入 | 当前用 tsx 直接运行，够用 |
| 数据库文件 | 留在 `packages/server/` | 后端专属，不共享 |

---

### 第 60 课：为什么需要 Monorepo？

- 对比两种方案：复制代码 vs 共享包
- 讲解 npm workspaces 的原理（类比 Python 的 `pip install -e .`）
- 画出目标结构图，理解三个子包的职责边界
- **产出**：理解 monorepo 解决了什么问题

### 第 61 课：搭建 Monorepo 骨架

- 创建 `packages/core`、`packages/web`、`packages/server` 目录
- 每个子包写最小 `package.json`（`name` 用 `@splendor/xxx`）
- 根 `package.json` 加 `"workspaces": ["packages/*"]`
- `npm install` 验证软链接生效
- 在 `web` 里 `import { ... } from "@splendor/core"` 验证能引用
- **产出**：三个子包的空壳，能互相 import

### 第 62 课：拆分代码并跑通

- `src/game/*` → `packages/core/src/`
- `src/components/*`、`src/App.tsx`、`src/App.css`、`src/index.css`、`src/main.tsx` → `packages/web/src/`
- `server/index-express.ts` → `packages/server/src/index.ts`
- 修复所有 import 路径（`"./types"` → 相对路径或包名引用）
- 配置各自的 tsconfig
- `npm run dev` 前端能跑，`npm run server` 后端能跑
- **产出**：拆分后的项目功能与拆分前完全一致

---

# 阶段五·五：完善游戏规则（4 课时）

> 当前游戏规则有四个重要子系统尚未实现，导致游戏无法真正"玩起来"：
> - 标记拿走后版图不补充，后期只剩空格
> - 特权系统只定义了字段，没有使用逻辑
> - 卡牌能力（购买后触发额外效果）完全缺失
> - 皇室卡牌只有类型定义，没有数据和获取逻辑
>
> 在进入 AI 之前，先把规则补全，让游戏本身是完整的。

### 当前缺失的规则

| 子系统 | 当前状态 | 问题 |
|--------|----------|------|
| 标记回收/版图补充 | `bag` 字段为空数组，花费的标记凭空消失 | 版图标记越拿越少，后期全是空格，无法继续游戏 |
| 特权系统 | `privileges` 字段存在，对手获得特权已实现 | 缺少"使用特权"操作，缺少特权转移规则 |
| 卡牌能力 | 类型定义中没有能力字段 | 购买卡牌后没有触发额外效果 |
| 皇室卡牌 | `RoyalCard` 类型定义了，`availableRoyalCards` 始终为空 | 没有皇室卡牌数据，获取逻辑也不完整 |

### 设计决策

| 决策 | 选择 | 原因 |
|------|------|------|
| 卡牌能力表示 | `CardAbility` 枚举 | 五种能力互斥，枚举最清晰 |
| 袋子实现 | `TokenType[]` 数组 + 洗牌 | 简单，和现有 `shuffleDeck` 复用 |
| 皇室卡牌数据 | 写死在 `card-pool.ts` | 只有 4 张，不需要外部数据源 |
| 前端改动 | 每课同步更新 React 组件 | 规则改了 UI 要跟上 |

---

### 第 63 课：标记回收与版图补充（袋子系统）

- 标记的生命周期：版图 → 玩家手中 → 购买花费 → 袋子 → refill → 版图
- 修改 `handleBuyCard`：花费的标记放回 `bag`（而不是凭空消失）
- 修改 `handleTakeGold`：拿走的黄金放回 `bag`
- 实现 `refillBoard(board, bag)`：从袋子洗牌，按螺旋顺序填充空格
- 补充版图作为**可选行动**：玩家在强制行动前可选择执行，执行后对手获得 1 个特权
- 前端：添加"补充版图"按钮，版图空格被填充
- **产出**：标记循环流动，版图不会永久枯竭

### 第 64 课：特权系统

- 实现 `usePrivilege(state)`：玩家使用 1 个特权，从版图拿任意 1 个非黄金标记
- 实现特权转移规则：对手获得特权时，若版图上特权已耗尽，改为从对手处拿取
- 实现特权上限：最多 3 个，超过无事发生
- 前端：显示特权数，添加"使用特权"按钮
- **产出**：特权系统完整可用

### 第 65 课：卡牌能力结算

- 在 `Card` 类型中新增 `ability` 字段（`CardAbility | null`）
- 定义五种能力：额外回合、拿取特权、从对手拿标记、拿取对应颜色标记、复制奖励颜色
- 修改 `handleBuyCard`：购买后检查并结算卡牌能力
- 前端：显示卡牌能力图标，结算时给出提示
- **产出**：购买卡牌后触发额外效果

### 第 66 课：皇室卡牌

- 添加 4 张皇室卡牌数据到 `card-pool.ts`
- 修改 `checkRoyalCardEligibility`：检查王冠数门槛（3/6），返回新解锁的门槛列表
- 实现 `handleClaimRoyalCard`：玩家从可用皇室卡牌中任选一张
- 结算皇室卡牌的能力
- 前端：显示皇室卡牌区域和选择面板，玩家信息面板显示王冠门槛状态
- **产出**：皇室卡牌系统完整可用

---

# 阶段五·六：游戏逻辑重构（5 课时）

> 当前游戏逻辑的问题已经很明显了：
>
> - **`handleBuyCard` 一个函数干了 10 件事**——校验、折扣、购买、皇室卡牌、胜利检查、金字塔补牌、能力结算、切换玩家，还带两个提前返回分支
> - **每个操作返回结构不一样**——前端得为每个操作写不同的处理逻辑，`privilegeMode`、`goldMode`、`discardMode` 越堆越多
> - **没有测试**——改一个规则心里没底，不知道会不会破坏其他规则
> - **卡牌数据和代码混在一起**——改卡牌数据要改 TypeScript 代码
>
> 这一阶段的目标不是加新功能，而是**重构**：把游戏逻辑从"想到哪写到哪"变成"有条理、可测试、易扩展"。
>
> 核心思路两条线并行：
> 1. **数据层**：卡牌数据抽成 JSON，代码只负责逻辑
> 2. **逻辑层**：引入"行动队列"模式，每个操作返回后续待办行动列表，由统一执行器处理

### 第 67 课：卡牌数据抽成 JSON

- 在 `packages/core/data/` 下创建 `cards.json`，存放 67 张珠宝卡 + 4 张皇室卡数据
- 新增 `BonusColor` 类型（`GemColor | "any" | null`），处理万能奖励和无奖励卡牌
- 手写 `validateCardData` 函数校验 JSON 数据（类型、范围、完整性）
- 修改 `card-pool.ts` 改为读取 JSON 文件
- 修改 `purchase.ts`：`getPlayerBonuses` 返回 `{ bonuses, wildBonus }`，`getActualCost` 使用万能奖励抵扣
- 验证：编译通过，游戏功能不变
- **产出**：卡牌数据和代码分离，改卡牌数据只需要改 JSON

### 第 68 课：引入 Action 类型系统

- 定义 `Action` 联合类型，统一表示所有玩家操作：
  ```ts
  type Action =
    | { type: "take_tokens"; positions: [number, number][] }
    | { type: "buy_card"; cardId: number }
    | { type: "pass" }
    | { type: "use_privilege"; position: [number, number] }
    | { type: "take_gold"; position: [number, number]; cardId: number }
    | { type: "claim_royal_card"; royalCardId: number }
    | { type: "refill_board" }
    | { type: "discard_tokens"; discards: TokenType[] }
  ```
- 定义 `PendingAction` 类型，表示系统自动触发的后续行动（如能力结算、切换玩家）
- 所有现有的 `handleXxx` 函数改为接收 `Action` 参数
- **产出**：所有游戏操作有了统一的类型表示

### 第 69 课：实现行动队列（Action Queue）

- 实现 `executeAction(state, action) → { state, pendingActions: PendingAction[] }`
- 每个操作执行后返回后续待办行动列表。例如购买卡牌：
  ```
  handleBuyCard(state, action)
    → { state: 购买后的状态, pendingActions: [
        { type: "resolve_royal", ... },  // 如果有皇室卡牌门槛
        { type: "check_win", ... },       // 检查胜利
        { type: "resolve_ability", ... }, // 结算卡牌能力
        { type: "switch_player" },        // 切换玩家
      ]}
  ```
- 实现 `processPendingActions(state) → { state, pendingActions[] }`：递归处理待办行动
- 前端只需调用 `executeAction`，然后循环处理 `pendingActions` 直到列表为空
- **产出**：统一的行动执行器，`handleBuyCard` 不再需要自己处理"后续该做什么"

### 第 70 课：引入 vitest 写规则测试

- 安装 vitest，配置 `packages/core/vitest.config.ts`
- 创建规则拆解文件（`tests/rules/specs/*.md`），每个规则类别一个文件：
  - 规则细则（R-xxx-nn 编号）
  - 测试点（xxx-nn 编号）
- 编写测试辅助函数：`createTestState`、`setBoardToken`、`makeCard`、`makePlayer`
- 按规则拆解文件编写测试，覆盖所有测试点：

  ```
  tests/
    specs/
      take-tokens.md     # 拿取标记规则拆解（7 细则，8 测试点）
      buy-card.md        # 购买卡牌规则拆解（7 细则，9 测试点）
      privileges.md      # 特权系统规则拆解（4 细则，6 测试点）
      abilities.md       # 卡牌能力规则拆解（5 细则，6 测试点）
      royal-cards.md     # 皇室卡牌规则拆解（4 细则，4 测试点）
    take-tokens.test.ts  # 7 个测试
    buy-card.test.ts     # 9 个测试
    privileges.test.ts   # 6 个测试
    abilities.test.ts    # 6 个测试
    royal-cards.test.ts  # 4 个测试
  ```

- **产出**：5 个规则拆解文件 + 32 个测试，`npm run test` 一键验证

### 第 71 课：重构 handleBuyCard

- 用行动队列重写 `handleBuyCard`，拆成多个小函数：
  - `validatePurchase(state, action)` — 校验
  - `applyPurchase(state, action)` — 执行购买（扣标记、加卡牌）
  - `handlePyramidRefill(state)` — 金字塔补牌
  - `resolveRoyalEligibility(state)` — 检查皇室卡牌
  - `resolveAbility(state)` — 结算能力
  - `switchPlayer(state)` — 切换玩家
- `executeAction` 负责按顺序调用这些函数并生成 `pendingActions`
- 前端：去掉 `privilegeMode`、`goldMode`、`discardMode` 等状态，改为根据 `pendingActions` 渲染对应 UI
- **产出**：`handleBuyCard` 从 80 行降到每个小函数 10-15 行，前端模式状态消失

---

# 阶段五·七：UI 交互优化（4 课时）

> 游戏逻辑已通过测试覆盖，但 UI 交互层一直缺乏系统化验证。
> 当前问题是"打地鼠式修 UI"——想到一个改一个，没有测试保护，改 A 可能破坏 B。
> 这一阶段的目标：梳理问题 → 引入 UI 测试 → 重构状态管理 → 完善交互体验。

### 当前 UI 层的问题

| 问题 | 表现 | 根因 |
|------|------|------|
| 多模式标志互相打架 | `goldMode`、`discardMode`、`privilegeMode` 等 boolean 叠加，某些组合下 UI 表现异常 | 没有统一的状态机，多个 boolean 组合爆炸 |
| 改 UI 靠人肉验证 | 每次改完手动在浏览器点一遍，效率极低 | 没有组件测试 |
| 操作流程不直观 | 玩家不清楚当前该做什么、能做什么 | 缺少操作提示和状态引导 |
| 视觉信息密度高 | 卡牌、标记、皇室卡牌挤在一起，难以快速判断 | 布局和视觉层次需要优化 |

### 设计决策

| 决策 | 选择 | 原因 |
|------|------|------|
| UI 测试框架 | vitest + @testing-library/react | 和游戏逻辑测试统一，不需要额外配置 |
| 状态管理 | 单一 `uiPhase` 状态机 | 替代多个 boolean，消除组合爆炸 |
| 测试策略 | 先测交互逻辑，再测视觉 | 交互逻辑是 bug 高发区，视觉靠截图对比性价比低 |

---

### 第 72 课：梳理 UI 问题清单

- 从头到尾完整玩一局，记录所有不符合预期的地方
- 把问题分类：交互 bug / 流程不顺 / 视觉问题 / 缺失功能
- 按影响程度排优先级（P0 阻塞游戏 / P1 体验差 / P2 锦上添花）
- 产出问题清单文档，作为后续课程的 TODO
- **产出**：`docs/lesson-72-UI问题梳理/` 下的问题清单

### 第 73 课：实现调试工具

- 在游戏中添加调试面板，可以快速修改游戏状态
- 支持的操作：加减玩家分数/王冠/特权/标记、清空牌库、直接触发皇室卡牌
- 用 `localStorage` 记住调试模式开关，刷新不丢失
- **产出**：调试面板可用，后续测试不再需要正常玩一局

### 第 74 课：引入 UI 组件测试

- 安装 `@testing-library/react`、`jsdom`
- 配置 vitest 支持 React 组件测试
- 给 Board 组件写测试：点击空格不触发、选中/取消选中、多选上限
- 给 Pyramid 组件写测试：可购买高亮、点击触发回调
- 给 PlayerInfo 组件写测试：当前玩家高亮、保留卡牌显示
- **产出**：3 个组件的测试文件，`npm test` 覆盖 UI 交互逻辑

### 第 74 课：用状态机重构 App.tsx

- 把 `goldMode`、`discardMode`、`privilegeMode` 等多个 boolean 合并为单一 `uiPhase`
- 定义 `UIPhase` 类型：`"normal" | "gold_selecting" | "discarding" | "privilege_selecting" | "royal_claiming" | "gem_color_selecting"`
- 每个 phase 对应一组明确的 UI 渲染逻辑，互不冲突
- 写测试验证 phase 切换正确（进入/退出各 phase 时状态清理干净）
- **产出**：App.tsx 中不再有多个 boolean 模式标志

### 第 76 课：完善交互体验

- 根据第 72 课的问题清单，逐项修复 P0 和 P1 问题
- 添加操作提示：当前玩家该做什么（拿标记 / 买卡牌 / 使用特权等）
- 优化版图选中反馈：显示选中顺序、高亮可选的相邻格子
- 优化金字塔交互：买不起的卡牌灰显、购买确认提示
- 每修一个问题就跑 UI 测试，确保不引入回归
- **产出**：交互体验符合预期，测试全部通过

---

# 阶段六：AI 对手（4 课时）

> 游戏规则已完整，代码结构也清晰了，现在让计算机学会玩这个游戏。
>
> AI 的核心思路：**枚举所有合法操作 → 评估每个操作的好坏 → 选最好的**。从随机乱选开始，逐步加入策略。

### 第 77 课：随机 AI

- 利用已有的 `Action` 类型，实现 `getValidActions(state)`：枚举当前玩家的所有合法操作
- 实现 `randomAI(state)`：从合法操作中随机选一个
- 在终端测试：创建初始状态，连续调用 AI 看它能不能走完一局
- **产出**：`packages/core/src/ai.ts`，AI 能随机做出合法操作

### 第 78 课：贪心策略 AI

- 给每种操作打分（越高越好）：
  - 购买卡牌：基础分 = 卡牌声望点 × 10 + 王冠 × 5，能触发皇室卡牌额外加分
  - 拿取标记：根据当前想买的卡牌缺少什么标记来打分
  - 拿取黄金 + 保留：能锁定一张高分卡牌时加分
  - 跳过：0 分（只有无其他操作时才选）
- 实现 `greedyAI(state)`：枚举所有操作，选分数最高的
- 对比随机 AI：贪心 AI 胜率明显更高
- **产出**：`greedyAI` 函数，AI 有了"偏好"

### 第 79 课：Web 中集成 AI

- 前端加"人机对战"按钮，创建游戏时选择模式
- 新增 `POST /api/game/create` 和 `POST /api/game/action` 接口
- 服务器维护游戏状态，玩家操作后自动调用 AI 响应
- 前端显示 AI 的操作结果（拿了什么标记、买了什么卡牌）
- 游戏结束显示胜负
- **产出**：浏览器里可以和 AI 对战

### 第 80 课：进阶 AI 策略

- 向前看一步：模拟"我执行操作 A → 对手用贪心策略回应 → 评估此时我的局面"
- 实现 `lookAheadAI(state)`：对每个操作，模拟对手最佳回应后的局面，选对自己最有利的
- 对比三种 AI（随机 / 贪心 / 向前看）的胜率
- 讨论更高级的 AI 方向（Minimax、蒙特卡洛树搜索）作为延伸
- **产出**：AI 会"思考"对手的反应

---

# 阶段七：在线联机（6 课时）

### 第 81 课：从轮询开始
### 第 82 课：引入 WebSocket
### 第 83 课：房间系统
### 第 84 课：联机对战流程
### 第 85 课：匹配机制
### 第 86 课：联机测试与优化

---

# 阶段八：部署上线（2 课时）

### 第 87 课：部署到服务器
### 第 88 课：CI/CD 与监控

---

> 📝 **学习建议**
> - 每节课后，尝试不看代码自己复现一遍
> - 遇到不懂的概念，先记下来继续往下走，不要卡住
> - 每个阶段结束后，回顾该阶段学到了什么
> - 代码是你的，随时可以修改和探索
