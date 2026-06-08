# 第 40 课：给 gameState.ts 添加操作函数

## 学习目标

- 理解纯函数的概念
- 理解为什么游戏操作要写成纯函数
- 把 `handleTakeTokens`、`handleBuyCard`、`handlePass` 加到 gameState.ts

## 本课只做一件事

当前 `gameState.ts` 只有 `createInitialState`。本课加上三个操作函数：

| 函数 | 作用 |
|------|------|
| `handleTakeTokens(state, positions)` | 拿取标记 |
| `handleBuyCard(state, cardId)` | 购买卡牌 |
| `handlePass(state)` | 跳过回合 |

每个函数都接收当前 `GameState`，返回新的 `GameState` + 消息。

本课不做：

- 在界面上调用这些函数
- 按钮、点击事件

---

## 1. 为什么 React 要求 state 不可变？

### 1.1 什么是"不可变"？

不可变（immutable）的意思是：**数据一旦创建，就不能被修改**。

如果要改变数据，不是去改原来的数据，而是创建一个新的副本，在副本上修改。

```typescript
// 可变（mutable）— 直接修改原数据
const player = { name: "玩家 1", tokens: 3 };
player.tokens = 5;  // 改了原对象

// 不可变（immutable）— 创建新对象
const player = { name: "玩家 1", tokens: 3 };
const newPlayer = { ...player, tokens: 5 };  // 原 player 不变
```

### 1.2 为什么 React 要求不可变？

React 需要知道"状态有没有变化"，才能决定要不要重新渲染页面。

如果直接修改原对象：

```typescript
const [player, setPlayer] = useState({ name: "玩家 1", tokens: 3 });

// ❌ 直接修改
player.tokens = 5;
// React 不知道 player 变了，不会重新渲染
```

因为 `player` 还是同一个对象引用，React 对比新旧 state 时发现"没变"。

如果创建新对象：

```typescript
// ✅ 创建新对象
const newPlayer = { ...player, tokens: 5 };
setPlayer(newPlayer);
// React 发现 newPlayer 是全新对象，和旧的不一样，触发重新渲染
```

### 1.3 用类比理解

想象你在写一份文档。

**可变方式**：直接在原稿上涂改。别人手里拿的还是旧版本，不知道你改了。

**不可变方式**：每次修改都复印一份，在复印件上改。别人一看"这是复印件，不是原件"，就知道内容变了。

React 就像那个"别人"——它通过比较"是不是同一个对象"来判断状态有没有变化。

### 1.4 可变 vs 不可变对比

```typescript
// 可变 — React 无法检测变化
const arr = [1, 2, 3];
arr.push(4);        // 同一个数组，内容变了
arr[0] = 99;        // 同一个数组，内容变了

// 不可变 — React 可以检测变化
const arr = [1, 2, 3];
const newArr = [...arr, 4];     // 新数组
const newArr2 = arr.map(x => x === 1 ? 99 : x);  // 新数组
```

### 1.5 这和纯函数有什么关系？

纯函数的第二条规则是"不修改输入的数据"。

我们的 `handleTakeTokens` 接收 `state`，不能直接改 `state`，而是返回一个新对象：

```typescript
export function handleTakeTokens(state, positions) {
  // ❌ 不能这样
  state.boardTokens[2][2] = null;
  state.currentPlayerIndex = 1;
  return state;

  // ✅ 要这样
  const newBoard = state.boardTokens.map(row => [...row]);
  newBoard[2][2] = null;
  return {
    ...state,
    boardTokens: newBoard,
    currentPlayerIndex: 1
  };
}
```

所以：

```text
React 要求 state 不可变
  ↓
操作函数不能修改原 state
  ↓
操作函数必须是纯函数
  ↓
每次返回新的 GameState 对象
```

### 1.6 本课代码中的不可变写法

```typescript
// 创建新玩家对象，不修改原 player
let newPlayer = { ...player, tokens: { ...player.tokens } };

// 创建新版图，不修改原 boardTokens
const newBoard = state.boardTokens.map(row => [...row]);

// 创建新 GameState，不修改原 state
return {
  ...state,
  players: newPlayers,
  boardTokens: result.board,
  currentPlayerIndex: opponentIndex
};
```

每一层都是"复制一份再修改"，确保原数据不受影响。

---

## 2. handleTakeTokens

```typescript
export function handleTakeTokens(
  state: GameState,
  positions: [number, number][]
): { state: GameState; message: string } {
  const player = state.players[state.currentPlayerIndex];
  const opponentIndex = state.currentPlayerIndex === 0 ? 1 : 0;

  const result = takeTokens(state.boardTokens, positions);

  let newPlayer = { ...player, tokens: { ...player.tokens } };
  for (const token of result.taken) {
    newPlayer.tokens[token] = (newPlayer.tokens[token] || 0) + 1;
  }
  newPlayer = enforceTokenLimit(newPlayer);

  let opponent = state.players[opponentIndex];
  if (result.opponentGetsPrivilege) {
    opponent = { ...opponent, privileges: (opponent.privileges || 0) + 1 };
  }

  const newPlayers: [Player, Player] = state.currentPlayerIndex === 0
    ? [newPlayer, opponent]
    : [opponent, newPlayer];

  return {
    state: {
      ...state,
      players: newPlayers,
      boardTokens: result.board,
      currentPlayerIndex: opponentIndex
    },
    message: `${player.name} 拿取了 ${result.taken.length} 个标记`
  };
}
```

