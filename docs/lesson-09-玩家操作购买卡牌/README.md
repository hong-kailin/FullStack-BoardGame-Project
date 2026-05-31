# 第 9 课：玩家操作 — 购买卡牌

## 本节课目标

实现购买卡牌的核心逻辑：计算折扣、检查费用、扣除标记、获得奖励。

---

## 1. 规则回顾

> **购买 1 张珠宝卡牌**
> 从金字塔中或你保留的卡牌中选择一张卡牌，用标记支付其费用，并将该卡牌正面朝上放置在你面前。黄金标记可以百搭，能用来代替任意一个宝石标记或珍珠标记。将已花费的标记放入袋子中。
>
> 购买后，你获得该珠宝卡牌的奖励。每个奖励都会减少未来购买卡牌的费用。

### 关键点

| 规则 | 说明 |
|------|------|
| **费用** | 卡牌左下角显示需要支付的宝石/珍珠数量 |
| **奖励** | 卡牌右下角显示奖励颜色，每 1 个奖励减少该色费用 1 个 |
| **黄金百搭** | 黄金可以代替任意颜色的宝石或珍珠 |
| **费用不能为负** | 奖励可以减少费用到 0，但不能减到负数 |
| **珍珠无奖励** | 规则书明确：游戏中不存在珍珠奖励 |

---

## 2. 计算实际费用

假设你有以下奖励：

| 颜色 | 奖励数量 |
|------|---------|
| 红色 | 3 |
| 蓝色 | 2 |
| 绿色 | 1 |

你想买一张卡牌，费用是：

| 颜色 | 需要 |
|------|------|
| 红色 | 5 |
| 蓝色 | 3 |
| 黑色 | 3 |
| 珍珠 | 1 |

实际支付 = 费用 - 奖励（不低于 0）：

| 颜色 | 计算 | 实际支付 |
|------|------|---------|
| 红色 | 5 - 3 = 2 | 2 |
| 蓝色 | 3 - 2 = 1 | 1 |
| 黑色 | 3 - 0 = 3 | 3 |
| 珍珠 | 1 - 0 = 1 | 1 |

**总计需要支付：2 + 1 + 3 + 1 = 7 个标记**

如果你手上有 8 个标记（含 1 个黄金），黄金可以代替任意 1 个，所以够付。

---

## 3. 代码实现

创建 `src/purchase.ts`：

```typescript
import { Card, Player, GemColor } from "./types";

// 获取玩家的奖励数量（按颜色）
export function getPlayerBonuses(player: Player): Record<GemColor, number> {
  const bonuses: Record<GemColor, number> = {
    red: 0, blue: 0, green: 0, white: 0, black: 0
  };

  for (const card of player.cards) {
    // 每张卡牌提供 1 个奖励（对应卡牌的 gem 颜色）
    // 有些卡牌可能有 2 个奖励，目前简化处理
    bonuses[card.gem]++;
  }

  return bonuses;
}

// 计算购买一张卡牌实际需要支付的费用
export function getActualCost(
  card: Card,
  playerBonuses: Record<GemColor, number>
): Record<GemColor | "pearl", number> {
  const cost: Record<GemColor | "pearl", number> = {
    red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0
  };

  for (const color of ["red", "blue", "green", "white", "black"] as GemColor[]) {
    const needed = card.cost[color] || 0;
    const bonus = playerBonuses[color] || 0;
    cost[color] = Math.max(0, needed - bonus); // 不能减到负数
  }
  cost.pearl = card.cost.pearl || 0; // 珍珠没有奖励减免

  return cost;
}

// 计算需要支付的总标记数（不含黄金）
export function getTotalTokenCost(actualCost: Record<GemColor | "pearl", number>): number {
  let total = 0;
  for (const key of Object.keys(actualCost) as (keyof typeof actualCost)[]) {
    total += actualCost[key];
  }
  return total;
}

// 检查玩家是否能买得起这张卡牌
export function canAfford(
  player: Player,
  actualCost: Record<GemColor | "pearl", number>
): boolean {
  const totalNeeded = getTotalTokenCost(actualCost);
  const playerTotal = Object.values(player.tokens).reduce((a, b) => a + b, 0);

  if (playerTotal < totalNeeded) return false;

  // 检查每种颜色是否够（黄金可补差额）
  let goldNeeded = 0;
  for (const color of ["red", "blue", "green", "white", "black", "pearl"] as const) {
    const needed = actualCost[color];
    const have = player.tokens[color] || 0;
    if (needed > have) {
      goldNeeded += needed - have;
    }
  }

  return goldNeeded <= (player.tokens.gold || 0);
}

// 执行购买
export function purchaseCard(
  player: Player,
  card: Card,
  actualCost: Record<GemColor | "pearl", number>
): Player {
  const newPlayer: Player = {
    ...player,
    tokens: { ...player.tokens },
    cards: [...player.cards]
  };

  // 扣除标记（先用对应颜色，不够的用黄金补）
  for (const color of ["red", "blue", "green", "white", "black", "pearl"] as const) {
    let needed = actualCost[color];
    const have = newPlayer.tokens[color] || 0;
    const useFromColor = Math.min(needed, have);
    newPlayer.tokens[color] = have - useFromColor;
    needed -= useFromColor;

    // 不够的部分用黄金补
    if (needed > 0) {
      newPlayer.tokens.gold = (newPlayer.tokens.gold || 0) - needed;
    }
  }

  // 添加卡牌
  newPlayer.cards.push(card);

  return newPlayer;
}
```

