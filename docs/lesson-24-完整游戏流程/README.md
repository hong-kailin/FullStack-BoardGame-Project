# 第 24 课：完整游戏流程

## 本节课目标

把版图、金字塔、玩家信息、拿取标记、购买卡牌整合到一起，实现完整的双人回合制游戏流程。

---

## 1. 思路

1. 初始化游戏状态（版图、金字塔、两个玩家）
2. 渲染完整界面
3. 当前玩家可以操作（拿取标记或购买卡牌）
4. 操作完成后切换玩家
5. 非当前玩家的操作被禁用

---

## 2. game.js 从哪来？

`web/game.js` 是由 `src/` 中的 TypeScript 代码编译得到的。每次修改了 `src/` 下的游戏逻辑后，需要重新编译：

```bash
npm run build:web
```

这个命令会把 `src/browser-entry.ts` 及其依赖（`board.ts`、`purchase.ts`、`game.ts` 等）打包成一个浏览器可用的 `web/game.js` 文件。

所有 Web 版的 HTML 文件都通过 `../../web/game.js` 引用同一个文件，不需要每个目录单独复制。

---

## 3. 动手

---

## 4. 动手

创建 `docs/lesson-24-完整游戏流程/index.html`：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>璀璨宝石对决</title>
</head>
<body>
  <div id="app"></div>

  <script type="module">
    import { takeTokens, validateTakePositions, purchaseCard, canAfford, getPlayerBonuses, getActualCost, getTotalPoints, getTotalCrowns, checkWinCondition } from "./game.js";

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

      // 版图
      const boardTitle = document.createElement("h2");
      boardTitle.textContent = "版图";
      app.appendChild(boardTitle);

      const boardDiv = document.createElement("div");
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const token = board[r][c];
          const span = document.createElement("span");
          const isSelected = selected.some(pos => pos[0] === r && pos[1] === c);
          span.textContent = isSelected ? "[" + (token || ".") + "]" : " " + (token || ".") + " ";

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
          boardDiv.appendChild(document.createTextNode(" "));
        }
        boardDiv.appendChild(document.createElement("br"));
      }
      app.appendChild(boardDiv);

      // 拿取按钮
      const takeBtn = document.createElement("button");
      takeBtn.textContent = "拿取标记";
      app.appendChild(takeBtn);

      takeBtn.addEventListener("click", function() {
        if (selected.length === 0) return;

        const error = validateTakePositions(selected);
        if (error) {
          selected.length = 0;
          render();
          return;
        }

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

      // 金字塔
      const pyramidTitle = document.createElement("h2");
      pyramidTitle.textContent = "金字塔";
      app.appendChild(pyramidTitle);

      for (let level = 0; level < pyramid.length; level++) {
        const levelTitle = document.createElement("h3");
        levelTitle.textContent = "等级 " + (level + 1);
        app.appendChild(levelTitle);

        for (const card of pyramid[level]) {
          const span = document.createElement("span");
          const costStr = Object.entries(card.cost).filter(([,v]) => v > 0).map(([k,v]) => k + "x" + v).join(" ");
          span.textContent = "[" + card.id + "] " + card.gem + " " + card.points + "分 | 费用: " + costStr + "  ";

          span.addEventListener("click", function() {
            const player = players[currentPlayerIndex];
            const bonuses = getPlayerBonuses(player);
            const actualCost = getActualCost(card, bonuses);
            if (!canAfford(player, actualCost)) return;

            const newPlayer = purchaseCard(player, card, actualCost);
            players[currentPlayerIndex] = newPlayer;
            pyramid[level] = pyramid[level].filter(c => c.id !== card.id);

            if (checkWinCondition(newPlayer)) {
              app.innerHTML = "";
              const win = document.createElement("h1");
              win.textContent = newPlayer.name + " 获胜！";
              app.appendChild(win);
              return;
            }

            currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
            render();
          });

          app.appendChild(span);
          app.appendChild(document.createElement("br"));
        }
        app.appendChild(document.createElement("br"));
      }

      // 玩家信息
      for (const player of players) {
        const playerDiv = document.createElement("div");
        const name = document.createElement("h2");
        name.textContent = player.name + (player.id === currentPlayerIndex ? "（当前回合）" : "");
        playerDiv.appendChild(name);

        const tokens = document.createElement("p");
        const tokenList = Object.entries(player.tokens).filter(([,v]) => v > 0).map(([k,v]) => k + "x" + v).join(" ");
        tokens.textContent = "标记: " + (tokenList || "无");
        playerDiv.appendChild(tokens);

        const stats = document.createElement("p");
        stats.textContent = "声望: " + getTotalPoints(player) + " | 王冠: " + getTotalCrowns(player) + " | 卡牌: " + player.cards.length + " 张";
        playerDiv.appendChild(stats);

        app.appendChild(playerDiv);
      }
    }

    render();
  </script>
</body>
</html>
```

---

## 4. 代码讲解

### 引入已有函数

```javascript
import { takeTokens, validateTakePositions, purchaseCard, canAfford, getPlayerBonuses, getActualCost, getTotalPoints, getTotalCrowns, checkWinCondition } from "./game.js";
```

`game.js` 是由 `src/browser-entry.ts` 编译生成的，它导出了所有游戏逻辑函数。这样我们就不需要重新实现逻辑了。

### 游戏状态

```javascript
let currentPlayerIndex = 0;
const selected = [];
```

`currentPlayerIndex` 记录当前是哪个玩家（0 或 1）。`selected` 记录当前选中的版图格子。

### 回合切换

```javascript
currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
```

每次操作完成后切换玩家。三目运算符：如果当前是 0 就变成 1，否则变成 0。

### 胜利检测

```javascript
if (checkWinCondition(newPlayer)) {
  app.innerHTML = "";
  const win = document.createElement("h1");
  win.textContent = newPlayer.name + " 获胜！";
  app.appendChild(win);
  return;
}
```

购买卡牌后检查是否满足胜利条件，如果满足则显示胜利信息并停止游戏。

---

## 5. 你学到了什么

| 概念 | 说明 |
|------|------|
| **完整流程** | 版图 + 金字塔 + 玩家 + 回合切换 |
| **回合切换** | 操作完成后切换 currentPlayerIndex |
| **胜利检测** | 购买卡牌后检查 checkWinCondition |
