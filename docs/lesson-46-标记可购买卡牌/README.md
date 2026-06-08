# 第 46 课：标记可购买卡牌

## 学习目标

- 理解如何根据玩家状态计算哪些卡牌可以购买
- 用高亮样式区分可购买和不可购买的卡牌

## 本课要做的事

当前所有卡牌看起来都一样，玩家必须自己算买不买得起。

本课：根据当前玩家的宝石和奖励，自动标记哪些卡牌可以购买。

---

## 1. 判断卡牌是否可购买

`canAfford` 函数已经在 `purchase.ts` 中实现了：

```typescript
export function canAfford(
  player: Player,
  actualCost: Record<GemColor | "pearl", number>
): boolean {
  // ...
}
```

它接收玩家和卡牌的实际费用，返回 true/false。

---

## 2. Pyramid 组件改动

```typescript
interface PyramidProps {
  pyramid: Card[][];
  onBuyCard: (cardId: number) => void;
  canAffordCard: (cardId: number) => boolean;
}
```

新增 `canAffordCard` props，它是一个函数，接收卡牌 ID，返回 true/false。

在渲染卡牌时，根据这个函数的结果加不同的 class：

```tsx
const affordable = canAffordCard(card.id);

<div
  className={`pyramid-card ${affordable ? "affordable" : "unaffordable"}`}
>
```

---

## 3. App.tsx 改动

```typescript
import { getPlayerBonuses, getActualCost, canAfford } from "./game/purchase";

const player = state.players[state.currentPlayerIndex];
const bonuses = getPlayerBonuses(player);

const canAffordCard = (cardId: number) => {
  for (const level of state.pyramid) {
    const card = level.find(c => c.id === cardId);
    if (card) {
      const actualCost = getActualCost(card, bonuses);
      return canAfford(player, actualCost);
    }
  }
  return false;
};
```

---

## 4. CSS 样式

```css
.pyramid-card.affordable {
  border-color: #2ecc71 !important;
  box-shadow: 0 0 6px rgba(46, 204, 113, 0.4);
}

.pyramid-card.unaffordable {
  opacity: 0.6;
}
```

---

## 本课产出

运行 `npm run dev`：

1. 买得起的卡牌有绿色边框高亮
2. 买不起的卡牌半透明
3. 切换回合后，高亮状态自动更新

## 思考题

1. **为什么 `canAffordCard` 写在 App 里，而不是 Pyramid 里？**

   因为 Pyramid 没有 `player` 数据。如果写在 Pyramid 里，需要把整个 player 传进去，但 Pyramid 只需要知道"能不能买"，不需要知道玩家的全部信息。

2. **为什么用 `!important` 在 affordable 的 border-color 上？**

   因为卡牌有内联样式 `style={{ borderColor: ... }}`，内联样式优先级高于 class。用 `!important` 覆盖内联样式。