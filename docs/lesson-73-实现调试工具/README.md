# 第 73 课：实现调试工具

## 本课学习目标

- 理解为什么需要调试工具（测试效率问题）
- 学会用 React 组件实现状态修改面板
- 学会用 `localStorage` 持久化 UI 状态

## 核心概念

### 为什么需要调试工具？

当前测试 UI 边界场景（皇室卡牌、游戏结束、牌库抽空）需要正常玩一整局，效率极低。

调试工具让你可以：
- 一键给玩家加 19 分 → 立刻测试"即将胜利"的 UI
- 一键给玩家加 5 个王冠 → 立刻测试皇室卡牌触发
- 一键清空某个牌库 → 立刻测试牌库抽空的 UI

### localStorage 是什么？

`localStorage` 是浏览器提供的键值存储，数据不会随页面刷新丢失。

```js
// 存
localStorage.setItem("debugMode", "true");
// 取
const debugMode = localStorage.getItem("debugMode"); // "true"
// 删
localStorage.removeItem("debugMode");
```

类比 Python：就像把数据写到一个不会丢的小文件里。

---

## 实现方案

### 设计

- 页面角落放一个齿轮按钮 ⚙️，点击切换调试面板
- 调试面板以侧边栏形式出现，不遮挡游戏主体
- 面板内按类别分组：分数、王冠、特权、标记、牌库、皇室卡牌
- 每个操作直接修改 state，立即生效
- `localStorage` 记住调试模式开关状态

### 文件

- `packages/web/src/components/DebugPanel.tsx` — 调试面板组件
- `packages/web/src/App.tsx` — 引入调试面板

---

## 本课产出

- 调试面板可用，后续测试不再需要正常玩一局
- 可以快速构造任意游戏状态来测试 UI

## 验证方式

- 打开游戏，点击齿轮按钮，调试面板出现
- 修改分数/王冠/标记等，游戏状态立即更新
- 刷新页面，调试模式状态保持
