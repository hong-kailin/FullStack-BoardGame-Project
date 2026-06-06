# 第 36 课：给 Board 组件添加简单交互

## 学习目标

- 理解 `Board()` 这个组件函数什么时候执行
- 理解为什么需要 `state`
- 理解 `useState` 的基本用法
- 实现：鼠标悬停临时变色，点击宝石持久高亮，再点取消

## 本课只做一件事

上一课我们已经把版图渲染出来了。本课只加一个很小的交互：

```text
鼠标移到宝石上 → 临时变色
点击宝石 → 持久高亮
再次点击同一个宝石 → 取消高亮
```

本课不实现“拿取标记”、不处理最多选 3 个，也不把选中状态传给 `App.tsx`。

当前只有 `Board` 自己需要知道“哪个格子被选中了”，所以状态先放在 `Board.tsx` 里。以后真的需要 App 知道选中结果时，再重构。

---

## 1. 先理解：Board() 函数什么时候执行？

React 组件本质上是一个函数。

```typescript
export default function Board({ boardTokens }: BoardProps) {
  return (...);
}
```

所以：

```text
Board 组件 = Board() 函数
```

React 要显示 `<Board />` 时，本质上就是执行 `Board()`，拿到它返回的 JSX，然后渲染到页面上。

### 1.1 第一次执行：页面初始化时

```text
浏览器加载 index.html
  ↓
index.html 加载 src/main.tsx
  ↓
main.tsx 渲染 <App />
  ↓
React 执行 App()
  ↓
App() 返回 <Board boardTokens={state.boardTokens} />
  ↓
React 执行 Board()
  ↓
Board() 返回 25 个格子的 JSX
  ↓
React 把 JSX 变成真实 DOM
```

所以页面第一次显示版图时，`Board()` 会执行一次。

### 1.2 后续还会执行吗？

会。

`Board()` 会在这些情况执行：

1. **初始化渲染时**：第一次显示 `<Board />`
2. **Board 自己的 state 更新时**：比如 `setSelectedCell(...)`
3. **父组件 App 重新渲染时**：即使 Board 的 props 没变，默认也会重新执行
4. **传给 Board 的 props 变化时**：比如以后 `boardTokens` 改变

所以不要把组件函数理解成“只运行一次的初始化函数”。

更准确地说：

```text
组件函数是一个“根据当前数据计算界面”的函数。
React 需要重新计算界面时，就会再次执行它。
```

本课最重要的是：

```text
用户点击宝石
  ↓
Board 的 state 改变
  ↓
React 重新执行 Board()
  ↓
Board 根据新的 state 返回新的 JSX
  ↓
页面更新高亮状态
```

---

## 2. 为什么需要 state？

既然 `Board()` 会反复执行，那普通变量就记不住数据。

如果不用 state，而是写普通变量：

```typescript
export default function Board({ boardTokens }: BoardProps) {
  let selectedCell = null;
  return (...);
}
```

会发生：

```text
用户点击格子
  ↓
selectedCell 被改成 [2, 3]
  ↓
React 重新执行 Board()
  ↓
let selectedCell = null 又重新开始
  ↓
刚才选中的信息丢了
```

因为函数每次执行时，普通变量都会重新创建。

所以我们需要一种“React 帮我们记住的数据”，这就是 `state`。

```text
普通变量：函数重新执行就重新创建
state：函数重新执行后仍然由 React 记住
```

本课要记住的是：

```text
当前哪个格子被点击选中了？
```

所以我们需要一个 state：`selectedCell`。

---

## 3. useState 是什么？

`useState` 是 React 提供的函数，用来给组件添加 state。

本课关键代码：

```typescript
const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
```

拆开看：

| 部分 | 含义 |
|------|------|
| `selectedCell` | 当前选中的格子 |
| `setSelectedCell` | 修改选中格子的函数 |
| `[number, number]` | 一个坐标，例如 `[2, 3]` |
| `null` | 没有选中任何格子 |
| 最后的 `(null)` | 初始值 |

### 3.1 useState 返回什么？

```typescript
const [count, setCount] = useState(0);
```

`useState(0)` 返回一个数组：

```text
[当前状态值, 修改状态的函数]
```

等价于：

```typescript
const result = useState(0);
const count = result[0];
const setCount = result[1];
```

### 3.2 selectedCell 的两种状态

```typescript
null      // 没有选中任何格子
[2, 3]    // 选中了第 2 行第 3 列
```

### 3.3 为什么不能直接赋值？

不能这样：

```typescript
selectedCell = [2, 3];
```

因为 React 不知道你偷偷改了变量。

必须这样：

```typescript
setSelectedCell([2, 3]);
```

`setSelectedCell` 会做两件事：

1. 更新 React 记住的 state
2. 通知 React 重新执行组件函数，更新页面

---

## 4. 本课的状态变化流程

