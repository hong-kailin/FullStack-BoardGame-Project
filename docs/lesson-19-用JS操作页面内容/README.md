# 第 19 课：用 JS 操作页面内容

## 本节课目标

学会用 JavaScript 动态创建和修改页面内容，不再写死 HTML。

---

## 1. 为什么需要动态操作？

到目前为止，我们的 HTML 页面内容都是**写死**的——金字塔里的卡牌列表是手动敲进去的。如果游戏状态变了（比如买了一张卡），页面不会自动更新。

要让页面"活"起来，需要用 JavaScript 动态创建和修改 HTML 元素。

---

## 2. 三个核心方法

### 2.1 `document.createElement` — 创建元素

```javascript
const h1 = document.createElement("h1");
```

这行代码创建了一个 `<h1>` 元素，但它还不在页面上——就像你做好了一个零件，还没装到机器上。

### 2.2 `textContent` — 设置文字

```javascript
h1.textContent = "璀璨宝石对决";
```

把元素的文字内容设为"璀璨宝石对决"。现在 `<h1>` 变成了 `<h1>璀璨宝石对决</h1>`。

### 2.3 `appendChild` — 添加到页面

```javascript
document.body.appendChild(h1);
```

把创建好的元素添加到页面的 `<body>` 中。现在浏览器里才真正显示出来。

---

## 3. 动手：用 JS 动态渲染游戏页面

创建 `docs/lesson-19-用JS操作页面内容/index.html`：

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
    import { getPlayerBonuses, getActualCost, canAfford } from "./game.js";

    const app = document.getElementById("app");

    // 游戏数据
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

    // 渲染标题
    const title = document.createElement("h1");
    title.textContent = "璀璨宝石对决";
    app.appendChild(title);

    // 渲染玩家信息
    function renderPlayer(player) {
      const div = document.createElement("div");
      const name = document.createElement("h2");
      name.textContent = player.name;
      div.appendChild(name);

      // 标记
      const tokens = document.createElement("p");
      const tokenList = Object.entries(player.tokens)
        .filter(([, v]) => v > 0)
        .map(([type, amount]) => `${type}x${amount}`)
        .join(" ");
      tokens.textContent = "标记: " + (tokenList || "无");
      div.appendChild(tokens);

      // 声望和王冠
      let totalPoints = 0;
      let totalCrowns = 0;
      for (const card of player.cards) {
        totalPoints += card.points;
        totalCrowns += card.crowns;
      }
      const stats = document.createElement("p");
      stats.textContent = `声望: ${totalPoints} | 王冠: ${totalCrowns} | 卡牌: ${player.cards.length} 张`;
      div.appendChild(stats);

      // 卡牌列表
      if (player.cards.length > 0) {
        const cardList = document.createElement("ul");
        for (const card of player.cards) {
          const li = document.createElement("li");
          li.textContent = `[${card.id}] ${card.gem} ${card.points}分 ${card.crowns}冠`;
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

## 4. 代码讲解

### `document.createElement("div")`
创建一个新的 `<div>` 元素，此时它还不存在于页面中。

### `element.textContent = "..."`
设置元素的文字内容。

### `parent.appendChild(child)`
把 `child` 元素添加到 `parent` 元素的末尾。

### 用函数封装渲染逻辑

```javascript
function renderPlayer(player) {
  const div = document.createElement("div");
  // ... 创建各种子元素 ...
  return div;
}
```

把渲染一个玩家的逻辑封装成函数，返回创建好的元素。这样代码更清晰，也方便复用。

---

## 5. 在浏览器中查看

1. 先运行 `npm run build:web` 编译 game.js
2. 用 Live Preview 打开 `index.html`

---

## 6. 你学到了什么

| 方法 | 作用 |
|------|------|
| `document.createElement("标签名")` | 创建一个新的 HTML 元素 |
| `element.textContent = "文字"` | 设置元素的文字内容 |
| `parent.appendChild(child)` | 把子元素添加到父元素中 |
