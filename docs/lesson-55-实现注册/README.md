# 第 55 课：实现注册（文件存储 + 密码哈希）

## 学习目标

- 理解为什么需要持久化存储（内存 vs 磁盘）
- 用 `node:fs` 读写 JSON 文件
- 理解为什么密码绝不能明文存储
- 掌握哈希的基本概念：盐（salt）+ scrypt
- 实现 `POST /api/register` 接口

---

## 安装

本课只用 Node.js 内置模块（`node:crypto`、`node:fs`），不需要安装新包。

---

## 核心概念讲解

### 1. 内存 vs 磁盘

第 54 课的数据存在内存里：

```ts
const items: Record<string, string> = {};  // 内存中
```

服务器重启 → 数据消失。用户系统需要**持久化存储**——数据写到磁盘上，重启后还在。

| 存储方式 | 重启后还在吗 | 速度 | 本课用 |
|----------|-------------|------|--------|
| 内存（变量） | ❌ | 极快 | — |
| 文件（JSON） | ✅ | 快 | ✅ |
| 数据库（SQLite） | ✅ | 快 | 后续课程 |

本课先用 JSON 文件，因为：
- 不需要安装任何东西（`node:fs` 是内置的）
- 数据是人类可读的 JSON，可以直接打开看
- 能直观理解"数据落盘"的概念

### 2. 为什么密码不能明文存储？

如果这样存：

```json
{ "alice": { "password": "secret123" } }
```

一旦文件泄露（服务器被黑、代码不小心上传到 GitHub），所有人的密码就暴露了。而且很多人多个网站用同一个密码，一个泄露全部遭殃。

**正确做法**：存密码的**哈希值**，不存原文。

### 3. 哈希（Hash）是什么？

哈希是一个**单向函数**：输入任意数据，输出固定长度的"指纹"。

```
"secret123"  --[scrypt]-->  "2aa4a62465a5e7fc..."
```

关键特性：
- **同样的输入 → 同样的输出**（可验证）
- **无法从输出反推输入**（单向，安全）
- **输入差一点，输出完全不同**（"secret123" 和 "secret124" 的哈希天差地别）

**类比**：哈希就像指纹。你可以在纸上按手印（存哈希），别人拿到手印也还原不出你的手指（无法反推），但下次你再来按一次，对比手印就知道是不是同一个人（验证密码）。

### 4. 盐（Salt）是什么？

如果只用哈希，有个问题：两个用户密码相同 → 哈希值相同。攻击者可以预先计算常见密码的哈希表（彩虹表），一比对就知道密码。

**盐**是一个随机字符串，每个用户不同，拼在密码前面一起哈希：

```
alice: salt="a1b2" → scrypt("a1b2" + "secret123") → hash1
bob:   salt="c3d4" → scrypt("c3d4" + "secret123") → hash2
```

即使 alice 和 bob 密码相同，因为盐不同，哈希值也完全不同。

**类比**：盐就像给每道菜加不同的调料。同样的食材（密码），加了不同的调料（盐），炒出来的味道（哈希）完全不同。

---

## 逐行代码讲解

### 文件读写

```ts
import fs from "node:fs";

const USERS_FILE = "server/users.json";
```

- `node:fs` 是 Node.js 的文件系统模块（File System），内置的
- `USERS_FILE` 是常量，定义文件路径

```ts
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}
```

- `fs.readFileSync(path, encoding)` — 同步读取文件，返回字符串
- `"utf-8"` 指定编码（文本文件用 UTF-8）
- `JSON.parse` 把 JSON 字符串转成 JS 对象
- `try-catch`：文件不存在时 `readFileSync` 会抛异常，此时返回空对象 `{}`
- `Sync` 后缀表示同步（Synchronous），会阻塞直到读完。对于小文件没问题

```ts
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}
```

- `fs.writeFileSync(path, content)` — 同步写入文件
- `JSON.stringify(users, null, 2)` — 第三个参数 `2` 是缩进空格数，让 JSON 文件格式化、人类可读

### 注册逻辑

```ts
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;
```

- **解构赋值**：`const { username, password } = req.body` 等价于：
  ```ts
  const username = req.body.username;
  const password = req.body.password;
  ```

```ts
  if (!username || !password) {
    res.status(400).json({ error: "username and password are required" });
    return;
  }
```

- 校验必填字段，缺少返回 400（Bad Request）

```ts
  const users = readUsers();

  if (users[username]) {
    res.status(409).json({ error: "username already exists" });
    return;
  }
```

- 先读文件，检查用户名是否已存在
- 状态码 409：Conflict（资源冲突，用户名已被占用）

### 密码哈希（核心）

```ts
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto.scryptSync(password, salt, 64).toString("hex");
```

逐段拆解：

```ts
crypto.randomBytes(16)
```

- 生成 16 字节（128 位）的随机数据
- 返回 Buffer 类型（二进制数据）

```ts
.toString("hex")
```

- Buffer 转成十六进制字符串
- 例如：`<Buffer ba 19 45 d6 ...>` → `"ba1945d6ef075d7f612362a20a4ff1b6"`

```ts
crypto.scryptSync(password, salt, 64)
```

- `scryptSync(密码, 盐, 输出长度)` — 同步计算 scrypt 哈希
- `password`：用户输入的原始密码
- `salt`：随机生成的盐
- `64`：输出 64 字节（512 位）的哈希值
- scrypt 是故意设计得很慢的哈希算法，目的是让暴力破解（尝试所有可能密码）变得极其耗时

```ts
.toString("hex")
```

- 同样转成十六进制字符串，方便存到 JSON 文件

```ts
  users[username] = { passwordHash, salt };
  saveUsers(users);

  res.status(201).json({ message: "registered" });
```

- 把哈希值和盐一起存入文件
- 注意：**盐必须和哈希一起存**，因为登录验证时需要同样的盐来重新计算哈希
- 盐不是秘密——它的作用是让相同密码产生不同哈希，而不是保密

---

## 数据流全景

```
用户提交                       服务器处理                      磁盘
{ username, password }
        │
        ▼
   校验必填 ──→ 400 (缺少参数)
        │
        ▼
   读文件检查 ──→ 409 (用户名已存在)
        │
        ▼
   生成随机盐 ──→ "ba1945d6..."
        │
        ▼
   scrypt(password, salt) ──→ "2aa4a624..."
        │
        ▼
   写入文件 ──────────────────────────→ users.json
        │
        ▼
   返回 201 (注册成功)
```

---

## 本课产出

| 文件 | 说明 |
|------|------|
| `server/index-express.ts` | 新增 `POST /api/register` |
| `server/users.json` | 用户数据文件（密码以哈希存储） |
| `.gitignore` | 新增 `server/users.json`（不提交到 Git） |

### 验证方式

```bash
npx tsx server/index-express.ts

# 注册
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'

# 查看存储的数据
cat server/users.json
# → {"alice":{"passwordHash":"2aa4a624...","salt":"ba1945d6..."}}

# 重复注册（应返回 409）
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"another"}'
```

---

## 思考题

1. 盐为什么要和哈希一起存？如果不存盐，登录时怎么验证密码？
2. `crypto.scryptSync` 的第三个参数 `64` 是什么意思？改成 `32` 会怎样？
3. 如果两个用户设置了相同的密码，他们的 `passwordHash` 会一样吗？为什么？

---

## 下一课预告

第 56 课实现登录：`POST /api/login`，读取文件中的哈希和盐，用同样的算法重新计算哈希，比对验证密码。
