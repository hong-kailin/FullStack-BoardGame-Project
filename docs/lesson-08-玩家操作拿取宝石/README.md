# 第 8 课：玩家操作 — 拿取宝石

## 本节课目标

实现版图上的标记放置和"拿取最多 3 个相邻标记"操作。

---

## 1. 规则回顾

根据规则书，拿取标记是强制行动之一：

> **拿取最多 3 个标记**
> 从版图上拿取最多 3 个相邻宝石标记和/或珍珠标记。标记必须位于不间断的水平线、垂直线或对角线上。你能拿取 2 个相邻标记，或甚至只拿一个标记。此行动不能用于拿取黄金标记。
>
> 如果你使用此行动拿取颜色相同的 3 个标记或 2 个珍珠，你的对手拿取 1 个特权。

### 关键点

| 规则 | 说明 |
|------|------|
| **相邻** | 同行、同列、同对角线，中间不能有空格或黄金隔开 |
| **数量** | 最多 3 个，也可以拿 2 个或 1 个 |
| **不能拿** | 黄金标记（黄金只能通过"拿取黄金+保留卡牌"获得） |
| **对手得特权** | 如果 3 个标记颜色相同，或拿了 2 个珍珠 |

---

## 2. 版图结构

版图是一个 5×5 的网格，25 个标记按**螺旋顺序**从中央格开始放置：

```
螺旋顺序（从中央开始）：
17 16 15 14 13
18  5  4  3 12
19  6  1  2 11
20  7  8  9 10
21 22 23 24 25
```

> 数字表示放置顺序，1 是中央格。

### 代码表示

我们用二维数组表示版图。`null` 表示空格：

```typescript
// board[row][col]，row 0 是顶部，col 0 是左侧
// null = 空格
```

### 拿取标记的相邻判定

标记必须位于**不间断的直线**上：

```
水平：  ● ● ●        ← 可以拿 3 个
垂直：  ●            ← 可以拿 3 个
        ●
        ●
对角线： ●           ← 可以拿 3 个
         ●
          ●
```

---

## 3. 动手：创建 board.ts

在 `src/` 下创建 `board.ts`，实现版图逻辑：

```typescript
import { TokenType } from "./types";

const BOARD_SIZE = 5;

// 螺旋顺序的位置（从中央开始）
const SPIRAL_ORDER: [number, number][] = [
  [2, 2], // 1: 中央
  [2, 3], // 2
  [1, 3], // 3
  [1, 2], // 4
  [1, 1], // 5
  [2, 1], // 6
  [3, 1], // 7
  [3, 2], // 8
  [3, 3], // 9
  [3, 4], // 10
  [2, 4], // 11
  [1, 4], // 12
  [0, 4], // 13
  [0, 3], // 14
  [0, 2], // 15
  [0, 1], // 16
  [0, 0], // 17
  [1, 0], // 18
  [2, 0], // 19
  [3, 0], // 20
  [4, 0], // 21
  [4, 1], // 22
  [4, 2], // 23
  [4, 3], // 24
  [4, 4], // 25
];

export function createBoard(tokens: TokenType[]): (TokenType | null)[][] {
  const board: (TokenType | null)[][] = Array.from(
    { length: BOARD_SIZE },
    () => Array(BOARD_SIZE).fill(null)
  );

  for (let i = 0; i < tokens.length && i < SPIRAL_ORDER.length; i++) {
    const [row, col] = SPIRAL_ORDER[i];
    board[row][col] = tokens[i];
  }

  return board;
}

// 检查三个位置是否在同一条不间断的水平/垂直/对角线上
function getLine(board: (TokenType | null)[][], row: number, col: number, dr: number, dc: number): TokenType[] {
  const tokens: TokenType[] = [];
  let r = row;
  let c = col;

  // 沿方向收集，最多 3 个
  for (let i = 0; i < 3; i++) {
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
    const token = board[r][c];
    if (token === null || token === "gold") break; // 空格或黄金中断
    tokens.push(token);
    r += dr;
    c += dc;
  }

  return tokens;
}

// 获取从 (row, col) 出发，所有方向上连续的标记
export function getAdjacentTokens(board: (TokenType | null)[][], row: number, col: number): TokenType[][] {
  // 8 个方向: 上、下、左、右、对角线
  const directions: [number, number][] = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ];

  return directions
    .map(([dr, dc]) => getLine(board, row, col, dr, dc))
    .filter(line => line.length >= 1); // 至少 1 个标记
}

// 从版图上拿取标记
export function takeTokens(
  board: (TokenType | null)[][],
  positions: [number, number][]
): { taken: TokenType[]; board: (TokenType | null)[][]; opponentGetsPrivilege: boolean } {
  const newBoard = board.map(row => [...row]);
  const taken: TokenType[] = [];

  for (const [row, col] of positions) {
    const token = newBoard[row][col];
    if (token && token !== "gold") {
      taken.push(token);
      newBoard[row][col] = null;
    }
  }

  // 检查是否触发对手得特权
  const allSameColor = taken.length === 3 && taken.every(t => t === taken[0]);
  const twoPearls = taken.filter(t => t === "pearl").length === 2;
  const opponentGetsPrivilege = allSameColor || twoPearls;

  return { taken, board: newBoard, opponentGetsPrivilege };
}
```

