# 第 34 课：创建游戏状态管理函数

## 学习目标

- 理解什么是"游戏状态管理"
- 从终端版 `game-loop.ts` 中提取 React 可复用的逻辑
- 写出第一个 React 可调用的游戏状态函数：`createInitialState`

## 本课只做一件事

本课我们先不做点击、不做购买、不做组件。

只创建一个新文件：

```text
src/game/gameState.ts
```

里面先放一个函数：

```typescript
createInitialState()
```

它负责创建一局游戏刚开始时的完整状态。

## 什么是 GameState？

`GameState` 就是"游戏当前世界的快照"。

类比 Python/C++：

- Python 中可以把它理解成一个很大的 `dict`
- C++ 中可以把它理解成一个 struct，里面装着所有游戏数据

它里面包含：

- 两个玩家
- 5×5 版图上的标记
- 金字塔卡牌
- 当前轮到谁
- 有没有胜利者
- 袋子里的标记

## 为什么要单独建 gameState.ts？

之前终端版的 `game-loop.ts` 同时做了三件事：

1. 创建初始状态
2. 读取终端输入
3. 根据输入修改游戏状态

但是 React 不需要终端输入，也不需要 `readline`。

所以我们要把里面真正有用的逻辑拆出来，放到 `gameState.ts`。

## 本课代码

```typescript
import type { GameState, TokenType } from "./types";
import { shuffleDeck, getLevelDeck } from "./card-pool";
import { createBoard } from "./board";

export function createInitialState(): GameState {
  const allTokens: TokenType[] = [
    "red", "blue", "green", "white", "black",
    "red", "blue", "green", "white", "black",
    "red", "blue", "green", "white", "black",
    "red", "blue", "green", "white", "black",
    "pearl", "pearl", "gold", "gold", "gold"
  ];

  const shuffledTokens = shuffleDeck(allTokens);
  const board = createBoard(shuffledTokens);

  return {
    players: [
      {
        id: 0,
        name: "玩家 1",
        tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
        cards: [],
        royalCards: [],
        reservedCards: [],
        privileges: 0
      },
      {
        id: 1,
        name: "玩家 2",
        tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
        cards: [],
        royalCards: [],
        reservedCards: [],
        privileges: 0
      }
    ],
    boardTokens: board,
    pyramid: [
      shuffleDeck(getLevelDeck(1)).slice(0, 5),
      shuffleDeck(getLevelDeck(2)).slice(0, 4),
      shuffleDeck(getLevelDeck(3)).slice(0, 3),
    ],
    availableRoyalCards: [],
    currentPlayerIndex: 0,
    winner: null,
    bag: []
  };
}
```

## 逐段解释

### 1. 类型导入

```typescript
import type { GameState, TokenType } from "./types";
```

`GameState` 和 `TokenType` 都是 TypeScript 类型，不是运行时变量。

所以这里用 `import type`，告诉编译器：

> 这些东西只在类型检查阶段使用，编译成 JavaScript 时请删掉。

### 2. 函数导入

```typescript
import { shuffleDeck, getLevelDeck } from "./card-pool";
import { createBoard } from "./board";
```

这些是真正会运行的函数，所以用普通 `import`。

### 3. 创建全部标记

```typescript
const allTokens: TokenType[] = [ ... ];
```

这里创建 25 个标记：

- 5 种基础宝石，每种 4 个，一共 20 个
- 珍珠 2 个
- 黄金 3 个

### 4. 洗混标记并创建版图

```typescript
const shuffledTokens = shuffleDeck(allTokens);
const board = createBoard(shuffledTokens);
```

`shuffleDeck` 负责打乱数组。

`createBoard` 负责按 5×5 螺旋顺序把标记放到版图上。

### 5. 返回完整 GameState

```typescript
return { ... };
```

这个对象就是一局游戏的初始状态。

React 后面会用：

```typescript
const [state, setState] = useState(createInitialState());
```

来把这个状态放进组件里。

## 本课产出

新增文件：

```text
src/game/gameState.ts
```

并且运行：

```bash
npx tsc --noEmit
```

无报错。

## 思考题（附答案）

1. **为什么本课只搬 `createInitialState`，不搬 `take` 和 `buy`？**

   因为我们要小步迭代。先保证"游戏能初始化"，再逐步加"拿取标记"、"购买卡牌"。如果一次性搬太多，出错时很难知道是哪一部分的问题。

2. **为什么 `shuffleDeck` 用普通 import，而 `GameState` 用 import type？**

   `shuffleDeck` 是运行时函数，浏览器真的要执行它；`GameState` 只是类型，编译后不存在，所以用 `import type`。
