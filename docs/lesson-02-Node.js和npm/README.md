# 第 2 课：Node.js 和 npm

## 本节课目标

理解 Node.js 和 npm 是什么，并用 TypeScript 写第一个程序。

---

## 1. 先回答一个基本问题：JavaScript 原来只能在哪跑？

JavaScript 最初是**浏览器专属语言**。你写一段 JS 代码，必须放到 HTML 里，用浏览器打开才能运行。这意味着 JS 只能写前端，不能操作文件、不能创建服务器。

> 类比：就像 Python 代码只能在一个受限环境里执行一样，JS 被"关在"浏览器里。

---

## 2. Node.js 做了什么？

Node.js 把 Chrome 浏览器的 JS 引擎（V8）单独拿了出来，封装成一个可以在**命令行**直接运行的程序。

从此 JavaScript（以及 TypeScript）可以：

| 能做的事 | 类比 Python |
|---------|------------|
| 读写文件 | `open()`, `read()` |
| 创建网络服务器 | `http.server` |
| 操作数据库 | `sqlite3` |
| 在终端直接运行 | `python3 xxx.py` |

> **类比**：Python 解释器（`python3 xxx.py`）→ 运行 Python 代码；Node.js（`node xxx.js`）→ 运行 JavaScript 代码。本质是一样的。

---

## 3. 那 TypeScript 呢？

TypeScript 是 JavaScript 的"超集"——就是在 JS 基础上加了**类型系统**。

但 Node.js 不认识 TypeScript，它只能直接运行 JavaScript。所以需要先**把 TS 转成 JS**（这叫"编译"），或者用一个工具直接运行 TS 文件。

我们用一个叫 `tsx` 的工具来直接运行 TS，不需要手动编译。

### 3.1 装一个全局工具

```bash
npm install -g tsx
```

`-g` 表示全局安装，装好后你在任何目录都能用 `tsx` 命令。

### 3.2 动手：写一个 TS 文件并运行

创建 `hello.ts`：

```typescript
// 和 Python 的 print() 一样
console.log("Hello World");

// 和 Python 一样可以做运算
const a: number = 1;
const b: number = 2;
console.log("1 + 2 =", a + b);
```

在终端运行：

```bash
tsx hello.ts
```

输出：

```
Hello World
1 + 2 = 3
```

> 注意 `const a: number = 1` 里的 `: number`——这就是 TypeScript 加的**类型标注**，告诉编译器 `a` 是数字类型。Python 3.6+ 也有类似的类型注解语法：`a: int = 1`。

**你现在做的就是"后端开发"**——TS 代码已经不在浏览器里了，它在你的电脑上直接运行。

---

## 4. npm（Node Package Manager）

### 4.1 为什么需要包管理器？

写代码时你经常会用到别人写好的代码（库/包），比如 Python 的 `requests`、`numpy`。

如果没包管理器，你要：

1. 去某个网站找到这个库
2. 手动下载 zip
3. 解压到项目目录
4. 这个库依赖的另外 5 个库，重复以上步骤
5. ...

**灾难**。npm 就是来解决这个问题的。

### 4.2 npm vs pip

| | Python | JavaScript |
|---|---|---|
| 包管理器 | pip | npm |
| 安装一个包 | `pip install requests` | `npm install express` |
| 包的记录文件 | `requirements.txt` | `package.json` |
| 包存放目录 | `site-packages/` | `node_modules/` |
| 包的来源 | pypi.org | npmjs.com |

### 4.3 npm install 背后发生了什么？

执行 `npm install express` 时：

1. npm 去 npmjs.com 查找 `express` 这个包
2. 下载到当前目录的 `node_modules/` 文件夹
3. 把依赖信息写入 `package.json`
4. `express` 依赖的其他包也会自动下载（传递依赖）

> 你装 1 个包，可能实际下载了 50 个包——这就是 npm 自动帮你做的事情。

---

## 5. node_modules 是什么？

`node_modules/` 就是下载的包存放的地方，类似 Python 的 `site-packages/`。

**重要：永远不要把 `node_modules` 提交到 git**，原因：

| 问题 | 说明 |
|------|------|
| 体积巨大 | 一个项目可能有几千个文件、几百 MB |
| 可重现 | 只要 `package.json` 在，任何人 `npm install` 都能生成同样的 `node_modules` |
| 平台相关 | 有些包在不同操作系统上编译结果不同 |

