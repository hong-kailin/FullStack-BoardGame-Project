# 第 54 课：引入 Express

## 安装

```bash
npm install express
npm install -D @types/express
```

| 包 | 作用 | 类型 |
|----|------|------|
| `express` | Express 框架本体 | `dependencies`（运行时需要） |
| `@types/express` | Express 的 TypeScript 类型声明 | `devDependencies`（仅开发时需要） |

> `@types/express` 是 DefinitelyTyped 社区维护的类型定义包。Express 本身是用 JavaScript 写的，没有自带类型。`@types/express` 为它补充了 TypeScript 类型，这样你在写 `app.get(...)` 时才有智能提示和类型检查。
>
> `-D` 是 `--save-dev` 的简写，表示安装到 `devDependencies`。类型定义只在开发阶段有用，运行时不需要。

---

## 学习目标

- 用 Express 重写第 53 课的 CRUD 服务器
- 理解 Express 如何解决原生 `http` 的三个痛点
- 掌握 `app.get/post/put/delete`、`express.json()`、`req.params`、`res.status().json()`

---

## 回顾：原生版的三个痛点

第 53 课我们手写了 60+ 行代码实现 CRUD。回头看有哪些问题：

```ts
// 痛点 1：路由 if-else 堆叠
if (url === "/api/items" && method === "GET") { ... }
else if (url === "/api/items" && method === "POST") { ... }
else if (url?.startsWith("/api/items/") && method === "PUT") { ... }
else if (url?.startsWith("/api/items/") && method === "DELETE") { ... }

// 痛点 2：body 拼接代码在 POST 和 PUT 里重复了两遍
let body = "";
req.on("data", (chunk) => { body += chunk.toString(); });
req.on("end", () => { ... });

// 痛点 3：路径参数手动截取
const id = url.slice("/api/items/".length);
```

---

## Express 版：同样的功能，少一半代码

### 文件：`server/index-express.ts`

```ts
import express from "express";

const app = express();
const items: Record<string, string> = {};

app.use(express.json());

app.get("/api/ping", (_req, res) => {
  res.json({ message: "pong" });
});

app.get("/api/items", (_req, res) => {
  res.json({ items });
});

app.post("/api/items", (req, res) => {
  const id = String(Date.now());
  items[id] = req.body.name ?? "unnamed";
  res.status(201).json({ id, name: items[id] });
});

app.put("/api/items/:id", (req, res) => {
  if (!items[req.params.id]) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  items[req.params.id] = req.body.name ?? items[req.params.id];
  res.json({ id: req.params.id, name: items[req.params.id] });
});

app.delete("/api/items/:id", (req, res) => {
  if (!items[req.params.id]) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  delete items[req.params.id];
  res.json({ message: "deleted" });
});

app.listen(3001, () => {
  console.log("Express server running at http://localhost:3001");
});
```

---

## 逐行对比：原生 vs Express

### 对比 1：路由定义

```ts
// 原生 — 手动判断 method + url
if (url === "/api/items" && method === "GET") { ... }

// Express — 声明式路由
app.get("/api/items", (_req, res) => { ... });
```

`app.get()` / `app.post()` / `app.put()` / `app.delete()` 四个方法分别对应四种 HTTP 方法。路由一目了然，不需要 if-else。

### 对比 2：body 解析

```ts
// 原生 — 16 行（监听 data 事件 + 拼接 + try-catch）
let body = "";
req.on("data", (chunk) => { body += chunk.toString(); });
req.on("end", () => {
  let parsed;
  try { parsed = JSON.parse(body); }
  catch { ... return; }
  items[id] = parsed.name ?? "unnamed";
  res.writeHead(201, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ id, name: items[id] }));
});

// Express — 3 行
app.post("/api/items", (req, res) => {
  const id = String(Date.now());
  items[id] = req.body.name ?? "unnamed";
  res.status(201).json({ id, name: items[id] });
});
```

`app.use(express.json())` 注册了一个**中间件**，自动完成 body 的拼接和 JSON 解析。解析结果放在 `req.body` 上，直接使用即可。

### 对比 3：路径参数

```ts
// 原生 — 手动截取字符串
const id = url.slice("/api/items/".length);

// Express — 用 :id 占位，自动提取到 req.params
app.put("/api/items/:id", (req, res) => {
  const id = req.params.id;  // ← 自动提取
```

`/api/items/:id` 中的 `:id` 是一个**路径参数占位符**。Express 自动匹配 URL 中的对应部分，放到 `req.params.id`。

### 对比 4：响应

```ts
// 原生 — 每次都要写 writeHead + JSON.stringify
res.writeHead(200, { "Content-Type": "application/json" });
res.end(JSON.stringify({ message: "pong" }));

// Express — res.json 自动设置 Content-Type + 序列化
res.json({ message: "pong" });

// 还可以链式设置状态码
res.status(201).json({ id, name: items[id] });
res.status(404).json({ error: "Item not found" });
```

---

## 中间件（Middleware）详解

```ts
app.use(express.json());
```

这是本课最重要的概念。中间件是一个函数，在请求到达路由处理函数**之前**执行：

```
请求 → [express.json() 中间件] → [路由处理函数] → 响应
          │
          读取 body 数据流
          JSON.parse
          放到 req.body
```

类比：餐厅门口的服务员（中间件）先帮你存包、领位，然后你才坐下点菜（路由处理函数）。

`app.use()` 注册的中间件对**所有路由**生效。你也可以给特定路由注册中间件：

```ts
app.post("/api/items", someMiddleware, (req, res) => { ... });
```

---

## 代码量对比

| | 原生版 | Express 版 |
|------|--------|-----------|
| 总行数 | 67 行 | 37 行 |
| POST body 处理 | 16 行 | 3 行 |
| PUT body 处理 | 16 行 | 4 行 |
| 路径参数 | 手动 `url.slice()` | `:id` + `req.params.id` |
| 响应 | `writeHead` + `JSON.stringify` + `end` | `res.json()` / `res.status().json()` |

---

## 本课产出

| 文件 | 说明 |
|------|------|
| `server/index.ts` | 原生版（保留，供对比） |
| `server/index-express.ts` | Express 版（同样功能，代码减半） |

### 验证方式

```bash
# 原生版（端口 3000）
npx tsx server/index.ts

# Express 版（端口 3001）
npx tsx server/index-express.ts

# 测试（两个版本结果一致）
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"apple"}'

curl http://localhost:3001/api/items

curl -X PUT http://localhost:3001/api/items/{id} \
  -H "Content-Type: application/json" \
  -d '{"name":"updated"}'

curl -X DELETE http://localhost:3001/api/items/{id}
```

---

## 思考题

1. 如果去掉 `app.use(express.json())`，POST 请求还能正常工作吗？`req.body` 会是什么？
2. `res.json()` 和 `res.status(201).json()` 的区别是什么？
3. Express 的 `:id` 路径参数支持多个吗？比如 `/api/users/:userId/posts/:postId`？

---

## 下一课预告

第 55 课将实现用户注册功能：`POST /api/register`，接收 username 和 password，用文件存储用户数据，密码做哈希处理。
