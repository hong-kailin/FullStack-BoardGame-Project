# 第 75 课：用状态机重构 App.tsx

## 本课学习目标

- 理解"多个 boolean 标志"和"单一状态机"的区别
- 学会用 TypeScript 联合类型定义状态机
- 重构 App.tsx，消除模式冲突

## 核心概念

### 为什么多个 boolean 是坏设计？

当前 App.tsx 用四个独立 boolean 管理 UI 模式：

```ts
const [goldMode, setGoldMode] = useState(false);
const [discardMode, setDiscardMode] = useState(false);
const [privilegeMode, setPrivilegeMode] = useState(false);
```

问题：这些 boolean 可以任意组合，产生 2^4 = 16 种状态，但只有少数组合是合法的。

比如 `goldMode=true` 且 `privilegeMode=true` 同时存在时，UI 该渲染什么？代码没有处理这种情况，就会出 bug。

类比：就像红绿灯，如果三个灯各有一个开关，有人可能同时打开红和绿。而真正的红绿灯是一个状态机——只有一个"当前颜色"。

### 状态机方案

用一个 `uiPhase` 替代所有 boolean：

```ts
type UIPhase = "normal" | "gold_selecting" | "discarding" | "privilege_selecting";
```

任何时候只有一个 phase 激活，不可能冲突。

### 状态机 vs 多个 boolean

| | 多个 boolean | 单一状态机 |
|------|------|------|
| 可能状态数 | 2^n（组合爆炸） | n（线性） |
| 非法状态 | 可能存在 | 不可能存在 |
| 状态切换 | 需要手动清理其他 boolean | 直接赋值新 phase |
| 可读性 | 需要理解 boolean 组合含义 | 一个名字说清楚 |

---

## 实现方案

### 改动范围

- `packages/web/src/App.tsx` — 主要重构
- `packages/web/src/useGameController.ts` — 同步重构（这个文件目前未被使用，先跳过）

### 步骤

1. 定义 `UIPhase` 类型
2. 把 `goldMode`、`discardMode`、`privilegeMode` 替换为 `uiPhase`
3. 把 `discardNeeded`、`discardSelection` 保留为辅助状态（只在 `discarding` phase 时有意义）
4. 调整所有事件处理函数，改为设置 `uiPhase`
5. 调整 JSX 渲染逻辑，改为根据 `uiPhase` 判断

---

## 本课产出

- App.tsx 中不再有多个 boolean 模式标志
- 每个 UI 阶段互不冲突

## 验证方式

- 正常玩一局，所有操作（拿标记、买卡牌、黄金保留、特权、归还标记）流程正常
- 不会出现"该显示的没显示、不该显示的显示了"
