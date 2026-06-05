# 第 32 课：JSX 语法

## 本节课目标

理解 JSX 是什么，看懂当前 `src/App.tsx` 中的代码。

---

## 1. JSX 是什么？

JSX 是 JavaScript 的语法扩展，让你在 JS 文件中写类似 HTML 的标签。

```tsx
const element = <h1>你好</h1>;
```

这不是 HTML，也不是字符串——它就是 JavaScript。上面这行代码等价于：

```javascript
const element = React.createElement("h1", null, "你好");
```

JSX 只是 `React.createElement` 的**语法糖**，写起来更直观。

---

## 2. 打开 `src/App.tsx`，逐行看

```tsx
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
```

### 第 1 行：`import { useState } from 'react'`

从 React 库中导入 `useState` 这个函数。`useState` 是 React 的"状态钩子"，用来让组件记住数据。

**类比**：就像 Python 的 `from math import sqrt`——从 math 模块中导入 sqrt 函数。

### 第 2-4 行：导入图片

```tsx
import reactLogo from './assets/react.svg'
```

Vite 允许你直接 `import` 图片文件。`reactLogo` 是一个变量，它的值是图片的 URL 路径（比如 `/assets/react.svg`）。

### 第 5 行：导入样式

```tsx
import './App.css'
```

导入 CSS 文件。Vite 会自动处理，让样式生效。

---

## 3. 组件函数

```tsx
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* ... JSX 内容 ... */}
    </>
  )
}

export default App
```

### `function App()`

这是一个**函数组件**。它返回一段 JSX，描述页面长什么样。

### `const [count, setCount] = useState(0)`

这是 React 的**状态管理**。`useState(0)` 创建了一个状态变量 `count`，初始值为 `0`。`setCount` 是一个函数，用来修改 `count` 的值。

- `count`：当前值（读）
- `setCount`：修改值的函数（写）

**类比**：就像 `let count = 0` 加了一个 `setCount` 函数，调用 `setCount(新值)` 时，React 会自动重新渲染组件。

### `return (...)`

组件返回的 JSX 就是页面要显示的内容。

### `<>...</>`

这是 React 的**Fragment（片段）**。因为一个组件只能返回一个根元素，但你想返回多个元素时，用 `<>` 把它们包起来，不会在 DOM 中产生多余的 div。

### `export default App`

把 App 组件导出，让 `main.tsx` 可以 `import App from './App.tsx'`。

---

## 4. JSX 中的 HTML

```tsx
<section id="center">
  <div className="hero">
    <img src={heroImg} className="base" width="170" height="179" alt="" />
  </div>
  <div>
    <h1>Get started</h1>
    <p>Edit <code>src/App.tsx</code> and save to test <code>HMR</code></p>
  </div>
</section>
```

### `className` 而不是 `class`

在 HTML 中，设置 CSS 类用 `class`。但在 JSX 中，要用 `className`：

```html
<!-- HTML -->
<div class="hero">

<!-- JSX -->
<div className="hero">
```

因为 `class` 是 JavaScript 的保留关键字（定义类用的），所以 React 改用 `className`。

### `{}` 嵌入 JavaScript 表达式

```tsx
<img src={heroImg} />
```

花括号 `{}` 表示"这里写 JavaScript 表达式"。`heroImg` 是一个变量，它的值是图片路径。如果不加花括号，`src="heroImg"` 会被当作字符串处理。

### 自闭合标签

```tsx
<img src={heroImg} className="base" />
```

没有子元素的标签可以自闭合，和 HTML5 一样。

---

## 5. 事件处理

```tsx
<button
  type="button"
  className="counter"
  onClick={() => setCount((count) => count + 1)}
>
  Count is {count}
</button>
```

### `onClick` 而不是 `onclick`

在 HTML 中，点击事件用 `onclick`（全小写）。在 JSX 中，用 `onClick`（驼峰命名）。

类似的还有：`onChange`、`onSubmit`、`onMouseEnter` 等。

### `{}` 里面是一个箭头函数

```tsx
onClick={() => setCount((count) => count + 1)}
```

