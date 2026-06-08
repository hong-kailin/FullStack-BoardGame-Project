# 第 44 课：回合切换与当前玩家显示

## 学习目标

- 理解如何高亮当前回合玩家
- 理解如何禁用非当前玩家的操作
- 理解游戏结束时禁用所有操作

## 本课要做的事

1. PlayerInfo 高亮当前回合玩家
2. 非当前回合玩家不能操作
3. 游戏结束时禁用所有操作

---

## 1. PlayerInfo 高亮当前玩家

```typescript
interface PlayerInfoProps {
  player: Player;
  isCurrentPlayer: boolean;
}
```

通过 `isCurrentPlayer` 控制样式：

```tsx
<div className={`player-info ${isCurrentPlayer ? "current" : ""}`}>
  <h3>{isCurrentPlayer ? "▶ " : ""}{player.name}</h3>
```

CSS：

```css
.player-info.current {
  border-color: #aa3bff;
  background: rgba(170, 59, 255, 0.1);
}
```

---

## 2. App.tsx 改动

```typescript
<PlayerInfo player={state.players[0]} isCurrentPlayer={state.currentPlayerIndex === 0} />
<PlayerInfo player={state.players[1]} isCurrentPlayer={state.currentPlayerIndex === 1} />
```

禁用非当前玩家的操作：

```typescript
{!state.winner && selectedCells.length > 0 && (
  <button className="btn-take" onClick={handleTake}>
    拿取标记 ({selectedCells.length} 个)
  </button>
)}
```

---

## 3. 完整代码

### PlayerInfo.tsx

```typescript
import type { Player } from "../game/types";
import { getPlayerBonuses } from "../game/purchase";
import { getTotalPoints, getTotalCrowns } from "../game/game";

interface PlayerInfoProps {
  player: Player;
  isCurrentPlayer: boolean;
}

const TOKEN_LABELS: Record<string, string> = {
  red: "🔴", blue: "🔵", green: "🟢",
  white: "⚪", black: "⚫",
  pearl: "🦪", gold: "🟡",
};

export default function PlayerInfo({ player, isCurrentPlayer }: PlayerInfoProps) {
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
    <div className={`player-info ${isCurrentPlayer ? "current" : ""}`}>
      <h3>{isCurrentPlayer ? "▶ " : ""}{player.name}</h3>
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

## 本课产出

运行 `npm run dev`：

1. 当前回合玩家的面板有紫色边框和高亮
2. 玩家名称前有 ▶ 标记
3. 游戏结束后所有操作按钮消失

## 思考题

1. **为什么用 `!state.winner` 来控制按钮显示？**

   游戏结束后，玩家不能再做任何操作。通过 `state.winner` 判断游戏是否结束，控制按钮的显示。

2. **`isCurrentPlayer` 是 props，不是 state，为什么能跟着变化？**

   因为 `state.currentPlayerIndex` 变化后，App 重新渲染，传给 PlayerInfo 的 `isCurrentPlayer` 也会变化。