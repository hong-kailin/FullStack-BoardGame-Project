# 第 59 课：前端接入用户系统

## 学习目标

- 理解跨域（CORS）问题及 Vite proxy 的解法
- 用 `fetch` 从 React 前端调用后端 API
- 实现注册/登录表单
- 登录后进入游戏，未登录显示表单

---

## 核心概念讲解

### 1. 跨域问题（CORS）

**先忘掉"跨域"这个词，我们从一个场景开始。**

你打开浏览器，访问 `localhost:5173`，看到了游戏页面。这个页面里的 JS 代码想调后端的 `/api/login` 接口。

问题是：后端跑在 `localhost:3001`，不是 `localhost:5173`。

**浏览器做了一件什么事？**

浏览器说："你（JS 代码）是从 5173 这个'家'出来的，你想去 3001 那个'家'拿东西？不行！我只允许你从自己家里拿东西。"

```
localhost:5173  ──fetch──→  localhost:3001   ❌ 浏览器拦住：不许去别人家！
```

这就是**同源策略**：浏览器只允许 JS 访问**和自己同一个"源"**的服务器。

**什么是"源"？**

"源" = 协议 + 域名 + 端口，三者完全一样才算同一个源。

| | 前端 | 后端 | 一样吗？ |
|------|------|------|--------|
| 协议 | `http://` | `http://` | ✅ |
| 域名 | `localhost` | `localhost` | ✅ |
| 端口 | `5173` | `3001` | ❌ 不一样！ |

端口不一样 → 不同源 → 浏览器拦截。

**为什么浏览器要这样做？**

假设没有这个限制。你登录了银行网站 `bank.com`，Cookie 里存着你的 sessionId。然后你不小心打开了一个恶意网站 `evil.com`。这个恶意网站的 JS 可以：

```js
fetch("https://bank.com/transfer?to=hacker&amount=10000")
```

因为你的浏览器里存着 `bank.com` 的 Cookie，这个请求会自动带上 Cookie，银行服务器以为是你本人在操作，钱就转走了。

**同源策略就是为了防止这种事**：`evil.com` 的 JS 不能向 `bank.com` 发请求。

**那我们的问题怎么解决？**

我们的前端和后端是同一个项目，只是开发时跑在不同端口。有三种解法：

| 方案 | 做法 | 适用场景 |
|------|------|----------|
| CORS 头 | 后端加 `Access-Control-Allow-Origin` 响应头 | 后端主动允许跨域 |
| Vite Proxy | 前端开发服务器做转发 | **开发环境**（本课用这个） |
| 同端口部署 | 前端和后端部署在同一个端口 | 生产环境 |

**类比**：

- **同源策略** = 小区门禁，只让本小区的人进出
- **CORS 头** = 你在门卫那里登记"允许 5173 号楼的访客进来"
- **Vite Proxy** = 你不出小区，让门卫帮你跑腿去 3001 号楼拿东西

> **Proxy（代理）是什么？**
>
> Proxy 就是"中间人"或"代办"。你自己不去，让代理替你去。
>
> 日常生活中到处都是代理：
> - 你不想亲自去排队买票 → 找黄牛（代理）帮你买
> - 你不在国内 → 找代购（代理）帮你买海外商品
> - 公司前台（代理）帮你收快递，再转交给你
>
> 在 Vite 里，`proxy` 就是这个意思：浏览器不直接访问后端，而是让 Vite 开发服务器**代理**这个请求——Vite 收到请求后，替你转发给后端，拿到结果再还给你。

### 2. Vite Proxy 解法

Vite 开发服务器（跑在 5173）充当"门卫"：

```
你（浏览器 JS）                         门卫（Vite）                     3001 号楼（后端）
    │                                      │                                │
    │ fetch("/api/login")                  │                                │
    │ ──────────────────→                  │                                │
    │   门卫，帮我去 3001 拿 /api/login      │                                │
    │                                      │ GET /api/login                 │
    │                                      │ ──────────────────────────────→│
    │                                      │                                │
    │                                      │ ←──── {"message":"success"} ───│
    │ ←── {"message":"success"} ────────── │                                │
```

从浏览器的视角看，请求发给了 `localhost:5173/api/login`——和自己同源，门禁放行。

配置只需一行：

```ts
server: {
  proxy: {
    '/api': 'http://localhost:3001',
  },
},
```

含义：所有以 `/api` 开头的请求，Vite 帮你转发到 `http://localhost:3001`。

> ⚠️ **注意**：proxy 只在开发环境（`npm run dev`）生效。生产环境部署时，通常让后端直接托管前端文件，或者用 Nginx 做转发。

### 3. fetch API

**是的，`fetch` 就是浏览器里的 `curl`。**

