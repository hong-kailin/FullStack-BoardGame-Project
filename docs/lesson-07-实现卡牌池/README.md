# 第 7 课：实现卡牌池

## 本节课目标

设计卡牌数据，实现发牌函数——从牌堆随机抽取卡牌组成金字塔。

---

## 1. 卡牌池是什么？

卡牌池 = 游戏中所有卡牌的数据集合。在 Splendor Duel 中：

- 总共 **67 张珠宝卡牌**，分为 3 个等级
- 每张卡牌有：费用、奖励颜色、声望点数、王冠、可能还有能力
- 游戏开始时，从每个等级牌堆顶部翻出若干张，组成**金字塔**：
  - 等级 1：5 张可见
  - 等级 2：4 张可见
  - 等级 3：3 张可见

### 为什么不从数据库/JSON 读取？

目前我们直接把卡牌数据**写死在代码里**（hardcode）。原因：

1. 还没引入数据库（奥卡姆剃刀——不需要就不加）
2. 卡牌数据是固定的，不需要动态修改
3. 写死在代码里最简单，看得最清楚

> 后面项目大了，需要把数据抽离到 JSON 或数据库时再重构。

---

## 2. 设计卡牌数据

根据规则，每张卡牌需要这些字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 唯一编号 |
| `level` | number | 等级 1/2/3 |
| `gem` | GemColor | 奖励颜色（购买后减少该色费用） |
| `points` | number | 声望点数 |
| `crowns` | number | 王冠数量 |
| `cost` | object | 购买费用（各色宝石/珍珠需要几个） |

### 创建一些示例卡牌

我们先为每个等级创建 8 张卡牌（总共 24 张），足够跑通游戏流程：

```typescript
// 等级 1 卡牌（费用较低，声望较低）
const level1Cards: Card[] = [
  { id: 1, level: 1, gem: "red", points: 1, crowns: 0, cost: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 3 } },
  { id: 2, level: 1, gem: "red", points: 2, crowns: 1, cost: { red: 0, blue: 0, green: 2, white: 1, black: 0, pearl: 0 } },
  { id: 3, level: 1, gem: "blue", points: 1, crowns: 0, cost: { red: 0, blue: 0, green: 0, white: 0, black: 3, pearl: 0 } },
  { id: 4, level: 1, gem: "blue", points: 2, crowns: 1, cost: { red: 0, blue: 0, green: 0, white: 2, black: 1, pearl: 0 } },
  { id: 5, level: 1, gem: "green", points: 1, crowns: 0, cost: { red: 1, blue: 0, green: 0, white: 0, black: 0, pearl: 2 } },
  { id: 6, level: 1, gem: "green", points: 2, crowns: 0, cost: { red: 3, blue: 0, green: 0, white: 0, black: 0, pearl: 0 } },
  { id: 7, level: 1, gem: "white", points: 1, crowns: 0, cost: { red: 0, blue: 2, green: 0, white: 0, black: 0, pearl: 1 } },
  { id: 8, level: 1, gem: "black", points: 1, crowns: 0, cost: { red: 0, blue: 0, green: 1, white: 0, black: 0, pearl: 2 } },
];
```

---

## 3. 实现发牌函数

发牌 = 从牌堆顶部取若干张卡牌放到桌面上。

我们需要：
1. `shuffleDeck` — 洗牌（随机打乱数组顺序）
2. `dealPyramid` — 从每级牌堆发指定数量的卡牌

### 3.1 洗牌

Fisher-Yates 洗牌算法，这是最经典也最公平的洗牌方式：

```typescript
function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

> 从后往前遍历，每个位置和前面随机一个位置交换。`Math.random()` 返回 [0, 1) 的随机数。

### 3.2 发牌

```typescript
function dealCards(deck: Card[], count: number): { dealt: Card[]; remaining: Card[] } {
  return {
    dealt: deck.slice(0, count),       // 前 count 张翻出来
    remaining: deck.slice(count)        // 剩下的还在牌堆
  };
}
```

---

## 4. 完整流程

```
1. 创建 3 个等级的卡牌数组（硬编码数据）
2. 分别洗牌
3. 从等级 1 发 5 张，等级 2 发 4 张，等级 3 发 3 张
4. 组成金字塔展示给玩家
```

---

## 5. 动手

真正的卡牌池代码放在 `src/card-pool.ts`，`docs/lesson-07/` 下的 `card-pool.ts` 是简化版示例。

### 真正的代码

```bash
# 查看 src/card-pool.ts
cat src/card-pool.ts
```

### 运行示例

```bash
tsx docs/lesson-07-实现卡牌池/card-pool.ts
```

---

## 6. 关于 import/export

这是你第一次看到 `import` 和 `export`。简单来说：

| 关键字 | 作用 | 类比 |
|--------|------|------|
| `export` | 把一个变量/函数/类型**分享出去**，让别人能用 | Python 的 `__all__` |
| `import` | 从别的文件**拿进来**使用 | Python 的 `from ... import ...` |

我们在 `types.ts` 中给类型定义加上 `export`，然后在 `card-pool.ts` 中 `import` 它们。

---

## 7. 总结

| 概念 | 一句话 |
|------|--------|
| **硬编码数据** | 卡牌数据直接写在代码里，不读外部文件 |
| **洗牌** | Fisher-Yates 算法随机打乱数组 |
| **发牌** | 从牌堆顶部取指定数量的卡牌 |
| **金字塔** | 3 行卡牌（等级 1/2/3），每行 5/4/3 张 |

---

## 思考题（附答案）

1. **为什么不用 JSON 文件存卡牌数据？**
   - 答：JSON 文件需要额外的读取逻辑（`fs.readFile` 或 `import`），目前卡牌数量少，直接写在代码里更简单。等以后卡牌多了（67 张全部），再考虑抽离到 JSON。

2. **Fisher-Yates 洗牌为什么比 `arr.sort(() => Math.random() - 0.5)` 好？**
   - 答：`sort` + `Math.random` 的洗牌不均匀——有些排列出现的概率比其他排列高。Fisher-Yates 保证每种排列的概率完全相等，是真正公平的洗牌。

3. **如果牌堆的卡牌不够发了怎么办？**
   - 答：目前每个等级我们设计了 8 张，而发牌只需 3-5 张，足够。当卡牌被购买后，我们需要从牌堆顶部补充新卡牌。如果牌堆空了，就不再补充。

---

准备好了告诉我，进入**第 8 课：玩家操作 — 拿取宝石**。
