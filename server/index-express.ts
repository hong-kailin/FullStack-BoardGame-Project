import express from "express";
import crypto from "node:crypto";
import Database from "better-sqlite3";

const app = express();
const db = new Database("server/data.db");

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

app.use(express.json());

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const pair of cookieHeader.split(";")) {
    const [key, ...rest] = pair.trim().split("=");
    cookies[key] = rest.join("=");
  }
  return cookies;
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

  const existing = db.prepare("SELECT username FROM users WHERE username = ?").get(username);
  if (existing) {
    res.status(409).json({ error: "username already exists" });
    return;
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto.scryptSync(password, salt, 64).toString("hex");

  db.prepare("INSERT INTO users (username, passwordHash, salt) VALUES (?, ?, ?)").run(username, passwordHash, salt);

  res.status(201).json({ message: "registered" });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "username and password are required" });
    return;
  }

  const user = db.prepare("SELECT passwordHash, salt FROM users WHERE username = ?").get(username) as { passwordHash: string; salt: string } | undefined;

  if (!user) {
    res.status(401).json({ error: "invalid username or password" });
    return;
  }

  const hash = crypto.scryptSync(password, user.salt, 64).toString("hex");

  if (hash !== user.passwordHash) {
    res.status(401).json({ error: "invalid username or password" });
    return;
  }

  const sessionId = crypto.randomBytes(32).toString("hex");
  db.prepare("INSERT INTO sessions (sessionId, username) VALUES (?, ?)").run(sessionId, username);

  res.setHeader("Set-Cookie", `sessionId=${sessionId}; HttpOnly; Path=/`);
  res.json({ message: "login successful", username });
});

app.get("/api/me", (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.sessionId;

  if (!sessionId) {
    res.status(401).json({ error: "not logged in" });
    return;
  }

  const session = db.prepare("SELECT username FROM sessions WHERE sessionId = ?").get(sessionId) as { username: string } | undefined;

  if (!session) {
    res.status(401).json({ error: "not logged in" });
    return;
  }

  res.json({ username: session.username });
});

app.post("/api/logout", (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.sessionId;

  if (sessionId) {
    db.prepare("DELETE FROM sessions WHERE sessionId = ?").run(sessionId);
  }

  res.setHeader("Set-Cookie", "sessionId=; HttpOnly; Path=/; Max-Age=0");
  res.json({ message: "logged out" });
});

app.listen(3001, () => {
  console.log("Express server running at http://localhost:3001");
});
