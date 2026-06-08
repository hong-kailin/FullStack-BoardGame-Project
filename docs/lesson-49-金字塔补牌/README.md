# 第 49 课：金字塔补牌

## 学习目标

- 理解金字塔补牌的规则
- 实现购买/保留卡牌后从牌库补充新卡

## 本课要做的事

当前购买卡牌或保留卡牌后，金字塔会空出一个位置，但不会补充新卡。

本课：购买或保留卡牌后，从对应等级的牌库中抽一张新卡补充到金字塔。

---

## 1. 当前问题

`createInitialState` 中，金字塔是这样创建的：

```typescript
pyramid: [
  shuffleDeck(getLevelDeck(1)).slice(0, 5),
  shuffleDeck(getLevelDeck(2)).slice(0, 4),
  shuffleDeck(getLevelDeck(3)).slice(0, 3),
],
```

每个等级只取了前 N 张，剩下的牌被丢弃了。

需要改成：每个等级保留一个牌库，当金字塔有空位时从牌库补充。

---

## 2. 数据结构改动

`GameState` 中需要新增 `decks` 字段，存储每个等级的剩余牌库：

```typescript
interface GameState {
  // ... 原有字段
  decks: Card[][];  // decks[0] = 等级 1 剩余牌库，decks[1] = 等级 2，decks[2] = 等级 3
}
```

---

## 3. createInitialState 改动

```typescript
const deck1 = shuffleDeck(getLevelDeck(1));
const deck2 = shuffleDeck(getLevelDeck(2));
const deck3 = shuffleDeck(getLevelDeck(3));

return {
  // ...
  pyramid: [
    deck1.slice(0, 5),
    deck2.slice(0, 4),
    deck3.slice(0, 3),
  ],
  decks: [
    deck1.slice(5),
    deck2.slice(4),
    deck3.slice(3),
  ],
};
```

---

## 4. 补牌函数

```typescript
function refillPyramidLevel(
  pyramid: Card[][],
  decks: Card[][],
  level: number
): { pyramid: Card[][]; decks: Card[][] } {
  const newPyramid = pyramid.map(levelCards => [...levelCards]);
  const newDecks = decks.map(deck => [...deck]);
  const currentCount = newPyramid[level].length;
  const targetCount = level === 0 ? 5 : level === 1 ? 4 : 3;

  while (newPyramid[level].length < targetCount && newDecks[level].length > 0) {
    const card = newDecks[level].shift()!;
    newPyramid[level].push(card);
  }

  return { pyramid: newPyramid, decks: newDecks };
}
```

---

## 5. handleBuyCard 和 handleTakeGold 中调用补牌

```typescript
// 购买/保留后
const refillResult = refillPyramidLevel(newPyramid, state.decks, found.level);
```

---

## 本课产出

运行 `npm run dev`：

1. 购买卡牌后，金字塔对应等级补充新卡
2. 保留卡牌后，金字塔对应等级补充新卡
3. 牌库耗尽后不再补充

## 思考题

1. **为什么补牌函数要返回 `{ pyramid, decks }` 而不是直接修改？**

   因为要遵循不可变原则。React 需要新对象才能检测到变化。

2. **等级 1 的目标是 5 张，等级 2 是 4 张，等级 3 是 3 张，为什么？**

   游戏规则规定：金字塔底部（等级 1）展示 5 张，中间（等级 2）展示 4 张，顶部（等级 3）展示 3 张。