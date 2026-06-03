# 第 25 课：CSS 入门

## 本节课目标

理解 CSS 是什么，学会给 HTML 元素添加颜色和字号。

---

## 1. 为什么需要 CSS？

看看你第 24 课做的游戏页面——所有文字都是黑白的，标题和正文分不清，按钮就是浏览器默认样式。

CSS 就是用来解决这个问题的。它控制页面上所有元素的**外观**：颜色、大小、位置、背景等等。

---

## 2. CSS 长什么样？

```css
h1 {
  color: red;
  font-size: 32px;
}
```

- `h1` 是**选择器**——告诉浏览器"我要给谁加样式"
- `color` 是**属性**——我要改什么
- `red` 是**值**——改成什么样

用大括号 `{}` 包起来，每条规则用分号 `;` 结尾。

---

## 3. 三种写 CSS 的方式

**方式一：内联样式（最直接，但不推荐）**
```html
<h1 style="color: red;">标题</h1>
```

**方式二：`<style>` 标签（练习时用）**
```html
<head>
  <style>
    h1 { color: red; }
  </style>
</head>
```

**方式三：外部 CSS 文件（正式项目用）**
```html
<head>
  <link rel="stylesheet" href="style.css">
</head>
```

这节课我们用方式二。

---

## 4. 动手：给游戏页面加点颜色

创建 `docs/lesson-25-CSS入门/index.html`：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>璀璨宝石对决</title>
  <style>
    body {
      background-color: #1a1a2e;
      color: #eee;
      font-family: "Microsoft YaHei", sans-serif;
    }

    h1 {
      color: #ffd700;
      text-align: center;
    }

    h2 {
      color: #e94560;
    }

    button {
      background-color: #e94560;
      color: white;
      border: none;
      padding: 8px 16px;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <h1>璀璨宝石对决</h1>
  <p>加了 CSS 的页面</p>

  <h2>版图</h2>
  <p>这里放版图</p>

  <h2>金字塔</h2>
  <p>这里放卡牌</p>

  <button>拿取标记</button>
  <button>购买卡牌</button>
</body>
</html>
```

---

## 5. 代码讲解

### 选择器

```css
body { ... }    /* 选中整个页面 */
h1 { ... }      /* 选中所有 h1 标签 */
h2 { ... }      /* 选中所有 h2 标签 */
button { ... }  /* 选中所有 button 标签 */
```

### 常用属性

| 属性 | 作用 | 示例值 |
|------|------|--------|
| `color` | 文字颜色 | `red`、`#ffd700`、`#eee` |
| `background-color` | 背景颜色 | `#1a1a2e`、`#e94560` |
| `font-size` | 字号 | `16px`、`32px` |
| `text-align` | 文字对齐 | `center`、`left` |
| `font-family` | 字体 | `"Microsoft YaHei", sans-serif` |
| `padding` | 内边距 | `8px 16px` |
| `border` | 边框 | `none`、`1px solid black` |

### 颜色值

```css
color: red;           /* 颜色名称 */
color: #ffd700;       /* 十六进制（最常用） */
color: rgb(255, 0, 0); /* RGB 值 */
```

`#ffd700` 是金色，`#1a1a2e` 是深蓝紫色，`#e94560` 是红色。

---

## 6. 补充：user agent stylesheet 是什么？

打开 F12 → Elements，选中一个元素，在 Styles 面板中你会看到一些灰色文字写着 "user agent stylesheet"。

这是**浏览器自带的默认样式**。每个浏览器都有自己的一套默认 CSS——比如 Chrome 会给 `h1` 设置较大的字号和加粗，给 `body` 设置 `margin: 8px`，给 `button` 设置默认的边框和背景色。

你写的 CSS 会覆盖这些默认样式。比如你在 `style` 里写了 `button { border: none; }`，就会覆盖浏览器默认的按钮边框。

**user agent** 就是"浏览器"的别称。所以 user agent stylesheet 就是"浏览器默认样式表"。

你可以在 F12 的 Styles 面板中看到优先级：
1. 你的 CSS（最优先）
2. user agent stylesheet（浏览器默认）
3. 继承自父元素的样式（优先级最低）

如果你想让某个元素完全"从零开始"，可以加：

```css
* {
  margin: 0;
  padding: 0;
}
```

这叫"CSS reset"——把所有元素的默认边距清零，然后再自己重新设置。不过现在先不用管，了解就行。

打开 F12 → Elements，选中一个元素，在 Styles 面板中你会看到一些灰色文字写着 "user agent stylesheet"。

这是**浏览器自带的默认样式**。每个浏览器都有自己的一套默认 CSS——比如 Chrome 会给 `h1` 设置较大的字号和加粗，给 `body` 设置 `margin: 8px`，给 `button` 设置默认的边框和背景色。

你写的 CSS 会覆盖这些默认样式。比如你在 `style` 里写了 `button { border: none; }`，就会覆盖浏览器默认的按钮边框。

**user agent** 就是"浏览器"的别称。所以 user agent stylesheet 就是"浏览器默认样式表"。

你可以在 F12 的 Styles 面板中看到优先级：
1. 你的 CSS（最优先）
2. user agent stylesheet（浏览器默认）
3. 继承自父元素的样式（优先级最低）

如果你想让某个元素完全"从零开始"，可以加：

```css
* {
  margin: 0;
  padding: 0;
}
```

这叫"CSS reset"——把所有元素的默认边距清零，然后再自己重新设置。不过现在先不用管，了解就行。

---

## 7. 你学到了什么

| 概念 | 说明 |
|------|------|
| **CSS** | 控制 HTML 元素的外观 |
| **选择器** | 告诉浏览器要给谁加样式 |
| **属性: 值** | 每条规则由属性和值组成 |
| **颜色** | 可以用名称、十六进制、RGB |
