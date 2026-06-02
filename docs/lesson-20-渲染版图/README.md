# 第 20 课：渲染版图

## 本节课目标

用 JS 动态生成 5×5 版图网格，根据数据填充每个格子。

---

## 1. 版图数据长什么样

在游戏逻辑中，版图是一个 5×5 的二维数组：

```javascript
const board = [
  ["red", "blue", null, "green", "white"],
  ["black", "pearl", "gold", "red", "blue"],
  ["green", null, "black", "white", "red"],
  ["blue", "green", "white", "black", "pearl"],
  ["red", "blue", "green", "white", "black"]
];
```

每个元素是一个标记类型（`"red"`、`"blue"` 等）或 `null`（空位）。

---

## 2. 用 JS 生成网格

创建 `docs/lesson-20-渲染版图/index.html`：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>璀璨宝石对决 - 版图</title>
  <style>
    .board {
      display: inline-block;
      border: 2px solid #333;
    }
    .row {
      display: flex;
    }
    .cell {
      width: 50px;
      height: 50px;
      border: 1px solid #999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      cursor: pointer;
    }
    .cell.empty {
      background: #eee;
    }
    .cell.center {
      border-color: gold;
      border-width: 2px;
    }
  </style>
</head>
<body>
  <h1>版图</h1>
  <div id="board-container"></div>

  <script>
    const board = [
      ["red", "blue", null, "green", "white"],
      ["black", "pearl", "gold", "red", "blue"],
      ["green", null, "black", "white", "red"],
      ["blue", "green", "white", "black", "pearl"],
      ["red", "blue", "green", "white", "black"]
    ];

    const container = document.getElementById("board-container");
    const boardDiv = document.createElement("div");
    boardDiv.className = "board";

    for (let r = 0; r < 5; r++) {
      const rowDiv = document.createElement("div");
      rowDiv.className = "row";

      for (let c = 0; c < 5; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";

        // 中央格特殊标记
        if (r === 2 && c === 2) {
          cell.classList.add("center");
        }

        const token = board[r][c];
        if (token === null) {
          cell.classList.add("empty");
          cell.textContent = "";
        } else {
          cell.textContent = token;
        }

        rowDiv.appendChild(cell);
      }

      boardDiv.appendChild(rowDiv);
    }

    container.appendChild(boardDiv);
  </script>
</body>
</html>
```

---

## 3. 代码讲解

### 双重循环生成网格

```javascript
for (let r = 0; r < 5; r++) {       // 遍历每一行
  for (let c = 0; c < 5; c++) {     // 遍历每一列
    // 创建每个格子
  }
}
```

外层循环控制行，内层循环控制列。总共创建 5×5 = 25 个格子。

### CSS 让格子排列成网格

```css
.row { display: flex; }         // 行内元素横向排列
.cell { width: 50px; height: 50px; }  // 每个格子固定大小
```

`display: flex` 让行内的格子从左到右排列，不换行。

### 中央格特殊标记

```javascript
if (r === 2 && c === 2) {
  cell.classList.add("center");
}
```

`classList.add` 给元素添加一个 CSS class。中央格（第 2 行第 2 列）有金色边框。

---

## 4. 你学到了什么

| 概念 | 说明 |
|------|------|
| **双重循环** | 外层行、内层列，生成网格 |
| **classList.add** | 给元素添加 CSS class |
| **display: flex** | 让子元素横向排列 |
| **二维数组** | `board[r][c]` 访问第 r 行第 c 列 |
