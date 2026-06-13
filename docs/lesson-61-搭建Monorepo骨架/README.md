# 第 61 课：搭建 Monorepo 骨架

## 学习目标

- 亲手创建三个子包的空壳
- 理解 npm workspaces 的配置方式
- 理解软链接（symlink）是什么、怎么验证
- 用 `-w` 标志在根目录操作子包

---

## 核心概念讲解

### 1. 上节课回顾

上节课我们发现了痛点：server 无法 import `src/game/` 里的游戏逻辑。解决方案是把游戏逻辑抽成独立包 `@splendor/core`，让 web 和 server 都依赖它。

本课我们搭建这个骨架——三个空壳包，能互相引用，但还没有搬代码。

### 2. npm workspaces 是什么？

#### 先理解问题

你的项目现在有三个"小项目"：

```
packages/
├── core/        ← 一个独立的 npm 包
├── web/         ← 另一个独立的 npm 包
└── server/      ← 又一个独立的 npm 包
```

每个都有自己的 `package.json`、自己的依赖。**问题**：`web` 怎么 import `core` 的代码？

#### 不用 workspaces 的话

如果这三个包是三个独立的 Git 仓库，`web` 想用 `core`，你得：

1. 把 `core` 发布到 npm（`npm publish`）
2. 在 `web` 里 `npm install @splendor/core`
3. 每次改 `core` 的代码 → 重新发布 → `web` 重新安装

开发体验极差。

#### 用 workspaces 的话

在根 `package.json` 写一行：

```json
{
  "workspaces": ["packages/*"]
}
```

`"packages/*"` 是一个 glob 模式，匹配 `packages/` 下的所有子目录。npm 会自动发现 `packages/core/`、`packages/web/`、`packages/server/` 这三个子包。

然后 `npm install`。npm 做的事情：

1. 扫描 `packages/` 下所有子目录
2. 发现 `core`、`web`、`server` 各有一个 `package.json`
3. 在 `node_modules/@splendor/` 下创建三个**软链接**，指向这三个目录

```
node_modules/@splendor/
├── core   → ../../packages/core    ← 这不是复制，是指针
├── web    → ../../packages/web
└── server → ../../packages/server
```

现在 `web` 里写 `import { ... } from "@splendor/core"`，Node.js 顺着软链接找到 `packages/core/`，就像它是一个已安装的 npm 包。

#### 类比：公司内部通讯录

| 概念 | 类比 |
|------|------|
| 整个项目 | 一家公司（monorepo） |
| 每个 `packages/` 下的目录 | 一个部门（workspace） |
| 部门内部引用 | 包内 import（`"./board"`） |
| 跨部门引用 | 跨包 import（`"@splendor/core"`） |
| `workspaces` 配置 | 公司通讯录——告诉所有人"这些部门存在，这是它们的内线号码" |
| npm | 总机接线员——你拨 `@splendor/core`，总机帮你转接到 `packages/core/` |

**没有通讯录**：你想找 core 部门的人，得跑到他们楼层敲门（用相对路径 `"../../../packages/core/src/index.ts"`），又丑又容易出错。

**有通讯录**：你直接拨 `@splendor/core`，总机自动转接。不管你在哪个部门（web 还是 server），拨号方式都一样。

#### 一句话总结

> **workspace = 一个子包。workspaces 配置 = 告诉 npm "这些目录都是子包，帮我把它们互相联通"。**

联通的方式就是软链接——不复制代码，只建指针。改 `core` 的代码，`web` 和 `server` 立刻看到最新版本。

### 3. 每个子包的 package.json

#### @splendor/core

