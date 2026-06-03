# 第 22 课：点击版图拿取标记

## 本节课目标

给版图格子绑定点击事件，调用 `src/` 中已有的 `takeTokens` 函数执行拿取操作。

---

## 1. 思路

之前的终端版中，拿取标记需要手动输入坐标。在 Web 版中，我们直接点击版图上的格子，点击的格子会高亮显示，最后点击"确认拿取"执行操作。

拿取规则（来自 `board.ts` 中的 `takeTokens`）：
- 1-3 个标记
- 必须在同一条直线（水平/垂直/对角线）上且相邻
- 不能包含黄金
- 3 个同色或 2 个珍珠 → 对手获得特权

---

## 2. 先编译 game.js

```bash
npm run build:web
```

这会把 `src/browser-entry.ts` 及其依赖编译到 `docs/lesson-22-点击版图拿取标记/game.js`。

---

## 3. 动手

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

  <script type="module">
    import { takeTokens } from "./game.js";

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
    hint.textContent = "点击格子选中（最多 3 个，必须相邻且在同一直线上），然后点确认";
    app.appendChild(hint);

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

    const msg = document.createElement("p");
    app.appendChild(msg);

    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "确认拿取";
    app.appendChild(confirmBtn);

    confirmBtn.addEventListener("click", function() {
      if (selected.length === 0) {
        msg.textContent = "请先点击格子选择标记";
        return;
      }

      const result = takeTokens(board, selected);

      for (const [r, c] of selected) {
        board[r][c] = null;
      }

      selected.length = 0;
      renderBoard();

      let text = "拿取了: " + result.taken.join(", ");
      if (result.opponentGetsPrivilege) {
        text += "（对手获得 1 个特权）";
      }
      msg.textContent = text;
    });
  </script>
</body>
</html>
```

---

## 4. 代码讲解

### 引入已有函数

```javascript
import { takeTokens } from "./game.js";
```

`game.js` 是由 `src/browser-entry.ts` 编译生成的，它导出了 `takeTokens` 等游戏逻辑函数。这样我们就不需要重新实现逻辑了。

### 调用 takeTokens

```javascript
const result = takeTokens(board, selected);
```

`takeTokens` 接收版图和选中的位置数组，返回：
- `taken`：实际拿取的标记列表
- `board`：更新后的版图
- `opponentGetsPrivilege`：对手是否获得特权

---

## 5. 你学到了什么

| 概念 | 说明 |
|------|------|
| **复用已有逻辑** | 通过 `import` 使用编译后的游戏函数 |
| **takeTokens** | 校验规则（相邻、直线、非黄金）并执行拿取 |
| **编译流程** | `npm run build:web` → 引用 `game.js` |
