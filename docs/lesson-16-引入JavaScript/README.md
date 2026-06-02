# 第 16 课：引入 JavaScript

## 本节课目标

在 HTML 页面中引入 JavaScript，让按钮点击后有反应。

---

## 1. JavaScript 是什么？

HTML 搭结构，CSS 管样式，JavaScript 让页面**动起来**。

到目前为止，你的页面是静态的——按钮点不动，输入框打了字也没反应。JavaScript 就是来解决这个问题的。

---

## 2. 用 `<script>` 标签写 JS

在 HTML 中写 JavaScript 用 `<script>` 标签：

```html
<script>
  console.log("Hello from JS!");
</script>
```

`console.log` 会在浏览器的**控制台**中输出文字。按 `F12` → **Console（控制台）** 标签可以看到输出。

---

## 3. 什么是 DOM？

DOM（文档对象模型）是浏览器对 HTML 页面的**内部表示**。

当你写了一个 HTML 文件，浏览器会把它解析成一棵"树"——每个标签都是一个节点，嵌套关系就是父子节点。

```html
<div>
  <h1>标题</h1>
  <p>段落</p>
</div>
```

浏览器内部会把这变成一棵树：

```
document
 └── div
      ├── h1  ("标题")
      └── p   ("段落")
```

JavaScript 可以通过 `document` 这个对象来访问这棵树——读取、修改、删除、添加节点。

**类比**：HTML 是设计图纸，DOM 是浏览器根据图纸搭建好的房子。JavaScript 就是你的手，可以摸到房子里的任何东西（DOM 节点），修改它、移动它、或者拆掉它。

---

## 4. 选中页面元素：`document.getElementById`

要给元素绑定"点我之后做什么"，先得选中这个元素。

选中的方式有很多种，最直接的是用 `id` 属性。`id` 是 HTML 标签的一个**全局属性**，用来给元素起一个**唯一的名字**——同一个页面里不能有两个相同的 `id`。

```html
<button id="my-btn">点我</button>
```

这里 `id="my-btn"` 就是给这个按钮起了个名字叫 `my-btn`。

然后在 JavaScript 中用 `document.getElementById("my-btn")` 就能找到它：

```html
<script>
  const btn = document.getElementById("my-btn");
  console.log(btn);  // 在控制台打印这个按钮元素
</script>
```

`document` 是浏览器提供的全局对象，代表整个页面。`getElementById` 是它的一个方法（函数），意思是"通过 id 获取元素"。

**类比**：`id` 就像学生的学号——每个学生有唯一的学号。老师喊学号就能找到对应的学生。`document.getElementById("my-btn")` 就是老师喊"学号 my-btn 的同学站起来"。

```html
<button id="my-btn">点我</button>

<script>
  const btn = document.getElementById("my-btn");
  console.log(btn);
</script>
```

`document.getElementById("my-btn")` 会找到 `id="my-btn"` 的那个元素。`const` 是声明常量，和 TypeScript 里的 `const` 一样。

---

## 5. 绑定点击事件：`addEventListener`

选中元素后，怎么让它在被点击时执行你的代码？用 `addEventListener`。

"事件"（Event）是浏览器里发生的事——点击、键盘输入、鼠标移动、页面加载完成……都是事件。

"监听"（Listener）就是"你告诉我这件事发生了，我就执行对应的代码"。

```html
<button id="my-btn">点我</button>

<script>
  const btn = document.getElementById("my-btn");
  btn.addEventListener("click", function() {
    console.log("按钮被点击了！");
  });
</script>
```

逐行解释：

| 代码 | 含义 |
|------|------|
| `btn.addEventListener(...)` | 给按钮绑定一个事件监听器 |
| `"click"` | 监听的事件类型——点击 |
| `function() { ... }` | 事件发生时要执行的函数（回调函数） |

**类比**：就像你给门装了一个门铃。`addEventListener("click", fn)` 相当于"当有人按门铃时（click 事件），播放门铃声（执行 fn 函数）"。

`addEventListener` 的通用格式：

```javascript
元素.addEventListener("事件类型", function() {
  // 事件发生后要执行的代码
});
```

除了 `"click"`，还有这些常用事件类型：

| 事件类型 | 触发时机 |
|---------|---------|
| `"click"` | 点击元素 |
| `"dblclick"` | 双击元素 |
| `"mouseenter"` | 鼠标移入元素 |
| `"mouseleave"` | 鼠标移出元素 |
| `"keydown"` | 按下键盘按键 |
| `"change"` | 输入框内容改变（失去焦点时触发） |
| `"input"` | 输入框内容改变（实时触发） |

---

## 6. 动手：让"跳过回合"按钮生效

创建 `docs/lesson-16-引入JavaScript/index.html`：

