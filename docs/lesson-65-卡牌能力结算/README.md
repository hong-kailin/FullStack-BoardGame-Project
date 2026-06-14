# 第 65 课：卡牌能力结算

## 学习目标

- 理解五种卡牌能力的效果
- 定义 `CardAbility` 类型，给卡牌数据添加能力字段
- 实现 `resolveCardAbility`：购买卡牌后触发能力
- 修改 `handleBuyCard`：在购买流程中插入能力结算
- 前端显示卡牌能力图标

---

## 核心概念讲解

### 1. 五种卡牌能力

| 能力 | 枚举值 | 效果 |
|------|--------|------|
| 额外回合 | `extra_turn` | 购买后不切换玩家，当前玩家再执行一个回合 |
| 获得特权 | `take_privilege` | 购买后当前玩家获得 1 个特权 |
| 从对手拿标记 | `take_from_opponent` | 购买后从对手处随机拿取 1 个非黄金标记 |
| 拿取同色标记 | `take_matching_token` | 购买后从版图上拿取 1 个与卡牌同色的标记 |

**设计说明**：`take_matching_token` 从版图拿取 1 个与卡牌颜色相同的标记。

### 2. 能力触发时机

能力在**购买卡牌后立即触发**，在切换玩家之前。流程：

```
购买卡牌 → 扣除标记 → 添加卡牌到玩家手牌 → 检查胜利条件 → 结算能力 → 切换玩家
```

如果能力是"额外回合"，则不切换玩家。

### 3. 能力分配策略

不是所有卡牌都有能力。我们给部分等级 2 和等级 3 的卡牌分配了能力，等级 1 的卡牌没有能力：

| 卡牌 ID | 等级 | 颜色 | 能力 |
|---------|------|------|------|
| 9 | 2 | 红 | `take_matching_token` |
| 11 | 2 | 蓝 | `take_privilege` |
| 13 | 2 | 绿 | `take_from_opponent` |
| 15 | 2 | 白 | `extra_turn` |
| 16 | 2 | 黑 | 无 |
| 17 | 3 | 红 | `extra_turn` |
| 19 | 3 | 蓝 | `take_privilege` |
| 21 | 3 | 绿 | `take_from_opponent` |
| 23 | 3 | 白 | 无 |
| 24 | 3 | 黑 | `take_matching_token` |

这样分配保证了四种能力各出现两次（等级 2 和等级 3 中各一次）。

---

## 逐行代码讲解

### types.ts — CardAbility 类型

```ts
export type CardAbility = "extra_turn" | "take_privilege" | "take_from_opponent" | "take_matching_token" | "copy_bonus";
```

这是一个**联合类型**（union type），表示 `ability` 字段只能取这五个字符串值之一。

```ts
export interface Card {
  // ... 已有字段
  ability: CardAbility | null;  // 卡牌能力，购买后触发
}
```

`| null` 表示卡牌可以没有能力。等级 1 的卡牌全部为 `null`。

### card-pool.ts — 给卡牌加 ability 字段

每张卡牌都加上了 `ability: null` 或具体的能力值：

```ts
{ id: 9, level: 2, gem: "red", points: 3, crowns: 1, bonusCount: 1, cost: { ... }, ability: "take_matching_token" },
```

改动量最大但最机械——24 张卡牌每张都加了一个字段。

### gameState.ts — resolveCardAbility

```ts
function resolveCardAbility(
  state: GameState,
  card: Card
): { state: GameState; message: string } {
  if (!card.ability) return { state, message: "" };
```

没有能力的卡牌直接返回，不做任何修改。

**extra_turn（额外回合）**：

```ts
case "extra_turn":
  return { state, message: "获得额外回合！" };
```

最简单的实现——只返回一条消息，不修改状态。真正的"不切换玩家"逻辑在 `handleBuyCard` 中处理。

**take_privilege（获得特权）**：

```ts
case "take_privilege": {
  const privResult = givePrivilege(state, playerIndex);
  return {
    state: { ...state, players: privResult.players, privilegesAvailable: privResult.privilegesAvailable },
    message: "获得 1 个特权！"
  };
}
```

直接复用上一课写的 `givePrivilege` 函数，给当前玩家 1 个特权。

**take_from_opponent（从对手拿标记）**：

```ts
case "take_from_opponent": {
  const nonGoldTokens = (Object.keys(opponent.tokens) as TokenType[]).filter(
    t => t !== "gold" && (opponent.tokens[t] || 0) > 0
  );
  if (nonGoldTokens.length === 0) {
    return { state, message: "对手没有可拿取的标记" };
  }
  const takenType = nonGoldTokens[Math.floor(Math.random() * nonGoldTokens.length)];
  // ... 从对手减 1，给当前玩家加 1
}
```

1. 筛选对手持有的非黄金标记（不能抢黄金）
2. 如果对手什么都没有，返回提示
3. 随机选一种标记，从对手转移到当前玩家

**take_matching_token（拿取同色标记）**：

