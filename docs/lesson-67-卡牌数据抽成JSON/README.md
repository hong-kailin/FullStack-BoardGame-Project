# 第 67 课：卡牌数据抽成 JSON

## 学习目标

- 理解"数据与代码分离"的原则
- 将 67 张珠宝卡 + 4 张皇室卡数据从 TypeScript 代码移到 JSON 文件
- 实现 `validateCardData` 函数校验 JSON 数据完整性
- 引入 `BonusColor` 类型（含 `"any"` 和 `null`），处理万能奖励和无奖励卡牌
- 确保重构后游戏功能不变

---

## 核心概念讲解

### 1. 为什么要把数据从代码中分离？

**之前**：卡牌数据写在 `card-pool.ts` 的 TypeScript 常量里。改卡牌数据要改代码，数据无法独立校验，不利于工具化。

**之后**：卡牌数据放在 `cards.json`，代码只负责读取和校验：

```
packages/core/
├── data/
│   └── cards.json        # 纯数据，改卡牌只改这里
└── src/
    └── card-pool.ts      # 纯逻辑，读取 JSON + 校验 + 提供查询函数
```

### 2. 卡牌奖励颜色的三种情况

卡牌的 `gem` 字段现在有三种取值：

| 值 | 含义 |
|----|------|
| `"red"` / `"blue"` / `"green"` / `"white"` / `"black"` | 对应颜色的奖励 |
| `"any"` | 万能奖励，可当作任意颜色使用 |
| `null` | 无奖励，卡牌只提供分数/王冠/能力 |

对应 TypeScript 类型：`export type BonusColor = GemColor | "any" | null;`

### 3. 万能奖励 vs 黄金标记

| 特性 | 万能奖励（`gem: "any"`） | 黄金标记 |
|------|------------------------|---------|
| 来源 | 购买卡牌后永久获得 | 从版图拿取，用完即弃 |
| 作用 | 购买时自动抵扣费用 | 手动替代任意颜色 |
| 持续性 | 永久有效 | 一次性使用 |
| 抵扣顺序 | 颜色折扣之后自动使用 | 最后手动使用 |

---

## 逐行代码讲解

### types.ts — BonusColor 类型

`BonusColor` 在 `GemColor` 的基础上增加了 `"any"` 和 `null`。`Card` 接口的 `gem` 字段从 `GemColor` 改为 `BonusColor`。

### data/cards.json — 卡牌数据

JSON 文件包含两个数组，共 67 张珠宝卡 + 4 张皇室卡。`cost` 字段只写有费用的颜色，由 `fillCost` 补全。`gem` 可以是颜色名、`"any"`、或 `null`。

### card-pool.ts — fillCost

```ts
function fillCost(cost: Record<string, unknown>): Record<GemColor | "pearl", number> {
  const filled: Record<string, number> = {};
  for (const color of ALL_COLORS) {
    filled[color] = (cost[color] as number) || 0;
  }
  return filled as Record<GemColor | "pearl", number>;
}
```

JSON 中的 `cost` 只包含有值的颜色，`fillCost` 补全所有 6 种颜色，没有的设为 0。

### card-pool.ts — validateCardData

```ts
if (c.gem !== null && c.gem !== undefined && !validGems.includes(c.gem as string))
  throw new Error(`卡牌 ${c.id} 颜色无效: ${c.gem}`);
```

`gem` 的校验允许 `null`、`undefined`（不写）、或 `validGems` 中的值。`"any"` 是合法值。

### card-pool.ts — 读取并转换数据

```ts
gem: (raw.gem as BonusColor) || null,  // undefined / "" -> null
```

`(raw.gem as BonusColor) || null` 确保 `undefined` 或空字符串都被转为 `null`。

### purchase.ts — getPlayerBonuses

三种情况：
- `gem === "any"` -> 计入万能奖励
- `gem` 是具体颜色 -> 计入对应颜色
- `gem === null` -> 无奖励，跳过

### purchase.ts — getActualCost

万能奖励在颜色折扣之后使用，自动补足费用最高的颜色。

---

## 本课产出

| 文件 | 改动 |
|------|------|
| `packages/core/src/types.ts` | 新增 `BonusColor` 类型；`Card.gem` 从 `GemColor` 改为 `BonusColor` |
| `packages/core/tsconfig.json` | 新增 `resolveJsonModule: true` |
| `packages/core/data/cards.json` | 新建，包含 67 张珠宝卡 + 4 张皇室卡数据 |
| `packages/core/src/card-pool.ts` | 重写为从 JSON 读取数据，新增 `fillCost` 和 `validateCardData` |
| `packages/core/src/purchase.ts` | `getPlayerBonuses` 返回 `{ bonuses, wildBonus }`；`getActualCost` 使用万能奖励抵扣 |
| `packages/core/src/game.ts` | `getPointsByGemColor` 跳过 `gem === "any"` 的卡牌 |
| 前端组件 | 处理 `gem === null` 的显示，新增万能/无奖励卡牌分组 |

### 验证方式

```bash
npx tsc --noEmit -p packages/core/tsconfig.json
npx tsc --noEmit -p packages/web/tsconfig.json
npm run dev
```

---

## 思考题

1. 为什么 JSON 中的 `cost` 只写有费用的颜色？
2. `validateCardData` 在模块加载时执行，这意味着什么？
3. 万能奖励和黄金标记有什么区别？

---

## 思考题答案

### 1. 为什么 cost 只写有费用的颜色？

JSON 的可读性。`{ "pearl": 3 }` 比写全 6 种颜色清晰得多。代码负责补全，JSON 只负责表达"有什么"。

### 2. 模块加载时执行意味着什么？

意味着只要 `card-pool.ts` 被 import，校验就会运行。如果 JSON 数据有问题，程序在启动时就会崩溃，而不是在用户执行某个操作时才暴露。这符合"快速失败"原则。

### 3. 万能奖励和黄金标记的区别？

万能奖励是永久折扣，购买卡牌时自动抵扣。黄金标记是一次性万能货币，需要手动使用。简单说：万能奖励是"永久打折卡"，黄金标记是"现金券"。

---

## 下一课预告

第 68 课：引入 Action 类型系统——定义统一的 Action 联合类型，让所有游戏操作有统一的表示方式。