> 这就是为什么我们需要 `.gitignore`，把 `node_modules` 排除在 git 之外。

---

## 6. 在 VS Code 中调试 TypeScript

写代码时经常需要调试（设置断点、看变量值、单步执行）。VS Code 对 TypeScript 调试支持很好。

### 6.1 创建调试配置

在项目根目录下创建 `.vscode/launch.json` 文件：

```
FullStack-BoardGame-Project/
└── .vscode/
    └── launch.json          # ← 新建这个文件
```

`launch.json` 内容如下：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug TS with tsx",
      "runtimeExecutable": "tsx",
      "args": ["${file}"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### 6.2 每项配置的含义

逐行解释上面的配置：

| 配置项 | 值 | 含义 |
|-------|---|------|
| `version` | `"0.2.0"` | launch.json 的格式版本，VS Code 规定的，照写就行 |
| `configurations` | `[...]` | 一个数组，里面可以配多个调试方案，下拉菜单切换 |
| `type` | `"node"` | 调试器类型。因为我们用 Node.js 运行代码，所以填 `node`。如果是浏览器里的 JS 就填 `chrome` |
| `request` | `"launch"` | `launch` = VS Code 直接启动程序；`attach` = 程序已经跑着，VS Code 连上去调试 |
| `name` | `"Debug TS with tsx"` | 这个配置在下拉菜单里显示的名字，随便起 |
| `runtimeExecutable` | `"tsx"` | 用什么程序来跑代码。默认是 `node`，但我们改成了 `tsx`，这样可以直接跑 .ts 文件 |
| `args` | `["${file}"]` | 传给运行程序的参数。`${file}` 是 VS Code 的变量，表示"当前打开的文件的路径"。所以实际执行的是 `tsx hello.ts` |
| `skipFiles` | `["<node_internals>/**"]` | 调试时跳过 Node.js 内部的代码文件，只调试你自己的代码 |

> `"runtimeExecutable": "tsx"` 是这个配置的精髓——默认 VS Code 用 `node` 来调试，但我们改成 `tsx` 让它能直接跑 `.ts` 文件。

### 6.3 调试步骤

1. 在 VS Code 中打开 `hello.ts`
2. 在行号左边点击，加一个**断点**（出现小红点），比如点在第 3 行
3. 按 `F5`（或点左边栏"运行和调试"→ 选择 "Debug TS with tsx"）
4. 程序会在断点处停下，你可以：
   - 鼠标悬停在变量上看值
   - 按 `F10` 单步执行下一行
   - 按 `F5` 继续运行到下一个断点
   - 看左边的"变量"面板

### 6.4 类比

> 在 Python 里你可能会在 IDE 中加断点 debug。VS Code 对 TS 的 debug 体验和 PyCharm 对 Python 的 debug 非常像——加断点、看变量、单步走，是一样的。

---

## 7. 验证你的环境

```bash
$ node --version
v22.22.1

$ npm --version
10.9.4

$ tsx --version
v4.19.0
```

---

## 7. 总结

| 概念 | 一句话 | Python 类比 |
|------|--------|------------|
| **Node.js** | 让你在服务器上跑 JS/TS | `python3` 解释器 |
| **tsx** | 让你直接运行 .ts 文件，不用手动编译 | — |
| **npm** | JS 的包管理器 | pip |
| **node_modules** | 下载的包放这里 | site-packages |
| **npm install** | 下载并安装依赖包 | pip install |

---

## 思考题（附答案）

1. **`tsx hello.ts` 和 `node hello.js` 有什么区别？**
   - 答：`node` 只能直接运行 `.js` 文件。`tsx` 内部先把你写的 `.ts` 文件编译成 `.js`，再交给 Node.js 运行。所以 `tsx` = 编译 + 运行，一步到位。

2. **为什么 `node_modules` 不应该提交到 git？**
   - 答：体积太大（几百 MB 到几 GB），而且可以通过 `npm install` 从 `package.json` 重新生成。提交了反而可能在别人电脑上因为平台差异跑不了。

---

准备好了告诉我，进入**第 3 课：package.json 详解**。