```ts
    case "take_matching_token": {
  const gemColor = card.gem;
  const newBoard = state.boardTokens.map(row => [...row]);
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (newBoard[r][c] === gemColor) {
        newBoard[r][c] = null;
        // 给当前玩家加 1 个该颜色标记
        return { state: { ...state, players: newPlayers, boardTokens: newBoard }, message: ... };
      }
    }
  }
  return { state, message: `版图上没有 ${gemColor} 标记可拿取` };
}
```

遍历 5×5 版图，找到第一个与卡牌同色的标记，从版图移除并加入玩家手中。如果版图上没有该颜色的标记，返回提示。

注意：这里**只拿 1 个**，不是拿所有同色标记。

### gameState.ts — handleBuyCard 改动

```ts
const stateAfterPurchase = {
  ...state,
  players: newPlayers,
  pyramid: finalPyramid,
  decks: finalDecks,
  bag: newBag,
};

const abilityResult = resolveCardAbility(stateAfterPurchase, card);
const isExtraTurn = card.ability === "extra_turn";

return {
  state: {
    ...abilityResult.state,
    currentPlayerIndex: isExtraTurn ? state.currentPlayerIndex : opponentIndex
  },
  message: abilityResult.message
    ? `${player.name} 购买了卡牌 ${cardId}。${abilityResult.message}`
    : `${player.name} 购买了卡牌 ${cardId}`
};
```

关键点：
1. 先构建"购买后的状态"（`stateAfterPurchase`），包含更新后的玩家、金字塔、袋子
2. 在这个状态上调用 `resolveCardAbility`
3. 如果是额外回合，`currentPlayerIndex` 不变（不切换玩家）
4. 如果有能力消息，拼接到购买消息后面

### Pyramid.tsx — 显示能力

```tsx
const ABILITY_LABELS: Record<string, string> = {
  extra_turn: "🔄 额外回合",
  take_privilege: "⭐ 获得特权",
  take_from_opponent: "👊 抢夺标记",
  take_matching_token: "🎨 拿取同色",
  copy_bonus: "📋 复制奖励",
};
```

在卡牌渲染中新增：

```tsx
{card.ability && <div className="card-ability">{ABILITY_LABELS[card.ability]}</div>}
```

只有有能力的卡牌才显示能力标签。

### App.css — 能力标签样式

```css
.card-ability {
  font-size: 11px;
  margin-top: 3px;
  padding: 2px 4px;
  background: rgba(241, 196, 15, 0.15);
  border-radius: 4px;
  color: #f39c12;
  font-weight: 600;
}
```

黄色背景 + 橙色文字，与普通卡牌信息区分开。

---

## 本课产出

| 文件 | 改动 |
|------|------|
| `packages/core/src/types.ts` | 新增 `CardAbility` 类型；`Card` 接口新增 `ability` 字段 |
| `packages/core/src/card-pool.ts` | 24 张卡牌全部加上 `ability` 字段，等级 2/3 各 5 张有实际能力 |
| `packages/core/src/gameState.ts` | 新增 `resolveCardAbility` 函数；修改 `handleBuyCard` 插入能力结算 |
| `packages/web/src/components/Pyramid.tsx` | 卡牌显示能力标签 |
| `packages/web/src/components/PlayerInfo.tsx` | 保留卡牌显示能力图标 |
| `packages/web/src/App.css` | 新增 `.card-ability` 和 `.reserved-ability` 样式 |

### 验证方式

```bash
# 编译检查
npx tsc --noEmit -p packages/core/tsconfig.json
npx tsc --noEmit -p packages/web/tsconfig.json

# 启动前端
npm run dev
# → 金字塔中部分卡牌显示能力标签（🔄/⭐/👊/🎨/📋）
# → 购买有能力的卡牌后，消息提示中显示能力效果
# → 购买"额外回合"卡牌后，回合不切换
```

---

## 思考题

1. 为什么 `resolveCardAbility` 要接收整个 `GameState` 而不是只接收 `Player`？
2. `take_from_opponent` 中为什么用随机选择而不是让玩家选择？
3. 如果购买卡牌后触发了"额外回合"，但当前玩家在额外回合中又购买了一张"额外回合"卡牌，会发生什么？

---

## 思考题答案

### 1. 为什么传整个 GameState？

因为不同能力需要修改状态的不同部分：
- `take_privilege` 需要修改 `players` 和 `privilegesAvailable`
- `take_from_opponent` 需要修改两个玩家的标记
- `take_matching_token` 需要修改 `boardTokens`

如果只传 `Player`，能力函数没有能力修改版图或特权系统。

### 2. 为什么随机选择？

让玩家手动选择"从对手拿哪种标记"会增加交互复杂度（需要弹窗或额外点击）。当前实现用随机选择保持简单，后续可以优化为让玩家选择。

### 3. 连续额外回合？

会无限循环下去——玩家 A 购买额外回合卡牌 → 不切换 → 再买一张额外回合 → 又不切换 → ... 这在实际游戏中不太可能发生（需要连续买到两张额外回合卡牌且支付得起），但理论上存在。可以加一个"每回合最多触发一次额外回合"的限制，但目前先保持简单。

---

## 下一课预告

第 66 课：皇室卡牌——添加皇室卡牌数据，实现王冠检查逻辑，前端显示皇室卡牌区域。
