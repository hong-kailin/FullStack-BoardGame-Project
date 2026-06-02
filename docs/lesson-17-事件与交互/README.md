# 第 17 课：事件与交互

## 本节课目标

学会读取输入框的值，让"拿取标记"按钮真正读取坐标。

---

## 1. 读取输入框的值

第 16 课学会了用 `addEventListener` 监听点击事件。但点击按钮后，怎么知道输入框里写了什么？

用 `value` 属性：

```html
<input id="coord-input" type="text" placeholder="输入坐标，如 2,2">
<button id="take-btn">拿取标记</button>

<script>
  const input = document.getElementById("coord-input");
  const btn = document.getElementById("take-btn");

  btn.addEventListener("click", function() {
    const text = input.value;
    console.log("输入的内容是:", text);
  });
</script>
```

`input.value` 就是输入框当前的内容（字符串）。

---

## 2. 动手：让"拿取标记"按钮读取坐标

创建 `docs/lesson-17-事件与交互/index.html`：

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
  const takeBtn = document.getElementById("take-btn");
  const coordInput = document.getElementById("coord-input");
  const turnInfo = document.getElementById("turn-info");

  // 跳过回合：切换玩家
  passBtn.addEventListener("click", function() {
    const current = turnInfo.textContent;
    if (current === "当前回合：玩家 1") {
      turnInfo.textContent = "当前回合：玩家 2";
    } else {
      turnInfo.textContent = "当前回合：玩家 1";
    }
    console.log("回合已切换");
  });

  // 拿取标记：读取坐标并打印
  takeBtn.addEventListener("click", function() {
    const text = coordInput.value;
    console.log("输入的坐标:", text);
  });
</script>
```

---

## 3. 你学到了什么

| 概念 | 说明 |
|------|------|
| `input.value` | 读取输入框当前的内容 |
| 事件交互流程 | 用户输入 → 点击按钮 → JS 读取输入 → 处理 |
