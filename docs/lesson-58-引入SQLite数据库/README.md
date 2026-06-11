# 第 58 课：引入 SQLite 数据库

## 学习目标

- 理解文件存储和内存存储的痛点
- 理解 SQLite 是什么：嵌入式数据库，不需要单独安装服务器
- 掌握 `better-sqlite3` 的基本用法：建表、增删查
- 把用户数据和 Session 从文件/内存迁移到 SQLite
- 验证服务器重启后登录态依然保持

---

## 安装

```bash
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

| 包 | 作用 | 类型 |
|----|------|------|
| `better-sqlite3` | SQLite 的 Node.js 驱动（同步 API，简单易用） | `dependencies` |
| `@types/better-sqlite3` | TypeScript 类型声明 | `devDependencies` |

---

## 核心概念讲解

### 1. 回顾痛点

上节课的数据存储方式：

| 数据 | 存储方式 | 问题 |
|------|----------|------|
| 用户 | `users.json` 文件 | 每次读写都要 `JSON.parse`/`JSON.stringify` 整个文件；并发写可能覆盖 |
| Session | 内存 `sessions = {}` | 服务器重启就丢失，所有用户被踢下线 |

### 2. SQLite 是什么？

SQLite 是一个**嵌入式数据库**。和 MySQL、PostgreSQL 不同，它：

- **不需要安装单独的数据库服务器**——整个数据库就是一个 `.db` 文件
- **零配置**——不需要用户名密码、不需要启动服务
- **数据持久化**——存在磁盘上，重启不丢
- **支持 SQL**——用标准的 SQL 语句操作数据

**类比**：

| | JSON 文件 | SQLite |
|------|-----------|--------|
| 类比 | 手写笔记本 | Excel 表格 |
| 查找数据 | 读整个文件，手动遍历 | `SELECT ... WHERE username = ?` |
| 修改数据 | 读整个文件 → 改 → 写整个文件 | `UPDATE ... WHERE ...` |
| 并发 | 两个人同时写会覆盖 | 自动处理锁 |

#### 并发写覆盖详解

**并发**是指两个请求**几乎同时**到达服务器，都要修改同一个文件。

假设 `users.json` 当前内容是：

```json
{ "alice": { "passwordHash": "...", "salt": "..." } }
```

现在 alice 和 bob **同时**注册：

```
时间线 →

请求 A（注册 bob）                    请求 B（注册 alice 修改资料）
    │                                      │
    │ ① 读文件                              │ ① 读文件
    │    users = { alice: ... }             │    users = { alice: ... }
    │                                      │
    │ ② 修改内存                            │ ② 修改内存
    │    users["bob"] = {...}               │    users["alice"] = 新数据
    │                                      │
    │ ③ 写入文件                            │
    │    {"alice":..., "bob":...}  ✅       │
    │                                      │ ③ 写入文件
    │                                      │    {"alice":新数据}  ❌
    │                                      │
    ▼                                      ▼
                    最终文件：{"alice": 新数据}
                    bob 的数据丢了！
```

**问题出在哪？**

请求 B 在第 ① 步读文件时，bob 还没被写入。请求 B 手里的 `users` 对象里没有 bob。当请求 B 在第 ③ 步写入时，它用自己手里的旧数据**覆盖**了请求 A 刚写入的新数据。bob 的注册记录就这样被"吞掉"了。

**为什么 SQLite 不会出现这个问题？**

SQLite 内部有**写锁**机制。当请求 A 在执行 `INSERT` 时，SQLite 会锁定数据库文件。请求 B 的 `INSERT` 必须等请求 A 完成并释放锁之后才能执行。

```
请求 A: INSERT INTO users ...  🔒 锁定 → 写入 → 🔓 释放
请求 B: INSERT INTO users ...  等待...等待...  🔒 锁定 → 写入 → 🔓 释放
```

两个写入操作**串行执行**，不会互相覆盖。

> ⚠️ **进阶内容，当前阶段可跳过**：Node.js 是单线程的，两个请求不会真正"同时"执行 JS 代码。但在 `async/await` 或回调场景下（比如读文件是异步的），两个请求的代码可能交错执行，产生上面的覆盖问题。我们用的 `readFileSync`/`writeFileSync` 是同步的，在当前简单场景下问题不大，但文件存储方案本身就没有并发保护——如果将来换成异步 IO 或多进程，问题就会暴露。SQLite 从根本上解决了这个问题。

---

## 逐行代码讲解

> 💡 **SQL 零基础？** 先看 [SQL 基础入门](./SQL基础入门.md)，了解表、SELECT、INSERT、DELETE 等基本概念，再回来看代码。

### 初始化数据库

```ts
import Database from "better-sqlite3";

const db = new Database("server/data.db");
```

- `new Database("server/data.db")` — 打开（或创建）数据库文件
- 如果文件不存在，自动创建
- 整个数据库就是一个 `data.db` 文件

```ts
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    passwordHash TEXT NOT NULL,
    salt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    sessionId TEXT PRIMARY KEY,
    username TEXT NOT NULL
  );
`);
```

- `db.exec()` — 执行一段 SQL（可以包含多条语句）
- 服务器启动时自动建表，`IF NOT EXISTS` 保证不会重复创建
- 两张表：
  - `users` — 替代 `users.json`
  - `sessions` — 替代内存 `sessions = {}`

