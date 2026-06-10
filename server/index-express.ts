import express from "express";
import crypto from "node:crypto";
import fs from "node:fs";

const app = express();
const USERS_FILE = "server/users.json";

app.use(express.json());

function readUsers(): Record<string, { passwordHash: string; salt: string }> {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, { passwordHash: string; salt: string }>) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.get("/api/ping", (_req, res) => {
  res.json({ message: "pong" });
});

app.post("/api/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "username and password are required" });
    return;
  }

  const users = readUsers();

  if (users[username]) {
    res.status(409).json({ error: "username already exists" });
    return;
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto.scryptSync(password, salt, 64).toString("hex");

  users[username] = { passwordHash, salt };
  saveUsers(users);

  res.status(201).json({ message: "registered" });
});

app.listen(3001, () => {
  console.log("Express server running at http://localhost:3001");
});
