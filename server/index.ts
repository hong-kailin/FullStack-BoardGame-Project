import http from "node:http";

const items: Record<string, string> = {};

const server = http.createServer((req, res) => {
  const url = req.url ?? "/";
  const method = req.method ?? "GET";

  if (url === "/api/ping" && method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "pong" }));
    return;
  }

  if (url === "/api/items" && method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ items }));
    return;
  }

  if (url === "/api/items" && method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
        return;
      }
      const id = String(Date.now());
      items[id] = parsed.name ?? "unnamed";
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ id, name: items[id] }));
    });
    return;
  }

  if (url?.startsWith("/api/items/") && method === "PUT") {
    const id = url.slice("/api/items/".length);
    if (!items[id]) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Item not found" }));
      return;
    }
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
        return;
      }
      items[id] = parsed.name ?? items[id];
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ id, name: items[id] }));
    });
    return;
  }

  if (url?.startsWith("/api/items/") && method === "DELETE") {
    const id = url.slice("/api/items/".length);
    if (!items[id]) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Item not found" }));
      return;
    }
    delete items[id];
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "deleted" }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
