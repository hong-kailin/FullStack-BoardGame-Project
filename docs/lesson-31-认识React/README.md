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

## 3. 用 Vite 创建 React + TypeScript 项目

Vite 是一个前端构建工具，类似 esbuild，但专门为 React/Vue 等框架设计。

在项目根目录运行：

```bash
npm create vite@latest splendor-react -- --template react-ts
```

这会创建一个名为 `splendor-react` 的新目录，使用 `react-ts` 模板（React + TypeScript）。

---

## 4. 项目结构

创建完成后，`splendor-react/` 目录结构如下：

```
splendor-react/
├── index.html          # 入口 HTML
├── package.json        # 依赖配置
├── tsconfig.json       # TypeScript 配置
├── vite.config.ts      # Vite 配置
├── src/
│   ├── main.tsx        # 入口文件
│   ├── App.tsx         # 根组件
│   ├── App.css         # 根组件样式
│   └── index.css       # 全局样式
└── public/
```

### 关键文件说明

| 文件 | 作用 |
|------|------|
| `src/main.tsx` | 入口文件，把 App 组件挂载到页面上 |
| `src/App.tsx` | 根组件，所有其他组件都放在这里 |
| `*.tsx` | 扩展名，表示这个文件包含 JSX 语法 |

---

## 5. 启动项目

```bash
cd splendor-react
npm install
npm run dev
```

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
| **Vite** | 创建 React 项目的工具 |
| **TSX** | TypeScript + JSX，React 组件的文件格式 |
