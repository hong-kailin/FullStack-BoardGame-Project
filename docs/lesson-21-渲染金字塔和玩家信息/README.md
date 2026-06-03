# 第 21 课：渲染金字塔和玩家信息

## 本节课目标

用 JS 动态生成金字塔卡牌列表和玩家信息，在页面上显示完整的游戏状态。

---

## 1. 金字塔数据

金字塔是三个等级的卡牌数组：

```javascript
const pyramid = [
  // 等级 1（5 张）
  [
    { id: 1, level: 1, gem: "red", points: 1, crowns: 0, bonusCount: 1, cost: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 3 } },
    { id: 2, level: 1, gem: "red", points: 2, crowns: 1, bonusCount: 1, cost: { red: 0, blue: 0, green: 2, white: 1, black: 0, pearl: 0 } },
    // ...
  ],
  // 等级 2（4 张）
  [ /* ... */ ],
  // 等级 3（3 张）
  [ /* ... */ ]
];
```

`pyramid[0]` 是等级 1，`pyramid[1]` 是等级 2，`pyramid[2]` 是等级 3。

---

## 2. 用 JS 渲染完整游戏界面

创建 `docs/lesson-21-渲染金字塔和玩家信息/index.html`：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>璀璨宝石对决</title>
</head>
<body>
  <div id="app"></div>

  <script>
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

    const player1 = {
      id: 0, name: "玩家 1",
      tokens: { red: 2, blue: 1, green: 0, white: 0, black: 3, pearl: 0, gold: 0 },
      cards: [
        { id: 1, level: 1, gem: "red", points: 1, crowns: 0, bonusCount: 1 },
        { id: 2, level: 1, gem: "red", points: 2, crowns: 1, bonusCount: 1 },
      ],
      royalCards: [], reservedCards: [], privileges: 0
    };

    const player2 = {
      id: 1, name: "玩家 2",
      tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
      cards: [],
      royalCards: [], reservedCards: [], privileges: 1
    };

    const app = document.getElementById("app");

    // 标题
    const title = document.createElement("h1");
    title.textContent = "璀璨宝石对决";
    app.appendChild(title);

    // 当前回合
    const turn = document.createElement("p");
    turn.textContent = "当前回合：玩家 1";
    app.appendChild(turn);

    // 金字塔
    const pyramidTitle = document.createElement("h2");
    pyramidTitle.textContent = "金字塔";
    app.appendChild(pyramidTitle);

    for (let level = 0; level < pyramid.length; level++) {
      const levelTitle = document.createElement("h3");
      levelTitle.textContent = "等级 " + (level + 1);
      app.appendChild(levelTitle);

      const list = document.createElement("ul");
      for (const card of pyramid[level]) {
        const li = document.createElement("li");

        // 把费用对象转成字符串，如 "绿x2 白x1"
        const costParts = [];
        for (const [color, amount] of Object.entries(card.cost)) {
          if (amount > 0) {
            costParts.push(color + "x" + amount);
          }
        }

        li.textContent = "[" + card.id + "] " + card.gem + " " + card.points + "分 " + card.crowns + "冠 | 费用: " + costParts.join(" ");
        list.appendChild(li);
      }
      app.appendChild(list);
    }

    // 渲染玩家
    function renderPlayer(player) {
      const div = document.createElement("div");

      const name = document.createElement("h2");
      name.textContent = player.name;
      div.appendChild(name);

      // 标记
      const tokens = document.createElement("p");
      const tokenList = [];
      for (const [type, amount] of Object.entries(player.tokens)) {
        if (amount > 0) {
          tokenList.push(type + "x" + amount);
        }
      }
      tokens.textContent = "标记: " + (tokenList.length > 0 ? tokenList.join(" ") : "无");
      div.appendChild(tokens);

      // 声望和王冠
      let totalPoints = 0;
      let totalCrowns = 0;
      for (const card of player.cards) {
        totalPoints += card.points;
        totalCrowns += card.crowns;
      }
      const stats = document.createElement("p");
      stats.textContent = "声望: " + totalPoints + " | 王冠: " + totalCrowns + " | 卡牌: " + player.cards.length + " 张";
      div.appendChild(stats);

      // 卡牌列表
      if (player.cards.length > 0) {
        const cardList = document.createElement("ul");
        for (const card of player.cards) {
          const li = document.createElement("li");
          li.textContent = "[" + card.id + "] " + card.gem + " " + card.points + "分 " + card.crowns + "冠";
          cardList.appendChild(li);
        }
        div.appendChild(cardList);
      }

      return div;
    }

    app.appendChild(renderPlayer(player1));
    app.appendChild(renderPlayer(player2));
  </script>
</body>
</html>
```

---

## 3. 代码讲解

### 遍历金字塔

```javascript
for (let level = 0; level < pyramid.length; level++) {
  for (const card of pyramid[level]) {
    // 处理每张卡牌
  }
}
```

`pyramid` 是一个二维数组，外层遍历等级，内层遍历该等级的所有卡牌。

### 渲染玩家函数

```javascript
function renderPlayer(player) {
  const div = document.createElement("div");
  // ... 创建各种子元素 ...
  return div;
}
```

把渲染逻辑封装成函数，传入玩家数据，返回创建好的 DOM 元素。这样两个玩家只需要调用两次 `renderPlayer`，代码不重复。

---

## 4. 你学到了什么

| 概念 | 说明 |
|------|------|
| **嵌套循环** | 遍历金字塔（外层等级，内层卡牌） |
| **Object.entries** | 把对象转成 `[key, value]` 数组 |
| **函数封装** | `renderPlayer(player)` 封装渲染逻辑 |
