# 第 70 课：引入 vitest 写规则测试

## 学习目标

- 理解"测试"是什么、为什么需要测试
- 安装 vitest 测试框架
- 学会设计测试用例：三段式（设置 → 执行 → 断言）
- 为拿取标记和购买卡牌编写 8 个规则测试

---

## 核心概念讲解

### 1. 测试是什么？用生活类比

想象你开了一家奶茶店，雇了一个新员工做奶茶。你怎么知道他做的对不对？

- **方式一**：等顾客投诉（= 用户发现 bug）
- **方式二**：你站在旁边看他做每一杯（= 手动测试）
- **方式三**：写一本操作手册，每做一杯对照检查一遍（= 自动化测试）

测试就是**写一段代码，自动检查另一段代码是否按预期运行**。

### 2. 为什么现在需要测试？

之前改代码全靠手动点页面验证：

1. 启动前端
2. 手动操作游戏（拿标记、买卡牌...）
3. 看结果对不对
4. 改代码
5. 再重复 1-3

效率低、容易漏、改多了心里没底。

有了测试后：

- **改代码不怕改坏** — 跑一遍测试就知道有没有破坏现有规则
- **规则即文档** — 测试用例本身就是规则的自然语言描述
- **快速反馈** — 改完代码几秒就知道结果

### 3. vitest 是什么？

vitest 是一个 JavaScript/TypeScript 的测试框架。你可以把它理解为"一个能自动运行你的测试代码并告诉你结果是否正确的工具"。

类比：
- vitest ≈ Python 的 pytest
- vitest ≈ C++ 的 Google Test

### 4. 测试的三段式结构

每个测试用例都遵循同样的结构：

```
1. 设置（Arrange）— 准备好测试需要的状态
2. 执行（Act）— 执行要测试的操作
3. 断言（Assert）— 检查结果是否符合预期
```

比如测试"拿取 1 个红色标记"：

```ts
// 1. 设置：在版图 (2,2) 位置放一个红色标记
board = setBoardToken(board, 2, 2, "red");

// 2. 执行：玩家拿取这个标记
const result = executeAction(state, { type: "take_tokens", positions: [[2, 2]] });

// 3. 断言：版图上标记没了，玩家手里多了 1 个红
expect(result.state.boardTokens[2][2]).toBeNull();
expect(result.state.players[0].tokens.red).toBe(1);
```

---

## 动手步骤

### 第一步：安装 vitest

vitest 是一个 npm 包，需要安装到 `@splendor/core` 子包中：

```bash
npm install -w @splendor/core -D vitest
```

参数说明：
- `-w @splendor/core` — 安装到 core 子包（workspace）
- `-D` — 安装到 devDependencies（只在开发时需要，生产环境不需要）

安装完成后，`packages/core/package.json` 中会多出 `devDependencies` 字段。

### 第二步：配置 vitest

在 `packages/core/` 下创建 `vitest.config.ts`：

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],  // 告诉 vitest 去哪里找测试文件
  },
});
```

这个配置文件告诉 vitest：
- 我们要运行测试
- 测试文件在 `tests/` 目录下，文件名以 `.test.ts` 结尾

### 第三步：添加 test 脚本

在 `packages/core/package.json` 中添加：

```json
"scripts": {
  "test": "vitest run"
}
```

之后就可以用 `npm run test -w @splendor/core` 来运行测试了。

### 第四步：设计测试辅助函数

游戏状态 `GameState` 有很多字段，而且 `createInitialState()` 包含随机洗牌。如果每个测试都从头创建完整状态，代码会非常冗长。

所以我们需要一个**辅助函数** `createTestState`，它创建一个"空的、可控的"游戏状态，测试只需要告诉它"哪些地方不一样"。

```ts
// 创建一个空的游戏状态，所有字段都有默认值
const state = createTestState();

