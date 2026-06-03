# 第 22 课：点击版图拿取标记

## 本节课目标

给版图格子绑定点击事件，点击格子记录选中的位置，点击按钮执行 take 操作。

---

## 1. 思路

之前的终端版中，拿取标记需要手动输入坐标。在 Web 版中，我们直接点击版图上的格子，点击的格子会高亮显示，最后点击"确认拿取"执行操作。

流程：
1. 点击版图格子 → 选中/取消选中
2. 选中的格子用 `[ ]` 标记
3. 点击"确认拿取" → 执行 takeTokens
4. 更新页面显示

---

## 2. 动手

创建 `docs/lesson-22-点击版图拿取标记/index.html`：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>璀璨宝石对决 - 拿取标记</title>
</head>
<body>
  <div id="app"></div>

  <script>
    const board = [
      ["red", "blue", null, "green", "white"],
      ["black", "pearl", "gold", "red", "blue"],
      ["green", null, "black", "white", "red"],
      ["blue", "green", "white", "black", "pearl"],
      ["red", "blue", "green", "white", "black"]
    ];

    const selected = [];

    const app = document.getElementById("app");

    const title = document.createElement("h1");
    title.textContent = "点击版图拿取标记";
    app.appendChild(title);

    const hint = document.createElement("p");
    hint.textContent = "点击格子选中（最多 3 个），然后点确认";
    app.appendChild(hint);

    // 渲染版图
    const boardDiv = document.createElement("div");

    function renderBoard() {
      boardDiv.innerHTML = "";

      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const token = board[r][c];
          const span = document.createElement("span");

          const isSelected = selected.some(pos => pos[0] === r && pos[1] === c);
          const display = isSelected ? "[" + (token || ".") + "]" : " " + (token || ".") + " ";

          span.textContent = display;

          span.addEventListener("click", function() {
            if (token === null || token === "gold") return;

            const idx = selected.findIndex(pos => pos[0] === r && pos[1] === c);
            if (idx >= 0) {
              selected.splice(idx, 1);
            } else if (selected.length < 3) {
              selected.push([r, c]);
            }

            renderBoard();
          });

          boardDiv.appendChild(span);
          boardDiv.appendChild(document.createTextNode(" "));
        }
        boardDiv.appendChild(document.createElement("br"));
      }
    }

    renderBoard();
    app.appendChild(boardDiv);

    // 已选位置显示
    const selectedInfo = document.createElement("p");
    app.appendChild(selectedInfo);

    // 确认按钮
    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "确认拿取";
    app.appendChild(confirmBtn);

    confirmBtn.addEventListener("click", function() {
      if (selected.length === 0) {
        selectedInfo.textContent = "请先点击格子选择标记";
        return;
      }

      const taken = [];
      for (const [r, c] of selected) {
        taken.push(board[r][c]);
        board[r][c] = null;
      }

      selected.length = 0;
      renderBoard();
      selectedInfo.textContent = "拿取了: " + taken.join(", ");
    });
  </script>
</body>
</html>
```

---

## 3. 代码讲解

### 选中状态管理

```javascript
const selected = [];
```

`selected` 数组存储当前选中的格子坐标，如 `[[0, 0], [0, 1]]`。

### 点击格子切换选中

```javascript
span.addEventListener("click", function() {
  const idx = selected.findIndex(pos => pos[0] === r && pos[1] === c);
  if (idx >= 0) {
    selected.splice(idx, 1);  // 已选中 → 取消
  } else if (selected.length < 3) {
    selected.push([r, c]);    // 未选中 → 添加
  }
  renderBoard();              // 重新渲染
});
```

`findIndex` 查找是否已选中该格子。如果已选中就移除（取消选中），未选中且未满 3 个就添加。

### 重新渲染

每次选中状态变化后调用 `renderBoard()`，重新生成版图。选中的格子用 `[red]` 显示，未选中的用 ` red ` 显示。

### 确认拿取

```javascript
confirmBtn.addEventListener("click", function() {
  const taken = [];
  for (const [r, c] of selected) {
    taken.push(board[r][c]);
    board[r][c] = null;       // 从版图移除
  }
  selected.length = 0;        // 清空选中
  renderBoard();              // 重新渲染
});
```

遍历选中的位置，把标记从版图中移除，记录到 `taken` 数组中。

---

## 4. 你学到了什么

| 概念 | 说明 |
|------|------|
| **点击选中** | 点击格子切换选中/取消 |
| **findIndex** | 查找元素在数组中的索引 |
| **splice** | 从数组中删除元素 |
| **重新渲染** | 数据变了就重新生成 DOM |
