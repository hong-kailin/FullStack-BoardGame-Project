# VS Code 同时调试前端和后端

## 为什么需要同时调试？

目前前端（Vite，端口 5173）和后端（Express，端口 3001）是两个独立的进程。调试时你需要：
- 在后端打断点，看请求怎么处理的
- 在前端打断点，看用户操作怎么触发 `fetch` 请求

VS Code 支持同时启动多个调试配置，让你在一个窗口里调试两端。

---

## launch.json 配置

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug 后端",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["tsx", "server/index-express.ts"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug 前端",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "/__vite/*": "${webRoot}/*"
      }
    }
  ],
  "compounds": [
    {
      "name": "Debug 全栈（前端 + 后端）",
      "configurations": ["Debug 后端", "Debug 前端"]
    }
  ]
}
```

> **注意**：单个调试配置放在 `configurations` 数组里，组合多个配置的"复合配置"放在 `compounds` 数组里。`compounds` 和 `configurations` 是平级的，不能把复合配置塞进 `configurations` 里。

### 三个配置分别做什么？

| 配置名 | 类型 | 作用 |
|--------|------|------|
| `Debug 后端` | `node` | 用 `npx tsx` 启动后端，可以在 `server/` 下的代码打断点 |
| `Debug 前端` | `chrome` | 打开 Chrome 访问 `localhost:5173`，可以在 `src/` 下的代码打断点 |
| `Debug 全栈` | 复合配置 | 同时启动上面两个 |

### 各字段含义

**Debug 后端**：

| 字段 | 值 | 含义 |
|------|-----|------|
| `type` | `"node"` | 用 Node.js 调试器 |
| `runtimeExecutable` | `"npx"` | 通过 npx 启动 |
| `runtimeArgs` | `["tsx", "server/index-express.ts"]` | 等价于 `npx tsx server/index-express.ts` |
| `console` | `"integratedTerminal"` | 日志输出到 VS Code 内置终端 |

**Debug 前端**：

| 字段 | 值 | 含义 |
|------|-----|------|
| `type` | `"chrome"` | 用 Chrome 浏览器调试 |
| `url` | `"http://localhost:5173"` | 打开这个地址 |
| `webRoot` | `"${workspaceFolder}/src"` | 源代码根目录，用于 source map 映射 |
| `sourceMapPathOverrides` | `{"/__vite/*": "${webRoot}/*"}` | 把 Vite 的虚拟路径映射到实际文件路径 |

**Debug 全栈**：

| 字段 | 值 | 含义 |
|------|-----|------|
| `name` | `"Debug 全栈（前端 + 后端）"` | 显示在下拉菜单中的名字 |
| `configurations` | `["Debug 后端", "Debug 前端"]` | 引用上面两个配置，同时启动 |

---

## 使用步骤

### 方式一：只调后端

1. 先手动启动前端：`npm run dev`
2. 在 `server/index-express.ts` 中打断点
3. 按 `F5`，选择 **"Debug 后端"**
4. 浏览器访问 `http://localhost:5173`，触发请求 → 断点生效

### 方式二：只调前端

1. 先手动启动后端：`npx tsx server/index-express.ts`
2. 在 `src/App.tsx` 中打断点
3. 按 `F5`，选择 **"Debug 前端"**
4. Chrome 自动打开 → 断点生效

### 方式三：同时调试两端（推荐）

1. 在 `server/index-express.ts` 和 `src/App.tsx` 中各打一个断点
2. 按 `F5`，选择 **"Debug 全栈（前端 + 后端）"**
3. VS Code 同时启动后端和前端
4. 浏览器操作触发前端断点，`fetch` 请求触发后端断点

---

## 调试时的界面

启动后，VS Code 顶部会出现调试工具栏：

```
⏯ 继续(F5)  ⤵ 单步跳过(F10)  ⤵ 单步进入(F11)  ⤴ 单步跳出(Shift+F11)  ⏹ 停止(Shift+F5)
```

左侧面板：

- **VARIABLES**：当前作用域内所有变量的值
- **WATCH**：手动添加想监视的表达式
- **CALL STACK**：调用栈，显示"谁调用了当前函数"
- **BREAKPOINTS**：所有断点列表

同时调试两端时，CALL STACK 面板会显示两个调试会话，可以切换。

---

## 注意事项

1. **端口不能冲突**：后端用 3001，前端用 5173，确保没有其他程序占用
2. **先启动后端**：前端通过 Vite proxy 转发 `/api` 请求到后端，后端必须先跑起来
3. **热更新**：修改前端代码后 Chrome 自动刷新；修改后端代码需要手动重启调试
4. **Source Map**：前端断点能生效是因为 Vite 生成了 source map，把编译后的 JS 映射回 TS 源码
