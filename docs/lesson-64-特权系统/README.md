# 第 64 课：特权系统

## 学习目标

- 理解特权系统的完整规则
- 实现 `givePrivilege` 辅助函数：集中处理"给对手一个特权"的逻辑
- 实现 `handleUsePrivilege`：玩家消耗特权拿取标记
- 修改 `handleTakeTokens` 和 `handleRefillBoard`：使用 `givePrivilege` 替代直接修改
- 在前端添加"使用特权"按钮和交互

---

## 核心概念讲解

### 1. 特权是什么？

特权是游戏中的一种资源，玩家可以消耗它来**从版图上拿取任意 1 个非黄金标记**（无需满足相邻/共线条件）。

特权的来源：
- 非起始玩家在游戏开始时获得 1 个特权
- 拿取 3 个同色标记时，对手获得 1 个特权
- 拿取 2 个珍珠时，对手获得 1 个特权
- 执行"补充版图"时，对手获得 1 个特权

### 2. 特权转移规则

```
版图上有特权 → 从版图拿 → privilegesAvailable - 1
版图无特权，对手有特权 → 从对手处抢 → 对手 -1，目标 +1
版图无特权，对手也无特权 → 无事发生
```

这个规则在 `givePrivilege` 函数中统一处理，而不是分散在各个操作函数里。

### 3. 特权上限

每个玩家最多持有 3 个特权。当玩家获得特权时，如果已有 3 个，则无事发生。

---

## 逐行代码讲解

### types.ts — 新增字段

```ts
export interface GameState {
  // ... 已有字段
  privilegesAvailable: number;  // 版图上剩余的可分配特权数
}
```

`privilegesAvailable` 表示版图上还有多少个"空闲特权"。初始值为 2（规则规定有 3 个特权标记，其中 1 个已分配给非起始玩家）。当玩家获得特权时，如果这个值 > 0，就从这里扣减。

### gameState.ts — givePrivilege 辅助函数

```ts
function givePrivilege(
  state: GameState,
  targetPlayerIndex: number
): { players: [Player, Player]; privilegesAvailable: number } {
```

这个函数封装了"给某个玩家一个特权"的完整逻辑：

```ts
const opponentIndex = targetPlayerIndex === 0 ? 1 : 0;
const target = state.players[targetPlayerIndex];
const opponent = state.players[opponentIndex];
```

先确定目标玩家和对手。

**情况 1：版图上有特权**

```ts
if (state.privilegesAvailable > 0) {
  const newTarget = { ...target, privileges: Math.min(target.privileges + 1, 3) };
  // ... 返回新 players 和 privilegesAvailable - 1
}
```

从版图拿 1 个特权给目标玩家。`Math.min(..., 3)` 确保不超过上限。

**情况 2：版图无特权，从对手处抢**

```ts
if (opponent.privileges > 0) {
  const newOpponent = { ...opponent, privileges: opponent.privileges - 1 };
  const newTarget = { ...target, privileges: Math.min(target.privileges + 1, 3) };
  // ... 返回新 players
}
```

对手减少 1 个特权，目标增加 1 个特权。`privilegesAvailable` 保持 0。

**情况 3：双方都没有**

```ts
return { players: state.players, privilegesAvailable: state.privilegesAvailable };
```

什么都不做，原样返回。

### gameState.ts — 修改 handleTakeTokens

**改动前**：
```ts
if (result.opponentGetsPrivilege) {
  opponent = { ...opponent, privileges: (opponent.privileges || 0) + 1 };
}
```

直接给对手加 1 个特权，没有考虑特权转移规则和上限。

**改动后**：
```ts
if (result.opponentGetsPrivilege) {
  const privResult = givePrivilege(state, opponentIndex);
  opponent = privResult.players[opponentIndex];
  privilegesAvailable = privResult.privilegesAvailable;
}
```

调用 `givePrivilege` 统一处理，同时更新 `privilegesAvailable`。

### gameState.ts — 修改 handleRefillBoard

**改动前**：
```ts
opponent = { ...opponent, privileges: Math.min((opponent.privileges || 0) + 1, 3) };
```

**改动后**：
```ts
const privResult = givePrivilege(state, opponentIndex);
```

同样的逻辑，统一走 `givePrivilege`。

### gameState.ts — handleUsePrivilege

```ts
export function handleUsePrivilege(
  state: GameState,
  position: [number, number]
): { state: GameState; message: string; needsDiscard: number } {
```

**参数**：游戏状态 + 玩家点击的版图位置。

**校验**：
```ts
if (player.privileges <= 0) {
  return { state, message: "没有可用的特权", needsDiscard: 0 };
}

const token = state.boardTokens[position[0]][position[1]];
if (!token || token === "gold") {
  return { state, message: "该位置没有可拿取的非黄金标记", needsDiscard: 0 };
}
```

两重校验：① 玩家确实有特权；② 目标位置有非黄金标记。

**执行**：
```ts
const newBoard = state.boardTokens.map(row => [...row]);
newBoard[position[0]][position[1]] = null;

const newPlayer = {
  ...player,
  tokens: { ...player.tokens },
  privileges: player.privileges - 1,  // 消耗 1 个特权
};
newPlayer.tokens[token] = (newPlayer.tokens[token] || 0) + 1;  // 拿取标记
```