```text
初始：selectedCell = null
  ↓
点击 [2, 3]
  ↓
setSelectedCell([2, 3])
  ↓
React 重新执行 Board()
  ↓
selectedCell = [2, 3]
  ↓
第 2 行第 3 列加上 selected class
```

再次点击同一个格子：

```text
点击 [2, 3]
  ↓
setSelectedCell(null)
  ↓
React 重新执行 Board()
  ↓
selectedCell = null
  ↓
没有格子被选中，高亮消失
```

---

## 5. 当前代码组织结构

```text
App.tsx
├── 创建游戏初始状态 state
└── 把 state.boardTokens 传给 Board

Board.tsx
├── 接收 boardTokens
├── 用 useState 记住 selectedCell
├── handleCellClick(row, col) 修改 selectedCell
├── isSelected(row, col) 判断格子是否被选中
└── 渲染 25 个格子
    ├── 鼠标 hover 时靠 CSS 临时变色
    └── selectedCell 对应的格子加 selected class，持久高亮

App.css
├── .board-cell.has-token:hover  鼠标悬停样式
└── .board-cell.selected         点击选中后的持久样式
```

为什么状态不放在 `App.tsx`？

```text
只有 Board 用到 selectedCell
所以 selectedCell 放在 Board 里
```

以后实现“拿取标记”按钮时，如果 App 也需要知道选中了哪些格子，再把状态提升到 App。

---

## 6. App.tsx 代码

`App.tsx` 保持简单，只负责把版图数据传给 `Board`。

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

---

## 7. Board.tsx 代码

```typescript
import { useState } from "react";
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
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);

  const handleCellClick = (row: number, col: number) => {
    const isSameCell = selectedCell?.[0] === row && selectedCell?.[1] === col;
    setSelectedCell(isSameCell ? null : [row, col]);
  };

  const isSelected = (row: number, col: number) =>
    selectedCell?.[0] === row && selectedCell?.[1] === col;

  return (
    <div className="board">
      <h3>版图</h3>
      <div className="board-grid">
        {boardTokens.map((row, rowIndex) =>
          row.map((token, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`board-cell ${token ? "has-token" : "empty"} ${isSelected(rowIndex, colIndex) ? "selected" : ""}`}
              onClick={() => token && handleCellClick(rowIndex, colIndex)}
            >
              {token ? <span>{TOKEN_LABELS[token]}</span> : <span>·</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

### 代码要点

#### `handleCellClick`

```typescript
const isSameCell = selectedCell?.[0] === row && selectedCell?.[1] === col;
setSelectedCell(isSameCell ? null : [row, col]);
```

逻辑：

```text
如果点击的是已选中的格子 → 取消选中
否则 → 选中新格子
```

`selectedCell?.[0]` 是可选链：如果 `selectedCell` 是 `null`，不会报错。

#### `isSelected`

```typescript
const isSelected = (row: number, col: number) =>
  selectedCell?.[0] === row && selectedCell?.[1] === col;
```

判断某个格子是不是当前被选中的格子。

#### `className`

```typescript
className={`board-cell ${token ? "has-token" : "empty"} ${isSelected(rowIndex, colIndex) ? "selected" : ""}`}
```

最终可能生成：

```text
board-cell has-token selected
```

CSS 会让带有 `selected` 的格子持久高亮。

#### `onClick`

```typescript
onClick={() => token && handleCellClick(rowIndex, colIndex)}
```

只有有宝石的格子才能点击。空格子的 `token` 是 `null`，不会执行点击逻辑。

---

## 8. CSS：hover 和 selected 的区别

```css
.board-cell.has-token:hover {
  border-color: #aa3bff;
  background: rgba(170, 59, 255, 0.1);
}

.board-cell.selected {
  border-color: #aa3bff;
  background: rgba(170, 59, 255, 0.1);
  box-shadow: 0 0 8px rgba(170, 59, 255, 0.5);
}
```

| 样式 | 触发方式 | 是否持久 |
|------|----------|----------|
| `:hover` | 鼠标放上去 | 不持久，鼠标移开就消失 |
| `.selected` | 点击后 state 改变 | 持久，直到再次点击取消 |

---

## 本课产出

运行：

```bash
npm run dev
```

你应该看到：

1. 鼠标放到有宝石的格子上，格子临时变色
2. 点击一个宝石格子，格子持续高亮
3. 再点同一个格子，高亮取消
4. 点另一个宝石格子，高亮移动到新格子

## 思考题（附答案）

1. **为什么本课把 `selectedCell` 放在 Board 里？**

   因为当前只有 Board 自己需要用它。代码只服务当前目标，不提前复杂化。

2. **什么时候需要把 selectedCell 移到 App？**

   当 App 或其他组件也需要知道选中的格子时，比如以后实现“拿取标记”按钮。

3. **hover 和 selected 有什么区别？**

   `hover` 是 CSS 临时状态；`selected` 是 React state 控制的持久状态。
