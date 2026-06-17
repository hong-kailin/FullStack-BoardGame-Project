# 第 71 课：重构 handleBuyCard + 前端逻辑抽离

## 学习目标

- 识别代码重复：金字塔补牌逻辑在 `handleBuyCard` 中重复了 4 次
- 提取 `removeCardAndRefillPyramid` 函数消除重复
- 理解"提取函数"是重构最基本也最有效的手段
- 将前端状态管理和事件处理从 App.tsx 抽离到自定义 Hook `useGameController`
- 将内联常量抽离到 `constants.ts`
- App.tsx 从 389 行降到约 120 行

---

## 核心概念讲解

### 1. 为什么要重构 handleBuyCard？

先看重构前的问题：`handleBuyCard` 有 4 个提前返回分支（`gem: "any"`、皇室卡牌、胜利条件、正常购买），每个分支都需要做"从金字塔移除卡牌 + 补牌"的操作。

这段代码在函数中重复了 4 次：

```ts
const newPyramid = fromPyramid
  ? state.pyramid.map(level => level.filter(c => c.id !== cardId))
  : state.pyramid;

let finalPyramid = newPyramid;
let finalDecks = state.decks;
if (fromPyramid) {
  const refill = refillPyramidLevel(newPyramid, state.decks, fromPyramid.level);
  finalPyramid = refill.pyramid;
  finalDecks = refill.decks;
}
```

这就是典型的**复制粘贴式编程**——同一个逻辑在 4 个地方出现，如果以后改补牌规则，要改 4 处，很容易漏。

### 2. 前端逻辑抽离：useGameController

App.tsx 之前同时承担了状态管理、事件处理、渲染三大职责，共 389 行。

**抽离后**：

```
App.tsx                  ~120 行  →  只负责渲染
useGameController.ts     ~130 行  →  状态 + 事件处理
constants.ts              ~15 行  →  常量
```

`useGameController` 是一个自定义 Hook，它把 App.tsx 中所有的 `useState` 和 `handleXxx` 函数封装在一起，返回一个对象供 App.tsx 使用：

```tsx
// App.tsx 中只需要：
const {
  state, message, error,
  handleCellClick, handleTake, handleBuy,
  ...
} = useGameController();
```

这样做的好处：
1. **App.tsx 只关心渲染** — 不再被状态管理的细节干扰
2. **逻辑可复用** — 如果以后需要多个游戏实例，可以复用同一个 Hook
3. **易于测试** — Hook 的逻辑可以独立测试

`constants.ts` 把内联的 `TOKEN_LABELS`、`GEM_COLORS`、`ABILITY_LABELS` 集中管理，避免在多个组件中重复定义。

### 3. 重构原则：不改变行为

重构的黄金法则是：**不改变代码的外部行为**。重构前后，同样的输入必须产生同样的输出。

验证方式就是跑测试——33 个测试全部通过，说明重构没有破坏任何功能。

---

## 逐行代码讲解

### removeCardAndRefillPyramid

```ts
function removeCardAndRefillPyramid(
  pyramid: Card[][],
  decks: Card[][],
  cardId: number,
  fromLevel: number | null
): { pyramid: Card[][]; decks: Card[][] } {
  if (fromLevel === null) return { pyramid, decks };
  const newPyramid = pyramid.map(level => level.filter(c => c.id !== cardId));
  const refill = refillPyramidLevel(newPyramid, decks, fromLevel);
  return refill;
}
```

参数：
- `pyramid` — 当前金字塔
- `decks` — 当前牌库
- `cardId` — 要移除的卡牌 ID
- `fromLevel` — 卡牌所在等级（`null` 表示从保留区购买，不需要操作金字塔）

逻辑：
1. 如果 `fromLevel === null`（从保留区购买），直接返回原样
2. 从金字塔中过滤掉购买的卡牌
3. 从牌库补充新卡到该等级

### handleBuyCard 重构后

重构后的主流程：

```ts
// 1. 校验
if (!card) return error;
if (!canAfford) return error;

// 2. 执行购买
const purchaseResult = purchaseCard(player, card, actualCost);
// 处理花费的标记 → newBag
// 处理保留区移除

// 3. 金字塔补牌（一次调用，消除 4 处重复）
const pyramidRefill = removeCardAndRefillPyramid(...);

// 4. 分支处理（每个分支只处理自己的逻辑，不再管金字塔）
if (card.gem === "any") return { ...pendingGemCard };
if (newThresholds.length > 0) return { ...pendingRoyalThresholds };
if (checkWinCondition(newPlayer)) return { ...winner };

// 5. 正常流程：能力结算 + 切换玩家
const abilityResult = resolveCardAbility(stateAfterPurchase, card);
return { ...切换玩家 };
```

每个分支只关注自己的特殊逻辑，公共的"金字塔补牌"提前处理好了。

---

## 本课产出

| 文件 | 改动 |
|------|------|
| `packages/core/src/gameState.ts` | 新增 `removeCardAndRefillPyramid`；`handleBuyCard` 消除 4 处重复，精简约 40 行 |
| `packages/web/src/constants.ts` | **新建**，集中管理 TOKEN_LABELS、GEM_COLORS、ABILITY_LABELS |
| `packages/web/src/useGameController.ts` | **新建**，自定义 Hook，提取所有状态和事件处理逻辑 |
| `packages/web/src/App.tsx` | 从 389 行降到约 120 行，只保留渲染逻辑 |

### 验证方式

```bash
npm run test -w @splendor/core
# 33 passed
npx tsc --noEmit -p packages/web/tsconfig.json
# 编译通过
```

---

## 思考题

1. 为什么 `removeCardAndRefillPyramid` 把 `fromLevel` 设计成 `number | null`？
2. 重构后 `handleBuyCard` 的行数减少了，但功能不变——你怎么验证？
3. 如果以后要加一个新分支（比如"购买卡牌后触发某种事件"），需要改几个地方？

---

## 思考题答案

### 1. 为什么 fromLevel 是 number | null？

`null` 表示"从保留区购买"，不需要操作金字塔。如果设计成两个函数（`removeCard` 和 `refillPyramid`），调用方需要自己判断是否要调第二个函数，容易漏。合并成一个函数后，调用方只需传 `null` 即可。

### 2. 怎么验证功能不变？

跑测试。33 个测试覆盖了购买卡牌的各种场景（正常购买、宝石不足、黄金抵扣、奖励折扣、gem:any、金字塔补牌、保留区购买、回合切换等），全部通过说明功能没变。

### 3. 加新分支需要改几个地方？

只需要在 `handleBuyCard` 中加一个 `if` 分支，在 `removeCardAndRefillPyramid` 调用之后。不需要再写金字塔补牌逻辑。这就是消除重复的好处。

---

## 下一课预告

第 72 课：随机 AI——利用 Action 类型，实现 `getValidActions` 枚举所有合法操作，让 AI 能随机做出合法操作。
