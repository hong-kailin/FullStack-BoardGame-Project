# 第 41 课：实现拿取标记

## 学习目标

- 理解"状态提升"——什么时候需要把状态从子组件移到父组件
- 实现完整的拿取标记流程

## 本课要做的事

第 39 课已经可以多选宝石了，但选中后没有"执行"的入口。

本课：

1. 把 `selectedCells` 从 Board 提升到 App
2. App 添加"拿取标记"按钮
3. 点击按钮调用 `handleTakeTokens`

---

## 1. 为什么需要状态提升？

当前 `selectedCells` 在 Board 内部。但"拿取标记"按钮在 App 里。

App 需要知道用户选了哪些格子，才能调用 `handleTakeTokens`。

所以 `selectedCells` 必须从 Board 提升到 App。

```text
之前：
App
├── Board（selectedCells 在这里）
└── （没有拿取按钮）

之后：
App（selectedCells 在这里）
├── Board（通过 props 接收 selectedCells）
├── 拿取标记按钮（读取 selectedCells）
└── 调用 handleTakeTokens
```

这就是"状态提升"——把状态放到需要它的公共父组件里。

---

## 2. 代码改动

### Board.tsx — 不再自己管理 selectedCells

```typescript
interface BoardProps {
  boardTokens: (TokenType | null)[][];
  selectedCells: [number, number][];
  onCellClick: (row: number, col: number) => void;
}
```

Board 不再用 `useState` 管理 `selectedCells`，改为通过 props 接收。

点击格子时调用 `onCellClick(row, col)`，由 App 决定怎么处理。

### App.tsx — 管理 selectedCells + 拿取按钮

```typescript
const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
const [state, setState] = useState(createInitialState());
const [message, setMessage] = useState("");

const handleCellClick = (row: number, col: number) => {
  // 校验逻辑...（和之前 Board 里的一样）
};

const handleTake = () => {
  const result = handleTakeTokens(state, selectedCells);
  setState(result.state);
  setMessage(result.message);
  setSelectedCells([]);
};
```

---

## 3. 完整 App.tsx

```typescript
import { useState } from "react";
import Board from "./components/Board";
import Pyramid from "./components/Pyramid";
import PlayerInfo from "./components/PlayerInfo";
import { createInitialState, handleTakeTokens } from "./game/gameState";
import { validateCellSelection } from "./game/board";
import "./App.css";

export default function App() {
  const [state, setState] = useState(createInitialState());
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleCellClick = (row: number, col: number) => {
    setError("");

    const index = selectedCells.findIndex(([r, c]) => r === row && c === col);
    if (index !== -1) {
      setSelectedCells(selectedCells.filter(([r, c]) => r !== row || c !== col));
      return;
    }

    const validationError = validateCellSelection(
      state.boardTokens, selectedCells, row, col
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedCells([...selectedCells, [row, col]]);
  };

  const handleTake = () => {
    if (selectedCells.length === 0) return;
    const result = handleTakeTokens(state, selectedCells);
    setState(result.state);
    setMessage(result.message);
    setSelectedCells([]);
  };

  return (
    <div className="app">
      <h1>璀璨宝石对决</h1>
      {message && <div className="message">{message}</div>}
      <div className="game-layout">
        <div>
          <Board
            boardTokens={state.boardTokens}
            selectedCells={selectedCells}
            onCellClick={handleCellClick}
          />
          {error && <div className="board-error">{error}</div>}
          {selectedCells.length > 0 && (
            <button className="btn-take" onClick={handleTake}>
              拿取标记 ({selectedCells.length} 个)
            </button>
          )}
        </div>
        <Pyramid pyramid={state.pyramid} />
      </div>
      <div className="players">
        <PlayerInfo player={state.players[0]} />
        <PlayerInfo player={state.players[1]} />
      </div>
    </div>
  );
}
```

---

## 本课产出

运行 `npm run dev`：

1. 点击版图上的宝石 → 选中
2. 点击"拿取标记"按钮 → 宝石从版图消失，加到玩家身上
3. 按钮只在选中时显示
4. 拿取后自动清除选中状态

## 思考题

1. **为什么拿取后要 `setSelectedCells([])`？**

   因为拿取后这些格子已经空了，再选中没有意义。清空选中状态是合理的用户体验。

2. **为什么 Board 不再自己管理 selectedCells？**

   因为 App 也需要知道选中了哪些格子（调用 handleTakeTokens 时需要传入 positions）。按照"状态放在需要它的公共父组件"原则，提升到 App。