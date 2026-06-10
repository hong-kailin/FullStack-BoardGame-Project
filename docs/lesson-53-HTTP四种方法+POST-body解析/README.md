# 第 53 课：HTTP 四种方法 + POST body 解析

## 学习目标

- 理解 HTTP 的四种核心方法：GET、POST、PUT、DELETE
- 理解 CRUD 概念（Create、Read、Update、Delete）
- 用原生 `http` 模块实现四种方法的接口
- 理解 POST/PUT 的 body 如何读取：流式传输 + 手动拼接
- 体会原生方式处理 body 的痛点（为引入 Express 做铺垫）

---

## 核心概念讲解

### 1. HTTP 四种方法

HTTP 协议定义了多种**方法（Method）**，告诉服务器"我想对这个资源做什么"：

| 方法 | 含义 | 类比（餐厅） | 有 body 吗 | 幂等吗 |
|------|------|-------------|-----------|--------|
| **GET** | 读取 | 看菜单 | ❌ | ✅ |
| **POST** | 创建 | 下单（新点一道菜） | ✅ | ❌ |
| **PUT** | 更新（整体替换） | 换菜 | ✅ | ✅ |
| **DELETE** | 删除 | 退菜 | ❌ | ✅ |

> **幂等**：同样的请求发一次和发多次，结果一样。GET 不管发多少次菜单不变；DELETE 第一次删掉了，第二次还是"已删除"的状态。POST 每次都会创建新资源，所以不幂等。

这四个方法合称 **CRUD**：

| CRUD | HTTP 方法 | 含义 |
|------|-----------|------|
| **C**reate | POST | 创建新资源 |
| **R**ead | GET | 读取资源 |
| **U**pdate | PUT | 更新资源 |
| **D**elete | DELETE | 删除资源 |

### 2. POST/PUT 的 body 是怎么传输的？

GET 请求没有 body，数据放在 URL 里。POST 和 PUT 有 body，数据在请求体中传输。

**关键理解**：body 不是一次性到达的——它是一块一块（chunk）流式传输的。

```
客户端                          服务器
   |                              |
   | --- chunk 1: '{"na' -------> |  ← req.on("data") 触发
   | --- chunk 2: 'me":"a' -----> |  ← req.on("data") 触发
   | --- chunk 3: 'pple"}' -----> |  ← req.on("data") 触发
   |                              |  ← req.on("end") 触发（收完了）
```

**类比**：就像收快递，不是一个大箱子一次送到，而是拆成几个小包裹分批送达。你要等所有包裹到齐了（`end` 事件），才能拼出完整的东西。

为什么这样设计？因为 body 可能很大（比如上传一个文件），如果等全部收完再处理，内存会爆。流式传输让服务器可以边收边处理。

### 3. 路径参数

本课还引入了一个新概念——**路径参数**：

```
/api/items/1781049008922
           └──────┬──────┘
               路径参数（id）
```

URL 的一部分本身就是数据，而不是查询参数。Express 里用 `:id` 表示，原生里手动用 `url.slice()` 截取。

---

## 逐行代码讲解

### 数据存储

```ts
const items: Record<string, string> = {};
```

- `Record<string, string>` 是 TS 类型：键是 string，值也是 string 的对象
- 这就是我们的"数据库"——目前只是内存里的一个对象，服务器重启就没了
- 后续课程会升级为文件存储 → SQLite 数据库

### GET /api/ping（和上节课一样）

```ts
if (url === "/api/ping" && method === "GET") {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "pong" }));
  return;
}
```

### GET /api/items（读取所有数据）

```ts
if (url === "/api/items" && method === "GET") {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ items }));
  return;
}
```

- 把整个 `items` 对象返回给客户端
- 状态码 200：OK

### POST /api/items（创建数据）— 重点

```ts
if (url === "/api/items" && method === "POST") {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    // body 收完了，可以解析
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON" }));
      return;
    }
    const id = String(Date.now());
    items[id] = parsed.name ?? "unnamed";
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ id, name: items[id] }));
  });
  return;
}
```

