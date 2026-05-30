# 第 3 课：package.json 详解

## 本节课目标

理解 `package.json` 是什么、每个字段的含义，并手动创建一个。

---

## 1. package.json 是什么？

`package.json` 是 Node.js/TypeScript 项目的**身份证 + 说明书**，放在项目根目录。

一个最简单的 `package.json` 长这样：

```json
{
  "name": "my-project",
  "version": "1.0.0"
}
```

它告诉别人：
- 这个项目叫什么名字 → `"name": "my-project"`
- 当前是什么版本 → `"version": "1.0.0"`

> 类比：package.json ≈ Python 项目里的 `pyproject.toml` 或 `setup.py`，但更通用——所有 Node/TS 项目都有它。

---

## 2. 怎么生成 package.json？

有两种方式：

### 方式一：用命令自动生成

在项目根目录执行：

```bash
npm init -y
```

`-y` 表示"所有选项都用默认值"，直接生成一个基础的 package.json。这最省事，适合初学者。

### 方式二：手动创建

直接在项目根目录新建 `package.json` 文件，自己写内容。等熟悉了所有字段后，完全可以手写。

> 先执行 `npm init -y` 生成一个基础的，再在上面修改，是最推荐的入门方式。

---

## 3. 先看你实际生成的 package.json

你执行 `npm init -y` 后，npm 生成了这个文件：

```json
{
  "name": "fullstack-boardgame-project",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "directories": {
    "doc": "docs"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

逐行解释每个字段：

| 字段 | 值 | 含义 |
|------|-----|------|
| `name` | `"fullstack-boardgame-project"` | 项目名，npm 自动用**文件夹名**作为项目名 |
| `version` | `"1.0.0"` | 版本号，遵循语义化版本 `major.minor.patch`（主版本.次版本.补丁），默认从 1.0.0 开始 |
| `description` | `""` | 项目描述，现在是空的，可以自己填上项目是做什么的 |
| `main` | `"index.js"` | 入口文件。别人引用这个包时默认加载 `index.js`，目前用不到 |
| `directories` | `{ "doc": "docs" }` | npm 检测到 `docs/` 文件夹自动写入的，纯信息字段，不影响功能 |
| `scripts` | `"test": "..."` | 可执行命令，默认只有一条 test，内容只是打印错误信息 |
| `keywords` | `[]` | 搜索关键词，不发布到 npm 的话用不到 |
| `author` | `""` | 作者，可以填你的名字 |
| `license` | `"ISC"` | 许可证，`ISC` 和 MIT 类似，都是宽松许可证 |

---

## 4. 再看一个更完整的 package.json

上面生成的只是最基础的版本。实际项目中，`package.json` 通常还有这些字段：

```json
{
  "name": "splendor-duel",
  "version": "1.0.0",
  "private": true,
  "description": "璀璨宝石对决在线版",
  "scripts": {
    "start": "tsx index.ts",
    "test": "echo \"Error: no test specified\""
  },
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

对比你生成的版本，多了三个字段：

| 字段 | 值 | 含义 |
|------|-----|------|
| `private` | `true` | 表示这个包是私有的，不会发布到 npm，防止误发布 |
| `dependencies` | `{ "express": "^4.18.0" }` | **生产依赖**：项目运行必须的包 |
| `devDependencies` | `{ "typescript": "^5.0.0" }` | **开发依赖**：只有开发时才需要的包 |

---

## 5. dependencies vs devDependencies

初学者最容易搞混这两个。记住一句话：

> **用户需要它跑起来吗？** 需要 → `dependencies`；不需要 → `devDependencies`

| 包 | 放哪 | 为什么 |
|----|------|--------|
| `express`（Web 框架） | dependencies | 用户要玩游戏，服务器必须跑 Express |
| `typescript`（TS 编译器） | devDependencies | 用户运行时已经是编译好的 JS，不需要 TS |
| `tsx`（TS 运行器） | devDependencies | 开发时用来跑 .ts 文件，上线后不需要 |
| `vitest`（测试框架） | devDependencies | 只有开发者跑测试才需要 |

---

## 6. npm install 和 package.json 的关系

你执行 `npm install express` 时，npm 会：

1. 下载 `express` 包到 `node_modules/`
2. **自动写入** `package.json` 的 `dependencies` 字段
3. 生成 `package-lock.json`（锁定每个包的精确版本号）

同理，`npm install typescript --save-dev`（或简写 `-D`）会写入 `devDependencies`。

**关键点**：`package.json` 是你**手动维护 + npm 自动更新**的文件。你告诉 npm"我要装什么"，npm 帮你记到文件里。

---

## 7. 动手：完善你的 package.json

现在修改你刚生成的 `package.json`，添加 `hello` 脚本并安装 tsx。

**第一步**：在 `scripts` 里加上 `hello` 命令：

```json
"scripts": {
  "hello": "tsx docs/lesson-02-Node.js和npm/hello.ts",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

**第二步**：安装 tsx：

```bash
npm install -D tsx
```

这会做三件事：
- 下载 `tsx` 到 `node_modules/`
- 在 `package.json` 里自动添加 `"devDependencies": { "tsx": "^4.0.0" }`
- 生成 `package-lock.json`

**第三步**：验证：

```bash
npm run hello
```

如果输出 `Hello World` 和 `1 + 2 = 3`，说明配置成功。

---

## 8. 再看 .gitignore

上节课说过 `node_modules` 不该提交到 git。现在你知道为什么了——只要 `package.json` 在，任何人 `npm install` 都能重建 `node_modules`。

一个标准的 Node.js 项目的 `.gitignore`：

```
node_modules
dist
.turbo
*.log
.DS_Store
```

- `node_modules` — 依赖包，可重现
- `dist` — 编译产物（TS → JS 的输出），可重现
- `.turbo` — Turborepo 的缓存目录
- `*.log` — 日志文件
- `.DS_Store` — macOS 的文件夹元数据文件

---

## 9. 总结

| 概念 | 一句话 |
|------|--------|
| package.json | 项目的身份证 + 说明书 |
| dependencies | 用户运行需要的包 |
| devDependencies | 只有开发才需要的包 |
| scripts | 快捷命令，`npm run xxx` 执行 |
| npm install | 根据 package.json 下载所有依赖 |
| node_modules | 下载的包实际存放的地方（不提交 git） |

---

## 思考题（附答案）

1. **`dependencies` 和 `devDependencies` 都装了同一个包，会怎样？**
   - 答：只会装一份。npm 知道这是同一个包，不会重复下载。但通常不需要这样写，选一个对的分类就行。

2. **`npm install` 和 `npm ci` 有什么区别？**
   - 答：`npm install` 会根据 `package.json` 安装，如果有新版本会更新 `package-lock.json`。`npm ci` 严格按照 `package-lock.json` 安装，不会改任何东西，更快更可重现，常用于 CI 环境。

3. **如果删了 `node_modules` 再跑 `npm install`，能恢复吗？**
   - 答：能。只要 `package.json` 和 `package-lock.json` 在，`npm install` 会完整重建 `node_modules`。这就是不提交 `node_modules` 的底气。

---

准备好了告诉我，进入**第 4 课：TypeScript 速览**。
