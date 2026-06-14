# 第 68 课：引入 Action 类型系统

## 学习目标

- 理解"统一操作类型"解决了什么问题
- 定义 `Action` 联合类型，统一表示所有玩家操作
- 实现 `executeAction` 调度函数，根据 Action 类型分发到对应的 handle 函数
- 确保现有功能不变

---

## 核心概念讲解

### 0. ⚠️ 本课只定义类型和调度器，未接入执行流程

本课完成了两件事：
1. 定义 `Action` 联合类型
2. 实现 `executeAction` 调度函数

但**前端 App.tsx 仍然直接调用 `handleBuyCard`、`handleTakeTokens` 等旧函数**，没有使用 `executeAction`。真正的接入会在第 69 课（行动队列）中完成。

这样做是为了**分步走**：先定义好类型和调度器，确保它们正确，下一课再改前端调用方。如果一次性改太多，出了问题难以定位。

### 1. 为什么需要 Action 类型？

**之前**：每个操作有自己的函数签名，前端调用时得知道该调哪个函数、传什么参数：

```ts
handleTakeTokens(state, positions)    // 参数是 positions
handleBuyCard(state, cardId)          // 参数是 cardId
handleUsePrivilege(state, position)   // 参数是 position
handleTakeGold(state, position, cardId) // 参数是 position + cardId
```

问题：
- 前端需要知道 8 个不同函数的签名
- 每个函数的返回结构也不一样（有的有 `needsDiscard`，有的没有）
- 以后加新操作（比如 AI）得再记一个新函数

**之后**：所有操作统一成一个类型 + 一个函数（**但尚未接入前端，仍走旧函数**）：

```ts
type Action = { type: "take_tokens"; positions: [...] }
            | { type: "buy_card"; cardId: number }
            | ...

executeAction(state, action)  // 唯一入口（第 69 课才会真正调用）
```

前端只需要知道 `Action` 类型和 `executeAction` 一个函数。

### 2. Action 类型 = 联合类型

```ts
export type Action =
  | { type: "take_tokens"; positions: [number, number][] }
  | { type: "buy_card"; cardId: number }
  | { type: "pass" }
  | { type: "use_privilege"; position: [number, number] }
  | { type: "take_gold"; position: [number, number]; cardId: number }
  | { type: "claim_royal_card"; royalCardId: number }
  | { type: "refill_board" }
  | { type: "discard_tokens"; discards: TokenType[] };
```

每个变体都有一个 `type` 字段作为"标签"，TypeScript 根据 `type` 自动推断其他字段的类型。这叫**可辨识联合**（Discriminated Union）。

### 3. executeAction = 调度器

```ts
function executeAction(state, action): { state, message, needsDiscard }
```

根据 `action.type` 分发到对应的 handle 函数。这是一个**调度器模式**（Dispatcher Pattern）——所有请求经过一个入口，由调度器决定谁来处理。

---

## 逐行代码讲解

### types.ts — Action 类型

```ts
export type Action =
  | { type: "take_tokens"; positions: [number, number][] }
  | { type: "buy_card"; cardId: number }
  // ...
```

每个变体以 `|` 开头，`type` 字段是字符串字面量类型。TypeScript 的"可辨识联合"机制让你在 `switch` 中自动获得类型收窄：

```ts
switch (action.type) {
  case "take_tokens":
    // 这里 TypeScript 知道 action 有 positions 字段
    return handleTakeTokens(state, action.positions);
  case "buy_card":
    // 这里 TypeScript 知道 action 有 cardId 字段
    return handleBuyCard(state, action.cardId);
}
```

### action.ts — executeAction

```ts
export function executeAction(
  state: GameState,
  action: Action
): { state: GameState; message: string; needsDiscard: number } {
  switch (action.type) {
    case "take_tokens":
      return handleTakeTokens(state, action.positions);
    case "buy_card":
      return { ...handleBuyCard(state, action.cardId), needsDiscard: 0 };
    // ...
  }
}
```

注意 `handleBuyCard` 返回 `{ state, message }`（没有 `needsDiscard`），而 `executeAction` 统一返回 `{ state, message, needsDiscard }`。对于没有 `needsDiscard` 的操作，补上 `needsDiscard: 0`。

这保证了前端只需要处理一种返回结构。

### 设计决策

| 决策 | 选择 | 原因 |
|------|------|------|
| 位置 | `packages/core/src/action.ts` | 纯游戏逻辑，零依赖 |
| 返回结构 | 统一 `{ state, message, needsDiscard }` | 前端只需处理一种返回格式 |
| 现有函数 | 不改动，只加一层包装 | 最小改动，降低风险 |
| Action 类型 | 只包含玩家操作 | 系统自动触发的操作（如能力结算）留到下一课 |

---

## 本课产出

| 文件 | 改动 |
|------|------|
| `packages/core/src/types.ts` | 新增 `Action` 联合类型（8 种操作） |
| `packages/core/src/action.ts` | **新建**，实现 `executeAction` 调度函数 |
| `packages/core/src/index.ts` | 导出 `Action` 和 `executeAction` |

### 验证方式

```bash
npx tsc --noEmit -p packages/core/tsconfig.json
npx tsc --noEmit -p packages/web/tsconfig.json
npm run dev
# 功能不变，前端仍然能正常游戏（因为前端仍走旧函数，executeAction 尚未接入）
```

---

## 思考题

1. 为什么 `Action` 用联合类型而不是接口 + 枚举？
2. `executeAction` 的返回类型统一了，但前端目前还没有用 `executeAction`——什么时候切换？
3. 如果以后新增一种操作（比如 `"surrender"`），需要改哪些文件？

---

## 思考题答案

### 1. 为什么用联合类型？

联合类型的优势是**可辨识联合**——TypeScript 可以根据 `type` 字段自动推断其他字段的类型。如果用接口 + 枚举，需要在运行时手动判断类型并做类型断言，代码更啰嗦且不安全。

### 2. 什么时候切换？

下一课（第 69 课：行动队列）会统一切换。届时前端不再直接调用 `handleXxx`，而是构造 `Action` 对象传给 `executeAction`，然后处理返回的 `pendingActions`。

### 3. 新增操作需要改什么？

1. `types.ts` — 在 `Action` 联合类型中新增一个变体
2. `action.ts` — 在 `switch` 中新增一个 `case`
3. 实现对应的 `handleXxx` 函数（或在 `action.ts` 中直接处理）

三步，非常清晰。

---

## 下一课预告

第 69 课：实现行动队列——每个操作执行后返回后续待办行动列表，由统一执行器递归处理。
