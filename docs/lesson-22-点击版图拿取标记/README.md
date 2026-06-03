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
    import { takeTokens } from "../../web/game.js";

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

### 这里为什么用 `span`？

```javascript
const span = document.createElement("span");
```

`span` 是 HTML 里的一个**行内元素（inline element）**。它本身没有特别强的语义，常常用来包住一小段文字或一个很小的内容块。

你可以把它理解成一个"轻量的小盒子"。

比如：

```html
<p>你有 <span>3</span> 个红宝石</p>
```

这里 `span` 只是把 `3` 这段内容单独包起来，方便后续设置样式或单独操作。

在这节课里，每个版图格子只是一个小小的显示单元，所以用 `span` 很方便：

- 每个格子创建一个 `span`
- 把格子的内容写进 `span.textContent`
- 给这个 `span` 绑定点击事件
- 用户点哪个格子，就处理哪个格子

和它对比：

- `div` 更像块级的大盒子，常用于布局和分区域
- `span` 更像行内的小盒子，适合包一小段内容
- `button` 是有明确"可点击控件"语义的元素

这节课用 `span` 的原因是：它足够轻量，拿来演示"把每个格子变成可点击对象"很直接。

### 为什么 `span` 可以绑定点击事件？

```javascript
span.addEventListener("click", function() {
  ...
});
```

因为这里的 `span` 不是普通字符串，也不是普通 JavaScript 对象，而是浏览器创建出来的一个 **DOM 元素对象**。

DOM 元素属于浏览器事件系统的一部分，所以它支持 `addEventListener(...)`。

这句话的意思是：

- 给这个 `span` 注册一个点击监听器
- 当用户点击它时
- 执行后面的函数

你可以把它理解成：

- `span` 是门
- `addEventListener("click", fn)` 是给门装门铃
- 点击门时，门铃响，也就是执行 `fn`

### 是不是所有对象都能绑定事件？

**不是。**

不是所有 JavaScript 对象都能调用 `addEventListener`。只有那些实现了事件机制的对象，才能这样绑定事件。

常见可以绑定事件的对象有：

- `window`
- `document`
- 各种 DOM 元素，比如 `div`、`span`、`button`、`input`

例如：

```javascript
window.addEventListener("resize", function() {
  console.log("窗口大小变化了");
});

document.addEventListener("click", function() {
  console.log("页面被点击了");
});

span.addEventListener("click", function() {
  console.log("格子被点击了");
});
```

但普通对象通常不行：

```javascript
const obj = { name: "test" };
obj.addEventListener("click", function() {}); // ❌ 报错
```

因为这个 `obj` 只是一个普通 JavaScript 对象，不属于 DOM，也没有浏览器提供的事件系统。

### 怎么判断一个东西能不能绑事件？

最简单的经验判断是：

- 如果它是 `document.createElement(...)` 创建出来的元素，通常可以
- 如果它是 `window`、`document` 这类浏览器对象，通常也可以
- 如果它只是普通的 `{}`、`[]`、数字、字符串，一般不可以

更本质地说，要看它是不是浏览器事件系统支持的对象。

### 一个开发上的补充

教学里用 `span` 做点击格子完全没问题，因为它简单直接。

但如果以后你要做更正式的交互界面，要记住：

- `span` 只是通用容器
- `button` 才是天生表示"可点击操作"的元素

所以正式项目里，如果一个元素本质上是"按钮"，通常优先考虑 `button`，因为它的语义和可访问性更好。

---

## 5. 你学到了什么

| 概念 | 说明 |
|------|------|
| **复用已有逻辑** | 通过 `import` 使用编译后的游戏函数 |
| **takeTokens** | 校验规则（相邻、直线、非黄金）并执行拿取 |
| **span 元素** | 一个轻量的行内 DOM 元素，可以用来包住小块内容 |
| **事件绑定** | 不是所有对象都能绑定事件，常见是 `window`、`document` 和 DOM 元素 |
| **编译流程** | `npm run build:web` → 引用 `game.js` |
