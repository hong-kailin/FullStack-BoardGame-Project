# 第 11 课：终端界面 v1 — 纯文本显示

## 本节课目标

创建一个终端渲染器，把游戏状态以纯文本形式显示在命令行中。

---

## 1. 为什么要做终端界面？

到目前为止，所有测试数据都是硬编码在 `index.ts` 中的。我们需要一个方式让玩家**看到**当前游戏状态。

终端界面虽然简陋，但有三个好处：
1. 验证游戏逻辑是否真的正确（眼睛看得到）
2. 为下一课的交互式输入做准备
3. 在 Web 界面做好之前，终端是唯一的测试手段

---

## 2. 设计渲染函数

我们需要渲染以下内容：

```
╔══════════════════════════════════════╗
║        璀璨宝石对决 — 终端版         ║
╚══════════════════════════════════════╝

版图（中央位置 * 标记）:
  pearl  blue   gold   white  red
  red    pearl  green  green  black
  red    gold   *white* red    gold
  black  green blue   green  white
  black  white  blue   blue   black

金字塔：
[1] 等级1 | 红色 | 1分 0冠 | 费用: 黑x3
[2] 等级1 | 蓝色 | 1分 0冠 | 费用: 黑x3
[3] 等级1 | 绿色 | 1分 0冠 | 费用: 红x1 珍珠x2
...

玩家 Alice（当前回合）:
  标记: 🔴2 🔵1 ⚫3 ⚪1 🟡1
  奖励: 🔴3 🔵2 🟢1
  卡牌: 6 张 | 声望: 16 | 王冠: 7
```

---

## 3. 创建 renderer.ts

创建 `src/renderer.ts`：

```typescript
import { Player, Card, TokenType, GemColor } from "./types";
import { getPlayerBonuses, getTotalPoints, getTotalCrowns } from "./game";

// 标记显示
const TOKEN_SYMBOLS: Record<TokenType, string> = {
  red: "🔴",
  blue: "🔵",
  green: "🟢",
  white: "⚪",
  black: "⚫",
  pearl: "🟣",
  gold: "🟡",
};

const GEM_COLORS: GemColor[] = ["red", "blue", "green", "white", "black"];

export function renderBoard(board: (TokenType | null)[][]): void {
  console.log("\n版图:");
  for (let r = 0; r < board.length; r++) {
    let line = "  ";
    for (let c = 0; c < board[r].length; c++) {
      const token = board[r][c];
      if (r === 2 && c === 2) {
        line += `[*${token ? TOKEN_SYMBOLS[token] || token : "  "}*] `;
      } else {
        line += ` ${token ? TOKEN_SYMBOLS[token] || token.padEnd(5) : " . "}  `;
      }
    }
    console.log(line);
  }
}

export function renderPyramid(pyramid: Card[][]): void {
  console.log("\n金字塔:");
  for (let level = 0; level < pyramid.length; level++) {
    console.log(`  等级 ${level + 1}:`);
    for (const card of pyramid[level]) {
      const costStr = Object.entries(card.cost)
        .filter(([, v]) => v > 0)
        .map(([color, amount]) => `${TOKEN_SYMBOLS[color as TokenType] || color}x${amount}`)
        .join(" ");
      console.log(`    [${card.id}] ${card.gem} ${card.points}分 ${card.crowns}冠 | 费用: ${costStr}`);
    }
  }
}

export function renderPlayer(player: Player, isCurrentPlayer: boolean): void {
  const prefix = isCurrentPlayer ? "▶ " : "  ";
  console.log(`\n${prefix}${player.name}${isCurrentPlayer ? "（当前回合）" : ""}:`);

  // 标记
  const tokensStr = Object.entries(player.tokens)
    .filter(([, v]) => v > 0)
    .map(([type, amount]) => `${TOKEN_SYMBOLS[type as TokenType] || type}x${amount}`)
    .join(" ");
  console.log(`  标记: ${tokensStr || "无"}`);

  // 奖励
  const bonuses = getPlayerBonuses(player);
  const bonusStr = GEM_COLORS
    .filter(c => bonuses[c] > 0)
    .map(c => `${TOKEN_SYMBOLS[c]}x${bonuses[c]}`)
    .join(" ");
  console.log(`  奖励: ${bonusStr || "无"}`);

  // 卡牌
  console.log(`  卡牌: ${player.cards.length} 张 | 声望: ${getTotalPoints(player)} | 王冠: ${getTotalCrowns(player)}`);

  // 保留卡牌
  if (player.reservedCards.length > 0) {
    console.log(`  保留卡牌: ${player.reservedCards.length} 张`);
  }

  // 特权
  if (player.privileges > 0) {
    console.log(`  特权: ${player.privileges} 个`);
  }
}

export function renderGameState(
  players: [Player, Player],
  board: (TokenType | null)[][],
  pyramid: Card[][],
  currentPlayerIndex: number
): void {
  console.log("\n========================================");
  console.log("      璀璨宝石对决 — 终端版");
  console.log("========================================");

  renderBoard(board);
  renderPyramid(pyramid);

  for (let i = 0; i < players.length; i++) {
    renderPlayer(players[i], i === currentPlayerIndex);
  }

  console.log("\n========================================\n");
}
```

