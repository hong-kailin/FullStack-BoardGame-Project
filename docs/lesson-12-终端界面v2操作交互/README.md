# 第 12 课：终端界面 v2 — 操作交互

这一课原来的 `README.md` 内容比较长，现在按主题拆成了几份文档。这样看起来更轻松，也更方便你以后回头查某个知识点。

## 本节课目标

让玩家可以通过命令行输入指令来操作游戏（拿取标记、购买卡牌），实现完整的双人轮流交互流程。

## 建议阅读顺序

1. [01-实现目标与主流程.md](./01-实现目标与主流程.md)
2. [02-readline-异步循环与不可变性.md](./02-readline-异步循环与不可变性.md)
3. [03-node-类型定义.md](./03-node-类型定义.md)
4. [04-tsconfig详解.md](./04-tsconfig详解.md)
5. [05-vscode-debug-输入问题.md](./05-vscode-debug-输入问题.md)

## 每份文档讲什么

| 文档 | 内容 |
|------|------|
| `01-实现目标与主流程.md` | 为什么要做交互、命令设计、回合循环、运行方式 |
| `02-readline-异步循环与不可变性.md` | `readline` 的异步模型、递归循环、不可变性 |
| `03-node-类型定义.md` | `@types/node`、npm scope、类型定义文件 |
| `04-tsconfig详解.md` | `tsconfig.json` 各项配置的含义和作用 |
| `05-vscode-debug-输入问题.md` | 为什么 F5 debug 时不能输入，以及怎么修复 |

## 本课涉及的代码文件

| 新增/修改 | 文件 | 作用 |
|-----------|------|------|
| 新增 | `src/game-loop.ts` | 游戏交互主循环 |
| 修改 | `src/board.ts` | `takeTokens` 中处理特权触发条件 |
| 修改 | `src/index.ts` | 入口改为启动游戏 |
| 新增 | `tsconfig.json` | TypeScript 配置文件 |
| 修改 | `.vscode/launch.json` | 修复 debug 无法输入的问题 |

## 本章新学知识点

- `readline` 模块和异步回调模式
- 递归实现游戏循环
- 正则表达式验证输入格式
- 不可变性（Immutability）
- `@types/node` 和 npm scope
- `tsconfig.json` 各配置项含义
- VS Code debug 的三种 console 模式
