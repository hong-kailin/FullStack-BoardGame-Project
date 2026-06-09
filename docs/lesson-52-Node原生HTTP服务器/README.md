# 第 52 课：Node 原生 HTTP 服务器

## 学习目标

- 理解"后端"是什么，和"前端"的关系
- 用 Node.js 内置的 `http` 模块创建最简单的服务器
- 理解请求（Request）和响应（Response）
- 理解路由的概念（根据 URL 返回不同内容）
- 理解 HTTP 状态码和 Content-Type
- 亲手写出第一个 API 接口 `/api/ping`

---

## 核心概念讲解

### 1. 前端 vs 后端：餐厅类比

| 餐厅 | Web 应用 |
|------|----------|
| 顾客 | 浏览器（前端） |
| 服务员 | HTTP 协议 |
| 厨房 | 服务器（后端） |
| 菜单 | API（接口） |
| 上菜 | 响应（Response） |

- **前端**：顾客能看到的部分——菜单、餐桌、装饰。对应浏览器里的 HTML/CSS/JS。
- **后端**：顾客看不到的厨房——处理订单、烹饪、管理库存。对应服务器代码。
- **HTTP**：服务员——在前端和后端之间传递信息。

### 2. 请求（Request）和响应（Response）

```
浏览器（前端）                         服务器（后端）
    |                                      |
    |  ---- GET /api/ping  ------------>   |  ← 请求：浏览器说"我要访问 /api/ping"
    |                                      |
    |  <---- 200 OK {"message":"pong"} --  |  ← 响应：服务器说"给你，这是结果"
```

- **请求**包含：URL（路径）、Method（GET/POST）、Headers（元信息）、Body（数据）
- **响应**包含：状态码（200/404/500）、Headers（Content-Type）、Body（内容）

### 3. HTTP 状态码

| 状态码 | 含义 | 类比 |
|--------|------|------|
| 200 | OK，成功 | 服务员端来你要的菜 |
| 404 | Not Found，找不到 | "对不起，菜单上没有这道菜" |
| 500 | Internal Server Error | "厨房着火了！" |

### 4. HTTP 方法（Method）

| 方法 | 含义 | 类比 |
|------|------|------|
| GET | 读取数据 | 看菜单 |
| POST | 创建数据 | 下单 |
| PUT | 更新数据 | 改单 |
| DELETE | 删除数据 | 退菜 |

### 5. Content-Type

告诉浏览器"我返回的是什么格式的数据"：

| Content-Type | 含义 |
|--------------|------|
| `text/plain` | 纯文本 |
| `application/json` | JSON 数据 |
| `text/html` | HTML 页面 |

### 6. 端口（Port）

一台电脑可以同时运行多个服务器，每个服务器监听不同的**端口号**。

类比：一栋大楼（IP 地址）有很多房间号（端口）。3000 号房间是我们的游戏服务器，8080 号可能是另一个应用。

---

## 逐行代码讲解

### 文件：`server/index.ts`

```ts
import http from "node:http";
```

- `node:http` 是 Node.js 内置模块，不需要 `npm install`
- `node:` 前缀是 Node 的约定，表示"这是内置模块，不是第三方包"

```ts
const server = http.createServer((req, res) => {
```

- `createServer` 创建一个 HTTP 服务器对象
- 它接收一个**回调函数**——每当有请求进来，Node 就调用这个函数
- 类比：餐厅安装了一台"点餐机"，顾客按铃（发请求），机器就通知厨房（调用回调函数）

```ts
  const url = req.url ?? "/";
  const method = req.method ?? "GET";
```

- `req.url`：用户访问的路径，如 `/api/ping`
- `req.method`：HTTP 方法，如 `GET`、`POST`
- `??` 是空值合并运算符：如果左边是 `null` 或 `undefined`，就用右边的默认值

```ts
  if (url === "/api/ping" && method === "GET") {
```

- 这就是**路由**：根据 URL 和 Method 决定执行什么逻辑
- 类比：服务员看菜单上的编号，"3 号菜"对应"宫保鸡丁"

```ts
    res.writeHead(200, { "Content-Type": "application/json" });
```

- `writeHead` 设置响应头
- `200`：HTTP 状态码，表示成功
- `Content-Type: application/json`：告诉浏览器"我返回的是 JSON"

```ts
    res.end(JSON.stringify({ message: "pong" }));
```

- `res.end()` 发送响应内容并结束连接
- `JSON.stringify()` 把 JS 对象转成 JSON 字符串
- 类比 Python 的 `json.dumps()`

```ts
    return;
```

- 重要！处理完请求后必须 `return`，否则代码会继续往下执行，可能发送两次响应导致报错

```ts
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
```

- 如果前面的路由都没匹配到，返回 404
- 这是"兜底"逻辑

```ts
server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
```

- `listen(3000)`：让服务器监听 3000 端口
- 第二个参数是回调函数，服务器启动成功后执行
- `localhost` 表示"本机"，只有自己的电脑能访问

---

## 本课产出

- `server/index.ts`：一个最简单的 HTTP 服务器
- 访问 `http://localhost:3000/api/ping` 返回 `{"message":"pong"}`
- 访问其他路径返回 404

### 验证方式

```bash
# 启动服务器
npx tsx server/index.ts

# 另一个终端测试
curl http://localhost:3000/api/ping
# 输出: {"message":"pong"}

curl http://localhost:3000/api/unknown
# 输出: {"error":"Not Found"}
```

#### `curl http://localhost:3000/api/ping` 详解

