# 第 31 课：认识 React

## 本节课目标

理解 React 是什么，用 Vite 创建第一个 React + TypeScript 项目。

---

## 1. 为什么需要 React？

回顾第 24 课和第 29 课的代码，你会发现一个问题：每次游戏状态变化，都要调用 `render()` 重新生成整个页面的 DOM。这种方式：

- **效率低**：每次重新生成所有元素，即使只改了一个数字
- **代码乱**：HTML、CSS、JS 混在一起，`render()` 函数越来越长
- **难维护**：想改一个按钮的样式，要在一大段 JS 里找到对应的 `createElement`

React 解决这些问题的思路是：**你只管描述页面长什么样，React 负责高效地更新 DOM**。

---

## 2. React 的核心思想

### 声明式 vs 命令式

| 方式 | 做法 | 类比 |
|------|------|------|
| **命令式**（原生 JS） | "先创建 div，再创建 h1，设置文字，添加到 body" | 你告诉厨师每一步怎么做 |
| **声明式**（React） | "我要一个标题为'璀璨宝石对决'的页面" | 你告诉厨师你要吃什么 |

原生 JS 是命令式——你一步步告诉浏览器"创建元素、设置属性、添加子元素"。React 是声明式——你只需要描述"页面长这样"，React 自己会去创建和更新 DOM。

### 组件化

React 把页面拆成一个个**组件**。每个组件是一个独立的、可复用的代码块：

```
<App>
  <Board />      ← 版图组件
  <Pyramid />    ← 金字塔组件
  <PlayerCard /> ← 玩家信息组件
</App>
```

每个组件只关心自己的逻辑，互不干扰。

---

## 3. 先创建一个示例项目，再把它整理回当前根目录

这一课我们采用两步走的方式：

1. **先在当前仓库里创建一个 `splendor-react/` 示例项目**，观察 Vite 帮我们生成了哪些文件
2. **再把这个示例项目的结构迁移回当前仓库根目录**，让主工程路径保持不变

这样做的好处是：你既能看清楚 Vite 默认生成了什么，又不会把以后的主工作路径变成 `splendor-react/`。

### 第一步：先创建一个临时示例项目

在项目根目录运行：

```bash
npm create vite@latest splendor-react -- --template react-ts
```

这行命令的作用是：**用 Vite 快速生成一个名为 `splendor-react` 的 React + TypeScript 项目骨架。**

把它拆开看：

| 部分 | 作用 |
|------|------|
| `npm create` | 用 `npm` 运行一个项目初始化工具 |
| `vite@latest` | 使用最新版 Vite 脚手架 |
| `splendor-react` | 新项目的目录名 |
| `--` | 把后面的参数传给 Vite，而不是传给 `npm` 自己 |
| `--template react-ts` | 指定模板为 React + TypeScript |

你可以把整条命令理解成一句话：

> 请 `npm` 临时运行最新版 Vite 脚手架，在当前目录创建一个叫 `splendor-react` 的新项目，并使用 `React + TypeScript` 模板初始化。

如果类比到你更熟悉的后端或 C++ 开发，这有点像：

- 用一个脚本自动帮你创建好项目目录
- 自动生成入口文件、配置文件、依赖声明
- 省掉你手动新建 `src/`、`package.json`、`tsconfig.json` 的过程

### 这里的"临时运行"是什么意思？

很多初学者看到这里会有一个自然的问题：**既然用了 Vite，为什么还没有先执行 `npm install vite`？**

关键在于，这条命令做的是**创建项目**，不是**安装项目依赖**。

`npm create vite@latest ...` 的过程更接近下面这样：

1. `npm` 先拿到 `create-vite` 这个脚手架工具
2. 立即运行它
3. 让它帮你生成项目文件
4. 运行结束后，不会把它当作当前项目依赖写进 `package.json`
5. 也不会像全局安装那样，变成你电脑里长期可直接使用的全局命令

所以这里说的"临时运行"，意思是：**把脚手架工具取来用一次，用来生成项目骨架，而不是正式安装到项目里。**

不过，更严谨地说，它也不一定是"用完就彻底删除"。因为 `npm` 往往会把下载过的包放进自己的缓存里，方便下次运行得更快。所以它更像是：

- 不安装到当前项目里
- 不安装成全局命令
- 可能会缓存到本机，供下次复用

### 第二步：再把示例项目整理回当前根目录

虽然 `splendor-react/` 这个示例项目很适合观察模板结构，但它不适合作为后续课程的长期工作目录。

原因很简单：这个仓库本身就是教学主工程。如果以后 React 开发都要先 `cd splendor-react`，路径会来回切换，学习时容易混乱。

所以这节课更推荐的最终形态是：**保持当前仓库根目录不变，把旧代码归档到 `old/`，然后把刚才生成的 React 项目结构搬回根目录。**

这样以后你始终在同一个路径下工作：

```bash
E:\FullStack-BoardGame-Project
```

后续命令也会统一很多：

```bash
npm install
npm run dev
```

### 具体可以怎么整理？

可以按下面的思路手动操作：

1. 先保留 `splendor-react/`，观察它生成的文件结构
2. 把当前根目录旧工程相关文件移动到 `old/`
3. 再把 `splendor-react/` 里的新工程文件挪到仓库根目录
4. 确认根目录已经变成 React 项目后，删除 `splendor-react/` 这个临时示例目录

通常会移动到 `old/` 的旧文件包括：

- 旧的 `package.json`
- 旧的 `package-lock.json`
- 旧的 `tsconfig.json`
- 旧的 `src/`
- 旧的 `web/`

