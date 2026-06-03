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

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const token = board[r][c];
        const text = document.createTextNode(token || ".");
        container.appendChild(text);
        container.appendChild(document.createTextNode(" "));
      }
      container.appendChild(document.createElement("br"));
    }
  </script>
</body>
</html>
```

---

## 3. 代码讲解

### 双重循环

```javascript
for (let r = 0; r < 5; r++) {       // 遍历每一行
  for (let c = 0; c < 5; c++) {     // 遍历每一列
    // 处理每个格子
  }
}
```

外层循环控制行，内层循环控制列。总共遍历 5×5 = 25 个格子。

### `document.createTextNode`

```javascript
const text = document.createTextNode(token || ".");
```

创建一个纯文本节点。`token || "."` 的意思是：如果 token 有值就用 token，否则用 `"."` 表示空位。

### `document.createElement("br")`

`<br>` 是换行标签。每行结束后插入一个 `<br>`，让下一行从新行开始。

## 4. 如何查看 JS 动态插入的元素？

打开 F12 → **Elements（元素）** 标签，展开 `<div id="board-container">`，你会看到 JS 动态添加的文本节点和 `<br>` 标签。

**原始 HTML 源码**（右键 → 查看页面源代码）只能看到静态的 HTML，看不到 JS 动态插入的内容。但 **Elements 面板显示的是实时的 DOM 树**——页面当前长什么样，它就显示什么。

这是前端开发中非常重要的一个概念：**HTML 源码是设计图，DOM 是盖好的房子，Elements 面板让你看到房子现在的样子**。

---

## 5. 你学到了什么

| 概念 | 说明 |
|------|------|
| **双重循环** | 外层行、内层列，遍历二维数组 |
| **createTextNode** | 创建纯文本节点 |
| **createElement("br")** | 创建换行标签 |
| **二维数组** | `board[r][c]` 访问第 r 行第 c 列 |
