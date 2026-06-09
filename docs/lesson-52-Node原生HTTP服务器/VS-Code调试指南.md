# VS Code 调试 server/index.ts

## 为什么要用调试器？

不用调试器时，我们靠 `console.log` 看变量值。但调试器能让你：

- **暂停代码**在任意一行，查看那一刻所有变量的值
- **单步执行**，一行一行看代码怎么走的
- **观察调用栈**，知道"谁调用了谁"

类比：`console.log` 像看监控录像回放，调试器像让时间暂停，走到厨房里亲眼检查每样东西。

---

## 步骤

### 1. 添加调试配置

在 `.vscode/launch.json` 中添加以下配置（如果文件不存在就创建）：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["tsx", "${file}"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

| 字段 | 值 | 含义 |
|------|-----|------|
| `type` | `"node"` | 用 Node.js 调试器 |
| `request` | `"launch"` | 启动一个新进程（而不是附加到已运行的进程） |
| `name` | `"Debug Server"` | 在 VS Code 下拉菜单中显示的名字 |
| `runtimeExecutable` | `"npx"` | 通过 npx 启动 |
| `runtimeArgs` | `["tsx", "${file}"]` | `${file}` 是 VS Code 变量，指向当前打开的文件。等价于 `npx tsx 当前文件` |
| `console` | `"integratedTerminal"` | 日志输出到 VS Code 内置终端 |
| `skipFiles` | `["<node_internals>/**"]` | 调试时不进入 Node.js 内部代码 |

### 2. 打断点

打开 `server/index.ts`，在你想暂停的行号左侧点击，出现一个**红色圆点**：

```
  4 │ const server = http.createServer((req, res) => {
  5 │   const url = req.url ?? "/";          ← 在这行左侧点一下，出现 🔴
  6 │   const method = req.method ?? "GET";
```

### 3. 启动调试

按 `F5`（或点击左侧工具栏的 🐞 Run and Debug 图标），在下拉菜单中选择 **"Debug Server"**。

终端会显示 `Server running at http://localhost:3000`，说明服务器已启动。

### 4. 触发断点

打开另一个终端，发送请求：

```bash
curl http://localhost:3000/api/ping
```

此时 VS Code 会自动切回调试界面，代码停在断点处（该行高亮为黄色）。

### 5. 检查变量和单步执行

代码暂停后，你可以：

| 操作 | 快捷键 | 作用 |
|------|--------|------|
| 查看变量值 | 鼠标悬停在变量上 | 显示当前值，如 `url = "/api/ping"` |
| 继续执行 | `F5` | 运行到下一个断点（或程序结束） |
| 单步跳过 | `F10` | 执行当前行，跳到下一行 |
| 单步进入 | `F11` | 如果当前行是函数调用，进入函数内部 |
| 单步跳出 | `Shift+F11` | 跳出当前函数 |
| 停止调试 | `Shift+F5` | 终止程序 |

左侧面板会显示：
- **VARIABLES**：当前作用域内所有变量的值
- **WATCH**：你可以手动添加想监视的表达式
- **CALL STACK**：调用栈，显示"谁调用了当前函数"

### 6. 停止调试

按 `Shift+F5` 或点击顶部红色方块按钮停止。

---

## 和之前 Chrome 调试配置的关系

`launch.json` 中可以同时存在多个配置，通过下拉菜单切换：

```
┌─────────────────────────┐
│ Debug React (Vite)      │  ← 调试前端（浏览器里跑的 React 代码）
│ Debug Server            │  ← 调试后端（Node.js 跑的服务器代码）
└─────────────────────────┘
```

| | Debug React (Vite) | Debug Server |
|---|---|---|
| `type` | `chrome` | `node` |
| 调试什么 | 浏览器中的前端代码 | Node.js 后端代码 |
| 启动方式 | 打开 Chrome 访问 `localhost:5173` | 用 `npx tsx` 运行 `server/index.ts` |
