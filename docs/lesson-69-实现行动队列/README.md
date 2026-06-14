# 第 69 课：实现行动队列（Action Queue）

## 学习目标

- 理解"行动队列"模式解决了什么问题
- 实现 `executeAction` 返回统一的 `{ state, message, needsDiscard, pendingActions }`
- 实现 `processPendingActions` 递归处理系统自动行动
- 前端从调 `handleXxx` 改为调 `executeAction`

---

## 核心概念讲解

### 1. 为什么需要行动队列？

**之前**：前端直接调 8 个不同的 `handleXxx` 函数，每个返回结构不一样：

```ts
// 前端需要知道：
handleTakeTokens(state, positions)    // 返回 { state, message, needsDiscard }
handleBuyCard(state, cardId)          // 返回 { state, message }（没有 needsDiscard）
handlePass(state)                     // 返回 { state, message }
```

前端还得自己判断"接下来该做什么"——比如购买卡牌后如果有皇室卡牌门槛，前端要显示选择面板。这些逻辑散落在前端代码里。

**之后**：所有操作通过 `executeAction` 一个入口，返回统一结构：

```ts
const result = executeAction(state, { type: "buy_card", cardId });
// result = { state, message, needsDiscard, pendingActions }
```

`pendingActions` 表示"接下来系统需要自动执行的操作"。前端只需要检查 `needsDiscard` 和 `pendingActions`，不需要知道具体业务逻辑。

### 2. 行动队列的工作流程

```
用户操作 → executeAction → { state, pendingActions }
                                  ↓
                    processPendingActions 循环处理
                                  ↓
                    直到 pendingActions 为空
```

当前 `pendingActions` 还都是空数组（因为 `handleBuyCard` 内部已经处理了所有逻辑），但第 71 课重构 `handleBuyCard` 时，`pendingActions` 会真正派上用场。

### 3. 哪些操作需要用户输入？

| 需要用户输入 | 不需要用户输入 |
|-------------|---------------|
| 归还标记（`discard_tokens`） | 切换玩家 |
| 选择皇室卡牌（`claim_royal_card`） | 能力结算（未来） |
| 选择要拿取的标记 | 胜利检查（未来） |

需要用户输入的操作由前端状态管理（`discardMode`、`pendingRoyalThresholds`），不需要的由 `processPendingActions` 自动处理。

---

## 逐行代码讲解

### types.ts — PendingAction

```ts
export type PendingAction = Action;
```

当前 `PendingAction` 和 `Action` 是同一个类型。未来如果系统行动和玩家操作不同，可以拆开。

### action.ts — executeAction 返回 pendingActions

```ts
export function executeAction(
  state: GameState,
  action: Action
): { state: GameState; message: string; needsDiscard: number; pendingActions: PendingAction[] } {
  switch (action.type) {
    case "take_tokens":
      return { ...handleTakeTokens(state, action.positions), pendingActions: [] };
    case "buy_card":
      return { ...handleBuyCard(state, action.cardId), needsDiscard: 0, pendingActions: [] };
    // ...
  }
}
```

每个 `case` 都补上了 `pendingActions: []`。当前所有操作都不产生系统自动行动，所以都是空数组。第 71 课重构后，`buy_card` 会返回真正的 `pendingActions`。

### action.ts — processPendingActions

```ts
export function processPendingActions(
  state: GameState,
  pendingActions: PendingAction[]
): { state: GameState; pendingActions: PendingAction[] } {
  let currentState = state;
  let queue = [...pendingActions];

  while (queue.length > 0) {
    const action = queue.shift()!;
    const result = executeAction(currentState, action);
    currentState = result.state;
    queue = [...result.pendingActions, ...queue];
  }

  return { state: currentState, pendingActions: [] };
}
```

从队列头部取一个行动执行，执行后可能产生新的 `pendingActions`，追加到队列头部。循环直到队列为空。

### App.tsx — 前端改动

**导入**：从 8 个 `handleXxx` 改为只导入 `executeAction`：

```tsx
import { createInitialState, executeAction } from "@splendor/core";
```

**调用**：所有操作改为构造 Action 对象：

```tsx
// 之前
const result = handleTakeTokens(state, selectedCells);

// 之后
const result = executeAction(state, { type: "take_tokens", positions: selectedCells });
```

```tsx
// 之前
const result = handleBuyCard(state, cardId);

// 之后
const result = executeAction(state, { type: "buy_card", cardId });
```

```tsx
// 之前
const result = handlePass(state);

// 之后
const result = executeAction(state, { type: "pass" });
```

所有 8 个操作都做了同样的转换。

---

## 本课产出

| 文件 | 改动 |
|------|------|
| `packages/core/src/types.ts` | 新增 `PendingAction` 类型 |
| `packages/core/src/action.ts` | `executeAction` 返回 `pendingActions`；新增 `processPendingActions` |
| `packages/web/src/App.tsx` | 从调 `handleXxx` 改为调 `executeAction`，导入精简 |

### 验证方式

```bash
npx tsc --noEmit -p packages/core/tsconfig.json
npx tsc --noEmit -p packages/web/tsconfig.json
npm run dev
# 功能不变，所有操作仍然正常
```

---

## 思考题

1. 为什么 `pendingActions` 当前都是空数组？
2. `processPendingActions` 用 `while` 循环而不是递归，为什么？
3. 如果 `pendingActions` 中有一个操作失败了，会怎样？

---

## 思考题答案

### 1. 为什么 pendingActions 都是空数组？

因为 `handleBuyCard` 内部已经处理了所有逻辑（皇室卡牌检查、能力结算、切换玩家）。第 71 课重构 `handleBuyCard` 时，会把这些逻辑拆出来变成 `pendingActions`，让 `executeAction` 统一调度。

### 2. 为什么用 while 循环？

用 `while` 循环避免递归调用栈溢出。理论上 `pendingActions` 不会很深（最多 3-4 层），但用循环更安全、更易读。

### 3. 操作失败会怎样？

当前所有操作都是纯函数，不会抛出异常。如果某个操作返回了错误消息（如"宝石不足"），它仍然会返回一个有效的 `GameState`，只是状态没变。`processPendingActions` 会继续处理下一个操作。

---

## 下一课预告

第 70 课：引入 vitest 写规则测试——安装 vitest，把核心规则写成可重复执行的测试用例。
