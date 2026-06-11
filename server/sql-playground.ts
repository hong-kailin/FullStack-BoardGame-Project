import Database from "better-sqlite3";

const db = new Database("server/playground.db");

console.log("🗑️  清空旧数据...");
db.exec("DROP TABLE IF EXISTS users");

console.log("📦 1. 建表");
db.exec(`
  CREATE TABLE users (
    username TEXT PRIMARY KEY,
    passwordHash TEXT NOT NULL,
    salt TEXT NOT NULL
  );
`);
console.log("   ✅ users 表已创建");

console.log("\n📝 2. 插入数据");
db.prepare("INSERT INTO users (username, passwordHash, salt) VALUES (?, ?, ?)").run(
  "alice", "hash_alice_123", "salt_a1b2"
);
db.prepare("INSERT INTO users (username, passwordHash, salt) VALUES (?, ?, ?)").run(
  "bob", "hash_bob_456", "salt_c3d4"
);
db.prepare("INSERT INTO users (username, passwordHash, salt) VALUES (?, ?, ?)").run(
  "charlie", "hash_charlie_789", "salt_e5f6"
);
console.log("   ✅ 插入了 3 个用户");

console.log("\n🔍 3. 查询所有用户");
const allUsers = db.prepare("SELECT * FROM users").all();
console.log("   ", allUsers);

console.log("\n🔍 4. 查询 alice 的密码哈希和盐");
const alice = db.prepare("SELECT passwordHash, salt FROM users WHERE username = ?").get("alice");
console.log("   ", alice);

console.log("\n🔍 5. 查询不存在的用户");
const nobody = db.prepare("SELECT * FROM users WHERE username = ?").get("nobody");
console.log("   ", nobody, "← undefined，说明不存在");

console.log("\n🔍 6. 检查用户名是否已存在（注册时用）");
const existing = db.prepare("SELECT username FROM users WHERE username = ?").get("alice");
if (existing) {
  console.log("   alice 已存在，不能重复注册");
}

console.log("\n🗑️  7. 删除 bob");
db.prepare("DELETE FROM users WHERE username = ?").run("bob");
const afterDelete = db.prepare("SELECT * FROM users").all();
console.log("   删除后剩余：", afterDelete);

console.log("\n✏️  8. 更新 alice 的密码");
db.prepare("UPDATE users SET passwordHash = ? WHERE username = ?").run("new_hash_xyz", "alice");
const updated = db.prepare("SELECT * FROM users WHERE username = ?").get("alice");
console.log("   更新后：", updated);

console.log("\n🧹 清理：删除练习数据库文件");
db.close();
import fs from "node:fs";
fs.unlinkSync("server/playground.db");
console.log("   ✅ playground.db 已删除");
