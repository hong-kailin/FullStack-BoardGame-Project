# 第 42 课：给 Pyramid 添加购买功能

## 学习目标

- 理解如何给已有组件添加交互
- 实现点击卡牌购买

## 本课要做的事

上一课已经可以拿取标记了。本课让金字塔卡牌可以点击购买。

1. `Pyramid.tsx` — 新增 `onBuyCard` props，点击卡牌时触发
2. `App.tsx` — 接入 `handleBuyCard`

---

## 1. Pyramid.tsx 改动

```typescript
interface PyramidProps {
  pyramid: Card[][];
  onBuyCard: (cardId: number) => void;
}
```

卡牌上绑定点击事件：

```tsx
<div
  key={card.id}
  className="pyramid-card"
  onClick={() => onBuyCard(card.id)}
>
```

---

## 2. App.tsx 改动

```typescript
import { handleBuyCard } from "./game/gameState";

const handleBuy = (cardId: number) => {
  const result = handleBuyCard(state, cardId);
  setState(result.state);
  setMessage(result.message);
};

<Pyramid pyramid={state.pyramid} onBuyCard={handleBuy} />
```

---

## 3. 完整代码

### Pyramid.tsx

```typescript
import type { Card } from "../game/types";

interface PyramidProps {
  pyramid: Card[][];
  onBuyCard: (cardId: number) => void;
}

function formatCost(cost: Card["cost"]): string {
  return Object.entries(cost)
    .filter(([, amount]) => amount > 0)
    .map(([color, amount]) => `${color}x${amount}`)
    .join(" ");
}

export default function Pyramid({ pyramid, onBuyCard }: PyramidProps) {
  return (
    <div className="pyramid">
      <h3>金字塔</h3>
      {pyramid.map((levelCards, levelIndex) => (
        <div key={levelIndex} className="pyramid-level">
          <h4>等级 {levelIndex + 1}</h4>
          <div className="pyramid-cards">
            {levelCards.map((card) => (
              <div
                key={card.id}
                className="pyramid-card"
                onClick={() => onBuyCard(card.id)}
              >
                <div>{card.gem}</div>
                <div>{card.points} 分</div>
                <div>王冠：{card.crowns}</div>
                <div>{formatCost(card.cost)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 本课产出

运行 `npm run dev`：

1. 点击金字塔卡牌 → 如果宝石足够，购买成功，卡牌消失
2. 如果宝石不够 → 提示"宝石不足"

## 思考题

1. **为什么 `handleBuy` 不需要校验？**

   因为 `handleBuyCard` 内部已经做了校验（`canAfford`、`findCardInPyramid`），如果校验失败会返回错误消息，不会修改 state。

2. **购买后卡牌从金字塔消失，但玩家面板没有更新？**

   PlayerInfo 读取的是 `state.players`，而 `handleBuyCard` 返回的新 state 里 players 已经更新了。所以 PlayerInfo 会自动重新渲染。