这条命令可以拆成两部分理解：

**1. `curl` — 命令行里的"浏览器"**

`curl`（Client URL）是一个在终端里发送 HTTP 请求的工具。你可以把它理解成**没有图形界面的浏览器**。

| 浏览器 | curl |
|--------|------|
| 你在地址栏输入 URL，回车 | 你在终端输入 `curl <URL>`，回车 |
| 看到渲染后的网页 | 看到服务器返回的原始数据（HTML/JSON） |
| 有图片、样式、交互 | 只有纯文本 |

> `curl` 是 macOS/Linux 自带的，不需要安装。

**2. `http://localhost:3000/api/ping` — URL 拆解**

```
http://localhost:3000/api/ping
└─┬─┘ └───┬───┘└┬┘└───┬───┘
  协议     主机    端口   路径
```

| 部分 | 值 | 含义 |
|------|-----|------|
| **协议** | `http://` | 用 HTTP 协议通信（不加密），浏览器里还有 `https://`（加密） |
| **主机** | `localhost` | 本机地址，指向你自己的电脑。等价于 IP `127.0.0.1` |
| **端口** | `3000` | 目标"房间号"。我们的服务器在 `server.listen(3000)` 监听这个端口 |
| **路径** | `/api/ping` | 请求的具体资源。对应服务器里 `if (url === "/api/ping")` 那行 |

**类比**：

```
http://localhost:3000/api/ping
```

就像寄一封信：

- `http://` → 用什么语言写信（协议）
- `localhost` → 寄到哪栋楼（主机）
- `3000` → 几号房间（端口）
- `/api/ping` → 收件人是谁（路径）

**3. 完整流程**

当你在终端敲下 `curl http://localhost:3000/api/ping`：

```
终端（curl）                         你的 server/index.ts
    |                                      |
    |  ① 解析 URL，知道要连 localhost:3000  |
    |  ② 建立 TCP 连接                      |
    |  ③ 发送：GET /api/ping HTTP/1.1  -->  |
    |                                      |  ④ server.listen(3000) 收到请求
    |                                      |  ⑤ req.url = "/api/ping"
    |                                      |  ⑥ req.method = "GET"
    |                                      |  ⑦ 匹配到 if 分支
    |                                      |  ⑧ res.end('{"message":"pong"}')
    |  <-- ⑨ 收到响应 {"message":"pong"}   |
    |  ⑩ 打印到终端                         |
```

---

## 常见问题

### VS Code 报错：`Cannot find name 'node:http'` / `req implicitly has an 'any' type`

**原因**：`server/index.ts` 没有被任何 `tsconfig` 覆盖到。

当前项目的 `tsconfig.json` 引用了两个子配置：
- `tsconfig.app.json` — 覆盖 `src/` 下的前端代码（React）
- `tsconfig.node.json` — 只覆盖 `vite.config.ts`

`server/` 目录不在任何一个配置的 `include` 范围内，所以 VS Code 找不到 Node.js 的类型定义。

**解决**：创建一个 `tsconfig.server.json`，专门给 `server/` 目录用。

**步骤 1**：在项目根目录创建 `tsconfig.server.json`：

```json
{
  "compilerOptions": {
    "target": "es2023",
    "lib": ["ES2023"],
    "module": "esnext",
    "types": ["node"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["server"]
}
```

**步骤 2**：在 `tsconfig.json` 中添加对它的引用：

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.server.json" }
  ]
}
```

> `@types/node` 已经在 `devDependencies` 中安装好了，不需要额外安装。

### 为什么 `req` 和 `res` 不需要手动标注类型？

```ts
http.createServer((req, res) => {
  // req 和 res 没有写类型，但 TS 不报错
```

这是因为 TypeScript 的**类型推断（Type Inference）**。

`http.createServer` 的类型定义（来自 `@types/node`）长这样：

```ts
function createServer(
  requestListener?: (req: IncomingMessage, res: ServerResponse) => void
): Server;
```

它已经声明了回调函数的参数类型是 `IncomingMessage` 和 `ServerResponse`。

当你传入回调函数时，TypeScript 看到 `createServer` 要求的参数类型，而你传的回调正好有两个参数，它就**自动把类型填上了**：

```
http.createServer((req, res) => { ... })
//                  ^^^   ^^^
// TS 自动推断：req 是 IncomingMessage，res 是 ServerResponse
```

**类比**：就像 Python 的函数签名 `def foo(x: int)`，你调用 `foo(42)` 时不需要再写 `42: int`，类型从函数定义那里就知道了。

**反过来**，如果不用 `createServer` 包裹，自己写一个裸的回调：

```ts
const handler = (req, res) => { ... };  // ❌ 报错！TS 不知道 req/res 是什么
```

这时候 TS 没有上下文可推断，就会报 `any`。

> **总结**：类型不一定要显式写出来。如果 TypeScript 能从上下文"猜"出类型，它就会自动推断。这就是静态类型语言的优势——既安全，又不啰嗦。

---

## 思考题

1. 如果浏览器访问 `http://localhost:3000/api/ping`，服务器会执行哪几行代码？
2. 如果把 `res.writeHead(200, ...)` 改成 `res.writeHead(500, ...)`，浏览器会收到什么？
3. 为什么处理完请求后要 `return`？去掉 `return` 会发生什么？

---

## 下一课预告

当前的路由是用 `if-else` 手动判断的，只有两个路径还好，但如果要加 10 个接口，代码会变成一长串 `if-else`。

第 53 课将引入 **Express** 框架，用更优雅的方式定义路由。
