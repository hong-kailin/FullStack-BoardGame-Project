# async/await 入门

> 本文档只做一件事：通过可运行的代码示例，让你理解异步代码的执行顺序。

---

## 示例 1：同步代码（你已经很熟悉了）

```ts
console.log("A");
console.log("B");
console.log("C");
```

执行顺序：**A → B → C**

一行接一行，上面走完才走下面。这就是你一直在写的代码。

---

## 示例 2：setTimeout — 代码不一定从上到下执行

```ts
console.log("A");

setTimeout(() => {
  console.log("B");
}, 1000);

console.log("C");
```

**执行顺序：A → C → B**

不是 A → B → C！`setTimeout` 的意思是："1 秒后执行 `console.log("B")`"。但它不会等这 1 秒——它安排完任务就**立刻继续往下走**了，所以 C 比 B 先打印。

**这就是异步**：有些操作不能立刻完成（要等 1 秒），代码不会傻等，而是先往下走，等操作完成了再回来处理。

---

## Promise 是什么？

### 先看一个具体例子

```ts
function wait(ms: number) {
  return new Promise((done) => {
    setTimeout(() => {
      done("🍕 外卖到了！");
    }, ms);
  });
}
```

逐行拆解：

```ts
function wait(ms: number) {
```

- `wait` 是一个普通函数，接收一个参数 `ms`（毫秒数）
- 返回值类型是 `Promise<string>`（先不用管这个写法，知道它返回 Promise 就行）

```ts
  return new Promise((done) => {
```

- `new Promise(...)` 创建一个 Promise 对象
- 括号里传入的是一个**函数**，这个函数会立刻执行
- 这个函数接收一个参数 `done`——这是 Promise 提供给你的"交货工具"
- 当你的异步操作完成了，调用 `done(结果)` 来告诉 Promise "我完事了，这是结果"

**`done` 是什么？**

`done` 是一个回调函数，由 Promise 自动提供。你不需要自己定义它，只需要在合适的时机**调用**它。

```ts
new Promise((done) => {
  // done 是 Promise 塞给你的
  // 你在这个函数里做异步操作
  // 操作完成后，调用 done(结果)
  done("完成了！");
});
```

**类比**：你接了一个外包项目（创建 Promise），客户给了你一个电话号码（`done`）。你开始干活（异步操作），干完了打电话告诉客户（调用 `done(结果)`）。客户接到电话后就知道项目完成了，并且拿到了结果。

```ts
    setTimeout(() => {
      done("🍕 外卖到了！");
    }, ms);
```

- `setTimeout` 等 `ms` 毫秒后，调用 `done("🍕 外卖到了！")`
- `done("🍕 外卖到了！")` 的意思是："Promise 完成了，结果是 `"🍕 外卖到了！"`"

```ts
  });
}
```

**所以 `wait(1000)` 做了什么？**

1. 创建一个 Promise
2. 启动一个 1 秒的定时器
3. **立刻返回**这个 Promise（不等定时器完成）
4. 1 秒后，定时器触发，调用 `done("🍕 外卖到了！")`，Promise 完成

### 用图理解

```
wait(1000) 被调用
    │
    ├─→ 创建 Promise（状态：pending）
    ├─→ 启动 1 秒定时器
    └─→ 立刻返回 Promise ← 调用者拿到的是这个
            │
            │  （1 秒过去了...）
            │
            └─→ done("🍕 外卖到了！") 被调用
                  Promise 状态变为 fulfilled
                  结果 = "🍕 外卖到了！"
```

### 验证：不加 await 拿到的是什么

```ts
const result = wait(1000);
console.log(result);
// 打印：Promise { <pending> }
```

`wait(1000)` 返回的是 Promise 对象本身，不是 `"🍕 外卖到了！"`。此时 Promise 还是 `pending`（进行中），因为 1 秒还没到。

### 验证：加 await 拿到的是什么

```ts
const result = await wait(1000);
console.log(result);
// 打印：🍕 外卖到了！
```

`await` 等 Promise 完成后，把 `done()` 传入的值（`"🍕 外卖到了！"`）取出来赋给 `result`。

### Promise 的三个要素

| 要素 | 代码中对应 | 含义 |
|------|-----------|------|
| 创建 | `new Promise((done) => { ... })` | 创建一个承诺 |
| 交付结果 | `done(结果)` | 承诺完成，交付结果 |
| 获取结果 | `await promise` | 等待承诺完成，拿到结果 |

### Promise 的三种状态

```
pending（进行中）  ──done(结果)──→  fulfilled（已完成）
                  ──error(错误)──→  rejected（已失败）
```

- `pending`：Promise 刚创建，还没完成
- `fulfilled`：`done(结果)` 被调用了，Promise 有结果了
- `rejected`：出错了（本课暂不涉及）

### 类比

| 外卖 | Promise |
|------|---------|
| 下单 | `new Promise(...)` 创建 Promise |
| 订单号 | `wait(1000)` 返回的 Promise 对象 |
| 店家做好饭，交给骑手 | `done("🍕 外卖到了！")` |
| 骑手送达，你拿到饭 | `await promise` 拿到结果 |
| 订单号本身不是饭 | Promise 本身不是结果 |

---

## 示例 3：await — 兑现 Promise

```ts
async function demo() {
  console.log("A");
  const result = await wait(1000);
  console.log(result);
  console.log("B");
}

demo();
console.log("C");
```

**执行顺序：A → C → 🍕 外卖到了！ → B**

发生了什么：

1. `demo()` 开始执行
2. 打印 A
3. `wait(1000)` 返回一个 Promise（订单号），`await` 说"我等"
4. `demo` 函数暂停，控制权还给外面
5. 外面继续，打印 C
6. 1 秒后，Promise 完成（外卖到了），`demo` 恢复执行
7. `result` 拿到 `"🍕 外卖到了！"`，打印出来
8. 打印 B

**关键**：`await` 只暂停**当前函数**（`demo`），外面的 `console.log("C")` 照常执行。

---

## 示例 4：await 让异步代码"看起来像同步的"

```ts
async function demo() {
  console.log("1. 开始");
  const r1 = await wait(1000);
  console.log(r1);
  const r2 = await wait(1000);
  console.log(r2);
  console.log("3. 两秒后");
}

demo();
```

执行顺序：**1 → (等 1 秒) → 🍕 外卖到了！ → (等 1 秒) → 🍕 外卖到了！ → 3. 两秒后**

有了 `await`，代码可以像同步代码一样从上往下读，不用关心"什么时候完成"。

---

## 示例 5：忘记 await 会怎样？

```ts
async function demo() {
  console.log("A");
  const result = wait(1000);   // 没加 await！
  console.log(result);
  console.log("B");
}

demo();
```

**执行顺序：A → Promise { <pending> } → B**

`wait(1000)` 返回的是 Promise（订单号），不是 `"🍕 外卖到了！"`（饭）。没加 `await`，你拿到的是订单号，不是饭。

---

## 总结

| 概念 | 一句话 | 类比 |
|------|--------|------|
| 同步 | 一行接一行，立刻执行 | 自己做饭，立刻吃 |
| 异步 | 有些操作需要等，不能立刻拿到结果 | 点外卖，需要等 |
| Promise | 一个"承诺"，代表未来会完成的结果 | 订单号 |
| `await` | 兑现 Promise，拿到结果。当前函数暂停，外面不受影响 | 等骑手送到，拿到饭 |
| `async` | 标记函数"这里面有 `await`"（语法要求） | — |

**一句话记住**：`await` 让需要等待的代码，写起来像不需要等待一样。
