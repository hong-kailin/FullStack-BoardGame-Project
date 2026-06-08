# 第 38 课：PlayerInfo 组件（静态显示）

## 学习目标

- 创建第三个 React 组件：玩家信息面板
- 理解如何在组件中调用游戏逻辑函数（`getTotalPoints`、`getTotalCrowns`、`getPlayerBonuses`）
- 理解如何并排渲染两个玩家信息

## 本课只做一件事

把两个玩家的信息显示在页面上：

```text
玩家 1
🔴x3 🟢x1 🟡x1
声望: 0  王冠: 0  卡牌: 0 张
奖励: 无

玩家 2
🔴x2 🔵x1 ⚫x2
声望: 0  王冠: 0  卡牌: 0 张
奖励: 无
```

本课不做：

- 当前回合玩家高亮
- 切换回合
- 购买卡牌

---

## 1. player 的数据结构

```typescript
interface Player {
  id: number;
  name: string;
  tokens: Record<TokenType, number>;
  cards: Card[];
  royalCards: RoyalCard[];
  reservedCards: Card[];
  privileges: number;
}
```

PlayerInfo 组件需要显示：

| 字段 | 显示方式 | 数据来源 |
|------|----------|----------|
| `name` | 玩家名称 | 直接读取 |
| `tokens` | 各色标记数量 | 直接读取 |
| 声望点数 | 购买卡牌上的分数总和 | 调用 `getTotalPoints()` |
| 王冠数 | 卡牌王冠总和 | 调用 `getTotalCrowns()` |
| 卡牌数 | 已购买的卡牌数量 | `player.cards.length` |
| 奖励 | 各色宝石折扣 | 调用 `getPlayerBonuses()` |

---

## 2. 当前代码组织结构

```text
APP
├── 创建游戏状态 state
├── Board
│   └── 显示版图
├── Pyramid
│   └── 显示金字塔
└── PlayerInfo x 2
    ├── 显示玩家 1 信息
    └── 显示玩家 2 信息
```

注意：这里是两个 `PlayerInfo` 组件，分别传入不同的 `player` 数据。

```tsx
<PlayerInfo player={state.players[0]} />
<PlayerInfo player={state.players[1]} />
```

复用同一个组件，传不同 props，这是 React 组件复用的基本方式。

---

## 3. PlayerInfo.tsx 代码

```typescript
import type { Player } from "../game/types";
import { getPlayerBonuses } from "../game/purchase";
import { getTotalPoints, getTotalCrowns } from "../game/game";

interface PlayerInfoProps {
  player: Player;
}

const TOKEN_LABELS: Record<string, string> = {
  red: "🔴", blue: "🔵", green: "🟢",
  white: "⚪", black: "⚫",
  pearl: "🦪", gold: "🟡",
};

export default function PlayerInfo({ player }: PlayerInfoProps) {
  const bonuses = getPlayerBonuses(player);

  const tokenDisplay = Object.entries(player.tokens)
    .filter(([, amount]) => amount > 0)
    .map(([type, amount]) => `${TOKEN_LABELS[type]}x${amount}`)
    .join(" ");

  const bonusDisplay = Object.entries(bonuses)
    .filter(([, amount]) => amount > 0)
    .map(([color, amount]) => `${color}x${amount}`)
    .join(" ");

  return (
    <div className="player-info">
      <h3>{player.name}</h3>
      <div className="player-tokens">{tokenDisplay || "无"}</div>
      <div className="player-stats">
        <span>声望: {getTotalPoints(player)}</span>
        <span>王冠: {getTotalCrowns(player)}</span>
        <span>卡牌: {player.cards.length} 张</span>
      </div>
      <div className="player-bonuses">奖励: {bonusDisplay || "无"}</div>
    </div>
  );
}
```

---

## 4. 逐段讲解

### 引入游戏逻辑函数

```typescript
import { getPlayerBonuses } from "../game/purchase";
import { getTotalPoints, getTotalCrowns } from "../game/game";
```

这些函数是之前终端版写好的，直接复用。

`getTotalPoints` 遍历所有卡牌，累计分数。

`getTotalCrowns` 遍历所有卡牌，累计王冠。

`getPlayerBonuses` 遍历所有卡牌，按颜色汇总奖励数量。

### tokenDisplay

```typescript
const tokenDisplay = Object.entries(player.tokens)
  .filter(([, amount]) => amount > 0)
  .map(([type, amount]) => `${TOKEN_LABELS[type]}x${amount}`)
  .join(" ");
```

`player.tokens` 是一个对象，比如：

```typescript
{ red: 3, blue: 0, green: 1, white: 0, black: 0, pearl: 0, gold: 1 }
```

处理步骤：

1. `Object.entries()` 转成 `[["red", 3], ["blue", 0], ...]`
2. `.filter()` 去掉数量为 0 的条目
3. `.map()` 转换成 `["🔴x3", "🟢x1", "🟡x1"]`
4. `.join(" ")` 拼接成 `"🔴x3 🟢x1 🟡x1"`

### bonusDisplay

与 tokenDisplay 逻辑相同，只是数据来源变成 `bonuses`。

---

## 5. App.tsx 中使用 PlayerInfo

```typescript
import PlayerInfo from "./components/PlayerInfo";
```

JSX 中：

```tsx
<div className="players">
  <PlayerInfo player={state.players[0]} />
  <PlayerInfo player={state.players[1]} />
</div>
```

---

## 本课产出

运行：

```bash
npm run dev
```

页面应该显示：

- 左上：版图（5×5 宝石网格）
- 右上：金字塔（三层卡牌）
- 下方：两个玩家信息面板

## 思考题（附答案）

1. **为什么 `getTotalPoints` 和 `getPlayerBonuses` 不写在组件里，而是从 game/ 目录导入？**

   因为它们是纯游戏逻辑，与 React 无关。写在组件外，终端版、AI、测试都可以复用。

2. **两个 `<PlayerInfo>` 组件是同一个函数执行两次吗？**

   是的。React 会根据 JSX 中的 `<PlayerInfo>` 出现次数分别执行。两个组件各自独立，互不影响。