| | curl | fetch |
|------|------|-------|
| 在哪运行 | 终端 | 浏览器 JS |
| 作用 | 发 HTTP 请求 | 发 HTTP 请求 |
| GET | `curl http://...` | `fetch("/api/ping")` |
| POST | `curl -X POST ... -d '{"a":1}'` | `fetch("/api/login", { method: "POST", body: JSON.stringify({a:1}) })` |
| 响应 | 直接打印到终端 | 返回 JS 对象，代码可以继续处理 |

它们做的事情完全一样——向服务器发 HTTP 请求，拿到响应。区别只是运行环境不同：`curl` 是命令行工具，`fetch` 是浏览器给 JS 提供的函数。

`fetch` 是浏览器内置的 HTTP 请求函数，替代老旧的 `XMLHttpRequest`。

```ts
const res = await fetch("/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password }),
});
const data = await res.json();
```

| 部分 | 含义 |
|------|------|
| `"/api/login"` | 请求 URL（通过 Vite proxy 转发到后端） |
| `method: "POST"` | HTTP 方法 |
| `headers` | 请求头，告诉服务器 body 是 JSON |
| `body: JSON.stringify(...)` | 请求体，把 JS 对象转成 JSON 字符串 |
| `await` | 等待服务器响应（异步操作） |
| `res.json()` | 把响应 body 从 JSON 字符串解析为 JS 对象 |

---

## 逐行代码讲解

### AuthForm 组件

```tsx
function AuthForm({ onLogin }: { onLogin: (username: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
```

- `onLogin` — 父组件传来的回调，登录成功后调用
- `isRegister` — 切换注册/登录模式
- 四个 `useState` 分别管理表单的四个状态

```tsx
  const handleSubmit = async () => {
    setError("");
    const endpoint = isRegister ? "/api/register" : "/api/login";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    onLogin(username);
  };
```

- `isRegister ? "/api/register" : "/api/login"` — 根据模式选择接口
- `await fetch(...)` — 发请求，等待响应
- `res.ok` — HTTP 状态码 200-299 时为 `true`，否则为 `false`
- 成功时调用 `onLogin(username)`，父组件把 `username` 存到状态里

### App 组件的改动

```tsx
const [username, setUsername] = useState<string | null>(null);

if (!username) {
  return <AuthForm onLogin={setUsername} />;
}
```

- `username` 为 `null` 时渲染登录表单
- 登录成功后 `setUsername("alice")`，`username` 不为 `null`，渲染游戏界面
- 点击"退出"按钮时 `setUsername(null)`，回到登录表单

### Vite 配置

```ts
server: {
  proxy: {
    '/api': 'http://localhost:3001',
  },
},
```

所有 `/api/*` 请求被 Vite 转发到后端，前端代码不需要写 `http://localhost:3001`，直接写 `/api/login` 即可。

---

## 本课产出

| 文件 | 说明 |
|------|------|
| `src/App.tsx` | 新增 AuthForm 组件，登录前显示表单，登录后进入游戏 |
| `src/App.css` | 新增表单样式 |
| `vite.config.ts` | 新增 `/api` proxy 配置 |

### 验证方式

```bash
# 启动后端
npx tsx server/index-express.ts

# 启动前端
npx vite

# 浏览器打开 http://localhost:5173
# → 看到登录/注册表单
# → 注册一个账号 → 自动登录 → 进入游戏界面
# → 点击"退出"回到登录表单
```

---

## 思考题

1. Vite proxy 在生产环境（部署到服务器上）还能用吗？如果不能，怎么解决？
2. 当前登录后刷新页面，登录态会丢失吗？为什么？
3. `fetch` 是异步的，为什么用 `await`？不用 `await` 会怎样？

---

## 思考题答案

### 1. Vite proxy 在生产环境能用吗？

**不能**。Vite proxy 只在 `vite dev` 开发模式下生效。生产环境部署时，通常有两种方案：

- **Nginx 反向代理**：和 Vite proxy 原理一样，但由 Nginx（专业的 Web 服务器）来做转发
- **后端托管前端**：Express 直接 `app.use(express.static("dist"))` 托管前端打包后的静态文件

### 2. 刷新页面登录态会丢失吗？

**不会**。登录时服务器设置了 `Set-Cookie: sessionId=...`，浏览器保存了这个 Cookie。刷新页面后，浏览器会自动带上 Cookie，`GET /api/me` 仍然能认出用户。

但当前代码没有在刷新时调用 `/api/me` 来恢复登录态——这是一个可以改进的点。

### 3. 为什么用 `await`？

`fetch` 返回一个 **Promise**（承诺），代表"未来会完成的操作"。不用 `await` 的话：

```ts
const res = fetch("/api/login", ...);
// res 是 Promise，不是响应对象！
// 此时网络请求可能还没完成
```

用 `await` 会暂停当前函数，等 Promise 完成后拿到真正的响应对象。

---

## 下一课预告

阶段四（用户系统）到此结束。下一阶段是 **Monorepo 拆分**——把项目拆成 `core`（游戏逻辑）、`web`（前端）、`server`（后端）三个子包，让前后端共享游戏逻辑。
