# 第 56 课：实现登录

## 学习目标

- 理解登录的验证流程：用同样的盐和算法重新算哈希，比对
- 实现 `POST /api/login` 接口
- 理解 HTTP 无状态特性：登录成功后，下一个请求服务器怎么知道"还是你"？

---

## 核心概念讲解

### 1. 登录 = 注册的逆过程

注册时我们做了：

```
密码 + 随机盐 → scrypt → 哈希值 → 存入文件
```

登录时反过来：

```
用户输入密码 + 文件中存的盐 → scrypt → 哈希值 → 和文件中的哈希比对
```

**关键**：登录时用注册时存的**同一个盐**来重新计算哈希。如果计算结果和文件中的一致，说明密码正确。

### 2. 为什么错误提示不区分"用户不存在"和"密码错误"？

```ts
if (!user) {
  res.status(401).json({ error: "invalid username or password" });
  return;
}
if (hash !== user.passwordHash) {
  res.status(401).json({ error: "invalid username or password" });
  return;
}
```

两种情况的错误提示完全一样。这是安全考量——如果提示"用户不存在"，攻击者就能用这个信息来枚举哪些用户名是已注册的。

### 3. HTTP 是无状态的（本课的痛点）

登录成功后返回 `{"message": "login successful"}`，但下一个请求到来时，服务器完全不知道"刚才那个人登录过"。

```
请求 1: POST /api/login  →  "login successful"
请求 2: GET  /api/items   →  服务器：你是谁？我不知道。
```

这就是 HTTP 的**无状态**特性：每个请求都是独立的，服务器不记得之前的请求。

类比：你去餐厅点菜，每次服务员都像第一次见到你一样问"您是谁？"。你需要一个"号码牌"来证明自己——这就是下一课的 Session 和 Cookie。

---

## 逐行代码讲解

```ts
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "username and password are required" });
    return;
  }
```

- 和注册一样，先校验必填字段

```ts
  const users = readUsers();
  const user = users[username];

  if (!user) {
    res.status(401).json({ error: "invalid username or password" });
    return;
  }
```

- 读文件，查找用户
- `users[username]` 返回 `{ passwordHash, salt }` 或 `undefined`
- 状态码 401：Unauthorized（未授权，身份验证失败）

```ts
  const hash = crypto.scryptSync(password, user.salt, 64).toString("hex");
```

- 用**用户输入**的密码 + **文件中存的盐**，重新计算哈希
- 参数和注册时完全一样：`scryptSync(password, salt, 64)`
- 如果密码正确，算出来的哈希一定和注册时算出来的一样（同样的输入 → 同样的输出）

```ts
  if (hash !== user.passwordHash) {
    res.status(401).json({ error: "invalid username or password" });
    return;
  }

  res.json({ message: "login successful", username });
```

- 比对哈希：`!==` 严格不等
- 注意：**不能**用 `password === user.password` 来比对，因为文件里根本没存原始密码
- 登录成功返回 200

---

## 完整验证流程

```
用户输入 { username: "alice", password: "secret123" }
        │
        ▼
   读文件找到 alice: { passwordHash: "2aa4...", salt: "ba19..." }
        │
        ▼
   scryptSync("secret123", "ba19...", 64) → "2aa4..."
        │
        ▼
   "2aa4..." === "2aa4..." ?  ✅ 一致 → 登录成功
```

如果密码错了：

```
   scryptSync("wrong", "ba19...", 64) → "f3c8..."
        │
        ▼
   "f3c8..." === "2aa4..." ?  ❌ 不一致 → 登录失败
```

---

## 本课产出

- `server/index-express.ts`：新增 `POST /api/login`

### 验证方式

```bash
npx tsx server/index-express.ts

# 先注册
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'

# 正确密码登录
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'
# → {"message":"login successful","username":"alice"}

# 错误密码
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"wrong"}'
# → {"error":"invalid username or password"}
```

---

## 思考题

1. 为什么错误提示不区分"用户不存在"和"密码错误"？
2. 登录成功后，服务器返回了 `{"message": "login successful"}`，但下一个请求服务器怎么知道"还是刚才那个人"？
3. 如果攻击者拿到了 `users.json` 文件，他能直接登录吗？为什么？

---

## 下一课预告

第 57 课解决 HTTP 无状态的问题：引入 **Session 和 Cookie**，让服务器能"记住"谁登录了。