// 创建一个自定义的游戏状态，覆盖某些字段
const state = createTestState({
  boardTokens: 自定义版图,
  players: 自定义玩家数据,
});
```

这就是"默认值 + 覆盖"模式——类似 React 的 `useState(initialState)` 或 Python 的 `defaultdict`。

另外还需要一个 `setBoardToken` 函数，用来在版图的指定位置放一个标记：

```ts
let board = createTestState().boardTokens;
board = setBoardToken(board, 2, 2, "red");  // 在 (2,2) 放红色标记
```

### 第五步：编写测试文件

测试文件放在 `packages/core/tests/rules/` 目录下，按规则类别分文件：

```
tests/
  helpers.ts                  # 测试辅助函数
  rules/
    take-tokens.test.ts       # 拿取标记相关规则
    buy-card.test.ts          # 购买卡牌相关规则
```

每个测试文件的结构：

```ts
import { describe, it, expect } from "vitest";  // 引入测试工具
import { executeAction } from "../../src/action.ts";  // 引入要测试的函数
import { createTestState, setBoardToken } from "../helpers.ts";  // 引入辅助函数

describe("拿取标记", () => {     // describe = 测试分组，把相关的测试放在一起
  it("拿取 1 个非黄金标记", () => {  // it = 一个具体的测试用例
    // 设置 → 执行 → 断言
  });

  it("拿取 3 个同色标记 → 对手获得 1 个特权", () => {
    // ...
  });
});
```

`describe` 和 `it` 是 vitest 提供的全局函数：
- `describe("名称", fn)` — 把多个相关测试分组
- `it("描述", fn)` — 一个具体的测试用例，描述用自然语言写清楚"测什么"
- `expect(实际值).toBe(期望值)` — 断言实际值是否等于期望值

### 第六步：运行测试

```bash
npm run test -w @splendor/core
```

输出示例：

```
✓ 拿取标记 > 拿取 1 个非黄金标记
✓ 拿取标记 > 拿取 3 个同色标记 → 对手获得 1 个特权
✓ 购买卡牌 > 宝石足够 → 购买成功
...

Test Files  2 passed (2)
Tests  8 passed (8)
```

绿色勾表示测试通过。如果有测试失败，vitest 会告诉你哪个测试失败了、期望值是什么、实际值是什么。

---

## 本课产出

| 文件 | 改动 |
|------|------|
| `packages/core/vitest.config.ts` | **新建**，vitest 配置 |
| `packages/core/package.json` | 新增 `"test": "vitest run"` 脚本 |
| `packages/core/tests/helpers.ts` | **新建**，`createTestState` 和 `setBoardToken` |
| `packages/core/tests/rules/take-tokens.test.ts` | **新建**，5 个拿取标记规则测试 |
| `packages/core/tests/rules/buy-card.test.ts` | **新建**，3 个购买卡牌规则测试 |

### 验证方式

```bash
npm run test -w @splendor/core
# 输出：8 passed
```

---

## 思考题

1. 为什么 `createTestState` 要用 `...overrides` 而不是直接传全部参数？
2. 如果测试需要验证"购买卡牌后金字塔补牌"，需要怎么设置初始状态？
3. 测试中对手特权数断言为 `toBe(2)`，为什么不是 `toBe(1)`？

---

## 思考题答案

### 1. 为什么用 overrides？

因为 `GameState` 有很多字段（players、boardTokens、pyramid、decks、bag...），如果每个测试都要传全部字段，测试代码会非常冗长且难以阅读。`overrides` 让测试只关注需要改动的字段，其他用默认值。

类比：你点奶茶时说"少糖去冰加珍珠"，而不是说"正常糖、正常冰、加珍珠、不加椰果、不加布丁......"。

### 2. 验证金字塔补牌？

需要构造一个有牌库的 `decks` 字段，然后购买一张金字塔中的卡牌，断言金字塔中出现了新卡牌。当前测试没有覆盖这个场景，后续可以添加。

### 3. 为什么 toBe(2)？

因为非起始玩家（玩家 B）初始就有 1 个特权（规则规定：起始玩家的对手获得 1 个特权）。所以触发"对手获得特权"后，特权数从 1 变为 2。

---

## 下一课预告

第 71 课：重构 handleBuyCard——拆成多个小函数，用行动队列串联，前端去掉所有模式状态。
