# 第 66 课：皇室卡牌

## 学习目标

- 理解皇室卡牌的触发条件和作用
- 添加 4 张皇室卡牌数据（含能力）
- 实现王冠门槛检测：达到 3/6 王冠时触发选择
- 实现 `handleClaimRoyalCard`：玩家从可用皇室卡牌中任选一张
- 结算皇室卡牌的能力
- 前端显示皇室卡牌区域和选择面板

---

## 核心概念讲解

### 1. 皇室卡牌是什么？

皇室卡牌是游戏中特殊的奖励卡牌，满足条件时自动触发选择。它们不花钱，但能提供额外的声望点和能力。

### 2. 触发条件

| 门槛 | 触发时机 | 效果 |
|------|----------|------|
| 第 3 个王冠 | 购买卡牌后总王冠数 ≥ 3 | 从 4 张皇室卡牌中任选 1 张 |
| 第 6 个王冠 | 购买卡牌后总王冠数 ≥ 6 | 从剩余皇室卡牌中任选 1 张 |

**关键**：每个门槛只能触发一次。如果玩家从 2 王冠直接跳到 5 王冠（跳过了 3），则第 1 张皇室卡牌永久错过。

### 3. 4 张皇室卡牌

| ID | 声望 | 能力 |
|----|------|------|
| 101 | +2 分 | 获得 1 个特权 |
| 102 | +2 分 | 额外回合 |
| 103 | +2 分 | 从对手拿取 1 个宝石 |
| 104 | +3 分 | 无能力 |

### 4. 设计决策

| 决策 | 选择 | 原因 |
|------|------|------|
| 选择方式 | 玩家从可用列表中任选 | 规则要求"任意拿" |
| 门槛记录 | `claimedRoyalThresholds` 数组 | 记录已领取的门槛，防止重复触发 |
| 能力结算 | 复用 `resolveCardAbility` | 与卡牌能力使用同一套逻辑 |
| 触发时机 | 购买卡牌后立即触发 | 在切换玩家之前，先让玩家选皇室卡牌 |

---

## 逐行代码讲解

### types.ts — RoyalCard 和 Player 改动

**RoyalCard 去掉 requirement，保留 ability**：
```ts
export interface RoyalCard {
  id: number;
  points: number;
  crowns: number;
  ability: CardAbility | null;
}
```

皇室卡牌不再需要奖励要求检查，只凭王冠数触发。`crowns` 保留但当前皇室卡牌都设为 0（皇室卡牌本身不提供王冠）。

**Player 新增 claimedRoyalThresholds**：
```ts
claimedRoyalThresholds: number[];  // 已领取皇室卡牌的王冠门槛
```

用来记录玩家已经领过哪个门槛的卡牌，防止重复触发。

**GameState 新增 pendingRoyalThresholds**：
```ts
pendingRoyalThresholds: number[];
```

当玩家购买卡牌达到新门槛时，先把门槛值存在这里。前端检测到这个字段不为空时，显示皇室卡牌选择面板。

### card-pool.ts — 皇室卡牌数据

```ts
const royalCards: RoyalCard[] = [
  { id: 101, points: 2, crowns: 0, ability: "take_privilege" },
  { id: 102, points: 2, crowns: 0, ability: "extra_turn" },
  { id: 103, points: 2, crowns: 0, ability: "take_from_opponent" },
  { id: 104, points: 3, crowns: 0, ability: null },
];
```

4 张卡牌，3 张有能力的 +2 分，1 张无能力的 +3 分（高分补偿无能力）。

### game.ts — checkRoyalCardEligibility

```ts
export function checkRoyalCardEligibility(
  player: Player
): number[] {
  const crowns = getTotalCrowns(player);
  const newThresholds: number[] = [];

  if (crowns >= 3 && !player.claimedRoyalThresholds.includes(3)) {
    newThresholds.push(3);
  }
  if (crowns >= 6 && !player.claimedRoyalThresholds.includes(6)) {
    newThresholds.push(6);
  }

  return newThresholds;
}
```

- 检查当前王冠数是否 ≥ 3/6
- 检查该门槛是否已被领取过
- 返回新解锁的门槛列表（可能同时达到两个门槛吗？不会，因为一次性最多买一张卡牌，卡牌最多提供 3 王冠）

### gameState.ts — handleBuyCard 改动

购买卡牌后，先检查皇室卡牌资格：

```ts
const newThresholds = checkRoyalCardEligibility(newPlayer);
if (newThresholds.length > 0) {
  // 保存状态并设置 pendingRoyalThresholds
  // 返回消息让前端显示选择面板
  return {
    state: {
      ...state,
      players: newPlayers,
      pyramid: finalPyramid,
      decks: finalDecks,
      bag: newBag,
      pendingRoyalThresholds: newThresholds,
    },
    message: `${player.name} 达到了 ${newThresholds.join("/")} 王冠，请选择一张皇室卡牌！`
  };
}
```

注意：这里**不切换玩家**，也不结算卡牌能力。先让玩家选皇室卡牌。皇室卡牌选完后，才会继续后面的流程。

如果没触发皇室卡牌，则正常检查胜利条件、结算能力、切换玩家。

### gameState.ts — handleClaimRoyalCard

```ts
export function handleClaimRoyalCard(
  state: GameState,
  royalCardId: number
): { state: GameState; message: string } {
```

**查找卡牌**：
```ts
const card = state.availableRoyalCards.find(c => c.id === royalCardId);
if (!card) return { state, message: "皇室卡牌不存在" };
```