---

## 4. 测试

更新 `src/index.ts`：

```typescript
import { getPlayerBonuses, getActualCost, getTotalTokenCost, canAfford, purchaseCard } from "./purchase";
import { Player, Card } from "./types";

// 创建一个测试玩家（有 3 红 2 蓝 1 绿的奖励）
const testPlayer: Player = {
  id: 0,
  name: "Alice",
  tokens: { red: 2, blue: 1, green: 0, white: 0, black: 3, pearl: 1, gold: 1 },
  cards: [
    // 假设已购买了一些卡牌，获得奖励
    { id: 1, level: 1, gem: "red", points: 1, crowns: 0, cost: {} as any },
    { id: 2, level: 1, gem: "red", points: 2, crowns: 1, cost: {} as any },
    { id: 3, level: 1, gem: "red", points: 0, crowns: 0, cost: {} as any },
    { id: 4, level: 1, gem: "blue", points: 1, crowns: 0, cost: {} as any },
    { id: 5, level: 1, gem: "blue", points: 0, crowns: 0, cost: {} as any },
    { id: 6, level: 1, gem: "green", points: 1, crowns: 0, cost: {} as any },
  ],
  royalCards: [],
  reservedCards: [],
  privileges: 0
};

// 要购买的卡牌
const targetCard: Card = {
  id: 18, level: 3, gem: "red", points: 7, crowns: 3,
  cost: { red: 0, blue: 0, green: 5, white: 0, black: 5, pearl: 2 }
};

const bonuses = getPlayerBonuses(testPlayer);
console.log("玩家奖励:", bonuses);

const actualCost = getActualCost(targetCard, bonuses);
console.log("实际费用:", actualCost);
console.log("需要支付标记数:", getTotalTokenCost(actualCost));
console.log("是否买得起:", canAfford(testPlayer, actualCost));

if (canAfford(testPlayer, actualCost)) {
  const updatedPlayer = purchaseCard(testPlayer, targetCard, actualCost);
  console.log("购买后剩余标记:", updatedPlayer.tokens);
  console.log("购买后卡牌数:", updatedPlayer.cards.length);
}
```

---

## 5. 总结

| 概念 | 说明 |
|------|------|
| **奖励** | 已购买卡牌提供的费用折扣 |
| **实际费用** | 卡牌标价 - 对应颜色奖励（不低于 0） |
| **黄金百搭** | 黄金可以代替任意缺少的颜色 |
| **购买流程** | 检查 → 扣标记 → 获得卡牌 |

---

准备好了告诉我，进入**第 10 课：游戏状态管理**。
