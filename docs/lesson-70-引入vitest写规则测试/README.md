# 第 70 课：引入 vitest 写规则测试

## 学习目标

- 理解"测试"是什么、为什么需要测试
- 安装 vitest 测试框架
- 学会设计测试用例：三段式（设置 → 执行 → 断言）
- 创建规则拆解文件（spec），将游戏规则细化为可测试的细则和测试点
- 编写 33 个规则测试覆盖 5 个规则类别

---

## 核心概念讲解

### 1. 测试是什么？用生活类比

想象你开了一家奶茶店，雇了一个新员工做奶茶。你怎么知道他做的对不对？

- **方式一**：等顾客投诉（= 用户发现 bug）
- **方式二**：你站在旁边看他做每一杯（= 手动测试）
- **方式三**：写一本操作手册，每做一杯对照检查一遍（= 自动化测试）

测试就是**写一段代码，自动检查另一段代码是否按预期运行**。

### 2. 为什么现在需要测试？

之前改代码全靠手动点页面验证，效率低、容易漏、改多了心里没底。

有了测试后：
- **改代码不怕改坏** — 跑一遍测试就知道有没有破坏现有规则
- **规则即文档** — 测试用例本身就是规则的自然语言描述
- **快速反馈** — 改完代码几秒就知道结果

### 3. 规则拆解文件（spec）

在写测试代码之前，先写**规则拆解文件**（`.md`），把游戏规则拆成两部分：

**规则细则**：每条规则一个编号，描述具体行为
```
### R-TT-03：3 同色触发对手特权
- 拿取 3 个标记且颜色全部相同时，对手获得 1 个特权
- 对手特权数 +1（受特权上限和转移规则约束）
```

**测试点表格**：每个测试点对应一条规则，方便追踪
```
| 编号 | 测试点 | 对应规则 |
|------|--------|----------|
| TT-03 | 拿取 3 个红色标记 → 对手特权 +1 | R-TT-03 |
```

这样做的目的是：
- **先想清楚再写代码** — 避免"想到哪写到哪"
- **规则和测试一一对应** — 知道每个规则有没有被测试覆盖
- **新人也能看懂** — 不用读代码就能知道游戏规则

### 4. vitest 是什么？

vitest 是一个 JavaScript/TypeScript 的测试框架。类比：vitest ≈ Python 的 pytest。

### 5. 测试的三段式结构

每个测试用例都遵循同样的结构：

```
1. 设置（Arrange）— 准备好测试需要的状态
2. 执行（Act）— 执行要测试的操作
3. 断言（Assert）— 检查结果是否符合预期
```

---

## 动手步骤

### 第一步：安装 vitest

```bash
npm install -w @splendor/core -D vitest
```

参数说明：
- `-w @splendor/core` — 安装到 core 子包（workspace）
- `-D` — 安装到 devDependencies

### 第二步：配置 vitest

在 `packages/core/` 下创建 `vitest.config.ts`：

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
```

### 第三步：添加 test 脚本

在 `packages/core/package.json` 中添加：

```json
"scripts": {
  "test": "vitest run"
}
```

之后用 `npm run test -w @splendor/core` 运行测试。

### 第四步：创建规则拆解文件

在 `tests/rules/specs/` 下创建 `.md` 文件，每个规则类别一个文件。例如 `take-tokens.md`：

```markdown
# 拿取标记规则拆解

### R-TT-01：基本拿取
- 玩家可以拿取 1 个非黄金标记
- 标记从版图移除，加入玩家手中

### R-TT-03：3 同色触发对手特权
- 拿取 3 个标记且颜色全部相同时，对手获得 1 个特权

## 测试点

| 编号 | 测试点 | 对应规则 |
|------|--------|----------|
| TT-01 | 拿取 1 个红色标记 → 版图移除、玩家获得 | R-TT-01 |
| TT-03 | 拿取 3 个红色标记 → 对手特权 +1 | R-TT-03 |
```

### 第五步：设计测试辅助函数

游戏状态 `GameState` 有很多字段，而且 `createInitialState()` 包含随机洗牌。所以需要辅助函数创建可控状态：

```ts
// 创建一个空的游戏状态，所有字段都有默认值
const state = createTestState();

