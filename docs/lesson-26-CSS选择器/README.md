# 第 26 课：CSS 选择器

## 本节课目标

学会用标签选择器、class 选择器、id 选择器精确选中页面元素，理解优先级规则。

---

## 1. 为什么需要不同的选择器？

上一课我们用标签选择器（`h1`、`button`）给所有同类型元素加了样式。但问题来了——如果我想让"拿取标记"按钮是红色，"跳过回合"按钮是灰色，用标签选择器做不到，因为它们都是 `<button>`。

这时候就需要 **class 选择器**。

---

## 2. 三种选择器

### 标签选择器

选中**所有**该标签的元素：

```css
button {
  background-color: red;
}
```

所有 `<button>` 都会变红。

### class 选择器

选中**所有** `class="xxx"` 的元素。class 可以重复使用：

```html
<button class="btn-primary">拿取标记</button>
<button class="btn-secondary">跳过回合</button>
```

```css
.btn-primary {
  background-color: #e94560;
}
.btn-secondary {
  background-color: #555;
}
```

class 选择器用 `.` 开头。

### id 选择器

选中**唯一** `id="xxx"` 的元素。一个页面只能有一个 id：

```html
<p id="turn-info">当前回合：玩家 1</p>
```

```css
#turn-info {
  font-size: 20px;
  color: #ffd700;
}
```

id 选择器用 `#` 开头。

---

## 3. 优先级规则

当多个选择器冲突时，谁说了算？

```
id 选择器 (#xxx)  >  class 选择器 (.xxx)  >  标签选择器 (div)
```

```css
button { color: blue; }        /* 标签选择器，优先级最低 */
.btn { color: red; }           /* class 选择器，优先级中等 */
#special { color: green; }     /* id 选择器，优先级最高 */
```

```html
<button class="btn" id="special">什么颜色？</button>
<!-- 最终是绿色，因为 id 选择器优先级最高 -->
```

---

## 4. 动手

创建 `docs/lesson-26-CSS选择器/index.html`：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CSS 选择器</title>
  <style>
    .btn {
      padding: 10px 20px;
      font-size: 16px;
      border: none;
    }

    .btn-primary {
      background-color: #e94560;
      color: white;
    }

    .btn-secondary {
      background-color: #555;
      color: #eee;
    }

    #turn-info {
      font-size: 20px;
      color: #ffd700;
    }

    .highlight {
      background-color: #333;
      padding: 10px;
    }
  </style>
</head>
<body>
  <h1>璀璨宝石对决</h1>
  <p id="turn-info">当前回合：玩家 1</p>

  <div class="highlight">
    <h2>版图</h2>
    <p>这里放 5x5 版图</p>
  </div>

  <div class="highlight">
    <h2>金字塔</h2>
    <p>这里放卡牌</p>
  </div>

  <button class="btn btn-primary">拿取标记</button>
  <button class="btn btn-secondary">跳过回合</button>
</body>
</html>
```

---

## 5. 代码讲解

### class 可以叠加

```html
<button class="btn btn-primary">拿取标记</button>
```

一个元素可以有多个 class，用空格分隔。`btn` 提供通用按钮样式（内边距、字号），`btn-primary` 提供颜色。这样不同的按钮可以共用 `btn` 的通用样式，只通过 `btn-primary` / `btn-secondary` 改变颜色。

**类比**：就像一个人可以同时有多个身份——"程序员"和"吉他手"。两个身份对应的属性（会写代码、会弹吉他）都生效。`btn` 是"按钮的通用样式"，`btn-primary` 是"这个按钮是红色的"。

### class 可以重复使用

```html
<div class="highlight">...</div>
<div class="highlight">...</div>
```

多个元素可以有相同的 class，适合给"同一类"元素设置相同样式。

### id 只能有一个

```html
<p id="turn-info">当前回合：玩家 1</p>
```

id 在整个页面中必须是唯一的。适合选中"特定的"元素，比如回合信息、标题等。

---

## 6. 你学到了什么

| 选择器 | 写法 | 选中谁 | 能否重复 |
|--------|------|--------|---------|
| 标签选择器 | `button` | 所有该标签 | 自动重复 |
| class 选择器 | `.btn` | 所有 class 为该值的元素 | 可以重复 |
| id 选择器 | `#turn-info` | 唯一一个元素 | 不能重复 |

优先级：`id` > `class` > `标签`

---

## 7. 补充：CSS 中的单位

在 F12 的 Styles 面板中，你可能会看到 `h1` 的 `font-size` 显示为 `0.67em`。这是浏览器默认样式中的值。

### `em` 是什么？

`em` 是一个相对单位，相对于**父元素的字号**。

- `1em` = 父元素的字号
- `0.67em` = 父元素字号的 0.67 倍

比如：

```html
<div style="font-size: 32px;">
  <h1 style="font-size: 0.67em;">标题</h1>
  <!-- h1 的字号 = 32 × 0.67 ≈ 21px -->
</div>
```

浏览器的默认样式里，`h1` 的字号是 `2em`（父元素是 `body`，默认字号 16px，所以 `h1` 是 32px），`h2` 是 `1.5em`（24px），`h3` 是 `1.17em`（约 19px），`h4` 是 `1em`（16px）。

### 其他常用单位

| 单位 | 含义 | 示例 |
|------|------|------|
| `px` | 像素，绝对大小 | `16px` |
| `em` | 相对于父元素字号 | `2em` = 父元素字号的 2 倍 |
| `rem` | 相对于根元素（`html`）字号 | `2rem` = 根元素字号的 2 倍 |
| `%` | 百分比 | `width: 50%` = 父元素宽度的一半 |

初学者先用 `px` 最安全，后面再慢慢理解 `em` 和 `rem`。