---

## 4. 更新 index.ts

将 `src/index.ts` 中的测试代码替换为使用渲染器：

```typescript
import { shuffleDeck } from "./card-pool";
import { createBoard } from "./board";
import { TokenType } from "./types";
import { renderGameState } from "./renderer";

// 创建所有标记
const allTokens: TokenType[] = [
  "red", "blue", "green", "white", "black",
  "red", "blue", "green", "white", "black",
  "red", "blue", "green", "white", "black",
  "red", "blue", "green", "white", "black",
  "pearl", "pearl", "gold", "gold", "gold"
];

const shuffledTokens = shuffleDeck(allTokens);
const board = createBoard(shuffledTokens);

const player1 = {
  id: 0, name: "Alice",
  tokens: { red: 2, blue: 1, green: 0, white: 0, black: 3, pearl: 0, gold: 0 },
  cards: [
    { id: 1, level: 1, gem: "red", points: 1, crowns: 0, cost: {} as any },
    { id: 2, level: 1, gem: "red", points: 2, crowns: 1, cost: {} as any },
    { id: 4, level: 1, gem: "blue", points: 1, crowns: 0, cost: {} as any },
  ],
  royalCards: [], reservedCards: [], privileges: 0
};

const player2 = {
  id: 1, name: "Bob",
  tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
  cards: [
    { id: 7, level: 1, gem: "white", points: 1, crowns: 0, cost: {} as any },
  ],
  royalCards: [], reservedCards: [], privileges: 1
};

const pyramid: Card[][] = [
  shuffleDeck(getLevelDeck(1)).slice(0, 5),
  shuffleDeck(getLevelDeck(2)).slice(0, 4),
  shuffleDeck(getLevelDeck(3)).slice(0, 3),
];

renderGameState([player1, player2], board, pyramid, 0);
```

运行：

```bash
npm start
```

---

## 5. 代码分析

### 5.1 渲染 vs 逻辑分离

`renderer.ts` 只负责显示，不修改任何游戏数据。这是好的设计模式——**关注点分离**。

### 5.2 emoji 作为标记符号

用 emoji 表示不同颜色的标记，在终端中更直观。如果终端不支持 emoji，可以换成字母缩写（R/B/G/W/Bk/P/Gd）。

### 5.3 中央标记特殊标记

规则书中，版图中央格有特殊意义。我们在渲染中用 `[* *]` 突出显示。

---

## 6. 总结

| 函数 | 作用 |
|------|------|
| `renderBoard` | 显示版图 5×5 网格 |
| `renderPyramid` | 显示金字塔中的卡牌 |
| `renderPlayer` | 显示玩家标记、奖励、卡牌、分数 |
| `renderGameState` | 渲染完整游戏状态 |

---

准备好了告诉我，进入**第 12 课：终端界面 v2 — 操作交互**。