```html
<div>
  <h1>璀璨宝石对决</h1>
  <p id="turn-info">当前回合：玩家 1</p>
</div>

<div>
  <h2>版图</h2>
  <p>（这里放 5x5 版图）</p>
</div>

<div>
  <h2>金字塔</h2>
  <h3>等级 1</h3>
  <ul>
    <li>[1] 红色 1分 0冠 | 费用: 珍珠x3</li>
    <li>[2] 红色 2分 1冠 | 费用: 绿x2 白x1</li>
    <li>[3] 蓝色 1分 0冠 | 费用: 黑x3</li>
    <li>[4] 蓝色 2分 1冠 | 费用: 白x2 黑x1</li>
    <li>[5] 绿色 1分 0冠 | 费用: 红x1 珍珠x2</li>
  </ul>
  <h3>等级 2</h3>
  <ul>
    <li>[9] 红色 3分 1冠 | 费用: 蓝x3 白x2 珍珠x1</li>
    <li>[10] 红色 4分 2冠 | 费用: 绿x4 黑x3</li>
    <li>[11] 蓝色 3分 1冠 | 费用: 红x2 黑x3</li>
    <li>[12] 蓝色 4分 2冠 | 费用: 白x4 珍珠x2</li>
  </ul>
  <h3>等级 3</h3>
  <ul>
    <li>[17] 红色 5分 2冠 | 费用: 蓝x4 白x4 珍珠x2</li>
    <li>[18] 红色 7分 3冠 | 费用: 绿x5 黑x5 珍珠x2</li>
    <li>[19] 蓝色 5分 2冠 | 费用: 红x4 黑x4 珍珠x2</li>
  </ul>
</div>

<div>
  <h2>玩家 1</h2>
  <p>标记: 红x2 蓝x1 黑x3</p>
  <p>声望: 0 | 王冠: 0</p>
  <p>卡牌: 0 张</p>
</div>

<div>
  <h2>玩家 2</h2>
  <p>标记: 无</p>
  <p>声望: 0 | 王冠: 0</p>
  <p>卡牌: 0 张</p>
</div>

<div>
  <h2>操作</h2>
  <input id="coord-input" type="text" placeholder="输入坐标，如 2,2">
  <button id="take-btn">拿取标记</button>
  <button id="pass-btn">跳过回合</button>
</div>

<script>
  const passBtn = document.getElementById("pass-btn");
  const turnInfo = document.getElementById("turn-info");

  passBtn.addEventListener("click", function() {
    const current = turnInfo.textContent;
    if (current === "当前回合：玩家 1") {
      turnInfo.textContent = "当前回合：玩家 2";
    } else {
      turnInfo.textContent = "当前回合：玩家 1";
    }
    console.log("回合已切换");
  });
</script>
```

点击"跳过回合"按钮，顶部的当前回合会在"玩家 1"和"玩家 2"之间切换。

---

## 7. 补充：HTML 文件怎么 debug？

你在 VS Code 的 HTML 文件中可以打断点，但这和在终端 debug TypeScript 不一样。

### 7.1 浏览器开发者工具才是 HTML/JS 的 debug 工具

HTML 文件是在**浏览器**中运行的，所以 debug 也要用浏览器自带的工具。

按 `F12` 打开开发者工具，切换到 **Sources（源代码）** 标签：

1. 找到你的 HTML 文件
2. 点击行号就能打断点（和 VS Code 一样）
3. 操作页面触发事件，代码会停在断点处
4. 右侧可以查看变量值、单步执行

### 7.2 VS Code 打断点是怎么回事？

VS Code 能识别 HTML 文件中的 `<script>` 标签，所以你可以点行号加红点。但这个红点**只有当你通过 VS Code 的 Debug 模式启动一个服务器时才会生效**——直接双击打开 HTML 文件，VS Code 的断点是不工作的。

要让 VS Code 的断点在 HTML 文件中生效，需要安装 **Live Preview** 插件（VS Code 官方出品）：

1. 按 `Cmd + Shift + X` 打开扩展面板
2. 搜索 "Live Preview"，安装（作者 Microsoft）
3. 打开你的 HTML 文件
4. 按 `Cmd + Shift + P` 打开命令面板
5. 输入 `Live Preview: Show Debug Preview` 并回车
6. VS Code 会启动一个内置服务器，在右侧面板中显示页面
7. 这时在 VS Code 的 HTML 文件中打上断点，操作页面就会停在断点处

> 这个操作会在 `.vscode/settings.json` 中生成一条配置，记录你预览的是哪个文件。

### 7.3 更推荐的方式：浏览器 F12

在不确定的地方加一行 `console.log(变量名)`，然后在 F12 的控制台看输出。这是前端开发最常用的调试方式——比打断点更快，适合检查"这个变量现在是什么值"。

```javascript
console.log("当前回合:", current);   // 在控制台看到: 当前回合: 玩家 1
console.log("按钮被点击了");         // 确认代码执行到了这里
```

**类比**：`console.log` 就像 C++ 的 `cout <<` 或 Python 的 `print()`——在关键位置打印变量值，看程序执行到了哪里。

---

## 8. 你学到了什么

| 概念 | 说明 |
|------|------|
| **DOM** | 浏览器对 HTML 的内部表示，一棵节点树 |
| `<script>` | 在 HTML 中写 JS 代码 |
| `console.log` | 在浏览器控制台输出文字 |
| `document.getElementById` | 通过 id 选中页面元素 |
| `addEventListener("click", fn)` | 给元素绑定点击事件 |
| `textContent` | 读取或修改元素的文字内容 |
