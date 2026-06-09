# tsconfig 三文件：联系与区别

## 一句话总结

这三个文件是 **TypeScript 编译器的三套不同配置**，分别用于项目的三个不同部分。根目录的 `tsconfig.json` 像一个"调度中心"，把三个子配置串起来。

---

## 类比：同一个厨房，三本不同的菜谱

| 概念 | 类比 |
|------|------|
| `tsconfig.json`（根） | 厨房总控台，决定"哪道菜用哪本菜谱" |
| `tsconfig.app.json` | 中餐菜谱 — 做前端（React）代码 |
| `tsconfig.node.json` | 烘焙菜谱 — 做 Vite 配置文件 |
| `tsconfig.server.json` | 日料菜谱 — 做后端服务器代码 |

同一间厨房（同一个项目），但做不同的菜（前端/后端）需要不同的工具和规则。

---

## 逐文件对比

### `tsconfig.json`（根配置 — 调度中心）

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.server.json" }
  ]
}
```

- `"files": []`：根配置自己不处理任何文件
- `"references"`：指向三个子配置，告诉 TypeScript "去那边找各自的规则"
- 作用：当你运行 `tsc` 或 VS Code 打开项目时，TypeScript 会同时加载三个子配置

---

### `tsconfig.app.json`（前端 — React 代码）

```json
{
  "compilerOptions": {
    "lib": ["ES2023", "DOM"],     // ← 关键差异
    "types": ["vite/client"],      // ← 关键差异
    "jsx": "react-jsx"             // ← 独有
  },
  "include": ["src"]               // ← 只覆盖 src/ 目录
}
```

**三个独有的配置：**

| 配置 | 值 | 为什么？ |
|------|-----|---------|
| `lib` | `["ES2023", "DOM"]` | 前端代码运行在**浏览器**里，需要 DOM API（`document`、`window` 等） |
| `types` | `["vite/client"]` | 告诉 TS 有 Vite 特有的类型（如 `import.meta.env`） |
| `jsx` | `"react-jsx"` | 支持 JSX 语法（`<div>...</div>`），这是 React 组件的基础 |

---

### `tsconfig.node.json`（Vite 配置文件）

```json
{
  "compilerOptions": {
    "lib": ["ES2023"],             // ← 没有 DOM
    "types": ["node"],             // ← Node.js 类型
    // 没有 jsx                    // ← 不需要 JSX
  },
  "include": ["vite.config.ts"]    // ← 只覆盖这一个文件
}
```

**和 app 配置的差异：**

| 差异点 | app | node | 原因 |
|--------|-----|------|------|
| `lib` | `ES2023 + DOM` | 只有 `ES2023` | `vite.config.ts` 运行在 Node.js，没有浏览器环境 |
| `types` | `vite/client` | `node` | 需要 Node.js 内置模块的类型（`fs`、`path` 等） |
| `jsx` | `react-jsx` | 无 | 配置文件不写 JSX |

---

### `tsconfig.server.json`（后端服务器代码）

```json
{
  "compilerOptions": {
    "lib": ["ES2023"],             // ← 没有 DOM
    "types": ["node"],             // ← Node.js 类型
    // 没有 jsx                    // ← 不需要 JSX
  },
  "include": ["server"]            // ← 只覆盖 server/ 目录
}
```

**和 node 配置几乎一样**，唯一的区别是 `include` 覆盖的目录不同：
- `tsconfig.node.json` → 只覆盖 `vite.config.ts` 一个文件
- `tsconfig.server.json` → 覆盖整个 `server/` 目录

> 为什么不能把 `server/` 也加到 `tsconfig.node.json` 的 `include` 里？
>
> 技术上可以，但语义上不干净。`tsconfig.node.json` 是 Vite 脚手架生成的，它的职责就是管 `vite.config.ts`。把服务器代码混进去会让配置职责不清。**一个配置管一件事**，这是工程上的好习惯。

---

## 核心差异速查表

| | `tsconfig.app.json` | `tsconfig.node.json` | `tsconfig.server.json` |
|---|---|---|---|
| **管谁** | `src/`（React 前端） | `vite.config.ts` | `server/`（后端） |
| **运行环境** | 浏览器 | Node.js | Node.js |
| **需要 DOM 吗** | ✅ 需要 | ❌ 不需要 | ❌ 不需要 |
| **需要 JSX 吗** | ✅ 需要 | ❌ 不需要 | ❌ 不需要 |
| **类型来源** | `vite/client` | `node` | `node` |

---

## 为什么要拆成三个？

**核心原因**：浏览器和 Node.js 是两个完全不同的运行环境。

```ts
// ✅ 在 src/（浏览器）中可以写：
document.getElementById("app");   // DOM API 存在

// ❌ 在 server/（Node.js）中写上面这行会报错：
// "Cannot find name 'document'"
// 因为 Node.js 没有 document 对象
```

反过来：

```ts
// ✅ 在 server/（Node.js）中可以写：
import fs from "node:fs";   // 文件系统 API 存在

// ❌ 在 src/（浏览器）中写上面这行会报错：
// 浏览器出于安全考虑，不允许 JS 直接读写文件
```

如果只有一个 `tsconfig.json`，TypeScript 就不知道某段代码是跑在浏览器还是 Node.js，也就无法给出正确的类型提示和错误检查。

**拆成三个配置，本质上是告诉 TypeScript："这三块代码运行在不同的地方，请用不同的规则检查它们。"**

---

## 相同之处

三个配置中这些字段完全一样（都是从 Vite 脚手架继承的）：

```json
"target": "es2023",           // 编译到 ES2023 标准
"module": "esnext",           // 使用最新的模块语法
"moduleResolution": "bundler", // 用打包器的模块解析方式
"skipLibCheck": true,         // 跳过 .d.ts 文件的类型检查（加速）
"noUnusedLocals": true,       // 未使用的局部变量报错
"noUnusedParameters": true,   // 未使用的参数报错
```

这些是项目的通用规则，无论前端后端都要遵守。
