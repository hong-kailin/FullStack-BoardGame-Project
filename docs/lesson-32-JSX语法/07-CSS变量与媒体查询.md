# 07. CSS 变量与媒体查询

## 1. CSS 变量（`--` 开头）

打开 `src/index.css`，你会看到很多以 `--` 开头的属性：

```css
:root {
  --text: #6b6375;
  --text-h: #08060d;
  --bg: #fff;
  --border: #e5e4e7;
  --accent: #aa3bff;
}
```

这些叫做 **CSS 自定义属性（CSS 变量）**。`--` 是它们的固定前缀。

## 2. 有什么用？

把颜色、字号等常用值存成变量，然后在其他地方引用：

```css
/* 定义变量 */
:root {
  --accent: #aa3bff;
  --bg: #fff;
}

/* 使用变量 */
body {
  background-color: var(--bg);
  color: var(--text);
}
```

## 3. 好处

1. **一处修改，全局生效** — 想换主题色，只改 `--accent` 的值就行，不用搜遍整个文件
2. **语义化** — `--accent` 比 `#aa3bff` 更容易理解
3. **配合媒体查询实现暗色模式**

**类比**：就像 C++ 的 `const int ACCENT_COLOR = 0xaa3bff;` 或 Python 的 `ACCENT_COLOR = "#aa3bff"`——把魔法数字变成有名字的常量。

## 4. `@media` 媒体查询

`@media` 是 CSS 的**媒体查询**，让 CSS 能根据设备条件应用不同的样式。

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #16171d;
  }
}
```

意思是：**如果用户系统是暗色模式，就把 `--bg` 改成深色**。

`@media` 后面跟条件，条件成立时里面的样式才生效。常用的条件：

| 条件 | 作用 |
|------|------|
| `(max-width: 1024px)` | 屏幕宽度 ≤ 1024px（平板/手机） |
| `(prefers-color-scheme: dark)` | 系统是暗色模式 |
| `(hover: none)` | 触摸屏设备（没有鼠标悬停） |

**类比**：就像 C++ 的 `#ifdef` 条件编译——不同平台编译不同的代码。`@media` 是不同设备应用不同的 CSS。

## 5. 暗色模式是怎么工作的？

`index.css` 中有一段：

```css
@media (prefers-color-scheme: dark) {
  :root {
    --text: #9ca3af;
    --bg: #16171d;
  }
}
```

当你的 macOS 切换到暗色模式时，浏览器检测到 `prefers-color-scheme: dark` 条件成立，自动应用里面的样式。所有用了 `var(--bg)` 的地方都会从白色变成深色。

你可以在 macOS 系统设置 → 外观中切换浅色/深色模式，然后刷新页面看看效果。

## 6. 一句话总结

**`--xxx` 是 CSS 变量，存颜色/字号等值方便复用。`@media` 是媒体查询，让 CSS 根据不同设备条件应用不同样式。**
