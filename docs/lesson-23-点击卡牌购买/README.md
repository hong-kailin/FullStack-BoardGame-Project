# 第 23 课：点击卡牌购买

## 本节课目标

点击金字塔中的卡牌，调用 `src/` 中已有的 `purchaseCard` 函数执行购买操作。

---

## 1. 思路

1. 显示金字塔卡牌列表
2. 点击卡牌 → 尝试购买
3. 调用 `purchaseCard` 和 `canAfford` 检查并执行
4. 更新页面显示

---

## 2. 动手

创建 `docs/lesson-23-点击卡牌购买/index.html`：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>璀璨宝石对决 - 购买卡牌</title>
</head>
<body>
  <div id="app"></div>

  <script type="module">
    import { purchaseCard, canAfford, getPlayerBonuses, getActualCost } from "../../web/game.js";

    const pyramid = [
      [
        { id: 1, level: 1, gem: "red", points: 1, crowns: 0, bonusCount: 1, cost: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 3 } },
        { id: 2, level: 1, gem: "red", points: 2, crowns: 1, bonusCount: 1, cost: { red: 0, blue: 0, green: 2, white: 1, black: 0, pearl: 0 } },
        { id: 3, level: 1, gem: "blue", points: 1, crowns: 0, bonusCount: 1, cost: { red: 0, blue: 0, green: 0, white: 0, black: 3, pearl: 0 } },
      ],
      [
        { id: 9, level: 2, gem: "red", points: 3, crowns: 1, bonusCount: 1, cost: { red: 0, blue: 3, green: 0, white: 2, black: 0, pearl: 1 } },
        { id: 10, level: 2, gem: "red", points: 4, crowns: 2, bonusCount: 2, cost: { red: 0, blue: 0, green: 4, white: 0, black: 3, pearl: 0 } },
      ],
      [
        { id: 17, level: 3, gem: "red", points: 5, crowns: 2, bonusCount: 1, cost: { red: 0, blue: 4, green: 0, white: 4, black: 0, pearl: 2 } },
      ],
    ];

    let player = {
      id: 0, name: "玩家 1",
      tokens: { red: 3, blue: 3, green: 3, white: 3, black: 3, pearl: 1, gold: 2 },
      cards: [],
      royalCards: [], reservedCards: [], privileges: 0
    };

    const app = document.getElementById("app");

    const title = document.createElement("h1");
    title.textContent = "点击卡牌购买";
    app.appendChild(title);

    const playerInfo = document.createElement("p");
    app.appendChild(playerInfo);

    const msg = document.createElement("p");
    app.appendChild(msg);

    const pyramidDiv = document.createElement("div");

    function render() {
      playerInfo.textContent = "标记: " + Object.entries(player.tokens).filter(([,v]) => v > 0).map(([k,v]) => k + "x" + v).join(" ") + " | 卡牌: " + player.cards.length + " 张";

      pyramidDiv.innerHTML = "";

      for (let level = 0; level < pyramid.length; level++) {
        const levelTitle = document.createElement("h3");
        levelTitle.textContent = "等级 " + (level + 1);
        pyramidDiv.appendChild(levelTitle);

        for (const card of pyramid[level]) {
          const span = document.createElement("span");
          const costStr = Object.entries(card.cost).filter(([,v]) => v > 0).map(([k,v]) => k + "x" + v).join(" ");
          span.textContent = "[" + card.id + "] " + card.gem + " " + card.points + "分 | 费用: " + costStr + "  ";

          span.addEventListener("click", function() {
            const bonuses = getPlayerBonuses(player);
            const actualCost = getActualCost(card, bonuses);

            if (!canAfford(player, actualCost)) {
              msg.textContent = "宝石不足，无法购买卡牌 " + card.id;
              return;
            }

            player = purchaseCard(player, card, actualCost);

            pyramid[level] = pyramid[level].filter(c => c.id !== card.id);

            render();
            msg.textContent = "购买了卡牌 " + card.id;
          });

          pyramidDiv.appendChild(span);
        }
        pyramidDiv.appendChild(document.createElement("br"));
      }
    }

    render();
    app.appendChild(pyramidDiv);
  </script>
</body>
</html>
```

---

## 3. 代码讲解

### 购买流程

```javascript
const bonuses = getPlayerBonuses(player);
const actualCost = getActualCost(card, bonuses);

if (!canAfford(player, actualCost)) {
  msg.textContent = "宝石不足";
  return;
}

player = purchaseCard(player, card, actualCost);
pyramid[level] = pyramid[level].filter(c => c.id !== card.id);
```

1. 计算奖励折扣
2. 计算实际费用
3. 检查是否买得起
4. 执行购买
5. 从金字塔移除已购买的卡牌

### 重新渲染

```javascript
function render() {
  // ... 重新生成所有 DOM
}
```

每次购买后调用 `render()` 重新渲染，更新玩家信息和金字塔。

---

## 4. 你学到了什么

| 概念 | 说明 |
|------|------|
| **购买流程** | 检查费用 → 执行购买 → 更新显示 |
| **filter** | 从数组中移除已购买的卡牌 |
| **重新渲染** | 数据变化后重新生成 DOM |
