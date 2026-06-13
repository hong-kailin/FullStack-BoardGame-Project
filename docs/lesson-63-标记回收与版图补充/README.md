# 第 63 课：标记回收与版图补充（袋子系统）

## 学习目标

- 理解标记的完整生命周期
- 实现 `refillBoard`：从袋子洗牌，按螺旋顺序填充版图空格
- 修改购买/归还逻辑：花费的标记放回袋子而非消失
- 在前端添加"补充版图"按钮

---

## 核心概念讲解

### 1. 标记的生命周期

之前标记的流动是单向的：

```
版图 → 玩家手中 → 购买花费 → 消失 ❌
```

本课把它变成循环：

```
版图 → 玩家手中 → 购买花费 → 袋子 → refill → 版图 ✅
```

| 阶段 | 谁持有标记 | 变化 |
|------|-----------|------|
| 初始 | 版图（25 个） | 袋子为空 |
| 拿取 | 玩家手中 | 版图减少，袋子不变 |
| 购买 | 还给银行 | 玩家减少，袋子增加 |
| 归还（超上限） | 还给银行 | 玩家减少，袋子增加 |
| 补充版图 | 版图 | 袋子减少，版图空格被填充 |

**关键**：拿取标记不经过袋子——标记从版图直接到玩家手中。只有**花费**（购买）和**归还**（超上限）时，标记才进袋子。

### 2. refillBoard 的实现

```ts
export function refillBoard(
  board: (TokenType | null)[][],
  bag: TokenType[]
): { board: (TokenType | null)[][]; bag: TokenType[] } {
  if (bag.length === 0) return { board, bag };

  const shuffled = shuffleArray([...bag]);
  const newBoard = board.map(row => [...row]);
  const newBag: TokenType[] = [];

  let tokenIndex = 0;
  for (const [row, col] of SPIRAL_ORDER) {
    if (newBoard[row][col] === null && tokenIndex < shuffled.length) {
      newBoard[row][col] = shuffled[tokenIndex];
      tokenIndex++;
    }
  }

  for (let i = tokenIndex; i < shuffled.length; i++) {
    newBag.push(shuffled[i]);
  }

  return { board: newBoard, bag: newBag };
}
```

**步骤**：
1. 袋子为空 → 直接返回，无事发生
2. 洗牌袋子中的标记
3. 按螺旋顺序遍历 25 个格子，遇到空格就填一个
4. 如果标记比空格多，剩余的留在袋子里

**类比**：你有一袋弹珠（袋子），棋盘上有空位。你把弹珠倒出来搅一搅（洗牌），然后从中心开始螺旋往外填坑。坑填满了还有剩的弹珠，就留在袋子里下次用。

### 3. 为什么拿取标记不进袋子？

拿取标记时，标记从版图到玩家手中——它们还在"流通"中，没有回到银行。

只有购买卡牌时，标记才真正被"花掉"——从玩家手中回到银行（袋子）。归还超上限的标记也是同理。

### 4. 补充版图是可选行动

按照规则，补充版图是玩家在强制行动前可以选择的**可选行动**。执行后对手获得 1 个特权。

```ts
export function handleRefillBoard(state: GameState): { state: GameState; message: string } {
  if (state.bag.length === 0) {
    return { state, message: "袋子为空，无法补充版图" };
  }

  const result = refillBoard(state.boardTokens, state.bag);

  let opponent = state.players[opponentIndex];
  opponent = { ...opponent, privileges: Math.min((opponent.privileges || 0) + 1, 3) };

  // ... 返回新状态
}
```

注意：`Math.min(..., 3)` 限制了特权上限为 3 个。

---

## 逐行代码讲解

### board.ts — refillBoard

```ts
const shuffled = shuffleArray([...bag]);
```

`[...bag]` 创建袋子的副本，避免修改原数组。`shuffleArray` 是 Fisher-Yates 洗牌算法。

```ts
for (const [row, col] of SPIRAL_ORDER) {
  if (newBoard[row][col] === null && tokenIndex < shuffled.length) {
    newBoard[row][col] = shuffled[tokenIndex];
    tokenIndex++;
  }
}
```

按螺旋顺序遍历 25 个格子。遇到空格就填一个标记，`tokenIndex` 递增。填完所有空格或标记用完就停。

### gameState.ts — handleBuyCard 改动

```ts
const spentTokens: TokenType[] = [];
for (const [type, count] of Object.entries(result.spent)) {
  for (let i = 0; i < count; i++) {
    spentTokens.push(type as TokenType);
  }
}
const newBag = [...state.bag, ...spentTokens];
```

`purchaseCard` 返回的 `result.spent` 是一个 `Record<string, number>`（如 `{ pearl: 3 }`）。把它展开成数组 `["pearl", "pearl", "pearl"]`，然后拼到袋子后面。

### gameState.ts — handleDiscardTokens 改动

```ts
const newBag = [...state.bag, ...discards];
```

归还的标记也进袋子，一行搞定。

### App.tsx — 前端按钮

```tsx
<button
  className="btn-pass"
  onClick={handleRefill}
  disabled={state.bag.length === 0}
  title={state.bag.length === 0 ? "袋子为空" : `袋子中有 ${state.bag.length} 个标记`}
>
  补充版图（对手+1特权）
</button>
```

- `disabled={state.bag.length === 0}` — 袋子为空时按钮灰色不可点
- `title` — 鼠标悬停显示袋子中标记数量

---

## 本课产出

| 文件 | 改动 |
|------|------|
| `packages/core/src/board.ts` | 新增 `refillBoard` + `shuffleArray` |
| `packages/core/src/gameState.ts` | `handleBuyCard` 花费进袋子；`handleDiscardTokens` 归还进袋子；新增 `handleRefillBoard` |
| `packages/core/src/index.ts` | 导出 `refillBoard` 和 `handleRefillBoard` |
| `packages/web/src/App.tsx` | 新增"补充版图"按钮 |
| `packages/web/src/App.css` | 新增 `.action-buttons` 和 `.btn-pass:disabled` 样式 |

### 验证方式

```bash
# 编译检查
npx tsc --noEmit -p packages/core/tsconfig.json
npx tsc --noEmit -p packages/web/tsconfig.json

# 启动前端
npm run dev
# → 购买卡牌后袋子有标记 → 点击"补充版图" → 空格被填充 → 对手获得特权
```

---

## 思考题

1. 如果袋子有 5 个标记但版图只有 3 个空格，`refillBoard` 会怎样？
2. 为什么 `handleRefillBoard` 不切换当前玩家（不改变 `currentPlayerIndex`）？
3. 拿取标记时标记不进袋子，那什么时候袋子才会"有货"？

---

## 思考题答案

### 1. 空格不够时

`refillBoard` 按螺旋顺序填满 3 个空格后，`tokenIndex = 3`，还剩 2 个标记。它们会被 push 到 `newBag` 里，留在袋子中下次用。

### 2. 为什么不切换玩家？

补充版图是**可选行动**，不是强制行动。玩家补充版图后，还要继续执行强制行动（拿标记/买卡牌/跳过）。所以回合不切换。

### 3. 袋子什么时候有货？

- 玩家购买卡牌时，花费的标记进袋子
- 玩家标记超上限归还时，归还的标记进袋子

拿取标记不经过袋子，所以游戏初期袋子一直是空的，直到有人买了第一张卡牌。

---

## 下一课预告

第 64 课：特权系统——实现"使用特权"操作，完善特权转移规则。