// 覆盖某些字段
const state = createTestState({
  boardTokens: 自定义版图,
  players: 自定义玩家数据,
});
```

`makeCard` 和 `makePlayer` 辅助函数让你不用写全所有字段：

```ts
const card = makeCard({ id: 1, cost: { red: 3 }, points: 1 });
const player = makePlayer({ id: 0, tokens: { red: 3 } });
```

### 第六步：编写测试文件

测试文件放在 `packages/core/tests/rules/` 下，每个 spec 对应一个 `.test.ts` 文件：

```
tests/
  helpers.ts                  # 测试辅助函数
  specs/
    take-tokens.md            # 规则拆解文件
    buy-card.md
    privileges.md
    abilities.md
    royal-cards.md
  rules/
    take-tokens.test.ts       # 7 个测试
    buy-card.test.ts          # 10 个测试
    privileges.test.ts        # 6 个测试
    abilities.test.ts         # 6 个测试
    royal-cards.test.ts       # 4 个测试
```

每个测试文件的结构：

```ts
import { describe, it, expect } from "vitest";
import { executeAction } from "../../src/action.ts";
import { createTestState, setBoardToken, makeCard, makePlayer } from "../helpers.ts";

describe("拿取标记", () => {
  it("TT-01：拿取 1 个红色标记 → 版图移除、玩家获得", () => {
    // 设置 → 执行 → 断言
  });
});
```

测试编号（TT-01）和 spec 中的测试点编号一一对应，方便追溯。

### 第七步：运行测试

```bash
npm run test -w @splendor/core
```

输出示例：

```
 Test Files  5 passed (5)
      Tests  33 passed (33)
```

---

## 本课产出

| 文件 | 改动 |
|------|------|
| `packages/core/vitest.config.ts` | **新建**，vitest 配置 |
| `packages/core/package.json` | 新增 `"test": "vitest run"` 脚本 |
| `packages/core/tests/helpers.ts` | **新建**，`createTestState`、`setBoardToken`、`makeCard`、`makePlayer` |
| `packages/core/tests/rules/specs/take-tokens.md` | **新建**，拿取标记规则拆解（7 条细则，8 个测试点） |
| `packages/core/tests/rules/specs/buy-card.md` | **新建**，购买卡牌规则拆解（8 条细则，10 个测试点） |
| `packages/core/tests/rules/specs/privileges.md` | **新建**，特权系统规则拆解（4 条细则，6 个测试点） |
| `packages/core/tests/rules/specs/abilities.md` | **新建**，卡牌能力规则拆解（4 条细则，6 个测试点） |
| `packages/core/tests/rules/specs/royal-cards.md` | **新建**，皇室卡牌规则拆解（4 条细则，4 个测试点） |
| `packages/core/tests/rules/take-tokens.test.ts` | **新建**，7 个测试覆盖所有 TT 测试点 |
| `packages/core/tests/rules/buy-card.test.ts` | **新建**，10 个测试覆盖所有 BC 测试点 |
| `packages/core/tests/rules/privileges.test.ts` | **新建**，6 个测试覆盖所有 PR 测试点 |
| `packages/core/tests/rules/abilities.test.ts` | **新建**，6 个测试覆盖所有 AB 测试点 |
| `packages/core/tests/rules/royal-cards.test.ts` | **新建**，4 个测试覆盖所有 RC 测试点 |

### 验证方式

```bash
npm run test -w @splendor/core
# 33 passed
```

---

## 思考题

1. 为什么 `createTestState` 要用 `...overrides` 而不是直接传全部参数？
2. 规则拆解文件（spec）和测试文件是什么关系？
3. 测试中对手特权数断言为 `toBe(2)`，为什么不是 `toBe(1)`？

---

## 思考题答案

### 1. 为什么用 overrides？

因为 `GameState` 有很多字段，如果每个测试都要传全部字段，测试代码会非常冗长。`overrides` 让测试只关注需要改动的字段，其他用默认值。类比：你点奶茶时说"少糖去冰加珍珠"，而不是说全。

### 2. spec 和测试文件的关系？

spec 是"设计文档"，测试文件是"实现"。先写 spec 想清楚要测什么，再写测试代码。spec 中的每个测试点对应测试文件中的一个 `it`。这样你通过看 spec 就知道所有规则和对应的测试覆盖情况。

### 3. 为什么 toBe(2)？

因为非起始玩家（玩家 B）初始就有 1 个特权。所以触发"对手获得特权"后，特权数从 1 变为 2。

---

## 下一课预告

第 71 课：重构 handleBuyCard——拆成多个小函数，用行动队列串联，前端去掉所有模式状态。
