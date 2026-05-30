# 第 6 课：游戏规则概览 + 类型定义

## 本节课目标

理解璀璨宝石对决的核心规则，并用 TypeScript 定义游戏中的基础类型。

---

## 1. 璀璨宝石对决是什么？

璀璨宝石对决（Splendor Duel）是一款**双人桌游**，改编自经典桌游《璀璨宝石》。两个玩家扮演珠宝商公会领袖，通过收集宝石、购买珠宝卡牌来获得声望点数和王冠，**率先达成三个胜利条件之一的人获胜**。

---

## 2. 游戏配件

| 配件 | 数量 | 说明 |
|------|------|------|
| **珠宝卡牌** | 67 张（3 个等级） | 等级 1 最多，等级 3 最少，越高级的卡牌越强 |
| **皇室卡牌** | 4 张 | 达成条件时获得，提供额外能力 |
| **宝石标记** | 5 色 × 4 个 = 20 个 | 红、蓝、绿、白、黑，是游戏中的货币 |
| **珍珠标记** | 2 个 | 特殊的宝石，功能同普通宝石但更稀有 |
| **黄金标记** | 3 个 | 百搭，可以代替任意颜色的宝石 |
| **特权卷轴** | 3 个 | 用于拿取额外标记 |
| **版图** | 1 块 | 用于放置 25 个标记（螺旋形排列） |
| **胜利板块** | 1 个 | 显示三种胜利条件 |

---

## 3. 三种胜利条件

你的回合**结束时**，只要满足以下**任意一个**条件，立即获胜：

| # | 条件 | 说明 |
|---|------|------|
| 1 | **声望点数 ≥ 20** | 你购买的所有卡牌上的声望点数总和达到 20 |
| 2 | **王冠 ≥ 10** | 你购买的所有卡牌上的王冠图标总数达到 10 |
| 3 | **同色卡牌声望 ≥ 10** | 你购买的**同一种奖励颜色**的卡牌上，声望点数总和达到 10 |

> **注意**：条件 3 说的是"同一种奖励颜色"，不是宝石颜色。比如你买的红色奖励卡牌上总共凑了 10 点声望，也算胜利。三种条件满足任意一个就赢，不要求同时满足。

---

## 4. 游戏流程

### 4.1 游戏设置

```
1. 将珠宝卡牌按等级分别洗混成 3 个牌库
2. 翻开：3 张等级 3 + 4 张等级 2 + 5 张等级 1，在胜利板块下方形成金字塔
3. 将 25 个标记随机放置在版图上（从中央格开始螺旋放置）
4. 将 3 个特权卷轴放在版图上方
5. 将 4 张皇室卡牌放在版图下方
6. 随机选择起始玩家，其对手拿取 1 个特权
```

### 4.2 玩家回合

每个回合按以下顺序进行：

**第一步：可选行动（0-2 个，按顺序执行）**

| 可选行动 | 说明 |
|---------|------|
| 使用特权 | 放回 1+ 个特权到版图，每放回 1 个，拿取版图上任意 1 个非黄金标记 |
| 补充版图 | 如果袋子为空，混洗标记填入空格，然后对手拿取 1 个特权 |

**第二步：强制行动（三选一）**

| 强制行动 | 说明 |
|---------|------|
| 拿取最多 3 个标记 | 从版图上拿取最多 3 个**相邻**的标记（同行/同列/对角线，不能含黄金）。如果 3 个标记颜色相同或其中 2 个是珍珠，对手拿取 1 个特权 |
| 拿取 1 个黄金 + 保留 1 张卡牌 | 拿取版图上 1 个黄金标记，然后从金字塔或牌库顶保留 1 张卡牌（最多保留 3 张） |
| 购买 1 张珠宝卡牌 | 用标记支付费用（黄金可百搭），获得卡牌的奖励和能力 |

**第三步：结算新卡牌能力**

如果购买的卡牌有能力，立即结算。

**第四步：拿取皇室卡牌**

当你获得第 3 个王冠时，拿取 1 张皇室卡牌；获得第 6 个王冠时，再拿取 1 张。

**第五步：回合结束**

- 如果你有超过 10 个标记，弃掉超出部分（放回袋子）
- 检查是否满足任意胜利条件 → 满足则获胜，否则对手开始回合

---

## 5. 卡牌详解

### 5.1 卡牌结构

```
┌─────────────────┐
│  声望点数  王冠   │  ← 右上角
│                 │
│  奖励颜色        │  ← 右下角（减少未来购买费用）
│                 │
│  费用            │  ← 左下角（需要支付哪些宝石）
│  能力            │  ← 左上角（特殊效果）
└─────────────────┘
```

### 5.2 奖励（Bonus）

每张卡牌提供 1-2 个奖励（一种颜色）。每拥有 1 个该颜色的奖励，未来购买卡牌时该颜色的费用减少 1 个标记。奖励可以叠加到 0，但不能减到负数。

> **示例**：你有 3 个红色奖励，购买需要 5 个红色宝石的卡牌时，只需支付 2 个红色宝石。

### 5.3 卡牌能力