**更新玩家**：
```ts
const newPlayer = {
  ...player,
  royalCards: [...player.royalCards, card],
  claimedRoyalThresholds: [...player.claimedRoyalThresholds],
};

for (const t of state.pendingRoyalThresholds) {
  if (!newPlayer.claimedRoyalThresholds.includes(t)) {
    newPlayer.claimedRoyalThresholds.push(t);
  }
}
```

将选中的皇室卡牌加入玩家手牌，记录已领取的门槛。

**移除已选卡牌**：
```ts
const newAvailable = state.availableRoyalCards.filter(c => c.id !== royalCardId);
```

**结算能力**：
```ts
const stateAfterClaim = {
  ...state,
  players: newPlayers,
  availableRoyalCards: newAvailable,
  pendingRoyalThresholds: [],
};

const abilityResult = resolveCardAbility(stateAfterClaim, card);
```

清空 `pendingRoyalThresholds`，调用 `resolveCardAbility` 结算皇室卡牌的能力。

注意：`resolveCardAbility` 的参数类型改为 `{ ability: CardAbility | null; gem?: GemColor }`，这样它既能接受 `Card` 也能接受 `RoyalCard`。

### 前端 — 皇室卡牌选择面板

```tsx
{state.pendingRoyalThresholds.length > 0 && (
  <div className="royal-claim-panel">
    <div className="message">达到 {state.pendingRoyalThresholds.join("/")} 王冠！请选择一张皇室卡牌：</div>
    <div className="royal-claim-list">
      {state.availableRoyalCards.map((card) => (
        <div
          key={card.id}
          className="royal-claim-card"
          onClick={() => {
            const result = handleClaimRoyalCard(state, card.id);
            setState(result.state);
            setMessage(result.message);
          }}
        >
          <div className="royal-claim-points">{card.points} 分</div>
          {card.ability && (
            <div className="royal-claim-ability">
              {{ extra_turn: "🔄 额外回合", take_privilege: "⭐ 获得特权", ... }[card.ability]}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}
```

- 当 `pendingRoyalThresholds` 不为空时，显示选择面板
- 点击卡牌调用 `handleClaimRoyalCard`
- 选择后面板消失，继续游戏流程

### 前端 — 皇室卡牌显示

在金字塔下方显示当前可用的皇室卡牌（供玩家预览）：

```tsx
{state.availableRoyalCards.length > 0 && (
  <div className="royal-cards">
    <h3>皇室卡牌</h3>
    <div className="royal-list">
      {state.availableRoyalCards.map((card) => (
        <div key={card.id} className="royal-card">
          <div className="royal-points">{card.points} 分</div>
          {card.ability && <div className="royal-ability">...能力图标...</div>}
        </div>
      ))}
    </div>
  </div>
)}
```

---

## 本课产出

| 文件 | 改动 |
|------|------|
| `packages/core/src/types.ts` | `RoyalCard` 去掉 `requirement`，保留 `ability`；`Player` 新增 `claimedRoyalThresholds`；`GameState` 新增 `pendingRoyalThresholds` |
| `packages/core/src/card-pool.ts` | 4 张皇室卡牌数据改为 2-3 分 + 能力 |
| `packages/core/src/game.ts` | `checkRoyalCardEligibility` 改为返回新解锁的门槛列表 |
| `packages/core/src/gameState.ts` | `resolveCardAbility` 参数类型兼容 `RoyalCard`；`handleBuyCard` 中插入皇室卡牌触发逻辑；新增 `handleClaimRoyalCard` |
| `packages/core/src/index.ts` | 导出 `handleClaimRoyalCard` |
| `packages/web/src/App.tsx` | 新增皇室卡牌选择面板和显示区域 |
| `packages/web/src/App.css` | 新增皇室卡牌相关样式 |

### 验证方式

```bash
# 编译检查
npx tsc --noEmit -p packages/core/tsconfig.json
npx tsc --noEmit -p packages/web/tsconfig.json

# 启动前端
npm run dev
# → 金字塔下方显示 4 张皇室卡牌（预览）
# → 购买卡牌使王冠数达到 3 → 弹出选择面板
# → 选择一张 → 获得分数 + 结算能力
# → 达到 6 王冠 → 再从剩余卡牌中选一张
```

---

## 思考题

1. 为什么 `handleBuyCard` 在触发皇室卡牌时**不切换玩家**？
2. 如果玩家选择了"额外回合"的皇室卡牌，会发生什么？
3. `claimedRoyalThresholds` 为什么用数组而不是布尔值？

---

## 思考题答案

### 1. 为什么不切换玩家？

因为皇室卡牌选择是购买流程的一部分。玩家购买卡牌 → 触发皇室卡牌选择 → 选完后**继续结算卡牌能力** → 最后才切换玩家。如果在皇室卡牌选择时就切换了玩家，轮到对手选皇室卡牌了，这不对。

### 2. 额外回合的皇室卡牌？

`handleClaimRoyalCard` 调用 `resolveCardAbility` 处理能力，但 `handleClaimRoyalCard` 本身不处理 `currentPlayerIndex` 的切换。这意味着选择"额外回合"皇室卡牌后，回合不会切换——当前玩家继续执行下一个回合。这符合规则。

### 3. 为什么用数组？

虽然当前只有 3 和 6 两个门槛，用两个布尔值（`hasClaimed3`、`hasClaimed6`）也可以。但用数组更通用——如果以后规则增加更多门槛（比如 9 王冠），不需要改类型定义。数组的 `includes` 方法可以处理任意数量的门槛值。

---

## 下一课预告

第 67 课：随机 AI——定义 Action 类型，实现 getValidActions，让 AI 能随机做出合法操作。
