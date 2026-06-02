# 02. readline、异步循环与不可变性

## 1. 什么是异步？

先用一句最直白的话说：

- **同步（sync）**：做完上一步，才能做下一步
- **异步（async）**：先把任务交出去，等结果回来时再继续处理

### 1.1 一个生活类比

比如你去餐厅点餐：

- **同步**像是你站在柜台前，厨师不做好你就不能走，也不能做别的事
- **异步**像是你点完餐先拿号去坐下，等号码到了再回来取餐

异步的核心不是"更快"，而是**等待的时候，不把整个程序卡死**。

### 1.2 在程序里是什么意思？

很多操作都会花时间，比如：

- 等用户输入
- 读文件
- 发网络请求
- 查数据库

如果这些操作都按同步方式处理，程序就会一直傻等着，别的事情什么都做不了。

异步的做法是：

1. 先发起这个操作
2. 不阻塞当前程序
3. 等操作完成后，再执行预先写好的"后续逻辑"

这个"后续逻辑"常见的写法有三种：

- 回调函数（callback）
- Promise
- `async` / `await`

### 1.3 为什么 `readline` 属于异步？

因为程序不知道你什么时候才会敲回车。

如果它像同步代码那样一直卡在那里，整个事件驱动流程就会变得很别扭。所以 `rl.question()` 的设计方式是：先把"等用户输入"这件事挂出去，等你真的输入完成后，再调用回调函数继续处理。

## 2. readline 的异步模型

`rl.question()` 不会让程序停下来等你输入。它注册一个回调函数，当用户按下回车时触发。这就是为什么我们需要用递归来模拟循环。

```typescript
// ❌ 错误写法：所有 question 会同时触发
while (true) {
  rl.question("> ", (input) => { ... });
}

// ✅ 正确写法：每次输入完成后才调用下一次 question
function loop() {
  rl.question("> ", (input) => {
    // 处理输入...
    loop();
  });
}
```

这里的关键不是"递归更高级"，而是它更符合异步事件的执行方式。

类比：
- Python 里像把逻辑挂到一个回调上，等事件发生再执行
- C++ 里像注册一个回调函数，输入事件来了才继续往下走

你可以把它理解成：`rl.question()` 不是"现在立刻拿到输入值"，而是"先登记一个处理函数，等输入来了再通知我"。

## 3. 不可变性（Immutability）

在整个代码中，我们不直接修改对象的属性，而是创建新对象：

```typescript
// ❌ 直接修改（会引发难以追踪的 bug）
player.tokens.red += 1;

// ✅ 创建新对象
const newPlayer = { ...player, tokens: { ...player.tokens } };
newPlayer.tokens.red = (newPlayer.tokens.red || 0) + 1;
```

这里你可能会觉得奇怪：

```typescript
const newPlayer = { ...player, tokens: { ...player.tokens } };
```

为什么不直接写成：

```typescript
const newPlayer = { ...player };
```

更准确地说：对象展开语法 `{ ...player }` 只会对 `player` 做**第一层浅拷贝（shallow copy）**。

也就是说：

- `{ ...player }` 会创建一个新的外层对象
- `player.tokens` 这个属性如果本身还是一个对象，那么它不会被继续复制
- 结果就是 `newPlayer.tokens` 和 `player.tokens` 仍然指向同一个对象

例如：

```typescript
const newPlayer = { ...player };

console.log(newPlayer.tokens === player.tokens); // true
```

这时如果你再写：

```typescript
newPlayer.tokens.red += 1;
```

看起来你改的是 `newPlayer`，其实旧的 `player.tokens.red` 也一起被改掉了。

所以我们才要写成：

```typescript
const newPlayer = { ...player, tokens: { ...player.tokens } };
```

这样就变成：

- `player` 外层复制了一份
- `tokens` 这个内层对象也复制了一份

于是：

```typescript
console.log(newPlayer.tokens === player.tokens); // false
```

你再改 `newPlayer.tokens.red`，就不会影响旧的 `player` 了。

### 3.1 用引用图理解浅拷贝

如果只写：

```typescript
const newPlayer = { ...player };
```

引用关系更像这样：

```text
player -----> {
               id: 0,
               name: "玩家 1",
               tokens ----+
             }
                         \
                          \
                           > tokensObject = { red: 1, blue: 0, ... }
                          /
                         /
newPlayer --> {
               id: 0,
               name: "玩家 1",
               tokens ----+
             }
```

注意：外层有两个不同的对象，但它们的 `tokens` 属性都指向同一个 `tokensObject`。

所以当你执行：

```typescript
newPlayer.tokens.red += 1;
```

效果其实是：

```text
player.tokens.red    也变了
newPlayer.tokens.red 也变了
```

如果写成：

```typescript
const newPlayer = { ...player, tokens: { ...player.tokens } };
```

引用关系就变成：

```text
player -----> {
               id: 0,
               name: "玩家 1",
               tokens ----> oldTokensObject = { red: 1, blue: 0, ... }
             }

newPlayer --> {
               id: 0,
               name: "玩家 1",
               tokens ----> newTokensObject = { red: 1, blue: 0, ... }
             }
```

这次两个 `tokens` 箭头指向的是**两份不同的对象**，只是它们一开始内容一样。

所以修改 `newPlayer.tokens.red` 时，不会污染旧状态。

你可以把它理解成：

- `{ ...player }`：只复制外壳
- `{ ...player, tokens: { ...player.tokens } }`：外壳复制了，里面的 `tokens` 小盒子也复制了

这在函数式编程中叫"不可变性"。好处是：

- 每次状态变更都产生一个新对象，旧状态不变
- 方便调试，可以保留历史状态
- 避免多个函数共享同一对象时的意外修改

如果你熟悉 Python，可以把它理解成：不是原地改同一个 `dict`，而是先拷贝出一个新的 `dict` 再改。C++ 里则有点像避免多个地方共享同一块可变对象，尽量让状态变化更显式。

## 4. 递归 vs 迭代

递归实现游戏循环在这里是必要的，因为 `readline` 是异步的。如果你学过 C++ 或 Python 的同步编程，可能会觉得不习惯。后面进入 Web 开发后，这种"事件驱动"的编程模式会更常见。

要点不是"以后都用递归"，而是：

- 同步流程里，`while` 往往很好用
- 异步流程里，通常要把"下一步"写进回调、Promise 或事件处理函数里
- 这里的 `loop()` 本质上是在说："这次输入处理完，再挂起下一次等待输入"
