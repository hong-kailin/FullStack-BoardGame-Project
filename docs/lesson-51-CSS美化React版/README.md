# 第 51 课：CSS 美化 React 版

## 学习目标

- 用 CSS 变量统一管理颜色，理解"设计系统"的概念
- 掌握 `transition`、`transform`、`box-shadow` 让界面"活起来"
- 理解 `z-index` 的作用——控制元素堆叠层级
- 用 `@media` 实现响应式布局

---

## 核心概念讲解

### 1. CSS 变量 — 统一管理颜色

```css
:root {
  --accent: #aa3bff;
  --accent-bg: rgba(170, 59, 255, 0.1);
  --border: #e5e4e7;
  --shadow: rgba(0, 0, 0, 0.1) 0 10px 15px -3px, ...;
}
```

**类比**：就像在代码里定义常量 `const ACCENT = "#aa3bff"`，而不是到处写魔法数字。

**好处**：改一个地方，全局生效。而且支持暗色模式——`@media (prefers-color-scheme: dark)` 下重新定义变量值即可。

**使用方式**：`color: var(--accent)` — 用 `var()` 读取变量值。

---

### 2. transition — 让变化有动画

```css
.board-cell {
  transition: all 0.2s ease;
}
```

**含义**：当这个元素的任何 CSS 属性发生变化时（比如 hover 时改了 `transform`），用 0.2 秒平滑过渡，而不是瞬间跳变。

- `all` — 所有属性都参与过渡
- `0.2s` — 过渡持续 0.2 秒
- `ease` — 缓动函数，开始快、中间慢、结束快（更自然）

**类比**：就像动画的"补间帧"——你只定义了起始状态和结束状态，浏览器自动计算中间过程。

---

### 3. transform — 变形但不影响布局

```css
.board-cell:hover {
  transform: scale(1.08);
}
```

**关键点**：`transform` 只改变视觉呈现，**不影响文档流**。元素放大后不会把旁边的元素挤开。

这和直接改 `width`/`height` 完全不同——改尺寸会触发重排（reflow），性能差；`transform` 只触发合成（composite），性能好。

| 属性 | 影响布局？ | 性能 |
|------|-----------|------|
| `width`/`height` | 是，触发重排 | 差 |
| `transform: scale()` | 否，只改视觉 | 好 |

**常用 transform**：
- `scale(1.08)` — 放大到 108%
- `translateY(-4px)` — 向上移动 4px（hover 上浮效果）
- `rotate(5deg)` — 旋转

---

### 4. box-shadow — 阴影制造层次感

```css
.board-cell.selected {
  box-shadow: 0 0 0 3px rgba(170, 59, 255, 0.3),
              0 4px 12px rgba(170, 59, 255, 0.25);
}
```

`box-shadow` 语法：`x偏移 y偏移 模糊半径 扩散半径 颜色`

- `0 0 0 3px` — 无偏移、无模糊、扩散 3px = 相当于一个 3px 的实心边框（但不算在盒模型里）
- `0 4px 12px` — 向下 4px、模糊 12px = 柔和的投影

**多个阴影用逗号分隔**，先写的在上面。

---

### 5. z-index — 谁盖在谁上面

```css
.board-cell:hover {
  z-index: 1;
}
```

当元素被 `transform: scale()` 放大后，可能被相邻元素遮挡。`z-index` 控制堆叠顺序，值越大越靠上。

**前提**：`z-index` 只对**定位元素**（`position` 不是 `static`）或 **flex/grid 子元素**生效。这里 `.board-cell` 是 grid 子元素，所以可以直接用。

---

### 6. @media — 响应式布局

```css
@media (max-width: 900px) {
  .game-layout {
    flex-direction: column;
  }
}
```

**含义**：当屏幕宽度 ≤ 900px 时，应用花括号内的样式。

这叫"断点"（breakpoint）——在某个宽度切换布局方式。桌面端横向排列，手机端纵向堆叠。