然后把 `splendor-react/` 中这些新文件放到根目录：

- `package.json`
- `package-lock.json`（如果你已经安装过依赖）
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `eslint.config.js`
- `index.html`
- `src/`
- `public/`
- `README.md`（Vite 自带的说明文件，可以删除）

### 为什么不直接在根目录执行 `npm create vite@latest .`？

因为当前仓库本来就不是空目录，已经有自己的：

- `package.json`
- `tsconfig.json`
- `src/`
- 其他教学资料和代码

如果直接在根目录生成，脚手架文件很容易和已有文件冲突。对教学项目来说，这种"覆盖式初始化"不够稳，也不利于你理解发生了什么。

所以我们才故意多绕一步：**先生成一个示例项目来观察，再把结构迁回根目录。** 这样过程更清晰，也更安全。

### Vite 在这里到底扮演什么角色？

Vite 不只是"创建项目的脚手架"，它更像是一个**前端开发环境管理器 + 构建工具**。它主要帮我们做四件事：

- **启动开发服务器**：让你在浏览器里访问项目
- **热更新**（HMR）：改完代码后，页面几乎立刻更新，不用手动刷新
- **处理模块依赖**：把 `import` 的各种文件组织起来，让浏览器能正确加载
- **打包生产版本**：开发完成后，把代码构建成适合上线部署的静态文件

可以把它类比成 C++ 里的"编译器 + 构建系统 + 本地运行环境"的组合，只不过它服务的是前端项目。

### Vite 到底解决了什么问题？

在原生前端项目里，浏览器只能直接理解 HTML、CSS、JS。可一旦我们开始写 React + TypeScript，就会遇到几个问题：

- 浏览器不直接认识 `tsx` 这种写法
- 一个页面会拆成很多模块文件，需要自动处理 `import` 关系
- 修改代码后，如果每次都整页重新加载，开发体验会很差
- 上线时还希望把代码压缩、拆包、优化加载速度

Vite 就是把这些事情统一接管起来。你写的是更适合开发的代码，它负责把这些代码变成浏览器能高效运行的形式。

### Vite 和 esbuild 是什么关系？

这里容易混淆：**Vite 和 esbuild 不是同一层东西**。

| 工具 | 更像什么 | 主要职责 |
|------|----------|----------|
| **esbuild** | 一个超快的底层编译器/打包器 | 把 TS/JS 很快地转换、打包 |
| **Vite** | 一个完整的前端开发工具链 | 开发服务器、热更新、依赖处理、生产构建 |

也就是说，esbuild 更像一个"发动机"，而 Vite 更像一辆完整的车。

很多时候，**Vite 内部会用到 esbuild** 来做一些速度要求很高的事情，比如：

- 依赖预构建
- TypeScript / JSX 的快速转换
- 开发阶段的快速模块处理

但 Vite 自己还额外提供了：

- 面向 React/Vue 的开发服务器
- 更友好的 HMR 热更新体验
- 插件系统
- 生产环境构建流程

所以说"Vite 类似 esbuild"不太准确，更准确的说法是：**Vite 是更上层的工具，内部会借助 esbuild 的速度优势。**

---

## 4. 项目结构

创建完成后，`splendor-react/` 目录结构如下：

```
splendor-react/
├── index.html              # 入口 HTML
├── package.json            # 依赖配置
├── tsconfig.json           # TypeScript 配置入口
├── tsconfig.app.json       # 应用代码的 TS 配置
├── tsconfig.node.json      # Node 环境文件的 TS 配置
├── vite.config.ts          # Vite 配置
├── eslint.config.js        # ESLint 代码规范配置
├── public/
│   └── favicon.svg         # 浏览器标签栏图标
├── src/
│   ├── main.tsx            # 入口文件
│   ├── App.tsx             # 根组件
│   ├── App.css             # 根组件样式
│   ├── index.css           # 全局样式
│   └── assets/             # 静态资源（图片、图标）
│       ├── hero.png
│       ├── react.svg
│       └── vite.svg
└── README.md               # Vite 自带的说明文件
```

### 关键文件说明

| 文件 | 作用 |
|------|------|
| `src/main.tsx` | 入口文件，把 App 组件挂载到页面上 |
| `src/App.tsx` | 根组件，所有其他组件都放在这里 |
| `*.tsx` | 扩展名，表示这个文件包含 JSX 语法 |

---

## 5. 启动项目

---

## 5. 启动项目

```bash
npm install
npm run dev
```

这里说的是**整理完成后的最终状态**：根目录本身就是 React 项目，所以不再需要进入 `splendor-react/` 子目录。

- `npm install`：根据新的 `package.json` 下载 React、Vite、TypeScript 等依赖
- `npm run dev`：启动 Vite 开发服务器

`npm run dev` 会启动一个开发服务器，默认在 `http://localhost:5173`。修改代码后页面会自动刷新。

---

## 6. 第一个组件

打开 `src/App.tsx`，改成：

```tsx
function App() {
  return (
    <div>
      <h1>璀璨宝石对决</h1>
      <p>欢迎来到 React 版！</p>
    </div>
  );
}

export default App;
```

保存后浏览器会自动更新，显示"璀璨宝石对决"标题。

---

## 7. 你学到了什么

| 概念 | 说明 |
|------|------|
| **声明式** | 描述"要什么"，而不是"怎么做" |
| **组件** | 页面上一个独立的、可复用的代码块 |
| **Vite** | 前端开发服务器 + 构建工具，不只是脚手架 |
| **TSX** | TypeScript + JSX，React 组件的文件格式 |
