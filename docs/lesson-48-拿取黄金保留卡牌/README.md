# 第 48 课：拿取黄金 + 保留卡牌

## 学习目标

- 理解黄金的特殊操作流程
- 实现保留卡牌功能

## 本课要做的事

当前黄金只能像普通宝石一样被选中，但游戏规则中黄金有特殊操作：

1. 点击版图上的黄金 → 选中
2. 点击"拿取黄金"按钮 → 黄金加入玩家标记
3. 然后玩家需要选择一张卡牌保留
4. 被保留的卡牌放入 `player.reservedCards`

---

## 1. 数据结构

`Player` 中已经有 `reservedCards: Card[]` 字段。

保留的卡牌最多 3 张。

---

## 2. 新增操作函数

在 `gameState.ts` 中新增：

```typescript
export function handleTakeGold(
  state: GameState,
  position: [number, number],
  cardId: number
): { state: GameState; message: string } {
  const player = state.players[state.currentPlayerIndex];
  const opponentIndex = state.currentPlayerIndex === 0 ? 1 : 0;

  const newBoard = state.boardTokens.map(row => [...row]);
  newBoard[position[0]][position[1]] = null;

  let newPlayer = { ...player, tokens: { ...player.tokens } };
  newPlayer.tokens.gold = (newPlayer.tokens.gold || 0) + 1;

  const found = findCardInPyramid(state.pyramid, cardId);
  if (!found) return { state, message: "卡牌不存在" };

  if (newPlayer.reservedCards.length >= 3) {
    return { state, message: "最多只能保留 3 张卡牌" };
  }

  newPlayer = {
    ...newPlayer,
    reservedCards: [...newPlayer.reservedCards, found.card]
  };

  const newPyramid = state.pyramid.map(level =>
    level.filter(c => c.id !== cardId)
  );

  const newPlayers: [Player, Player] = state.currentPlayerIndex === 0
    ? [newPlayer, state.players[1]]
    : [state.players[0], newPlayer];

  return {
    state: {
      ...state,
      players: newPlayers,
      boardTokens: newBoard,
      pyramid: newPyramid,
      currentPlayerIndex: opponentIndex
    },
    message: `${player.name} 拿取了黄金并保留了卡牌 ${cardId}`
  };
}
```

---

## 3. App.tsx 改动

```typescript
const [goldMode, setGoldMode] = useState(false);

const handleCellClick = (row: number, col: number) => {
  // ... 原有逻辑
};

const handleTakeGold = () => {
  if (selectedCells.length !== 1) return;
  const pos = selectedCells[0];
  const token = state.boardTokens[pos[0]][pos[1]];
  if (token !== "gold") return;
  setGoldMode(true);
  setMessage("请选择一张要保留的卡牌");
};

const handleReserveCard = (cardId: number) => {
  if (!goldMode) return;
  const result = handleTakeGold(state, selectedCells[0], cardId);
  setState(result.state);
  setMessage(result.message);
  setSelectedCells([]);
  setGoldMode(false);
};
```

---

## 本课产出

运行 `npm run dev`：

1. 点击黄金 → 选中
2. 点击"拿取黄金"按钮 → 进入选卡模式
3. 点击金字塔中的卡牌 → 卡牌被保留，黄金加入玩家
4. 保留的卡牌在 PlayerInfo 中以迷你卡牌形式展示（颜色、分数、王冠、费用）
5. 点击保留的卡牌 → 如果宝石足够，直接购买

---

## 4. 保留卡牌的展示

PlayerInfo 中，保留的卡牌以完整迷你卡牌形式展示：

```typescript
{player.reservedCards.map((card) => (
  <div
    key={card.id}
    className="reserved-card"
    style={{ borderColor: GEM_COLORS[card.gem] || "#999" }}
    onClick={() => onBuyReserved?.(card.id)}
    title="点击购买"
  >
    <div className="reserved-gem" style={{ color: GEM_COLORS[card.gem] }}>
      {card.gem}
    </div>
    <div className="reserved-points">{card.points}分</div>
    {card.crowns > 0 && <div className="reserved-crowns">👑x{card.crowns}</div>}
    <div className="reserved-cost">{formatCost(card.cost)}</div>
  </div>
))}
```

点击保留卡牌 → 调用 `handleBuyReserved` → 购买卡牌并从保留区移除。

---

## 5. handleBuyCard 支持保留卡牌购买

`handleBuyCard` 原来只在金字塔中查找卡牌。现在也检查 `reservedCards`：

```typescript
const fromPyramid = findCardInPyramid(state.pyramid, cardId);
const fromReserved = player.reservedCards.find(c => c.id === cardId);
const card = fromPyramid?.card || fromReserved;

if (!card) return { state, message: `卡牌 ID ${cardId} 不存在` };
```

购买后，如果是保留卡牌，从 `reservedCards` 中移除：

```typescript
if (fromReserved) {
  newPlayer = {
    ...newPlayer,
    reservedCards: newPlayer.reservedCards.filter(c => c.id !== cardId)
  };
}
```

如果是金字塔卡牌，从金字塔移除（原有逻辑不变）。

---

## 思考题

1. **为什么拿取黄金后还要选卡牌？**

   游戏规则规定：拿取黄金的同时必须保留一张卡牌。这两个操作是一起的。

2. **保留的卡牌和购买的卡牌有什么区别？**

   保留的卡牌放在 `reservedCards` 中，还没有支付费用。玩家可以在后续回合中购买保留的卡牌。保留区最多 3 张。