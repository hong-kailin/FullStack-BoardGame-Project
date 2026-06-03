# 第 28 课：Flexbox 布局

## 本节课目标

学会用 Flexbox 让元素横向排列和居中。

---

## 1. 为什么需要 Flexbox？

默认情况下，块级元素（`<div>`、`<p>`、`<h1>` 等）是**从上到下**纵向排列的，每个占一整行。

但很多时候你需要**横向排列**——比如两个玩家信息并排显示，或者按钮排成一行。Flexbox 就是用来做这个的。

---

## 2. 什么是 Flexbox？

Flexbox 是 CSS 提供的一种**布局模式**。你只需要在父元素上加 `display: flex`，它的子元素就会自动横向排列。

```css
.container {
  display: flex;
}
```

---

## 3. 核心概念

```
┌─────────────────────────────────────────┐
│         容器 (display: flex)              │
│                                          │
│  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │ 项目1 │  │ 项目2 │  │ 项目3 │           │
│  └──────┘  └──────┘  └──────┘           │
│                                          │
│  ←────────── 主轴 (main axis) ─────────→ │
└─────────────────────────────────────────┘
```

- **容器**：设置了 `display: flex` 的元素
- **项目**：容器内的子元素
- **主轴**：项目排列的方向（默认从左到右）
- **交叉轴**：与主轴垂直的方向（默认从上到下）

---

## 4. 常用属性

### 在容器上设置

| 属性 | 作用 | 常用值 |
|------|------|--------|
| `display: flex` | 开启 Flexbox | `flex` |
| `justify-content` | 主轴方向的对齐方式 | `center`（居中）、`space-between`（两端对齐）、`flex-start`（左对齐） |
| `align-items` | 交叉轴方向的对齐方式 | `center`（居中）、`flex-start`（顶部对齐） |
| `gap` | 项目之间的间距 | `20px` |

---

## 5. 动手

创建 `docs/lesson-28-Flexbox布局/index.html`：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Flexbox 布局</title>
  <style>
    .container {
      display: flex;
      justify-content: center;
      gap: 20px;
    }

    .box {
      background-color: #333;
      color: #eee;
      padding: 20px;
      border: 1px solid white;
      width: 150px;
    }
  </style>
</head>
<body>
  <h1>玩家信息</h1>

  <div class="container">
    <div class="box">
      <h2>玩家 1</h2>
      <p>标记: 红x2 蓝x1</p>
      <p>声望: 3</p>
    </div>

    <div class="box">
      <h2>玩家 2</h2>
      <p>标记: 无</p>
      <p>声望: 0</p>
    </div>
  </div>
</body>
</html>
```

---

## 6. 试试不同效果

把 `justify-content: center` 改成：

- `flex-start` — 左对齐
- `flex-end` — 右对齐
- `space-between` — 两端对齐，中间等距

把 `gap: 20px` 改成 `gap: 5px`，两个卡片会挨得更近。

---

## 7. 你学到了什么

| 属性 | 作用 |
|------|------|
| `display: flex` | 开启 Flexbox，子元素横向排列 |
| `justify-content` | 控制水平方向的对齐 |
| `align-items` | 控制垂直方向的对齐 |
| `gap` | 控制项目之间的间距 |
