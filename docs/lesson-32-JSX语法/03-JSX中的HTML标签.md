# 03. JSX 中的 HTML 标签

## 1. JSX 和 HTML 的差异

JSX 看起来像 HTML，但有一些重要的区别。

## 2. `className` 而不是 `class`

在 HTML 中，设置 CSS 类用 `class`：

```html
<div class="hero">
```

在 JSX 中，要用 `className`：

```tsx
<div className="hero">
```

**原因**：`class` 是 JavaScript 的保留关键字（用来定义类的），所以 React 改用 `className`。

类似的还有：

| HTML | JSX | 原因 |
|------|-----|------|
| `class` | `className` | `class` 是 JS 保留字 |
| `for`（label 的 for 属性） | `htmlFor` | `for` 是 JS 保留字 |
| `tabindex` | `tabIndex` | 驼峰命名 |
| `onclick` | `onClick` | 驼峰命名 |

## 3. `{}` 嵌入 JavaScript 表达式

在 JSX 中，花括号 `{}` 表示"这里写 JavaScript 表达式"。

```tsx
<img src={heroImg} />
```

`heroImg` 是一个变量，它的值是图片路径。如果不加花括号，`src="heroImg"` 会被当作字符串处理。

再比如：

```tsx
<p>Count is {count}</p>
```

`{count}` 会把 count 的当前值显示在页面上。

**规则**：JSX 中遇到 `{}`，里面就写 JS 代码。可以是变量、函数调用、运算表达式。

## 4. 自闭合标签

没有子元素的标签可以自闭合：

```tsx
<img src={heroImg} className="base" />
<input type="text" />
<br />
```

和 HTML5 一样。

## 5. `<section>` 标签

`<section>` 是原生 HTML5 标签，表示文档中的一个"区域"或"章节"。

```html
<div>       <!-- 没有语义，就是一个容器 -->
<section>   <!-- 有语义，表示这是一个章节/区域 -->
```

在 `App.tsx` 中用了三个 `<section>`：

```tsx
<section id="center">     ← 中心区域（logo + 按钮）
<section id="next-steps"> ← 下一步区域（文档链接 + 社交链接）
<section id="spacer">     ← 底部留白区域
```

用 `<section>` 的好处：
- 对搜索引擎更友好
- 对屏幕阅读器更友好
- 代码自解释

**类比**：`<div>` 就像白纸，你可以画任何东西。`<section>` 就像标了"第一章"的纸——功能一样，但多了个标签说明用途。

## 6. 一句话总结

**JSX ≈ HTML，但 `class` 要写成 `className`，JS 代码要包在 `{}` 里。**
