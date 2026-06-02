# 04. VS Code Debug 输入问题

## 1. 问题描述

按 F5 debug 程序后，`rl.question()` 停在等待输入，但调试控制台无法输入任何字符。

## 2. 原因

VS Code 的 Node.js debugger 默认使用**调试控制台（Debug Console）**显示程序输出。这个控制台是**只读的**，只能显示 `console.log` 的内容，不能接收 `process.stdin` 的输入。

而 `rl.question()` 底层依赖 `process.stdin`，所以程序会卡在这里。

类比：调试控制台像一台只能看的显示器，没有键盘。

## 3. 第一次尝试：`integratedTerminal`

```json
"console": "integratedTerminal"
```

这会让程序运行在 VS Code 的内置终端面板里。理论上它支持 stdin，因此看起来应该能解决问题。

但实际测试里，某些环境下仍可能不能输入。原因通常和终端集成、stdin 重定向、`tsx` 的兼容性有关。

## 4. 最终方案：`externalTerminal`

```json
"console": "externalTerminal"
```

这会让程序运行在独立弹出的系统终端窗口中。因为它是真正的终端进程，stdin / stdout 都完整可用，所以最稳。

## 5. 三种 console 模式对比

| 模式 | 位置 | stdin | 适用场景 |
|------|------|-------|---------|
| `internalConsole` | VS Code 调试控制台 | `No` | 只看输出、不需要输入 |
| `integratedTerminal` | VS Code 内置终端 | `Maybe` | 简单交互，依赖环境兼容性 |
| `externalTerminal` | 独立终端窗口 | `Yes` | `readline` 这类真实交互程序 |

## 6. 结论

如果你的程序依赖 `process.stdin`，尤其是用了 `readline`，优先把 VS Code 的 debug console 改成 `externalTerminal`。这是最省心、最稳定的方案。
