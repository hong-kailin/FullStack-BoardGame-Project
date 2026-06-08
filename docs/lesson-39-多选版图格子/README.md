# 第 39 课：多选版图格子（含游戏规则校验）

## 学习目标

- 理解多选状态的管理方式
- 理解如何在选择时实时校验游戏规则
- 理解黄金的特殊处理

## 游戏规则

本课的多选不是随便选的，要遵守游戏规则：

1. **最多选 3 个**非黄金标记
2. **必须在同一直线上且相邻**（水平、垂直、对角线）
3. **黄金只能单独拿取**，不能和其他标记混选

---

## 1. 校验逻辑

### 规则 1：黄金只能单独拿

```typescript
if (clickedToken === "gold") {
  if (selectedCells.length > 0) {
    setError("黄金只能单独拿取");
    return;
  }
  setSelectedCells([[row, col]]);
  return;
}
```

如果点击的是黄金：

- 当前没有选中任何格子 → 选中它
- 已经选了别的格子 → 提示错误

### 规则 2：不能和黄金混选

```typescript
if (selectedCells.some(([r, c]) => boardTokens[r][c] === "gold")) {
  setError("黄金不能和其他宝石一起拿取");
  return;
}
```

如果当前已选的是黄金，再点其他宝石 → 拒绝。

### 规则 3：最多 3 个

```typescript
if (selectedCells.length >= 3) {
  setError("最多只能拿取 3 个标记");
  return;
}
```

### 规则 4：同一直线且相邻

```typescript
const newSelected: [number, number][] = [...selectedCells, [row, col]];
const validationError = validateTakePositions(newSelected);
if (validationError) {
  setError(validationError);
  return;
}
```

`validateTakePositions` 是从 `board.ts` 导入的函数，它会检查所有已选位置是否在同一直线上且相邻。

比如：

```text
✅ 允许：[2,2] [2,3] [2,4]   → 同一行，相邻
✅ 允许：[2,2] [3,3] [4,4]   → 对角线，相邻
❌ 拒绝：[2,2] [2,4]          → 中间跳过了 [2,3]
❌ 拒绝：[2,2] [1,3]          → 不在同一直线
```

---

## 2. Board.tsx 完整代码

```typescript
import { useState } from "react";
import type { TokenType } from "../game/types";
import { validateTakePositions } from "../game/board";

interface BoardProps {
  boardTokens: (TokenType | null)[][];
}

const TOKEN_LABELS: Record<string, string> = {
  red: "🔴", blue: "🔵", green: "🟢",
  white: "⚪", black: "⚫",
  pearl: "🦪", gold: "🟡",
};

export default function Board({ boardTokens }: BoardProps) {
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [error, setError] = useState("");

  const handleCellClick = (row: number, col: number) => {
    setError("");

    // 如果点击的是已选中的格子 → 取消选中
    const index = selectedCells.findIndex(([r, c]) => r === row && c === col);
    if (index !== -1) {
      setSelectedCells(selectedCells.filter(([r, c]) => r !== row || c !== col));
      return;
    }

    const clickedToken = boardTokens[row][col];

    // 黄金只能单独拿
    if (clickedToken === "gold") {
      if (selectedCells.length > 0) {
        setError("黄金只能单独拿取");
        return;
      }
      setSelectedCells([[row, col]]);
      return;
    }

    // 已选黄金时不能再加其他
    if (selectedCells.some(([r, c]) => boardTokens[r][c] === "gold")) {
      setError("黄金不能和其他宝石一起拿取");
      return;
    }

    // 最多 3 个
    if (selectedCells.length >= 3) {
      setError("最多只能拿取 3 个标记");
      return;
    }

    // 校验相邻和直线
    const newSelected: [number, number][] = [...selectedCells, [row, col]];
    const validationError = validateTakePositions(newSelected);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedCells(newSelected);
  };

  const isSelected = (row: number, col: number) =>
    selectedCells.some(([r, c]) => r === row && c === col);

  return (
    <div className="board">
      <h3>版图</h3>
      {error && <div className="board-error">{error}</div>}
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

---

## 本课产出

测试不同场景：

| 操作 | 期望结果 |
|------|----------|
| 点击黄金 | 单独选中 |
| 选了一个宝石再点黄金 | 提示"黄金只能单独拿取" |
| 选 3 个非黄金宝石 | 第三点选中后不能继续选第 4 个 |
| 选不在同一直线的两个格子 | 提示"标记必须相邻" |
| 点击已选中的格子 | 取消选中 |

## 思考题

1. **为什么 `${[r, c]}` 这种写法不对？**

   `${[r, c]}` 会把数组转成 `"2,3"` 的字符串。比较时 `===` 用不了，所以先存成 `[number, number]` 的元组，然后分别比较行号和列号。

2. **黄金的选中逻辑为什么和其他宝石不一样？**

   因为游戏规则中，拿取黄金是"拿 1 个黄金 + 保留 1 张卡牌"，是单独的行动。而拿取非黄金是"拿 1-3 个相邻标记"，是另一个行动。