从版图移除标记，加入玩家手中，特权数 -1。

**标记上限检查**：
```ts
const totalTokens = Object.values(newPlayer.tokens).reduce((a, b) => a + b, 0);
const needsDiscard = totalTokens > 10 ? totalTokens - 10 : 0;
```

使用特权拿取标记也可能导致标记超上限，需要触发归还流程。

**返回新状态**：
```ts
return {
  state: {
    ...state,
    players: newPlayers,
    boardTokens: newBoard,
    privilegesAvailable: state.privilegesAvailable + 1,  // 特权放回版图
  },
  // ...
};
```

注意：使用特权时，特权放回版图（`privilegesAvailable + 1`）。这模拟了"玩家放回特权标记到版图上，然后拿取一个非黄金标记"的物理动作。

### App.tsx — 前端改动

**新增 state**：
```ts
const [privilegeMode, setPrivilegeMode] = useState(false);
```

控制是否处于"使用特权"模式。

**handleCellClick 中特权模式的处理**：
```ts
if (privilegeMode) {
  const token = state.boardTokens[row][col];
  if (!token || token === "gold") {
    setError("只能拿取非黄金标记");
    return;
  }
  const result = handleUsePrivilege(state, [row, col]);
  setState(result.state);
  setPrivilegeMode(false);
  if (result.needsDiscard > 0) {
    setDiscardMode(true);
    setDiscardNeeded(result.needsDiscard);
    setDiscardSelection({});
  }
  setMessage(result.message);
  return;
}
```

在特权模式下点击版图格子：
1. 检查是否是非黄金标记
2. 调用 `handleUsePrivilege`
3. 退出特权模式
4. 如果需要归还标记，进入归还模式

**"使用特权"按钮**：
```tsx
{player.privileges > 0 && (
  <button
    className={`btn-pass ${privilegeMode ? "active" : ""}`}
    onClick={() => {
      setPrivilegeMode(!privilegeMode);
      setSelectedCells([]);
      setError(privilegeMode ? "" : "请点击版图上的一个非黄金标记");
    }}
  >
    {privilegeMode ? "取消使用特权" : `使用特权 (${player.privileges})`}
  </button>
)}
```

- 只有当前玩家有特权时才显示
- 点击进入/退出特权模式
- 进入时清除已选中的格子，显示提示信息

### PlayerInfo.tsx — 显示特权数

```tsx
<span>特权: {player.privileges}</span>
```

在玩家信息面板中显示当前持有的特权数量。

### App.css — 新增样式

```css
.btn-pass.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}
```

当"使用特权"按钮处于激活状态时，用强调色高亮显示，让玩家知道当前处于特权模式。

---

## 本课产出

| 文件 | 改动 |
|------|------|
| `packages/core/src/types.ts` | `GameState` 新增 `privilegesAvailable` 字段 |
| `packages/core/src/gameState.ts` | 新增 `givePrivilege` 辅助函数；新增 `handleUsePrivilege`；修改 `handleTakeTokens` 和 `handleRefillBoard` 使用 `givePrivilege` |
| `packages/core/src/index.ts` | 导出 `handleUsePrivilege` |
| `packages/web/src/App.tsx` | 新增 `privilegeMode` 状态；特权模式下的格子点击处理；"使用特权"按钮 |
| `packages/web/src/App.css` | 新增 `.btn-pass.active` 样式 |
| `packages/web/src/PlayerInfo.tsx` | 显示特权数 |

### 验证方式

```bash
# 编译检查
npx tsc --noEmit -p packages/core/tsconfig.json
npx tsc --noEmit -p packages/web/tsconfig.json

# 启动前端
npm run dev
# → 游戏开始时玩家 2 有 1 个特权
# → 拿取 3 个同色标记 → 对手获得特权
# → 点击"使用特权" → 点击版图上的非黄金标记 → 标记被拿取
# → 特权用完后按钮消失
```

---

## 思考题

1. 为什么要把 `givePrivilege` 抽成独立函数，而不是在每个操作函数里直接修改 `privileges`？
2. `handleUsePrivilege` 中为什么 `privilegesAvailable` 要 +1？
3. 如果玩家使用特权后标记超过 10 个，会发生什么？

---

## 思考题答案

### 1. 为什么抽成独立函数？

因为**三个地方**都需要"给对手一个特权"的逻辑：`handleTakeTokens`（3 同色/2 珍珠）、`handleRefillBoard`（补充版图）。如果分散写，特权转移规则（从版图拿 vs 从对手抢）改起来要改三处，容易漏。集中到 `givePrivilege` 后，一处改处处生效。

### 2. 为什么 privilegesAvailable 要 +1？

物理上，玩家使用特权时，是把版图上的特权标记**放回**到版图中央，然后拿取一个非黄金标记。所以 `privilegesAvailable` 增加 1，表示这个特权标记又回到了版图上可供分配。

### 3. 标记超上限会怎样？

`handleUsePrivilege` 返回 `needsDiscard > 0`，前端检测到后进入归还模式（`discardMode`），让玩家选择要归还的标记。归还的标记放回袋子。

---

## 下一课预告

第 65 课：卡牌能力结算——购买卡牌后触发额外效果（额外回合、拿取特权、从对手拿标记等）。
