# 第 30 课：完善游戏规则 — 金字塔补牌和袋子系统

## 本节课目标

购买卡牌后从牌库补充新卡，花费的标记放回袋子。

---

## 1. 问题

当前游戏中，购买卡牌后金字塔会少一张卡，但不会补新卡。玩着玩着金字塔就空了。

规则要求：
- 购买卡牌后，从对应等级的牌库顶抽一张新卡补到金字塔中
- 花费的标记放回袋子，袋子可以在"补充版图"可选行动中使用

---

## 2. 修改 `src/purchase.ts`

`purchaseCard` 现在返回花费的标记信息：

```typescript
export function purchaseCard(player, card, actualCost) {
  // ... 扣标记逻辑 ...
  return { player: newPlayer, spent: { red: 1, blue: 2, gold: 1, ... } };
}
```

`spent` 记录了每种颜色花了多少个，用于放回袋子。

---

## 3. 动手

创建 `docs/lesson-30-完善游戏规则-金字塔补牌/index.html`：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>璀璨宝石对决</title>
  <style>
    body {
      background-color: #1a1a2e;
      color: #eee;
      font-family: "Microsoft YaHei", sans-serif;
      padding: 20px;
    }
    h1 { color: #ffd700; text-align: center; }
    h2 { color: #e94560; }
    .cell {
      display: inline-block; width: 50px; height: 50px;
      line-height: 50px; text-align: center;
      border: 1px solid #555; margin: 2px; cursor: pointer;
      vertical-align: top;
    }
    .cell.selected { border-color: #ffd700; border-width: 2px; }
    .cell.empty { background-color: #2a2a4e; }
    .cell.gold { background-color: #554400; }
    .btn {
      padding: 10px 20px; font-size: 16px; border: none;
      cursor: pointer; margin: 5px;
    }
    .btn-primary { background-color: #e94560; color: white; }
    .players { display: flex; gap: 20px; margin-top: 20px; }
    .player-card {
      background-color: #16213e; padding: 15px;
      border: 1px solid #333; flex: 1;
    }
    .player-card.active { border-color: #ffd700; }
    .pyramid span {
      display: inline-block; margin: 3px; padding: 5px;
      background-color: #16213e; cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="app"></div>

  <script type="module">
    import { takeTokens, validateTakePositions, purchaseCard, canAfford, getPlayerBonuses, getActualCost, getTotalPoints, getTotalCrowns, checkWinCondition, shuffleDeck, getLevelDeck, getTotalTokenCost } from "../../web/game.js";

    const board = [
      ["red", "blue", null, "green", "white"],
      ["black", "pearl", "gold", "red", "blue"],
      ["green", null, "black", "white", "red"],
      ["blue", "green", "white", "black", "pearl"],
      ["red", "blue", "green", "white", "black"]
    ];

    const bag = [];

    const decks = [
      shuffleDeck(getLevelDeck(1)),
      shuffleDeck(getLevelDeck(2)),
      shuffleDeck(getLevelDeck(3)),
    ];

    function drawCard(level) {
      if (decks[level].length === 0) return null;
      return decks[level].pop();
    }

    const pyramid = [
      [drawCard(0), drawCard(0), drawCard(0), drawCard(0), drawCard(0)].filter(Boolean),
      [drawCard(1), drawCard(1), drawCard(1), drawCard(1)].filter(Boolean),
      [drawCard(2), drawCard(2), drawCard(2)].filter(Boolean),
    ];

    const players = [
      { id: 0, name: "玩家 1", tokens: { red: 2, blue: 1, green: 0, white: 0, black: 3, pearl: 0, gold: 0 }, cards: [], royalCards: [], reservedCards: [], privileges: 0 },
      { id: 1, name: "玩家 2", tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 }, cards: [], royalCards: [], reservedCards: [], privileges: 1 },
    ];

    let currentPlayerIndex = 0;
    const selected = [];

    const app = document.getElementById("app");

    function render() {
      app.innerHTML = "";

      const title = document.createElement("h1");
      title.textContent = "璀璨宝石对决";
      app.appendChild(title);

      const turn = document.createElement("p");
      turn.textContent = "当前回合：" + players[currentPlayerIndex].name;
      app.appendChild(turn);

      const boardTitle = document.createElement("h2");
      boardTitle.textContent = "版图";
      app.appendChild(boardTitle);

      const boardDiv = document.createElement("div");
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const token = board[r][c];
          const span = document.createElement("span");
          span.className = "cell";
          if (token === null) span.classList.add("empty");
          if (token === "gold") span.classList.add("gold");
          const isSelected = selected.some(pos => pos[0] === r && pos[1] === c);
          if (isSelected) span.classList.add("selected");
          span.textContent = token || "";

          span.addEventListener("click", function() {
            if (token === null || token === "gold") return;
            const idx = selected.findIndex(pos => pos[0] === r && pos[1] === c);
            if (idx >= 0) { selected.splice(idx, 1); }
            else if (selected.length < 3) { selected.push([r, c]); }
            render();
          });

          boardDiv.appendChild(span);
        }
        boardDiv.appendChild(document.createElement("br"));
      }
      app.appendChild(boardDiv);

      const takeBtn = document.createElement("button");
      takeBtn.className = "btn btn-primary";
      takeBtn.textContent = "拿取标记";
      app.appendChild(takeBtn);

      takeBtn.addEventListener("click", function() {
        if (selected.length === 0) return;
        const error = validateTakePositions(selected);
        if (error) { selected.length = 0; render(); return; }
        const result = takeTokens(board, selected);
        for (const [r, c] of selected) { board[r][c] = null; }
        const player = players[currentPlayerIndex];
        for (const token of result.taken) {
          player.tokens[token] = (player.tokens[token] || 0) + 1;
        }
        selected.length = 0;
        currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
        render();
      });

      const pyramidTitle = document.createElement("h2");
      pyramidTitle.textContent = "金字塔";
      app.appendChild(pyramidTitle);

      const pyramidDiv = document.createElement("div");
      pyramidDiv.className = "pyramid";
      for (let level = 0; level < pyramid.length; level++) {
        const levelTitle = document.createElement("h3");
        levelTitle.textContent = "等级 " + (level + 1);
        pyramidDiv.appendChild(levelTitle);

        for (const card of pyramid[level]) {
          const span = document.createElement("span");
          const costStr = Object.entries(card.cost).filter(([,v]) => v > 0).map(([k,v]) => k + "x" + v).join(" ");
          span.textContent = "[" + card.id + "] " + card.gem + " " + card.points + "分 | " + costStr;

          span.addEventListener("click", function() {
            const player = players[currentPlayerIndex];
            const bonuses = getPlayerBonuses(player);
            const actualCost = getActualCost(card, bonuses);
            if (!canAfford(player, actualCost)) return;

            const result = purchaseCard(player, card, actualCost);
            players[currentPlayerIndex] = result.player;

            // 花费的标记放回袋子
            for (const [color, amount] of Object.entries(result.spent)) {
              if (amount > 0) {
                for (let i = 0; i < amount; i++) {
                  bag.push(color);
                }
              }
            }

            // 从牌库补新卡
            const idx = pyramid[level].indexOf(card);
            pyramid[level].splice(idx, 1);
            const newCard = drawCard(level);
            if (newCard) {
              pyramid[level].push(newCard);
            }

            if (checkWinCondition(result.player)) {
              app.innerHTML = "<h1>" + result.player.name + " 获胜！</h1>";
              return;
            }

            currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
            render();
          });

          pyramidDiv.appendChild(span);
          pyramidDiv.appendChild(document.createElement("br"));
        }
      }
      app.appendChild(pyramidDiv);

      const playersDiv = document.createElement("div");
      playersDiv.className = "players";
      for (const player of players) {
        const card = document.createElement("div");
        card.className = "player-card" + (player.id === currentPlayerIndex ? " active" : "");
        const name = document.createElement("h3");
        name.textContent = player.name;
        card.appendChild(name);
        const tokens = document.createElement("p");
        const tokenList = Object.entries(player.tokens).filter(([,v]) => v > 0).map(([k,v]) => k + "x" + v).join(" ");
        tokens.textContent = "标记: " + (tokenList || "无");
        card.appendChild(tokens);
        const stats = document.createElement("p");
        stats.textContent = "声望: " + getTotalPoints(player) + " | 王冠: " + getTotalCrowns(player) + " | 卡牌: " + player.cards.length + " 张";
        card.appendChild(stats);
        playersDiv.appendChild(card);
      }
      app.appendChild(playersDiv);
    }

    render();
  </script>
</body>
</html>
```

---

## 4. 代码讲解

### 牌库和抽牌

```javascript
const decks = [
  shuffleDeck(getLevelDeck(1)),
  shuffleDeck(getLevelDeck(2)),
  shuffleDeck(getLevelDeck(3)),
];

function drawCard(level) {
  if (decks[level].length === 0) return null;
  return decks[level].pop();
}
```

`decks` 是三个洗好的牌库。`drawCard` 从牌库顶（数组末尾）取一张卡。如果牌库空了返回 `null`。

### 购买后补牌

```javascript
const newCard = drawCard(level);
if (newCard) {
  pyramid[level].push(newCard);
}
```

购买卡牌后，从同等级的牌库抽一张新卡补到金字塔中。如果牌库空了就不补。

### 袋子系统

```javascript
const bag = [];

// 购买时：
for (const [color, amount] of Object.entries(result.spent)) {
  if (amount > 0) {
    for (let i = 0; i < amount; i++) {
      bag.push(color);
    }
  }
}
```

`bag` 数组存储所有放回的标记。目前还没有"补充版图"操作，后面课程会用到。

---

## 5. 你学到了什么

| 概念 | 说明 |
|------|------|
| **牌库** | 每个等级一个洗好的牌堆 |
| **drawCard** | 从牌库抽一张卡 |
| **补牌** | 购买后从牌库抽新卡补到金字塔 |
| **袋子** | 存储花费的标记，后续用于补充版图 |
