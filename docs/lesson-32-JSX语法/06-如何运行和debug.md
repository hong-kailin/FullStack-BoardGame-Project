# 06. 如何运行和 debug

## 1. 为什么不能双击打开？

你现在双击 `index.html` 用浏览器打开，看到的是一片空白。原因是现在的项目**必须通过 Vite 开发服务器运行**。

三个原因：

1. **浏览器不认识 `.tsx`** — `index.html` 中引用了 `/src/main.tsx`，但浏览器只认识 `.js`，不认识 TypeScript 和 JSX
2. **`import` 裸模块** — `main.tsx` 里有 `import { useState } from 'react'`，这种没有路径的"裸模块名"浏览器不认识，只有 Vite 这样的构建工具能处理
3. **`file://` 限制** — `type="module"` 的 `<script>` 在 `file://` 协议下会被浏览器的 CORS 策略阻止

**类比**：之前的原生 HTML/JS 页面是"做好的菜"，直接双击就能吃。现在的 React + TypeScript 项目是"菜谱和食材"，需要 Vite 这个"厨师"做好才能吃。

## 2. 正确打开方式

在终端运行：

```bash
npm run dev
```

然后在浏览器访问 `http://localhost:5173`。Vite 开发服务器会在背后实时编译 TSX、处理模块导入、提供热更新。

## 3. 如何 debug

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

## 4. 一句话总结

**必须 `npm run dev` 启动 Vite 服务器才能访问项目，debug 用 F12 或 VS Code 的 Chrome debug。**
