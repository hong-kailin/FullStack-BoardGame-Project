import express from "express";
import crypto from "node:crypto";
import fs from "node:fs";

const app = express();
const USERS_FILE = "server/users.json";

const sessions: Record<string, string> = {};

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

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "username and password are required" });
    return;
  }

  const users = readUsers();
  const user = users[username];

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
  sessions[sessionId] = username;

  res.setHeader("Set-Cookie", `sessionId=${sessionId}; HttpOnly; Path=/`);
  res.json({ message: "login successful", username });
});

app.get("/api/me", (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.sessionId;

  if (!sessionId || !sessions[sessionId]) {
    res.status(401).json({ error: "not logged in" });
    return;
  }

  res.json({ username: sessions[sessionId] });
});

app.post("/api/logout", (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.sessionId;

  if (sessionId) {
    delete sessions[sessionId];
  }

  res.setHeader("Set-Cookie", "sessionId=; HttpOnly; Path=/; Max-Age=0");
  res.json({ message: "logged out" });
});

app.listen(3001, () => {
  console.log("Express server running at http://localhost:3001");
});