| 图标 | 效果 |
|------|------|
| 🔄 | 本回合结束后，立即再进行一个回合 |
| 👑 | 将此卡牌与有奖励的卡牌重叠放置，奖励颜色视为被重叠的卡牌颜色 |
| 💎 | 从版图上拿取 1 个与此卡牌颜色对应的标记 |
| ⭐ | 拿取 1 个特权 |
| ✋ | 从对手处拿取 1 个非黄金标记 |

---

## 6. 定义游戏类型

根据上面的规则，我们来定义 TS 类型。

### 6.1 宝石颜色

```typescript
type GemColor = "red" | "blue" | "green" | "white" | "black";
```

珍珠和黄金是特殊标记，不是标准宝石颜色。

### 6.2 标记类型

```typescript
type TokenType = GemColor | "pearl" | "gold";
```

### 6.3 卡牌

```typescript
interface Card {
  id: number;
  level: number;                              // 1, 2, 或 3
  gem: GemColor;                              // 奖励颜色
  points: number;                             // 声望点数
  crowns: number;                             // 王冠数量（0-3）
  cost: Record<GemColor | "pearl", number>;   // 购买费用（不需要黄金，黄金是百搭）
}
```

### 6.4 皇室卡牌

```typescript
interface RoyalCard {
  id: number;
  points: number;                             // 声望点数
  crowns: number;                             // 王冠数量
  requirement: Record<GemColor, number>;      // 需要多少该颜色的奖励才能获得
}
```

### 6.5 玩家

```typescript
interface Player {
  id: number;
  name: string;
  tokens: Record<TokenType, number>;           // 持有的标记
  cards: Card[];                               // 已购买的卡牌
  royalCards: RoyalCard[];                     // 已获得的皇室卡牌
  reservedCards: Card[];                       // 保留的卡牌（最多 3 张）
  privileges: number;                          // 持有的特权数量
}
```

### 6.6 游戏状态

```typescript
interface GameState {
  players: [Player, Player];                  // 两个玩家
  boardTokens: (TokenType | null)[][];         // 版图上的标记（null = 空格）
  pyramid: Card[][];                           // 金字塔：3 行，每行不同等级
  availableRoyalCards: RoyalCard[];            // 可获得的皇室卡牌
  currentPlayerIndex: number;                  // 当前轮到谁 (0 或 1)
  winner: Player | null;                       // 赢家
  bag: TokenType[];                            // 袋子中的标记
}
```

---

## 7. 动手：创建 types.ts

在 `docs/lesson-06-游戏规则概览+类型定义/` 下创建 `types.ts`：

```typescript
type GemColor = "red" | "blue" | "green" | "white" | "black";
type TokenType = GemColor | "pearl" | "gold";

interface Card {
  id: number;
  level: number;
  gem: GemColor;
  points: number;
  crowns: number;
  cost: Record<GemColor | "pearl", number>;
}

interface RoyalCard {
  id: number;
  points: number;
  crowns: number;
  requirement: Record<GemColor, number>;
}

interface Player {
  id: number;
  name: string;
  tokens: Record<TokenType, number>;
  cards: Card[];
  royalCards: RoyalCard[];
  reservedCards: Card[];
  privileges: number;
}

interface GameState {
  players: [Player, Player];
  boardTokens: (TokenType | null)[][];
  pyramid: Card[][];
  availableRoyalCards: RoyalCard[];
  currentPlayerIndex: number;
  winner: Player | null;
  bag: TokenType[];
}

// 测试
const player1: Player = {
  id: 0,
  name: "Alice",
  tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
  cards: [],
  royalCards: [],
  reservedCards: [],
  privileges: 0
};

console.log("Player 1:", player1);
```

运行：

```bash
tsx docs/lesson-06-游戏规则概览+类型定义/types.ts
```

---

## 8. 总结

| 类型 | 用途 |
|------|------|
| `GemColor` | 5 种宝石颜色（红蓝绿白黑） |
| `TokenType` | 所有标记类型（宝石 + 珍珠 + 黄金） |
| `Card` | 珠宝卡牌（等级、奖励、分数、王冠、费用） |
| `RoyalCard` | 皇室卡牌（分数、王冠、获取条件） |
| `Player` | 玩家（标记、手牌、皇室卡牌、保留卡牌、特权） |
| `GameState` | 游戏整体状态 |

三种胜利条件：**声望 ≥ 20** 或 **王冠 ≥ 10** 或 **同色卡牌声望 ≥ 10**

---

## 思考题（附答案）

1. **黄金标记和珍珠标记有什么区别？**
   - 答：黄金是百搭，可以代替任意宝石支付，只能通过"拿取黄金 + 保留卡牌"行动获得。珍珠是普通标记的一种（和宝石一样），可以通过正常拿取获得，但费用中可能需要珍珠。

2. **为什么 `cost` 的类型是 `Record<GemColor | "pearl", number>` 而不是 `Record<TokenType, number>`？**
   - 答：因为卡牌费用只用宝石和珍珠，不用黄金。黄金是百搭，在支付时代替任意颜色，不是费用本身的一部分。

3. **特权（Privilege）有什么用？**
   - 答：在回合中你可以消耗特权来拿取版图上任意 1 个非黄金标记。特权主要通过对手的行动获得（对手拿取 3 个同色标记、对手补充版图等）。

---

准备好了告诉我，进入**第 7 课：实现卡牌池**。
