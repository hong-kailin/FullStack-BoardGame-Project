# 第 27 课：盒模型

## 本节课目标

理解 margin、padding、border 的区别，学会控制元素之间的间距。

---

## 1. 每个元素都是一个盒子

在 CSS 的世界里，每个 HTML 元素都被看作一个"盒子"：

```
┌─────────────────────────────────┐
│          margin（外边距）         │
│  ┌───────────────────────────┐  │
│  │      border（边框）         │  │
│  │  ┌─────────────────────┐  │  │
│  │  │    padding（内边距）   │  │  │
│  │  │  ┌───────────────┐  │  │  │
│  │  │  │   content     │  │  │  │
│  │  │  │   （内容）      │  │  │  │
│  │  │  └───────────────┘  │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

从内到外：**content → padding → border → margin**

---

## 2. 三个属性的区别

| 属性 | 位置 | 作用 |
|------|------|------|
| `padding` | 内容 和 边框 之间 | 让内容"喘口气"，不贴着边框 |
| `border` | padding 和 margin 之间 | 给元素加个边框线 |
| `margin` | 边框 外面 | 控制元素之间的距离 |

**类比**：想象你是一张照片装在相框里：
- **content** = 照片本身
- **padding** = 照片和相框之间的卡纸（白色边框）
- **border** = 相框的框
- **margin** = 这个相框和墙上其他相框之间的距离

---

## 3. 动手

创建 `docs/lesson-27-盒模型/index.html`：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>盒模型</title>
  <style>
    .card {
      background-color: #333;
      color: #eee;
      width: 200px;

      /* 内边距：内容不贴边 */
      padding: 20px;

      /* 边框：1px 宽的实线白边 */
      border: 1px solid white;

      /* 外边距：和其他元素拉开距离 */
      margin: 20px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>玩家 1</h2>
    <p>标记: 红x2 蓝x1</p>
    <p>声望: 3 | 王冠: 1</p>
  </div>

  <div class="card">
    <h2>玩家 2</h2>
    <p>标记: 无</p>
    <p>声望: 0 | 王冠: 0</p>
  </div>
</body>
</html>
```

---

## 4. 试试不同的值

把 `padding: 20px` 改成 `padding: 5px`，内容会贴着边框。

把 `margin: 20px` 改成 `margin: 5px`，两个卡片会挨得更近。

把 `border: 1px solid white` 改成 `border: 3px solid red`，边框变粗变红。

---

## 5. 你学到了什么

| 属性 | 作用 |
|------|------|
| `padding` | 内容与边框之间的间距 |
| `border` | 元素的边框线 |
| `margin` | 元素与外部的间距 |

---

## 6. 补充：h2 的浏览器默认样式是什么意思？

在 F12 中你会看到 `h2` 的 user agent stylesheet 长这样：

```css
h2 {
    display: block;
    font-size: 1.5em;
    margin-block-start: 0.83em;
    margin-block-end: 0.83em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
}
```

逐条解释：

| 属性 | 值 | 含义 |
|------|----|------|
| `display: block` | `block` | 块级元素，占一整行，前后自动换行 |
| `font-size: 1.5em` | 父元素字号的 1.5 倍 | 如果 body 默认 16px，h2 就是 24px |
| `margin-block-start: 0.83em` | 上外边距 = 0.83 × 当前字号 | 让 h2 上方和前面的内容拉开距离 |
| `margin-block-end: 0.83em` | 下外边距 = 0.83 × 当前字号 | 让 h2 下方和后面的内容拉开距离 |
| `margin-inline-start: 0px` | 左外边距 = 0 | 左边不留空 |
| `margin-inline-end: 0px` | 右外边距 = 0 | 右边不留空 |
| `font-weight: bold` | 加粗 | 标题默认就是粗体 |

### 为什么 margin 用 em 而不是 px？

`em` 在 `font-size` 和 `margin`/`padding` 上的参照对象不一样：

- **`font-size: 1.5em`** — 相对于**父元素**的字号
- **`margin: 0.83em`** — 相对于**当前元素自身**的字号

所以 h2 的 `margin-block-start: 0.83em` 实际算出来大约是 20px。

用 `em` 的好处是：如果 h2 的字号变了，margin 会自动跟着比例调整，不用手动改。

### 怎么看父元素的字号？

在 F12 的 **Computed（计算后）** 标签中，你可以看到元素最终生效的所有属性值（记得勾选 **Show all** 才能看到全部属性）。

在这个例子里，h2 的父元素是 `<div class="card">`。选中 card，看 Computed 中的 `font-size`——如果 card 自己没有设字号，它会显示继承自 body 的 16px。

**继承规则**：如果没有给某个元素设置 `font-size`，它会从父元素继承。body 的默认字号是 16px（由浏览器默认样式设置），所以 body 下的所有元素默认都是 16px，除非自己或中间的父元素重新设置了字号。

### margin-block-start 和 margin-top 有什么区别？

`margin-top` 是传统的写法，`margin-block-start` 是新的逻辑属性写法。在英文从左到右的排版中，两者效果一样。`block` 方向就是"从上到下"的方向，`inline` 方向就是"从左到右"的方向。

目前你直接用 `margin-top`、`margin-bottom`、`margin-left`、`margin-right` 就行，更直观。
