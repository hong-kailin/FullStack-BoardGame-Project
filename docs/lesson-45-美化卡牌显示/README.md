# 第 45 课：美化卡牌显示

## 学习目标

- 理解如何让卡牌费用显示更直观
- 用宝石 emoji 代替文字费用

## 本课要做的事

当前卡牌显示：

```text
red
5 分
王冠：2
bluex4 whitex4 pearlx2
```

本课改为：

```text
🔴
5 分  👑x2
🔵x4 ⚪x4 🦪x2
```

用宝石 emoji 代替文字颜色名，让费用一目了然。

---

## 1. 颜色映射表

```typescript
const GEM_COLORS: Record<string, string> = {
  red: "#e74c3c", blue: "#3498db", green: "#2ecc71",
  white: "#ecf0f1", black: "#2c3e50",
};

const GEM_EMOJI: Record<string, string> = {
  red: "🔴", blue: "🔵", green: "🟢",
  white: "⚪", black: "⚫",
  pearl: "🦪",
};
```

---

## 2. formatCost 改为 emoji 版本

```typescript
function formatCost(cost: Card["cost"]): string {
  return Object.entries(cost)
    .filter(([, amount]) => amount > 0)
    .map(([color, amount]) => `${GEM_EMOJI[color] || color}x${amount}`)
    .join(" ");
}
```

---

## 3. 完整 Pyramid.tsx

```typescript
import type { Card } from "../game/types";

interface PyramidProps {
  pyramid: Card[][];
  onBuyCard: (cardId: number) => void;
}

const GEM_COLORS: Record<string, string> = {
  red: "#e74c3c", blue: "#3498db", green: "#2ecc71",
  white: "#ecf0f1", black: "#2c3e50",
};

const GEM_EMOJI: Record<string, string> = {
  red: "🔴", blue: "🔵", green: "🟢",
  white: "⚪", black: "⚫",
  pearl: "🦪",
};

function formatCost(cost: Card["cost"]): string {
  return Object.entries(cost)
    .filter(([, amount]) => amount > 0)
    .map(([color, amount]) => `${GEM_EMOJI[color] || color}x${amount}`)
    .join(" ");
}

export default function Pyramid({ pyramid, onBuyCard }: PyramidProps) {
  const reversed = [...pyramid].reverse();

  return (
    <div className="pyramid">
      <h3>金字塔</h3>
      {reversed.map((levelCards, i) => (
        <div key={i} className="pyramid-level">
          <div className="pyramid-cards">
            {levelCards.map((card) => (
              <div
                key={card.id}
                className="pyramid-card"
                style={{ borderColor: GEM_COLORS[card.gem] || "#999" }}
                onClick={() => onBuyCard(card.id)}
              >
                <div className="card-gem" style={{ color: GEM_COLORS[card.gem] }}>
                  {card.gem}
                </div>
                <div className="card-points">{card.points} 分</div>
                {card.crowns > 0 && <div className="card-crowns">👑x{card.crowns}</div>}
                <div className="card-cost">{formatCost(card.cost)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 3.1 为什么用 reverse？

`pyramid` 的数据结构是 `[等级1卡牌, 等级2卡牌, 等级3卡牌]`。

等级 1 有 5 张卡，等级 2 有 4 张，等级 3 有 3 张。

金字塔应该是上面窄、下面宽：

```text
    [卡] [卡] [卡]         ← 等级 3（3 张）
  [卡] [卡] [卡] [卡]      ← 等级 2（4 张）
[卡] [卡] [卡] [卡] [卡]   ← 等级 1（5 张）
```

所以用 `reverse()` 把数组反转，等级 3 先渲染。

---

## 4. 布局调整

为了让页面更宽敞，版图更大：

```css
.app {
  max-width: 1100px;   /* 之前是 600px */
}

.board-grid {
  grid-template-columns: repeat(5, 64px);  /* 之前是 48px */
  grid-template-rows: repeat(5, 64px);
}

.board-cell {
  font-size: 28px;  /* 之前是 22px */
}
```

金字塔卡牌改为固定宽度、居中：

```css
.pyramid-card {
  width: 100px;     /* 之前是 min-width: 90px */
  text-align: center;
}
```

去掉等级文字，只显示卡牌本身，视觉上更像金字塔。

```css
.pyramid-card {
  border: 2px solid;
  border-radius: 6px;
  background: #f4f3ec;
  padding: 8px;
  min-width: 90px;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.15s;
}

.pyramid-card:hover {
  transform: translateY(-2px);
  box-shadow: rgba(0, 0, 0, 0.1) 0 4px 8px;
}

.card-gem {
  font-weight: bold;
  font-size: 16px;
  text-transform: uppercase;
}

.card-points {
  font-size: 20px;
  font-weight: bold;
}

.card-crowns {
  font-size: 14px;
}

.card-cost {
  font-size: 12px;
  margin-top: 4px;
}
```

---

## 本课产出

运行 `npm run dev`：

1. 每张卡牌边框颜色对应宝石颜色
2. 费用用 emoji 显示，如 🔵x4 ⚪x4 🦪x2
3. 卡牌悬停时浮起效果

## 思考题

1. **为什么 `GEM_COLORS` 和 `GEM_EMOJI` 要分开定义？**

   一个用于 CSS 颜色值，一个用于显示 emoji。用途不同，分开更清晰。

2. **`{card.crowns > 0 && <div>...</div>}` 这种写法叫什么？**

   条件渲染。如果 `card.crowns > 0` 为真，渲染后面的 JSX；为假则忽略。