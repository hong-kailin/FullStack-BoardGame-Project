# 第 37 课：Pyramid 组件（静态显示金字塔）

## 学习目标

- 理解如何新建第二个 React 组件
- 理解 `Card[][]` 这种二维数组如何渲染
- 用 JSX 显示三层金字塔卡牌

## 本课只做一件事

把游戏状态里的 `state.pyramid` 渲染到页面上。

本课不做：

- 点击购买卡牌
- 判断玩家宝石是否足够
- 回合切换
- 卡牌补牌

当前目标很简单：**先把卡牌显示出来**。

---

## 1. pyramid 的数据结构

在 `GameState` 里，金字塔数据是：

```typescript
pyramid: Card[][];
```

这是一个二维数组：

```text
pyramid
├── pyramid[0]：等级 1 卡牌列表
├── pyramid[1]：等级 2 卡牌列表
└── pyramid[2]：等级 3 卡牌列表
```

每一张卡牌大概长这样：

```typescript
{
  id: 17,
  level: 3,
  gem: "red",
  points: 5,
  crowns: 2,
  cost: { red: 0, blue: 4, green: 0, white: 4, black: 0, pearl: 2 }
}
```

本课要显示这些信息：

- 卡牌颜色 `gem`
- 声望点数 `points`
- 王冠数 `crowns`
- 费用 `cost`

---

## 2. 当前代码组织结构

```text
App.tsx
├── 创建游戏初始状态 state
├── 把 state.boardTokens 传给 Board
└── 把 state.pyramid 传给 Pyramid

Board.tsx
└── 显示版图

Pyramid.tsx
└── 显示金字塔卡牌
```

为什么新建 `Pyramid.tsx`？

因为“显示版图”和“显示金字塔”是两个不同的界面区域。

如果都写在 `App.tsx` 里，App 会越来越长。现在拆一个组件，App 只负责组合页面：

```tsx
<Board boardTokens={state.boardTokens} />
<Pyramid pyramid={state.pyramid} />
```

---

## 3. Pyramid.tsx 代码

```typescript
import type { Card } from "../game/types";

interface PyramidProps {
  pyramid: Card[][];
}

export default function Pyramid({ pyramid }: PyramidProps) {
  return (
    <div className="pyramid">
      <h3>金字塔</h3>
      {pyramid.map((levelCards, levelIndex) => (
        <div key={levelIndex} className="pyramid-level">
          <h4>等级 {levelIndex + 1}</h4>
          <div className="pyramid-cards">
            {levelCards.map((card) => (
              <div key={card.id} className="pyramid-card">
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

## 4. 为什么需要两层 map？

因为 `pyramid` 是二维数组。

第一层 `map` 遍历等级：

```typescript
pyramid.map((levelCards, levelIndex) => ...)
```

第二层 `map` 遍历某个等级下的卡牌：

```typescript
levelCards.map((card) => ...)
```

对应关系：

```text
pyramid.map
├── 等级 1
│   └── levelCards.map 渲染 5 张卡
├── 等级 2
│   └── levelCards.map 渲染 4 张卡
└── 等级 3
    └── levelCards.map 渲染 3 张卡
```

---

## 5. formatCost 是什么？

卡牌费用是对象：

```typescript
{ red: 0, blue: 4, green: 0, white: 4, black: 0, pearl: 2 }
```

直接显示对象不好看，所以写一个小函数转成字符串：

```typescript
function formatCost(cost: Card["cost"]): string {
  return Object.entries(cost)
    .filter(([, amount]) => amount > 0)
    .map(([color, amount]) => `${color}x${amount}`)
    .join(" ");
}
```

结果是：

```text
bluex4 whitex4 pearlx2
```

这个函数只服务当前组件显示，所以先放在 `Pyramid.tsx` 里。

---

## 6. App.tsx 如何使用 Pyramid

```typescript
import Pyramid from "./components/Pyramid";
```

然后在 JSX 中：

```tsx
<div className="game-layout">
  <Board boardTokens={state.boardTokens} />
  <Pyramid pyramid={state.pyramid} />
</div>
```

---

## 本课产出

运行：

```bash
npm run dev
```

页面上应该看到：

- 左边：5×5 版图
- 右边：三层金字塔卡牌

## 思考题（附答案）

1. **为什么 `formatCost` 不放到别的工具文件？**

   因为目前只有 `Pyramid.tsx` 用它。当前课程只服务当前目标，不提前抽象。

2. **为什么 Pyramid 不处理点击购买？**

   因为本课目标只是静态显示。购买逻辑会在后面的课程单独实现。
