# 第 43 课：跳过回合

## 学习目标

- 实现"跳过回合"按钮
- 理解最简单的操作：只切换 currentPlayerIndex

## 本课只做一件事

添加一个"跳过回合"按钮，点击后切换到对手的回合。

---

## 1. 代码改动

### App.tsx

```typescript
import { handlePass } from "./game/gameState";

const handleSkip = () => {
  const result = handlePass(state);
  setState(result.state);
  setMessage(result.message);
};
```

JSX 中加一个按钮：

```tsx
<button className="btn-pass" onClick={handleSkip}>
  跳过回合
</button>
```

---

## 2. handlePass 做了什么

```typescript
export function handlePass(state: GameState): { state: GameState; message: string } {
  const player = state.players[state.currentPlayerIndex];
  const opponentIndex = state.currentPlayerIndex === 0 ? 1 : 0;
  return {
    state: { ...state, currentPlayerIndex: opponentIndex },
    message: `${player.name} 跳过了回合`
  };
}
```

它只做了一件事：把 `currentPlayerIndex` 从 0 变成 1 或从 1 变成 0。

---

## 本课产出

运行 `npm run dev`：

1. 点击"跳过回合"按钮
2. 当前玩家切换
3. PlayerInfo 中当前回合玩家会变化（目前还没有高亮，下一课加）

## 思考题

1. **为什么 handlePass 这么简单？**

   因为跳过回合就是什么都不做，只切换玩家。真正的游戏逻辑（拿取、购买）已经在第 41、42 课实现了。

2. **为什么跳过回合后还要清空 selectedCells？**

   切换回合后，当前玩家变了，之前选中的格子应该清空。这个逻辑应该在 handleSkip 里加吗？还是由调用方处理？