流程：

```text
1. 获取当前玩家和对手
2. 调用 takeTokens 从版图上移除标记
3. 把拿到的标记加到玩家身上
4. 检查标记上限，超了强制归还
5. 如果触发特权条件，对手获得特权
6. 切换回合到对手
7. 返回新 state
```

---

## 3. handleBuyCard

```typescript
export function handleBuyCard(
  state: GameState,
  cardId: number
): { state: GameState; message: string } {
  const player = state.players[state.currentPlayerIndex];
  const opponentIndex = state.currentPlayerIndex === 0 ? 1 : 0;

  const found = findCardInPyramid(state.pyramid, cardId);
  if (!found) return { state, message: `卡牌 ID ${cardId} 不在金字塔中` };

  const bonuses = getPlayerBonuses(player);
  const actualCost = getActualCost(found.card, bonuses);

  if (!canAfford(player, actualCost)) {
    return { state, message: "宝石不足，无法购买该卡牌" };
  }

  const result = purchaseCard(player, found.card, actualCost);
  let newPlayer = result.player;

  const royalCard = checkRoyalCardEligibility(newPlayer, state.availableRoyalCards);
  if (royalCard) {
    newPlayer = { ...newPlayer, royalCards: [...newPlayer.royalCards, royalCard] };
  }

  if (checkWinCondition(newPlayer)) {
    return {
      state: { ...state, winner: newPlayer },
      message: `${player.name} 购买了卡牌 ${cardId}，达到胜利条件！`
    };
  }

  const newPyramid = state.pyramid.map(level => level.filter(c => c.id !== cardId));
  const newPlayers = [...state.players] as [Player, Player];
  newPlayers[state.currentPlayerIndex] = newPlayer;

  return {
    state: {
      ...state,
      players: newPlayers,
      pyramid: newPyramid,
      currentPlayerIndex: opponentIndex
    },
    message: `${player.name} 购买了卡牌 ${cardId}`
  };
}
```

流程：

```text
1. 找到卡牌
2. 计算折扣后的实际费用
3. 检查玩家是否买得起
4. 扣除费用，添加卡牌
5. 检查皇室卡牌资格
6. 检查胜利条件
7. 从金字塔移除已购买的卡牌
8. 切换回合
```

---

## 4. handlePass

```typescript
export function handlePass(state: GameState): { state: GameState; message: string } {
  const player = state.players[state.currentPlayerIndex];
  const opponentIndex = state.currentPlayerIndex === 0 ? 1 : 0;
  return {
    state: { ...state, currentPlayerIndex: opponentIndex },
    message: `${player.name} 跳过了回合`
  };
}
```

最简单的操作：只切换回合。

---

## 5. 完整 gameState.ts

```typescript
import type { GameState, Player, TokenType, Card } from "./types";
import { shuffleDeck, getLevelDeck } from "./card-pool";
import { createBoard, takeTokens } from "./board";
import { switchPlayer, checkWinCondition, checkRoyalCardEligibility, enforceTokenLimit } from "./game";
import { getPlayerBonuses, getActualCost, canAfford, purchaseCard } from "./purchase";

export function createInitialState(): GameState {
  // ...（第 34 课已实现）
}

function findCardInPyramid(pyramid: Card[][], cardId: number): { level: number; card: Card } | null {
  for (let level = 0; level < pyramid.length; level++) {
    for (const card of pyramid[level]) {
      if (card.id === cardId) return { level, card };
    }
  }
  return null;
}

export function handleTakeTokens(
  state: GameState,
  positions: [number, number][]
): { state: GameState; message: string } {
  // ...（上面已写）
}

export function handleBuyCard(
  state: GameState,
  cardId: number
): { state: GameState; message: string } {
  // ...（上面已写）
}

export function handlePass(state: GameState): { state: GameState; message: string } {
  // ...（上面已写）
}
```

---

## 本课产出

运行：

```bash
npx tsc --noEmit
```

无报错。

这些函数目前还没有被界面调用。第 41 课开始接入。

## 思考题

1. **为什么每个函数都返回 `{ state, message }` 而不是只返回 state？**

   `message` 是给用户看的提示信息（"拿取了 3 个标记"、"宝石不足"等）。如果只返回 state，界面不知道要不要显示提示。

2. **为什么 `handleTakeTokens` 不自己校验位置合法性？**

   位置校验（相邻、直线、黄金规则）已经在 `validateCellSelection` 中实现了。`handleTakeTokens` 假设传入的位置已经是合法的。