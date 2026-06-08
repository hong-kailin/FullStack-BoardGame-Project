# 第 47 课：已购买卡牌按颜色展示

## 学习目标

- 理解如何在 PlayerInfo 中展示已购买的卡牌
- 理解如何按宝石颜色分组排列卡牌

## 本课要做的事

当前 PlayerInfo 只显示卡牌数量，不显示具体卡牌。

本课：在 PlayerInfo 下方展示已购买的卡牌，按颜色分组。

---

## 1. 数据结构

`player.cards` 是一个 `Card[]` 数组。

每张卡牌有 `gem` 字段（颜色）和 `points`、`crowns` 等。

我们需要按颜色分组：

```typescript
const cardsByColor: Record<string, Card[]> = {
  red: [],
  blue: [],
  green: [],
  white: [],
  black: [],
};

for (const card of player.cards) {
  cardsByColor[card.gem].push(card);
}
```

---

## 2. PlayerInfo 改动

```typescript
const GEM_COLORS: Record<string, string> = {
  red: "#e74c3c", blue: "#3498db", green: "#2ecc71",
  white: "#ecf0f1", black: "#2c3e50",
};

const cardsByColor: Record<string, Card[]> = {
  red: [], blue: [], green: [], white: [], black: [],
};
for (const card of player.cards) {
  cardsByColor[card.gem].push(card);
}
```

JSX 中渲染：

```tsx
{player.cards.length > 0 && (
  <div className="owned-cards">
    {(["red", "blue", "green", "white", "black"] as const).map((color) =>
      cardsByColor[color].length > 0 && (
        <div key={color} className="color-group">
          <div className="color-group-header" style={{ color: GEM_COLORS[color] }}>
            {GEM_EMOJI[color]} x{cardsByColor[color].length}
          </div>
          <div className="color-group-cards">
            {cardsByColor[color].map((card) => (
              <div
                key={card.id}
                className="owned-card"
                style={{ borderColor: GEM_COLORS[color] }}
                title={`${card.points}分 ${card.crowns}冠`}
              >
                {card.points > 0 && <span>{card.points}</span>}
                {card.crowns > 0 && <span>👑{card.crowns}</span>}
              </div>
            ))}
          </div>
        </div>
      )
    )}
  </div>
)}
```

---

## 3. CSS 样式

```css
.owned-cards {
  margin-top: 8px;
}

.color-group {
  margin-bottom: 6px;
}

.color-group-header {
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 3px;
}

.color-group-cards {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.owned-card {
  border: 1px solid;
  border-radius: 4px;
  padding: 2px 5px;
  font-size: 11px;
  background: #f4f3ec;
  display: flex;
  gap: 3px;
}
```

---

## 本课产出

运行 `npm run dev`：

1. 购买卡牌后，PlayerInfo 下方按颜色展示
2. 每种颜色一行，显示该颜色有几张卡
3. 每张卡显示分数和王冠数

## 思考题

1. **为什么用 `(["red", "blue", ...] as const)` 而不是 `Object.keys(cardsByColor)`？**

   因为 `Object.keys` 返回 `string[]`，TypeScript 会报类型错误。`as const` 告诉 TS 这是一个固定数组。

2. **为什么已购买的卡牌用小卡片显示，不像金字塔那样完整？**

   因为空间有限。已购买的卡牌只展示关键信息（分数、王冠），不需要显示费用（已经买过了）。