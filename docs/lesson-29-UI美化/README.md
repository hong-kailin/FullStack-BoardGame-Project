# 第 29 课：UI 美化

## 本节课目标

把前面学的 CSS 知识（颜色、选择器、盒模型、Flexbox）综合起来，美化第 24 课的游戏页面。

---

## 1. 思路

之前第 24 课的游戏页面是纯文字的，现在给它加上样式：

- 深色背景、金色标题
- 版图格子用颜色区分不同标记
- 玩家信息卡片用 Flexbox 并排
- 按钮美化

---

## 2. 动手

创建 `docs/lesson-29-UI美化/index.html`：

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

    h1 {
      color: #ffd700;
      text-align: center;
    }

    h2 {
      color: #e94560;
    }

    .board {
      margin: 20px 0;
    }

    .cell {
      display: inline-block;
      width: 50px;
      height: 50px;
      line-height: 50px;
      text-align: center;
      border: 1px solid #555;
      margin: 2px;
      cursor: pointer;
    }

    .cell.selected {
      border-color: #ffd700;
      border-width: 2px;
    }

    .cell.empty {
      background-color: #2a2a4e;
    }

    .cell.gold {
      background-color: #554400;
    }

    .btn {
      padding: 10px 20px;
      font-size: 16px;
      border: none;
      cursor: pointer;
      margin: 5px;
    }

    .btn-primary {
      background-color: #e94560;
      color: white;
    }

    .btn-secondary {
      background-color: #555;
      color: #eee;
    }

    .players {
      display: flex;
      gap: 20px;
      margin-top: 20px;
    }

    .player-card {
      background-color: #16213e;
      padding: 15px;
      border: 1px solid #333;
      flex: 1;
    }

    .player-card.active {
      border-color: #ffd700;
    }

    .pyramid span {
      display: inline-block;
      margin: 3px;
      padding: 5px;
      background-color: #16213e;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="app"></div>

  <script type="module">
    import { takeTokens, validateTakePositions, purchaseCard, canAfford, getPlayerBonuses, getActualCost, getTotalPoints, getTotalCrowns, checkWinCondition } from "../../web/game.js";

    const board = [
      ["red", "blue", null, "green", "white"],
      ["black", "pearl", "gold", "red", "blue"],
      ["green", null, "black", "white", "red"],
      ["blue", "green", "white", "black", "pearl"],
      ["red", "blue", "green", "white", "black"]
    ];

    const pyramid = [
      [
        { id: 1, level: 1, gem: "red", points: 1, crowns: 0, bonusCount: 1, cost: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 3 } },
        { id: 2, level: 1, gem: "red", points: 2, crowns: 1, bonusCount: 1, cost: { red: 0, blue: 0, green: 2, white: 1, black: 0, pearl: 0 } },
        { id: 3, level: 1, gem: "blue", points: 1, crowns: 0, bonusCount: 1, cost: { red: 0, blue: 0, green: 0, white: 0, black: 3, pearl: 0 } },
        { id: 4, level: 1, gem: "blue", points: 2, crowns: 1, bonusCount: 2, cost: { red: 0, blue: 0, green: 0, white: 2, black: 1, pearl: 0 } },
        { id: 5, level: 1, gem: "green", points: 1, crowns: 0, bonusCount: 1, cost: { red: 1, blue: 0, green: 0, white: 0, black: 0, pearl: 2 } },
      ],
      [
        { id: 9, level: 2, gem: "red", points: 3, crowns: 1, bonusCount: 1, cost: { red: 0, blue: 3, green: 0, white: 2, black: 0, pearl: 1 } },
        { id: 10, level: 2, gem: "red", points: 4, crowns: 2, bonusCount: 2, cost: { red: 0, blue: 0, green: 4, white: 0, black: 3, pearl: 0 } },
        { id: 11, level: 2, gem: "blue", points: 3, crowns: 1, bonusCount: 1, cost: { red: 2, blue: 0, green: 0, white: 0, black: 3, pearl: 0 } },
        { id: 12, level: 2, gem: "blue", points: 4, crowns: 2, bonusCount: 2, cost: { red: 0, blue: 0, green: 0, white: 4, black: 0, pearl: 2 } },
      ],
      [
        { id: 17, level: 3, gem: "red", points: 5, crowns: 2, bonusCount: 1, cost: { red: 0, blue: 4, green: 0, white: 4, black: 0, pearl: 2 } },
        { id: 18, level: 3, gem: "red", points: 7, crowns: 3, bonusCount: 2, cost: { red: 0, blue: 0, green: 5, white: 0, black: 5, pearl: 2 } },
        { id: 19, level: 3, gem: "blue", points: 5, crowns: 2, bonusCount: 1, cost: { red: 4, blue: 0, green: 0, white: 0, black: 4, pearl: 2 } },
      ],
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
      boardDiv.className = "board";
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
            if (idx >= 0) {
              selected.splice(idx, 1);
            } else if (selected.length < 3) {
              selected.push([r, c]);
            }
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
            const newPlayer = purchaseCard(player, card, actualCost);
            players[currentPlayerIndex] = newPlayer;
            pyramid[level] = pyramid[level].filter(c => c.id !== card.id);
            if (checkWinCondition(newPlayer)) {
              app.innerHTML = "<h1>" + newPlayer.name + " 获胜！</h1>";
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

## 3. 你学到了什么

| 概念 | 说明 |
|------|------|
| **综合运用** | 颜色、选择器、盒模型、Flexbox 一起用 |
| **className** | 用 JS 给元素设置 class |
| **classList.add** | 给元素添加额外的 class |
