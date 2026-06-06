# 第 35 课：第一个 React 组件 — Board（静态渲染）

## 学习目标

- 创建第一个 React 组件
- 理解 props 如何传递数据
- 用 JSX 渲染 5×5 版图

## 本课要做的事

1. 创建 `src/components/Board.tsx` — 版图组件
2. 修改 `App.tsx` — 调用 `createInitialState()` 获取数据，传给 Board
3. 在浏览器中看到版图

## 什么是"组件"？

在 React 中，组件就是一个返回 JSX 的函数：

```typescript
function Board(props) {
  return <div>...</div>;
}
```

类比：

- Python 中的函数：接收参数，返回数据
- React 组件：接收 props，返回 JSX（要渲染的界面）

## 第一步：创建 Board 组件

创建 `src/components/Board.tsx`：

```typescript
import type { TokenType } from "../game/types";

interface BoardProps {
  boardTokens: (TokenType | null)[][];
}

const TOKEN_LABELS: Record<string, string> = {
  red: "🔴", blue: "🔵", green: "🟢",
  white: "⚪", black: "⚫",
  pearl: "🦪", gold: "🟡",
};

export default function Board({ boardTokens }: BoardProps) {
  return (
    <div className="board">
      <h3>版图</h3>
      <div className="board-grid">
        {boardTokens.map((row, r) =>
          row.map((token, c) => (
            <div
              key={`${r}-${c}`}
              className={`board-cell ${token ? "has-token" : "empty"}`}
            >
              {token ? (
                <span>{TOKEN_LABELS[token]}</span>
              ) : (
                <span>·</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

### 逐行解读

**第 1 行**：`import type { TokenType }`

`TokenType` 是类型，不是运行时值。所以用 `import type`，编译后这一行会被删掉。

如果写成 `import { TokenType }`，Vite 会尝试生成运行时导入，但 `types.ts` 只有类型，编译后变成 `export {};`，就会报错"没有导出 TokenType"。

**第 3-6 行**：`interface BoardProps`

定义了组件接收的参数。这里只有一个参数：`boardTokens`。

`(TokenType | null)[][]` 表示"一个二维数组，每个元素要么是 TokenType，要么是 null"。

- 有标记的格子 → TokenType 值
- 空格子 → null

**第 8-11 行**：`TOKEN_LABELS`

一个查找表，把标记类型映射成 emoji 符号。

- red → 🔴（红宝石）
- blue → 🔵（蓝宝石）
- green → 🟢（绿宝石）
- white → ⚪（白宝石）
- black → ⚫（黑宝石）
- pearl → 🦪（珍珠）
- gold → 🟡（黄金）

**第 13 行**：`export default function Board({ boardTokens }: BoardProps)`

- `Board` 是组件名（习惯大写开头）
- `{ boardTokens }` 是解构赋值
- `BoardProps` 是 TypeScript 类型注解

### 深入理解：解构赋值

`{ boardTokens }` 是 JS/TS 中一个非常重要的概念——**解构赋值**（destructuring assignment）。

#### 没有解构的情况

先看如果不解构，代码怎么写：

```typescript
function Board(props: BoardProps) {
  // props 是一个对象：{ boardTokens: 版图数据 }
  const boardTokens = props.boardTokens;  // 手动取出 boardTokens
  // ...
}
```

这里 `props` 是一个对象：

```text
props = {
  boardTokens: [ [null, "red", ...], [...] ]
}
```

要拿到里面的 `boardTokens`，传统写法是 `props.boardTokens`。

#### 使用解构

```typescript
function Board({ boardTokens }: BoardProps) {
  // 直接拿到了 boardTokens，不需要 props.xxx
  // ...
}
```

**解构的作用**：把对象（或数组）中的值"拆开"，直接赋值给变量。

#### 为什么 React 组件常用解构？

因为组件通常接收多个 props：

```typescript
// 不解构，每次都要写 props.
function Player(props) {
  return <div>{props.name} - {props.score}分</div>;
}