`onClick` 的值必须是一个函数。这里用箭头函数 `() => ...` 包了一层，点击时才执行 `setCount`。

### `{count}` 显示变量值

```tsx
Count is {count}
```

`{count}` 会把 count 的当前值显示在页面上。每次点击按钮，`setCount` 修改 count，React 自动重新渲染，页面上的数字就会更新。

---

## 6. 从 `main.tsx` 看组件如何挂载

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### `document.getElementById('root')!`

找到 `index.html` 中的 `<div id="root">`。`!` 是 TypeScript 的非空断言，告诉 TS"这个元素一定存在，不会是 null"。

### `createRoot(...).render(...)`

创建 React 根节点，把 `<App />` 组件渲染到 `#root` 中。

### `<StrictMode>`

React 的严格模式。开发时，它会帮你检查组件中的潜在问题（比如副作用、过时的 API）。不影响生产环境。

### `<App />`

使用 App 组件。`<App />` 等价于 `<App></App>`，因为 App 没有子元素，所以用自闭合写法。

---

## 7. 从 `index.html` 看入口

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>splendor-react</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `<div id="root">`

React 的挂载点。所有 React 内容都会渲染到这个 div 里面。

### `<script type="module" src="/src/main.tsx">`

注意这里引用的是 `.tsx` 文件，不是 `.js`。Vite 开发服务器会自动处理 TypeScript 的编译，所以可以直接写源文件路径。

### 为什么双击 `index.html` 打开是空白？

你现在双击 `index.html` 用浏览器打开，看到的是一片空白。原因是现在的项目**必须通过 Vite 开发服务器运行**，不能像之前那样直接双击打开。

三个原因：

1. **浏览器不认识 `.tsx`** — `index.html` 中引用了 `/src/main.tsx`，但浏览器只认识 `.js`，不认识 TypeScript 和 JSX
2. **`import` 裸模块** — `main.tsx` 里有 `import { useState } from 'react'`，这种没有路径的"裸模块名"浏览器不认识，只有 Vite 这样的构建工具能处理
3. **`file://` 限制** — `type="module"` 的 `<script>` 在 `file://` 协议下会被浏览器的 CORS 策略阻止

**正确打开方式**：在终端运行：

```bash
npm run dev
```

然后在浏览器访问 `http://localhost:5173`。Vite 开发服务器会在背后实时编译 TSX、处理模块导入、提供热更新。

**类比**：之前的原生 HTML/JS 页面是"做好的菜"，直接双击就能吃。现在的 React + TypeScript 项目是"菜谱和食材"，需要 Vite 这个"厨师"做好才能吃。`npm run dev` 就是让厨师开始工作。

---

## 8. 如何 debug React 项目

### 方式一：浏览器 F12（最简单）

`npm run dev` 启动后，在浏览器按 F12 → Sources 标签 → `src/App.tsx` 打断点。和之前 debug HTML 文件一样。

### 方式二：VS Code 启动 Chrome debug

在 VS Code 中按 `F5`，选择 "Debug React (Vite)"。VS Code 会自动打开一个 Chrome 窗口并 attach 调试器。

但需要注意：**必须先启动 Vite 开发服务器，再按 F5**。

```bash
# 终端 1：启动 Vite
npm run dev

# 然后按 F5 启动 Chrome debug
```

### 方式三：`console.log` 大法

在不确定的地方加一行 `console.log(变量名)`，然后在浏览器 F12 的控制台看输出。这是最常用的调试方式。

---

## 9. 你学到了什么

| 概念 | 说明 |
|------|------|
| **JSX** | 在 JS 中写 HTML 标签，是 `createElement` 的语法糖 |
| **`{}`** | 在 JSX 中嵌入 JavaScript 表达式 |
| **`className`** | JSX 中代替 HTML 的 `class` |
| **`onClick`** | JSX 中代替 HTML 的 `onclick`（驼峰命名） |
| **`useState`** | 让组件记住数据，数据变了自动重新渲染 |
| **`<>...</>`** | Fragment，包裹多个元素但不产生多余 DOM |