### 注册（对比）

```ts
// 之前：读 JSON 文件，检查对象属性
const users = readUsers();
if (users[username]) { ... }
users[username] = { passwordHash, salt };
saveUsers(users);

// 现在：SQL 查询
const existing = db.prepare("SELECT username FROM users WHERE username = ?").get(username);
if (existing) { ... }
db.prepare("INSERT INTO users (username, passwordHash, salt) VALUES (?, ?, ?)").run(username, passwordHash, salt);
```

`better-sqlite3` 的 API 分两步：

1. `db.prepare(sql)` — 编译 SQL 语句，返回一个 Statement 对象
2. `.get(params)` — 执行查询，返回**一行**结果（查不到返回 `undefined`）
3. `.run(params)` — 执行插入/更新/删除，不返回数据

### 登录（对比）

```ts
// 之前：读整个 JSON 文件
const users = readUsers();
const user = users[username];

// 现在：只查需要的行
const user = db.prepare("SELECT passwordHash, salt FROM users WHERE username = ?").get(username);
```

**关键区别**：JSON 文件需要把整个文件读到内存再查找；SQLite 只返回匹配的那一行。

### Session（对比）

```ts
// 之前：内存对象，重启丢失
const sessions: Record<string, string> = {};
sessions[sessionId] = username;
const username = sessions[sessionId];
delete sessions[sessionId];

// 现在：数据库表，重启不丢
db.prepare("INSERT INTO sessions (sessionId, username) VALUES (?, ?)").run(sessionId, username);
const session = db.prepare("SELECT username FROM sessions WHERE sessionId = ?").get(sessionId);
db.prepare("DELETE FROM sessions WHERE sessionId = ?").run(sessionId);
```

**这就是本课最重要的改进**：Session 存在 SQLite 里，服务器重启后依然有效。

---

## 代码量对比

| | 之前（文件 + 内存） | 现在（SQLite） |
|------|-------------------|---------------|
| 用户存储 | `readUsers()` + `saveUsers()` 两个函数 | SQL 语句 |
| Session 存储 | `sessions = {}` 内存对象 | SQLite `sessions` 表 |
| 重启后 Session | ❌ 丢失 | ✅ 保持 |
| 查找用户 | 读整个文件 → 对象查找 | `SELECT ... WHERE ...` |
| 新增依赖 | 无 | `better-sqlite3` |

---

## 本课产出

| 文件 | 说明 |
|------|------|
| `server/index-express.ts` | 用户和 Session 全部迁移到 SQLite |
| `server/data.db` | SQLite 数据库文件（自动生成） |
| `.gitignore` | 新增 `server/data.db` |

### 验证方式

```bash
npx tsx server/index-express.ts

# 注册 + 登录
curl -c /tmp/cookies.txt -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'

curl -c /tmp/cookies.txt -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'

# 验证登录态
curl -b /tmp/cookies.txt http://localhost:3001/api/me
# → {"username":"alice"}

# 重启服务器后再试
curl -b /tmp/cookies.txt http://localhost:3001/api/me
# → {"username":"alice"}  ← 重启后依然保持！
```

---

## 思考题

1. `db.prepare("SELECT ...").get(params)` 和 `db.prepare("SELECT ...").all(params)` 有什么区别？
2. 如果 `CREATE TABLE` 不加 `IF NOT EXISTS`，服务器重启第二次会发生什么？
3. SQL 语句中的 `?` 占位符为什么不能直接用字符串拼接（如 `"SELECT ... WHERE username = '" + username + "'"`）？

---

## 思考题答案

### 1. `.get()` 和 `.all()` 的区别

- `.get()` — 返回**第一行**结果（对象），查不到返回 `undefined`
- `.all()` — 返回**所有行**（数组），查不到返回 `[]`

```ts
// 查一个用户 → 用 .get()
db.prepare("SELECT * FROM users WHERE username = ?").get("alice");
// → { username: "alice", passwordHash: "...", salt: "..." }

// 查所有用户 → 用 .all()
db.prepare("SELECT * FROM users").all();
// → [{ username: "alice", ... }, { username: "bob", ... }]
```

### 2. 不加 `IF NOT EXISTS` 会怎样？

第二次启动时 `CREATE TABLE` 会报错，因为表已经存在了。`IF NOT EXISTS` 让数据库在表已存在时静默跳过。

### 3. 为什么用 `?` 占位符而不是字符串拼接？

这是为了防止 **SQL 注入攻击**。假设用户名是用户输入的，如果用字符串拼接：

```ts
// ❌ 危险！
const sql = `SELECT * FROM users WHERE username = '${username}'`;
```

攻击者输入用户名为 `' OR 1=1 --`，拼接后的 SQL 变成：

```sql
SELECT * FROM users WHERE username = '' OR 1=1 --'
```

`OR 1=1` 永远为真，`--` 注释掉后面的内容。结果：**返回所有用户的数据**。

用 `?` 占位符时，`better-sqlite3` 会自动对参数做转义处理，用户输入被当作**纯数据**而不是 SQL 代码，注入攻击无效。

---

## 下一课预告

第 59 课：前端接入用户系统——在 React 中加注册/登录表单，用 `fetch` 调后端接口，用 Vite proxy 解决跨域问题。
