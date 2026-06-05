# splendor-react 项目文件结构详解

## 根目录文件

### `package.json`
项目的依赖配置文件。记录了项目名称、版本、脚本命令、依赖包等信息。

```json
{
  "name": "splendor-react",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.6",
    "react-dom": "^19.2.6"
  },
  "devDependencies": {
    "typescript": "~6.0.2",
    "vite": "^8.0.12",
    "@vitejs/plugin-react": "^6.0.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3"
  }
}
```

| 字段 | 含义 |
|------|------|
| `"type": "module"` | 项目使用 ES Module 规范（import/export） |
| `"dependencies"` | 运行时依赖：`react` 和 `react-dom` |
| `"devDependencies"` | 开发依赖：TypeScript 编译器、Vite 构建工具、React 类型定义 |

**三个脚本命令：**

| 命令 | 作用 |
|------|------|
| `npm run dev` | 启动开发服务器，实时预览 |
| `npm run build` | 先 TypeScript 编译检查，再用 Vite 打包成生产文件 |
| `npm run preview` | 本地预览打包后的生产版本 |

---

### `index.html`
整个项目的入口 HTML 文件。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Splendor Duel</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

关键点：
- `<div id="root">` 是 React 挂载点，所有 React 内容都会渲染到这个 div 里
- `<script type="module" src="/src/main.tsx">` 是入口 JS 文件

**对比之前的 HTML 文件**：之前我们在 HTML 里直接写 `<script>` 标签引入 JS，现在 HTML 只负责提供一个空壳，所有内容由 React 动态生成。

---

### `vite.config.ts`
Vite 构建工具的配置文件。

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

`@vitejs/plugin-react` 是 Vite 的 React 插件，让 Vite 能处理 JSX/TSX 语法。

**类比**：就像之前我们在 `package.json` 中配置 `build:web` 用 esbuild 编译 TS，Vite 的配置文件告诉 Vite 要用哪些插件来处理项目。

---

### `tsconfig.json`
TypeScript 的配置文件。这个文件本身不直接配置编译选项，而是引用其他配置文件：

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

`references` 把配置拆成了两份：
- `tsconfig.app.json` — 给 `src/` 下的应用代码用
- `tsconfig.node.json` — 给 `vite.config.ts` 这种 Node.js 环境下的配置文件用

---

### `tsconfig.app.json`
应用代码的 TypeScript 配置。

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true
  },
  "include": ["src"]
}
```

| 配置 | 含义 |
|------|------|
| `"jsx": "react-jsx"` | 支持 JSX 语法，这是 React 特有的 |
| `"module": "ESNext"` | 使用最新的 ES Module 标准 |
| `"moduleResolution": "bundler"` | 用 Vite 这类打包工具的模块解析规则 |
| `"strict": true` | 开启严格类型检查 |

**`"jsx": "react-jsx"` 是 React 项目特有的配置**，告诉 TypeScript "这个文件里有 JSX 语法，你要能识别它"。

---

### `tsconfig.node.json`
Node.js 环境的 TypeScript 配置，给 `vite.config.ts` 用。

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler"
  },
  "include": ["vite.config.ts"]
}
```

---

### `eslint.config.js`
代码规范检查工具的配置。ESLint 会检查代码风格和潜在错误。初学者可以先不管它。

---

## src/ 目录

### `src/main.tsx`
应用的入口文件。

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

逐行解释：

| 代码 | 作用 |
|------|------|
| `createRoot(document.getElementById('root')!)` | 找到 HTML 中的 `<div id="root">`，创建 React 根节点 |
| `.render(<App />)` | 把 App 组件渲染到这个根节点中 |
| `<StrictMode>` | React 的严格模式，开发时帮你检查潜在问题 |

**对比之前的原生 JS**：之前我们在 HTML 中写 `<script>`，然后手动 `createElement`、`appendChild`。现在 React 帮我们做了这些事。

---

### `src/App.tsx`
根组件，所有其他组件都从这里开始。

```tsx
import './App.css'

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

- `App` 是一个**函数组件**，它返回一段 JSX
- `export default App` 让其他文件可以 `import App from './App.tsx'`

---

### `src/App.css`
App 组件的样式文件。

### `src/index.css`
全局样式文件，在 `main.tsx` 中被导入，影响整个页面。

### `src/vite-env.d.ts`
Vite 的类型声明文件，让 TypeScript 能识别 Vite 特有的功能（如 `import.meta.env`）。一般不需要修改。

### `src/assets/`
存放静态资源文件（图片、图标等）。Vite 模板默认包含 `react.svg`、`vite.svg` 和 `hero.png`，在 `App.tsx` 中被引用展示。

---

## 总结

| 文件 | 作用 |
|------|------|
| `index.html` | 入口 HTML，提供挂载点 `<div id="root">` |
| `package.json` | 依赖和脚本配置 |
| `vite.config.ts` | Vite 构建工具配置 |
| `tsconfig.json` | TypeScript 配置入口，引用其他配置 |
| `tsconfig.app.json` | 应用代码的 TS 配置（含 JSX 支持） |
| `tsconfig.node.json` | Node 环境文件的 TS 配置 |
| `src/main.tsx` | React 入口，挂载 App 组件 |
| `src/App.tsx` | 根组件 |
| `src/App.css` | 根组件样式 |
| `src/index.css` | 全局样式 |
| `src/vite-env.d.ts` | Vite 类型声明 |
