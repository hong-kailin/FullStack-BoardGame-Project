import express from "express";

const app = express();
const items: Record<string, string> = {};

app.use(express.json());

app.get("/api/ping", (_req, res) => {
  res.json({ message: "pong" });
});

app.get("/api/items", (_req, res) => {
  res.json({ items });
});

app.post("/api/items", (req, res) => {
  const id = String(Date.now());
  items[id] = req.body.name ?? "unnamed";
  res.status(201).json({ id, name: items[id] });
});

app.put("/api/items/:id", (req, res) => {
  if (!items[req.params.id]) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  items[req.params.id] = req.body.name ?? items[req.params.id];
  res.json({ id: req.params.id, name: items[req.params.id] });
});

app.delete("/api/items/:id", (req, res) => {
  if (!items[req.params.id]) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  delete items[req.params.id];
  res.json({ message: "deleted" });
});

app.listen(3001, () => {
  console.log("Express server running at http://localhost:3001");
});
