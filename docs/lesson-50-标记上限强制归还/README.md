# 第 50 课：标记上限强制归还

## 学习目标

- 理解标记上限规则（最多 10 个）
- 理解自动归还逻辑

## 本课要做的事

游戏规则：回合结束时，如果玩家持有的标记超过 10 个，必须弃掉超出的部分。

当前 `enforceTokenLimit` 已经在 `game.ts` 中实现，并且在 `handleTakeTokens` 中被调用。

本课：添加提示信息，让玩家知道哪些标记被自动归还了。

---

## 1. enforceTokenLimit 的现有逻辑

```typescript
export function enforceTokenLimit(player: Player): Player {
  const totalTokens = Object.values(player.tokens).reduce((a, b) => a + b, 0);

  if (totalTokens <= 10) return player;

  let remaining = totalTokens - 10;
  const newTokens = { ...player.tokens };

  for (const type of ["pearl", "red", "blue", "green", "white", "black", "gold"] as const) {
    if (remaining <= 0) break;
    const discard = Math.min(remaining, newTokens[type] || 0);
    newTokens[type] = (newTokens[type] || 0) - discard;
    remaining -= discard;
  }

  return { ...player, tokens: newTokens };
}
```

归还顺序：珍珠 → 红 → 蓝 → 绿 → 白 → 黑 → 黄金。

---

## 2. handleTakeTokens 中已有调用

```typescript
newPlayer = enforceTokenLimit(newPlayer);
```

每次拿取标记后都会自动检查并归还。

---

## 3. 添加归还提示

修改 `handleTakeTokens`，返回消息中包含归还信息：

```typescript
const beforeTotal = Object.values(player.tokens).reduce((a, b) => a + b, 0);
const takenCount = result.taken.length;
const afterTotal = beforeTotal + takenCount;

let message = `${player.name} 拿取了 ${takenCount} 个标记`;

if (afterTotal > 10) {
  const discarded = afterTotal - 10;
  message += `，超过上限，自动归还 ${discarded} 个`;
}
```

---

## 本课产出

运行 `npm run dev`：

1. 拿取标记后，如果超过 10 个，消息中显示自动归还数量
2. 标记数量被限制在 10 个以内

## 思考题

1. **为什么归还顺序是珍珠优先？**

   珍珠比较稀有（总共只有 2 个），先归还珍珠可以减少珍珠的流通量。这是游戏设计者的选择。

2. **当前是自动归还，以后会改成玩家手动选择吗？**

   可以。当前先实现自动版本保证规则生效，后续可以改成弹出选择界面让玩家自己决定归还哪些。