逐段拆解：

```ts
let body = "";
req.on("data", (chunk) => {
  body += chunk.toString();
});
```

- `req.on("data", ...)` — 每收到一块数据就触发一次回调
- `chunk` 是 Buffer 类型（二进制数据），`.toString()` 转成字符串
- 每次把新收到的数据拼到 `body` 后面

```ts
req.on("end", () => {
```

- `req.on("end", ...)` — 所有数据收完后触发
- 此时 `body` 才是完整的 JSON 字符串

```ts
try {
  parsed = JSON.parse(body);
} catch {
  res.writeHead(400, ...);
  res.end(JSON.stringify({ error: "Invalid JSON" }));
  return;
}
```

- `JSON.parse` 可能失败（如果客户端发来的不是合法 JSON）
- 必须用 try-catch 包裹，否则服务器会崩溃
- 状态码 400：Bad Request（客户端发的东西有问题）

```ts
const id = String(Date.now());
items[id] = parsed.name ?? "unnamed";
res.writeHead(201, ...);
```

- `Date.now()` 返回当前时间戳（毫秒），转成字符串作为唯一 ID
- `??` 是空值合并：如果 `parsed.name` 是 `null` 或 `undefined`，用 `"unnamed"`
- 状态码 201：Created（资源创建成功）

### PUT /api/items/{id}（更新数据）

```ts
if (url?.startsWith("/api/items/") && method === "PUT") {
  const id = url.slice("/api/items/".length);
```

- `url?.startsWith(...)` — `?` 是因为 `req.url` 可能为 `undefined`
- `url.slice("/api/items/".length)` — 截掉前缀，拿到后面的 id
- 例如 `/api/items/123` → `"123"`

body 读取部分和 POST 完全一样——又是重复代码，这就是痛点。

### DELETE /api/items/{id}（删除数据）

```ts
if (url?.startsWith("/api/items/") && method === "DELETE") {
  const id = url.slice("/api/items/".length);
  if (!items[id]) {
    res.writeHead(404, ...);
    return;
  }
  delete items[id];
  res.writeHead(200, ...);
  res.end(JSON.stringify({ message: "deleted" }));
  return;
}
```

- DELETE 没有 body，不需要拼接
- 先检查 id 是否存在，不存在返回 404
- `delete items[id]` 删除对象的属性

---

## 本课的痛点（为 Express 铺垫）

现在代码有 60+ 行，而且有几个明显的问题：

1. **路由 if-else 堆叠**：5 个路由就 5 个 if，加接口 = 加 if
2. **body 拼接重复**：POST 和 PUT 的 body 读取代码完全一样，复制粘贴的
3. **路径参数手动截取**：`url.slice("/api/items/".length)` 很脆弱
4. **每次都要写 `writeHead` + `JSON.stringify`**

这些都是下一课 Express 要解决的问题。

---

## 本课产出

- `server/index.ts`：支持四种 HTTP 方法的服务器
- 内存中维护一个 `items` 对象，支持完整的 CRUD 操作

### 验证方式

```bash
npx tsx server/index.ts

# 另一个终端：
# 创建
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"apple"}'

# 读取
curl http://localhost:3000/api/items

# 更新（把返回的 id 替换进去）
curl -X PUT http://localhost:3000/api/items/{id} \
  -H "Content-Type: application/json" \
  -d '{"name":"green apple"}'

# 删除
curl -X DELETE http://localhost:3000/api/items/{id}
```

---

## 思考题

1. POST 创建成功后返回的状态码是 201 而不是 200，为什么？
2. 如果客户端 POST 的 body 非常大（比如 100MB），`body += chunk.toString()` 会有什么问题？
3. PUT 和 POST 的 body 读取代码一模一样，怎么避免重复？（提示：提取函数）

---

## 下一课预告

第 54 课引入 **Express** 框架，用 `app.get()` / `app.post()` / `app.put()` / `app.delete()` 替代 if-else 堆叠，用 `express.json()` 中间件替代手动 body 拼接。
