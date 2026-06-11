# SQL 基础入门

> 本文档面向零 SQL 基础的初学者，只讲本课用到的内容。不追求全面，够用就行。

---

## 1. 数据库是什么？

数据库就是一个**有组织的数据库存仓库**。你不需要自己管理文件、不需要手动遍历查找，而是用 SQL 语言告诉数据库"我要什么"，它帮你找。

**类比**：

| | JSON 文件 | 数据库 |
|------|-----------|--------|
| 类比 | 手写笔记本 | Excel 表格 |
| 存什么 | 一个大的 JSON 对象 | 一张或多张**表**（Table） |
| 找数据 | 读整个文件，手动遍历 | `SELECT ... WHERE ...` |
| 改数据 | 读整个文件 → 改 → 写整个文件 | `UPDATE ... WHERE ...` |
| 结构 | 随便写，没有约束 | 表结构定义好，不能乱写 |

---

## 2. 表（Table）是什么？

表是数据库中最核心的概念。一张表就像一个 Excel 表格：

```
┌─────────────────────────────────────────────────────┐
│                     users 表                         │
├──────────┬──────────────┬──────────────────────────┤
│ username │ passwordHash │ salt                     │  ← 列名（Column）
├──────────┼──────────────┼──────────────────────────┤
│ alice    │ 2aa4a624...  │ ba1945d6...              │  ← 一行数据（Row）
│ bob      │ f3c8b129...  │ c7e3a01f...              │
└──────────┴──────────────┴──────────────────────────┘
```

- **列（Column）**：每一列有一个名字和类型（TEXT、INTEGER 等）
- **行（Row）**：每一行是一条记录
- **主键（Primary Key）**：唯一标识一行的那一列，比如 `username`。主键的值不能重复

---

## 3. 建表（CREATE TABLE）

在使用数据库之前，要先告诉它"我要存什么格式的数据"——这就是建表。

```sql
CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  passwordHash TEXT NOT NULL,
  salt TEXT NOT NULL
);
```

逐行拆解：

| 部分 | 含义 |
|------|------|
| `CREATE TABLE` | 创建一张新表 |
| `IF NOT EXISTS` | 如果表已经存在，就跳过（防止重复创建报错） |
| `users` | 表的名字 |
| `username TEXT` | 创建一列叫 `username`，类型是文本 |
| `PRIMARY KEY` | 这一列是主键——值不能重复，用来唯一标识每一行 |
| `NOT NULL` | 这一列不能为空 |

**类比**：建表就像在 Excel 里新建一个 Sheet，定义好每列的标题和格式。

---

## 4. 插入数据（INSERT）

往表里添加一行数据：

```sql
INSERT INTO users (username, passwordHash, salt)
VALUES ('alice', '2aa4a624...', 'ba1945d6...');
```

| 部分 | 含义 |
|------|------|
| `INSERT INTO users` | 往 `users` 表里插入 |
| `(username, passwordHash, salt)` | 要填哪几列 |
| `VALUES (...)` | 每列对应的值 |

在代码里，我们用 `?` 占位符代替直接写值：

```ts
db.prepare("INSERT INTO users (username, passwordHash, salt) VALUES (?, ?, ?)")
  .run(username, passwordHash, salt);
```

`?` 会被 `run()` 的参数按顺序替换。用 `?` 而不是直接拼字符串，是为了防止 SQL 注入攻击（后面会讲）。

---

## 5. 查询数据（SELECT）

从表里查找数据：

```sql
-- 查 alice 的密码哈希和盐
SELECT passwordHash, salt FROM users WHERE username = 'alice';
```

| 部分 | 含义 |
|------|------|
| `SELECT passwordHash, salt` | 我要查这两列 |
| `FROM users` | 从 `users` 表里查 |
| `WHERE username = 'alice'` | 只查 username 等于 'alice' 的那一行 |

如果想查所有列，用 `*`：

```sql
SELECT * FROM users WHERE username = 'alice';
```

在代码里：

```ts
// 查一行 → .get() 返回一个对象
const user = db.prepare("SELECT passwordHash, salt FROM users WHERE username = ?").get(username);
// user = { passwordHash: "2aa4a624...", salt: "ba1945d6..." }

// 查所有行 → .all() 返回数组
const allUsers = db.prepare("SELECT * FROM users").all();
// allUsers = [{ username: "alice", ... }, { username: "bob", ... }]
```

---

## 6. 删除数据（DELETE）

从表里删除一行：

```sql
DELETE FROM sessions WHERE sessionId = 'abc123';
```

| 部分 | 含义 |
|------|------|
| `DELETE FROM sessions` | 从 `sessions` 表里删除 |
| `WHERE sessionId = 'abc123'` | 只删 sessionId 等于 'abc123' 的那一行 |

> ⚠️ **重要**：如果不加 `WHERE`，`DELETE FROM sessions` 会删掉整张表的所有数据！

在代码里：

```ts
db.prepare("DELETE FROM sessions WHERE sessionId = ?").run(sessionId);
```

---

## 7. 更新数据（UPDATE）

本课没用到，但很常用，顺便讲一下：

```sql
UPDATE users SET passwordHash = 'newhash...' WHERE username = 'alice';
```

| 部分 | 含义 |
|------|------|
| `UPDATE users` | 更新 `users` 表 |
| `SET passwordHash = 'newhash...'` | 把 passwordHash 改成新值 |
| `WHERE username = 'alice'` | 只改 alice 那一行 |

---

## 8. `?` 占位符 vs 字符串拼接（SQL 注入）

**为什么用 `?` 而不是直接拼字符串？**

假设你这样写：

```ts
// ❌ 危险！
const sql = `SELECT * FROM users WHERE username = '${username}'`;
db.prepare(sql).get();
```

攻击者注册时输入用户名为：

```
' OR 1=1 --
```

拼接后的 SQL 变成：

```sql
SELECT * FROM users WHERE username = '' OR 1=1 --'
```

- `OR 1=1` 永远为真 → 匹配所有行
- `--` 是 SQL 的注释符 → 后面的内容被忽略

结果：**攻击者拿到了所有用户的数据**。

**用 `?` 占位符时**：

```ts
// ✅ 安全
db.prepare("SELECT * FROM users WHERE username = ?").get(username);
```

`better-sqlite3` 会自动对参数做转义处理。用户输入被当作**纯数据**，不会被当成 SQL 代码执行。`' OR 1=1 --` 会被当作一个普通的用户名去查找，当然查不到。

**类比**：字符串拼接就像把用户输入直接写进你的代码里执行——用户写什么就执行什么。`?` 占位符就像把用户输入放在一个"安全信封"里——不管信封里写什么，都只被当作数据，不会被当成命令。

---

## 9. 本课用到的 SQL 速查

| 操作 | SQL | better-sqlite3 代码 |
|------|-----|-------------------|
| 建表 | `CREATE TABLE IF NOT EXISTS users (...)` | `db.exec(sql)` |
| 插入 | `INSERT INTO users (...) VALUES (?, ?, ?)` | `db.prepare(sql).run(a, b, c)` |
| 查一行 | `SELECT ... FROM users WHERE username = ?` | `db.prepare(sql).get(name)` |
| 查所有 | `SELECT * FROM users` | `db.prepare(sql).all()` |
| 删除 | `DELETE FROM sessions WHERE sessionId = ?` | `db.prepare(sql).run(id)` |