```json
{
  "name": "@splendor/core",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

| 字段 | 含义 |
|------|------|
| `name` | 包名，其他包用这个名字 import |
| `private: true` | 防止意外发布到 npm |
| `type: "module"` | 使用 ES Module（`import`/`export`） |
| `main` | 包的入口文件，`import "@splendor/core"` 时找这个文件 |
| `exports` | 更精确的导出控制，`"."` 表示包本身的入口 |

注意：`core` 没有 `dependencies`——它必须是零依赖的纯 TypeScript。

#### @splendor/web

```json
{
  "name": "@splendor/web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@splendor/core": "*",
    "react": "^19.2.6",
    "react-dom": "^19.2.6"
  }
}
```

关键点：`"@splendor/core": "*"`——`*` 表示"任意版本"，因为 `core` 是本地包，不需要版本号匹配。

#### @splendor/server

```json
{
  "name": "@splendor/server",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx src/index.ts"
  },
  "dependencies": {
    "@splendor/core": "*",
    "better-sqlite3": "^12.10.0",
    "express": "^5.2.1"
  }
}
```

同样依赖 `@splendor/core: "*"`。

### 4. 软链接（Symlink）是什么？

`npm install` 之后，去 `node_modules/@splendor/` 看看：

```bash
ls -la node_modules/@splendor/
# core   -> ../../packages/core     ← 软链接！
# server -> ../../packages/server   ← 软链接！
# web    -> ../../packages/web      ← 软链接！
```

`core -> ../../packages/core` 的意思是：`node_modules/@splendor/core` 不是一个真实的目录，而是一个**指针**，指向 `packages/core/`。

**类比**：

| 概念 | 类比 |
|------|------|
| 真实文件 | 你的房子（在 `packages/core/`） |
| 软链接 | 你家在物业登记的门牌号（在 `node_modules/@splendor/core`） |
| import | 快递员按门牌号找到你家 |

当你写 `import { VERSION } from "@splendor/core"` 时，Node.js 去 `node_modules/@splendor/core` 找，发现是个软链接，顺着找到 `packages/core/src/index.ts`，就像找到了真实的房子。

**为什么用软链接而不是复制？**

- 修改 `packages/core/src/index.ts`，`web` 和 `server` 立即看到最新代码
- 不需要重新 `npm install`，不需要重新发布

### 5. 根 package.json 的 scripts 变化

```json
{
  "scripts": {
    "dev": "npm run dev -w @splendor/web",
    "build": "npm run build -w @splendor/web",
    "server": "npm run dev -w @splendor/server",
    "lint": "eslint .",
    "preview": "npm run preview -w @splendor/web"
  }
}
```

`-w` 是 `--workspace` 的缩写。`npm run dev -w @splendor/web` 的意思是：在 `@splendor/web` 这个子包里执行 `npm run dev`。

**类比**：你站在小区门口（根目录），说"帮我去 B 栋（web）执行 dev 命令"。`-w` 就是这个"帮我去某栋楼"的指令。

| 命令 | 含义 |
|------|------|
| `npm run dev` | 启动前端开发服务器（Vite） |
| `npm run server` | 启动后端服务器（Express） |
| `npm run build` | 构建前端 |
| `npm run dev -w @splendor/core` | 在 core 包里执行 dev（如果 core 有 dev 脚本的话） |

### 6. 验证软链接生效

创建测试文件 `packages/web/src/test-core.ts`：

```ts
import { VERSION } from "@splendor/core";
console.log("Core version:", VERSION);
```

运行：

```bash
npx tsx packages/web/src/test-core.ts
# Core version: 0.0.0
```

`@splendor/core` 的 import 成功了！说明软链接正常工作。

同样在 server 包验证也通过。

---

## 本课产出

| 文件 | 说明 |
|------|------|
| `packages/core/package.json` | core 包配置，零依赖 |
| `packages/core/tsconfig.json` | core 的 TypeScript 配置 |
| `packages/core/src/index.ts` | 临时入口文件（`VERSION` 常量） |
| `packages/web/package.json` | web 包配置，依赖 react + @splendor/core |
| `packages/web/tsconfig.json` | web 的 TypeScript 配置（含 JSX 支持） |
| `packages/server/package.json` | server 包配置，依赖 express + @splendor/core |
| `packages/server/tsconfig.json` | server 的 TypeScript 配置 |
| `package.json`（根） | 新增 `workspaces`，scripts 改用 `-w` |

### 验证方式

```bash
# 软链接存在
ls -la node_modules/@splendor/
# core   -> ../../packages/core
# server -> ../../packages/server
# web    -> ../../packages/web

# 验证 import 生效
echo 'import { VERSION } from "@splendor/core"; console.log(VERSION);' > /tmp/test.mts
npx tsx /tmp/test.mts
# 0.0.0
```

---

## 思考题

1. `"@splendor/core": "*"` 中的 `*` 是什么意思？如果改成 `"^1.0.0"` 会怎样？
2. 根 `package.json` 的 `dependencies` 里还有 `react`、`express` 等，它们现在属于谁？应该怎么处理？
3. 软链接和硬链接有什么区别？（提示：删除原文件后）

---

## 思考题答案

### 1. `*` 的含义

`*` 是 npm 的版本范围语法，表示"接受任意版本"。对于本地 workspace 包，版本号没有意义（因为代码就在隔壁），所以用 `*`。

如果改成 `"^1.0.0"`，npm 会检查 `packages/core/package.json` 里的 `version` 是否满足 `>=1.0.0 <2.0.0`。当前 `version` 是 `0.0.0`，不满足，npm install 会报错。

### 2. 根 package.json 的依赖

当前根 `package.json` 里还残留着 `react`、`express`、`better-sqlite3` 等依赖。这些依赖现在应该分别属于各自的子包：

- `react`、`react-dom` → 属于 `@splendor/web`
- `express`、`better-sqlite3` → 属于 `@splendor/server`

下一课拆分代码时，我们会清理根 `package.json`，把依赖移到各自的子包里。现在暂时保留不影响功能（npm workspaces 会把所有子包的依赖提升到根 `node_modules`）。

### 3. 软链接 vs 硬链接

| | 软链接（symlink） | 硬链接（hard link） |
|------|------|------|
| 本质 | 一个指向路径的"快捷方式" | 同一个文件的另一个名字 |
| 删除原文件后 | 软链接变成"死链接"（指向不存在的路径） | 文件仍然存在（数据不删） |
| 跨文件系统 | ✅ 可以 | ❌ 不可以 |
| npm workspaces 用哪个 | 软链接 | 不用 |

npm workspaces 用软链接，因为子包可能在不同磁盘分区，软链接更灵活。

---

## 下一课预告

第 62 课：拆分代码并跑通——把 `src/game/` 搬进 `packages/core/`，把 React 组件搬进 `packages/web/`，把 Express 代码搬进 `packages/server/`，修复所有 import 路径，确保 `npm run dev` 和 `npm run server` 都能正常工作。