// 解构，直接写变量名
function Player({ name, score }: { name: string; score: number }) {
  return <div>{name} - {score}分</div>;
}
```

解构让代码更简洁、更易读。这是 React 社区的标准写法。

#### 更完整的 TS 例子：带两个属性的 interface

```typescript
// 定义一个接口，有两个属性
interface UserInfo {
  username: string;
  level: number;
}

// 不解构
function showUser(props: UserInfo) {
  console.log(props.username);
  console.log(props.level);
}

// 解构
function showUser({ username, level }: UserInfo) {
  console.log(username);
  console.log(level);
}

// 调用
showUser({ username: "Alice", level: 10 });
```

两种写法效果完全一样。解构版的优势是：

- 不用每次写 `props.`
- 一眼就能看出函数用了 props 里的哪些字段
- 字段越多优势越明显

#### 回到我们的代码

```typescript
export default function Board({ boardTokens }: BoardProps) {
```

等价于：

```typescript
export default function Board(props: BoardProps) {
  const boardTokens = props.boardTokens;
```

只不过省去了中间变量 `props`，直接在参数位置把 `boardTokens` 解构出来。

**第 15-42 行**：JSX 渲染

```jsx
{boardTokens.map((row, r) =>
  row.map((token, c) => (
    <div key={`${r}-${c}`}>
      {token ? <span>emoji</span> : <span>·</span>}
    </div>
  ))
)}
```

这段代码乍一看很复杂，我们拆成三层来理解。

### 第一层：理解 boardTokens 的数据结构

先弄清楚 `boardTokens` 是什么：

```typescript
boardTokens = [
  [null,  null,  null,  null,  "red"    ],  // 第 0 行
  [null,  null,  null,  "blue", "green"  ],  // 第 1 行
  [null,  "red", "red", "blue", null     ],  // 第 2 行
  [null,  null,  null,  null,  null     ],  // 第 3 行
  [null,  null,  null,  null,  null     ],  // 第 4 行
];
```

它是一个**二维数组**：

- 外层数组有 5 个元素（5 行）
- 内层数组也有 5 个元素（5 列）
- 每个格子是一个 `TokenType` 值（如 `"red"`）或 `null`（空格子）

### 第二层：`.map()` 是什么

`.map()` 是 JS 数组的方法。它遍历数组的每个元素，返回一个新数组。

```typescript
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);
// doubled = [2, 4, 6]
```

`.map()` 的回调函数接收两个参数：

```typescript
array.map((当前元素, 当前索引) => {
  return 新值;
});
```

例如：

```typescript
const fruits = ["苹果", "香蕉", "橘子"];
fruits.map((fruit, index) => {
  console.log(`第 ${index} 个是 ${fruit}`);
  return fruit;
});
// 输出：
// 第 0 个是 苹果
// 第 1 个是 香蕉
// 第 2 个是 橘子
```

在 React 中，`.map()` 返回的数组里放 JSX 元素时，React 会自动把它们渲染到页面上。

### 第三层：拆解我们的代码

```jsx
boardTokens.map((row, r) =>
```

遍历外层数组（5 行）。每次拿到一行数据（`row`）和行号（`r`）。

- 第 0 次：`row = [null, null, null, null, "red"]`, `r = 0`
- 第 1 次：`row = [null, null, null, "blue", "green"]`, `r = 1`
- 以此类推...

---

```jsx
row.map((token, c) =>
```

遍历内层数组（5 列）。每次拿到一个格子（`token`）和列号（`c`）。

拿第 0 行的第 4 列举例：
- `token = "red"`, `c = 4`
- 生成一个 `<div>` 显示红色圆点

拿第 0 行的第 0 列举例：
- `token = null`, `c = 0`
- 生成一个 `<div>` 显示点号

---

```jsx
<div key={`${r}-${c}`}>
```

`key` 是 React 要求的唯一标识。`${r}-${c}` 用模板字符串把行号和列号拼起来：

- 第 0 行第 0 列 → `key="0-0"`
- 第 2 行第 3 列 → `key="2-3"`
- 第 4 行第 4 列 → `key="4-4"`

这样每个格子都有独一无二的 key。

---

```jsx
{token ? <span>{TOKEN_LABELS[token]}</span> : <span>·</span>}
```

这是**条件渲染**。`token ? ... : ...` 是 JS 的三目运算符：

- 如果 `token` 有值（不是 null）→ 显示对应的 emoji
- 如果 `token` 是 null → 显示点号

### 合并理解：整体流程

```
boardTokens（二维数组）
  │
  ├── 第 0 行 → 遍历 5 列
  │     ├── 列 0: null     → <div key="0-0">·</div>
  │     ├── 列 1: null     → <div key="0-1">·</div>
  │     ├── 列 2: null     → <div key="0-2">·</div>
  │     ├── 列 3: null     → <div key="0-3">·</div>
  │     └── 列 4: "red"    → <div key="0-4">🔴</div>
  │
  ├── 第 1 行 → 遍历 5 列
  │     ├── 列 0: null     → <div key="1-0">·</div>
  │     └── ...
  │
  ├── ...
  │
  └── 第 4 行 → 遍历 5 列
        └── ...
```

最终生成 5×5 = 25 个 `<div>`，被 CSS 网格排成 5 行 5 列。

### 如果用循环写是什么样的？

如果你不熟悉 `.map()`，用传统的 `for` 循环也能实现同样的效果：

```typescript
const rows = [];
for (let r = 0; r < boardTokens.length; r++) {
  const cells = [];
  for (let c = 0; c < boardTokens[r].length; c++) {
    const token = boardTokens[r][c];
    cells.push(
      <div key={`${r}-${c}`}>
        {token ? <span>{TOKEN_LABELS[token]}</span> : <span>·</span>}
      </div>
    );
  }
  rows.push(<div className="board-row">{cells}</div>);
}
// 然后渲染 rows
```

但用 `.map()` 更简洁、更符合 React 的"声明式"风格。`.map()` 在 JS/TS 中非常常见，值得花时间掌握。

## 第二步：修改 App.tsx

现在把 App.tsx 的内容替换掉，不再显示 Vite 默认页面，而是显示游戏版图：

```typescript
import { useState } from "react";
import Board from "./components/Board";
import { createInitialState } from "./game/gameState";
import "./App.css";

export default function App() {
  const [state] = useState(createInitialState());

  return (
    <div className="app">
      <h1>璀璨宝石对决</h1>
      <Board boardTokens={state.boardTokens} />
    </div>
  );
}
```

### 逐行解读

**第 1 行**：`import { useState } from "react"`

`useState` 是 React 的内置函数，用来在组件中保存状态。

**第 2 行**：`import Board from "./components/Board"`

引入我们自己写的 Board 组件。

**第 3 行**：`import { createInitialState } from "./game/gameState"`

引入初始化游戏状态的函数。

**第 5-11 行**：App 组件

```typescript
export default function App() {
  const [state] = useState(createInitialState());
  // ...
}
```

`useState(createInitialState())` 的意思是：
1. 调用 `createInitialState()` 生成初始游戏状态
2. 把结果存入 `state` 变量
3. 当 `state` 变化时，React 会自动重新渲染界面

注意这里我们只用了 `useState` 返回数组的第一个元素（`state`），没用第二个元素（`setState`）。因为本课只做静态渲染，不需要修改状态。

## 本课产出

启动开发服务器：

```bash
npm run dev
```

浏览器中会显示一个页面，顶部是"璀璨宝石对决"标题，下方是 5×5 的版图网格，格子中显示各种宝石表情符号。

## 思考题（附答案）

1. **为什么 boardTokens 的数据类型是 `(TokenType | null)[][]`，不是 `TokenType[][]`？**

   因为版图上有空格子。拿取标记后，原位置变成 null。如果全是 `TokenType`，就无法表示"空"的状态。
   类比 C++ 中用 `std::optional<TokenType>`，Python 中用 `Optional[TokenType]`。

2. **`useState(createInitialState())` 中，`createInitialState()` 什么时候执行？**

   只在组件首次渲染时执行一次。React 会记住初始值，后续重新渲染不会再次调用。
   这称为"惰性初始化"——相当于 `useState(() => createInitialState())` 的简写。