然后在 `src/index.ts` 中引入并测试：

```typescript
import { createBoard, getAdjacentTokens, takeTokens } from "./board";
import { shuffleDeck } from "./card-pool";

// 模拟 25 个标记
const allTokens: TokenType[] = [
  "red", "blue", "green", "white", "black",
  "red", "blue", "green", "white", "black",
  "red", "blue", "green", "white", "black",
  "red", "blue", "green", "white", "black",
  "pearl", "pearl", "gold", "gold", "gold"
];

const shuffledTokens = shuffleDeck(allTokens as any) as TokenType[];
const board = createBoard(shuffledTokens);

console.log("版图初始状态:");
console.log(board.map(row => row.map(t => (t ?? "  ").padEnd(6)).join("")).join("\n"));

// 测试从中央位置拿取相邻标记
const adjacent = getAdjacentTokens(board, 2, 2);
console.log("\n中央位置 (2,2) 的各方向相邻标记:");
adjacent.forEach((line, i) => console.log(`  方向 ${i}:`, line));
```

> 注意：`shuffleDeck` 接受 `Card[]`，但洗牌逻辑不关心元素类型。后面会把它改造成泛型函数。

### 运行

```bash
npm start
```

---

## 4. 代码分析

### 4.1 螺旋顺序

SPLENDOR DUEL 的版图标记是从中央开始按螺旋放置的。我们硬编码了 25 个位置的顺序，因为它是固定的。

### 4.2 相邻判定

`getLine` 从给定位置沿某个方向走，收集连续的、非空非黄金的标记。遇到空格或黄金就停止。

### 4.3 特权触发

两种情况下对手获得特权：
- 拿取的 3 个标记颜色完全相同
- 拿取了 2 个珍珠

---

## 5. 总结

| 概念 | 说明 |
|------|------|
| 版图 | 5×5 网格，螺旋放置 25 个标记 |
| 相邻 | 同行/同列/同对角线，不间断 |
| 拿取 | 最多 3 个，不能拿黄金 |
| 特权触发 | 3 个同色 或 2 个珍珠 |

---

## 思考题（附答案）

1. **为什么黄金标记会中断相邻线？**
   - 答：规则规定拿取标记行动不能拿黄金，黄金在版图上相当于"障碍物"。

2. **`getLine` 只往一个方向走，怎么能拿到一整条线？**
   - 答：`getAdjacentTokens` 会往两个相反方向都调用（比如上和下），这样就能拿到一整条线上的所有标记。在 `takeTokens` 中，玩家需要手动选择具体拿哪些位置的标记。

---

准备好了告诉我，进入**第 9 课：玩家操作 — 购买卡牌**。
