# 第 36 课：给 Board 组件添加交互

## 学习目标

- 理解 React 中的事件处理（onClick）
- 理解"状态提升"——子组件的事件交给父组件处理
- 实现点击格子选中/取消选中

## 本课要做的事

上一课 Board 只能**静态展示**版图。本课让它能**交互**——点击格子选中，再点取消选中。

改动两个文件：

1. `Board.tsx` — 接收新 props：`selectedPositions` 和 `onCellClick`
2. `App.tsx` — 用 `useState` 管理选中的位置，传给 Board

## React 的事件处理回顾

在 HTML 中绑定点击事件：

```html
<button onclick="handleClick()">点击</button>
```

在 React 中：

```jsx
<button onClick={handleClick}>点击</button>
```

区别只有两点：

| HTML | React |
|------|-------|
| `onclick`（全小写） | `onClick`（驼峰命名） |
| `"函数名()"`（字符串） | `{函数名}`（JS 表达式） |

**重要**：`onClick={handleClick}` 是传函数本身，不是调用它。不能写 `onClick={handleClick()}`，那会在渲染时就执行。

## 第一步：修改 Board.tsx

```typescript
import type { TokenType } from "../game/types";

interface BoardProps {
  boardTokens: (TokenType | null)[][];
  selectedPositions: [number, number][];
  onCellClick: (row: number, col: number) => void;
}
```

新增了两个 props：

- **`selectedPositions`** — 当前选中的格子坐标列表，类型是 `[number, number][]`（坐标对组成的数组）
- **`onCellClick`** — 点击格子时触发的回调函数，接收行号、列号

然后在渲染每个格子时，判断它是否在选中列表中，加上 `selected` class，并绑定点击事件：

```typescript
export default function Board({ boardTokens, selectedPositions, onCellClick }: BoardProps) {
  const isSelected = (r: number, c: number) =>
    selectedPositions.some(([sr, sc]) => sr === r && sc === c);

  return (
    <div className="board">
      <h3>版图</h3>
      <div className="board-grid">
        {boardTokens.map((row, r) =>
          row.map((token, c) => (
            <div
              key={`${r}-${c}`}
              className={`board-cell ${token ? "has-token" : "empty"} ${isSelected(r, c) ? "selected" : ""}`}
              onClick={() => token && onCellClick(r, c)}
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

**`isSelected` 函数**：

```typescript
const isSelected = (r: number, c: number) =>
  selectedPositions.some(([sr, sc]) => sr === r && sc === c);
```

`selectedPositions` 是一个数组，例如 `[[2, 2], [2, 3]]`。`isSelected` 检查某个格子 `(r, c)` 是否在这个数组中。

`.some()` 方法：只要数组中有**任意一个**元素满足条件就返回 true。类比 Python 的 `any()`。

**`onClick` 绑定**：

```jsx
onClick={() => token && onCellClick(r, c)}
```

这里做了两件事：

1. `token && ...` — 只有有标记的格子才能被点击（空格子点不了）
2. `onCellClick(r, c)` — 调用父组件传进来的回调，告诉 App"第 r 行第 c 列的格子被点了"

**className 动态拼接**：

```jsx
className={`board-cell ${token ? "has-token" : "empty"} ${isSelected(r, c) ? "selected" : ""}`}
```

`${...}` 模板字符串拼接多个 class：

- 所有格子都有 `board-cell`
- 有标记的格子加 `has-token`，空格的加 `empty`
- 选中的格子额外加 `selected`

## 第二步：修改 App.tsx

```typescript
import { useState } from "react";
import Board from "./components/Board";
import { createInitialState } from "./game/gameState";
import "./App.css";

export default function App() {
  const [state] = useState(createInitialState());
  const [selectedPositions, setSelectedPositions] = useState<[number, number][]>([]);

  const handleCellClick = (row: number, col: number) => {
    const already = selectedPositions.find(([r, c]) => r === row && c === col);
    if (already) {
      setSelectedPositions(selectedPositions.filter(([r, c]) => r !== row || c !== col));
    } else {
      if (selectedPositions.length >= 3) return;
      setSelectedPositions([...selectedPositions, [row, col] as [number, number]]);
    }
  };

  return (
    <div className="app">
      <h1>璀璨宝石对决</h1>
      <Board
        boardTokens={state.boardTokens}
        selectedPositions={selectedPositions}
        onCellClick={handleCellClick}
      />
    </div>
  );
}
```

### 逐行解读

**新增 state**：

```typescript
const [selectedPositions, setSelectedPositions] = useState<[number, number][]>([]);
```

- `selectedPositions` — 当前选中的格子坐标数组，初始为空数组 `[]`
- `setSelectedPositions` — 更新这个状态的函数

**handleCellClick**：

```typescript
const handleCellClick = (row: number, col: number) => {
  // 1. 检查这个格子是否已经选中
  const already = selectedPositions.find(([r, c]) => r === row && c === col);
  if (already) {
    // 2. 已选中 → 取消选中（从数组中移除）
    setSelectedPositions(
      selectedPositions.filter(([r, c]) => r !== row || c !== col)
    );
  } else {
    // 3. 未选中 → 检查是否已选 3 个（最多选 3 个）
    if (selectedPositions.length >= 3) return;
    // 4. 添加选中
    setSelectedPositions([...selectedPositions, [row, col] as [number, number]]);
  }
};
```

逻辑：

- 如果点击的格子已经在选中列表里 → 移除它（取消选中）
- 如果不在列表里 → 如果没满 3 个就添加进去（最多选 3 个）
- `filter()` 创建一个新数组，排除掉被点击的格子
- `[...selectedPositions, ...]` 是数组展开，创建一个新数组，在原数组末尾追加新元素

**数据流**：

```
用户点击格子
  → Board 组件触发 onClick={() => onCellClick(r, c)}
    → App 的 handleCellClick 执行
      → setSelectedPositions 更新状态
        → React 重新渲染 App
          → 新的 selectedPositions 传给 Board
            → Board 重新渲染，选中格子显示 selected class
```

## 第三步：添加选中样式

在 `App.css` 中添加选中高亮的样式：

```css
.board-cell.has-token {
  cursor: pointer;
}
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

- `has-token` 的格子鼠标变成手指（pointer）
- `hover` 时边框和背景变色，提示"这个格子可以点"
- `selected` 时额外加阴影，明显区别于其他格子

## 本课产出

点击版图上的标记格子：

- 第一次点击 → 格子高亮（选中）
- 再次点击同一个格子 → 高亮消失（取消选中）
- 最多同时选中 3 个

## 思考题（附答案）

1. **为什么 `onClick` 里要写 `() => onCellClick(r, c)`，不能直接写 `onClick={onCellClick(r, c)}`？**

   因为 `onClick` 需要的是一个**函数**，不是函数的返回值。

   - `onClick={onCellClick}` ✅ — 传函数本身，点击时执行
   - `onClick={onCellClick(r, c)}` ❌ — 渲染时立刻执行，返回值赋给 onClick
   - `onClick={() => onCellClick(r, c)}` ✅ — 箭头包一层，点击时才执行

   类比：就像 `addEventListener("click", handleClick)` 不能写成 `addEventListener("click", handleClick())`。

2. **为什么 `selectedPositions` 要存在 App 里，不直接存在 Board 里？**

   因为将来"拿取标记"按钮在 App 中。如果选中状态存在 Board 里，App 拿不到数据，没法知道用户选了哪些格子。

   这就是 React 的**状态提升**原则：把状态放在需要它的最近公共父组件中。