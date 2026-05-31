# 第 10 课：游戏状态管理

## 本节课目标

实现回合切换、胜利条件检测和标记上限管理。

---

## 1. 规则回顾

### 回合流程

```
1. 可选行动（0-2 个）：使用特权 / 补充版图
2. 强制行动（三选一）：拿标记 / 拿黄金+保留 / 购买
3. 结算新卡牌能力
4. 检查王冠 → 获得皇室卡牌（第 3 个和第 6 个）
5. 回合结束：
   a. 标记超过 10 个 → 弃到 10 个
   b. 检查胜利条件
   c. 满足任一条件 → 获胜，否则对手开始回合
```

### 三种胜利条件

| # | 条件 | 说明 |
|---|------|------|
| 1 | **声望点数 ≥ 20** | 你所有卡牌（含皇室卡牌）上的声望点总和 |
| 2 | **王冠 ≥ 10** | 你所有卡牌上的王冠总数 |
| 3 | **同色卡牌声望 ≥ 10** | 同一种奖励颜色的卡牌上，声望点总和达到 10 |

---

## 2. 代码实现

创建 `src/game.ts`：

```typescript
import { Player, GameState, Card, RoyalCard, GemColor } from "./types";
import { getPlayerBonuses } from "./purchase";

// 计算玩家总声望点（卡牌 + 皇室卡牌）
export function getTotalPoints(player: Player): number {
  let total = 0;
  for (const card of player.cards) {
    total += card.points;
  }
  for (const card of player.royalCards) {
    total += card.points;
  }
  return total;
}

// 计算玩家总王冠数
export function getTotalCrowns(player: Player): number {
  let total = 0;
  for (const card of player.cards) {
    total += card.crowns;
  }
  for (const card of player.royalCards) {
    total += card.crowns;
  }
  return total;
}

// 计算同色卡牌声望（按奖励颜色分组）
export function getPointsByGemColor(player: Player): Record<GemColor, number> {
  const points: Record<GemColor, number> = {
    red: 0, blue: 0, green: 0, white: 0, black: 0
  };

  for (const card of player.cards) {
    points[card.gem] += card.points;
  }

  return points;
}

// 检查玩家是否满足任意胜利条件
export function checkWinCondition(player: Player): boolean {
  // 条件 1：声望 ≥ 20
  if (getTotalPoints(player) >= 20) return true;

  // 条件 2：王冠 ≥ 10
  if (getTotalCrowns(player) >= 10) return true;

  // 条件 3：同色卡牌声望 ≥ 10
  const pointsByColor = getPointsByGemColor(player);
  for (const color of ["red", "blue", "green", "white", "black"] as GemColor[]) {
    if (pointsByColor[color] >= 10) return true;
  }

  return false;
}

// 切换当前玩家
export function switchPlayer(state: GameState): GameState {
  return {
    ...state,
    currentPlayerIndex: state.currentPlayerIndex === 0 ? 1 : 0
  };
}

// 检查王冠数并获取可获得的皇室卡牌
export function checkRoyalCardEligibility(
  player: Player,
  availableRoyalCards: RoyalCard[]
): RoyalCard | null {
  const crowns = getTotalCrowns(player);

  // 第 3 个王冠：拿取第 1 张皇室卡牌（索引 0）
  // 第 6 个王冠：拿取第 2 张皇室卡牌（索引 1）
  const royalIndex = crowns === 3 ? 0 : crowns === 6 ? 1 : -1;

  if (royalIndex >= 0 && royalIndex < availableRoyalCards.length) {
    return availableRoyalCards[royalIndex];
  }

  return null;
}

// 回合结束时丢弃超出 10 个的标记
export function enforceTokenLimit(player: Player): Player {
  const totalTokens = Object.values(player.tokens).reduce((a, b) => a + b, 0);

  if (totalTokens <= 10) return player;

  const toDiscard = totalTokens - 10;
  let remaining = toDiscard;
  const newTokens = { ...player.tokens };

  // 按顺序丢弃：先丢珍珠和宝石，尽量保留黄金
  for (const type of ["pearl", "red", "blue", "green", "white", "black", "gold"] as const) {
    if (remaining <= 0) break;
    const discard = Math.min(remaining, newTokens[type] || 0);
    newTokens[type] = (newTokens[type] || 0) - discard;
    remaining -= discard;
  }

  return { ...player, tokens: newTokens };
}
```

---

## 3. 测试

更新 `src/index.ts`：

```typescript
import {
  getTotalPoints, getTotalCrowns, getPointsByGemColor,
  checkWinCondition, switchPlayer, checkRoyalCardEligibility,
  enforceTokenLimit
} from "./game";

// 测试玩家 1：高分路线
const player1: Player = {
  id: 0, name: "Alice",
  tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
  cards: [
    { id: 10, level: 2, gem: "red", points: 4, crowns: 2, cost: {} as any },
    { id: 14, level: 2, gem: "green", points: 5, crowns: 2, cost: {} as any },
    { id: 18, level: 3, gem: "red", points: 7, crowns: 3, cost: {} as any },
  ],
  royalCards: [],
  reservedCards: [],
  privileges: 0
};

console.log("玩家 1 声望:", getTotalPoints(player1));
console.log("玩家 1 王冠:", getTotalCrowns(player1));
console.log("按颜色声望:", getPointsByGemColor(player1));
console.log("是否获胜:", checkWinCondition(player1));

// 测试标记上限
const tokenRichPlayer: Player = {
  id: 1, name: "Bob",
  tokens: { red: 3, blue: 2, green: 1, white: 0, black: 4, pearl: 2, gold: 1 },
  cards: [], royalCards: [], reservedCards: [], privileges: 0
};

console.log("\nBob 标记数:", Object.values(tokenRichPlayer.tokens).reduce((a, b) => a + b, 0));
const limited = enforceTokenLimit(tokenRichPlayer);
console.log("弃到 10 后:", limited.tokens);
```

---

## 4. 总结

| 功能 | 函数 | 说明 |
|------|------|------|
| 总分计算 | `getTotalPoints` | 卡牌 + 皇室卡牌 |
| 王冠计算 | `getTotalCrowns` | 卡牌 + 皇室卡牌 |
| 同色声望 | `getPointsByGemColor` | 按奖励颜色分组 |
| 胜利判定 | `checkWinCondition` | 三种条件任意满足 |
| 回合切换 | `switchPlayer` | 0 ↔ 1 |
| 皇室卡牌 | `checkRoyalCardEligibility` | 第 3/6 王冠触发 |
| 标记上限 | `enforceTokenLimit` | 弃到 10 个 |

---

准备好了告诉我，进入**第 11 课：终端界面 v1 — 纯文本显示**。