---

## 逐行代码讲解

### App.css 整体结构

```
.app                    → 页面容器，居中、限宽
.message                → 提示消息条，渐变背景
.game-layout            → 版图 + 金字塔横向排列
.board                  → 版图区域，圆角卡片风格
.board-cell             → 每个格子，hover 放大 + 阴影
.btn-take / .btn-pass   → 操作按钮，hover 变色
.pyramid                → 金字塔区域
.pyramid-card           → 卡牌，hover 上浮
.players                → 两个玩家面板
.player-info            → 玩家面板，当前玩家高亮
.owned-cards            → 已购卡牌按颜色分组
.reserved-cards         → 保留卡牌
.discard-panel          → 归还标记面板，红色警示
@media                  → 窄屏适配
```

### 关键样式拆解

**版图格子选中态**：
```css
.board-cell.selected {
  border-color: var(--accent);           /* 紫色边框 */
  background: var(--accent-bg);          /* 淡紫背景 */
  box-shadow: 0 0 0 3px ..., 0 4px ...; /* 双层阴影 = 光晕 */
  transform: scale(1.08);               /* 微微放大 */
  z-index: 1;                           /* 盖住邻居 */
}
```

**卡牌可购买高亮**：
```css
.pyramid-card.affordable {
  box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.3),  /* 绿色描边 */
              0 4px 12px rgba(46, 204, 113, 0.15); /* 绿色柔光 */
}
```

**当前玩家面板**：
```css
.player-info.current {
  border-color: var(--accent);
  background: linear-gradient(135deg, var(--accent-bg), var(--code-bg));
  box-shadow: 0 0 0 1px ..., 0 4px 16px ...;
}
```

`linear-gradient(135deg, ...)` — 135 度对角线渐变，从淡紫过渡到面板底色，制造"发光"效果。

---

## 顺手修复的 Bug

### 1. `setDiscardSelection([])` 类型错误

```typescript
// ❌ 错误：[] 是数组，但 discardSelection 的类型是 Record<string, number>
setDiscardSelection([]);

// ✅ 正确：{} 是空对象
setDiscardSelection({});
```

### 2. 未使用的导入

```typescript
// ❌ getActualCost 导入了但没用到
import { getPlayerBonuses, getActualCost } from "../game/purchase";

// ✅ 只导入用到的
import { getPlayerBonuses } from "../game/purchase";
```

### 3. `let` → `const`

```typescript
// ❌ newPlayer 没有被重新赋值，应该用 const
let newPlayer = { ...player, tokens: { ...player.tokens } };

// ✅
const newPlayer = { ...player, tokens: { ...player.tokens } };
```

---

## 本课产出

运行 `npm run dev`，观察：

1. 版图格子 hover 时放大 + 紫色光晕
2. 选中格子有双层阴影光晕
3. 金字塔卡牌 hover 上浮
4. 可购买卡牌有绿色高亮边框
5. 当前玩家面板有渐变发光效果
6. 归还面板红色警示风格
7. 缩小浏览器窗口到 900px 以下，布局自动切换为纵向

---

## 思考题

1. **为什么 `transform: scale()` 比直接改 `width`/`height` 性能好？**

   提示：浏览器渲染流水线分为 重排（Layout）→ 重绘（Paint）→ 合成（Composite）。`transform` 只触发最后一步。

2. **`box-shadow: 0 0 0 3px` 和 `border: 3px solid` 有什么区别？**

   `border` 占用盒模型空间（会把内容往里挤），`box-shadow` 不占空间（只是视觉效果）。选哪种取决于你需不需要它影响布局。

3. **如果想让暗色模式下的样式也好看，需要改什么？**

   只需要在 `@media (prefers-color-scheme: dark)` 里重新定义 CSS 变量的值。因为所有组件都用 `var(--xxx)` 引用变量，改一处全局生效。
