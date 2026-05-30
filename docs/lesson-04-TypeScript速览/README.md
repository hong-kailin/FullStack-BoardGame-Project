# 第 4 课：TypeScript 速览

## 本节课目标

理解 TypeScript 是什么、和 JavaScript 是什么关系，并学会写最基本的类型定义。

---

## 1. JavaScript vs TypeScript

### JavaScript 的问题

JavaScript 最初是浏览器里的脚本语言，设计目标就是"好上手"——变量没有类型，怎么写都行：

```javascript
// JavaScript — 随便写，不报错
let a = 1;
a = "hello";     // 同一个变量，从数字变成字符串，没问题
a = [1, 2, 3];   // 变成数组，也没问题

function add(x, y) {
  return x + y;
}

add(1, 2);        // 3
add("1", "2");    // "12" — 字符串拼接，不是加法！但 JS 不提醒你
```

这种"随便写"在小项目里很爽，但项目一大，问题就来了：

- 你写了个函数，参数应该传数字，结果传了字符串
- 函数返回了什么？不知道，得看源码
- 编辑器没法给你智能提示，因为它不知道变量是什么类型

### TypeScript 的解决方案

TypeScript 就是在 JavaScript 基础上加了**类型系统**。上面的代码用 TS 写：

```typescript
// TypeScript — 按规矩写
let a: number = 1;
a = "hello";  // ❌ 报错：不能把 string 赋值给 number

function add(x: number, y: number): number {
  return x + y;
}

add(1, 2);        // ✅ 3
add("1", "2");    // ❌ 报错：不能传 string
```

> **类比**：JS ≈ Python 那种动态类型，随便写；TS ≈ C++ 那种静态类型，变量和函数的类型都得声明。但 TS 比 C++ 更灵活——它能在你写代码的时候检查类型，但编译成 JS 后类型信息就消失了，不影响运行性能。

---

## 2. 核心概念：类型注解

用 `: 类型名` 来告诉 TS"这个变量是什么类型"：

```typescript
// 基本类型
const username: string = "Alice";
const age: number = 25;
const isActive: boolean = true;

// 数组
const scores: number[] = [90, 85, 95];
const names: string[] = ["Alice", "Bob"];

// 对象
const person: { name: string; age: number } = {
  name: "Alice",
  age: 25
};
```

> 注意：`const` 声明常量（不能重新赋值），`let` 声明变量（可以重新赋值）。这和 Python/C++ 的 const 概念类似。

> ⚠️ 如果你用 `name` 作为变量名，VS Code 可能会报错 `Cannot redeclare block-scoped variable 'name'`。这是因为 TypeScript 的类型定义文件 `lib.dom.d.ts` 里已经声明了一个全局的 `name` 变量（来自浏览器 API）。解决方法是换一个变量名，比如 `username`。这是我们遇到的第一个"全局命名冲突"，后面学会模块化（import/export）后就不会有这个问题了。

### 类比到 Python/C++

| TypeScript | Python | C++ |
|-----------|--------|-----|
| `const x: number = 1` | `x: int = 1` | `int x = 1;` |
| `const name: string = "hi"` | `name: str = "hi"` | `std::string name = "hi";` |
| `const arr: number[] = [1,2]` | `arr: list[int] = [1,2]` | `std::vector<int> arr = {1,2};` |
| `function add(a: number, b: number): number` | `def add(a: int, b: int) -> int` | `int add(int a, int b)` |

> 可以看到，TypeScript 的类型语法和 Python 的类型注解非常像，只是冒号的位置略有不同。

---

## 3. interface — 定义"形状"

`interface` 是 TS 里最重要的概念之一。它用来定义一个对象**应该长什么样**——有哪些字段、分别是什么类型。

```typescript
interface Person {
  name: string;
  age: number;
  isStudent: boolean;
}

// 使用 interface 声明变量
const alice: Person = {
  name: "Alice",
  age: 25,
  isStudent: true
};

// 如果你漏了字段或类型不对，TS 会报错
const bob: Person = {
  name: "Bob"
  // ❌ 报错：缺少 age 和 isStudent
};
```

> **类比**：
> - Python 的 `dataclass`：`@dataclass class Person: name: str; age: int`
> - C++ 的 `struct`：`struct Person { string name; int age; };`
>
> interface 就是 TS 版的"定义数据结构的形状"。

### 可选字段

用 `?` 表示这个字段可有可无：

```typescript
interface Config {
  host: string;
  port: number;
  debug?: boolean;  // ? 表示可选
}

const config1: Config = { host: "localhost", port: 3000 };          // ✅ 没问题
const config2: Config = { host: "localhost", port: 3000, debug: true };  // ✅ 也可以
```

---

## 4. type — 另一种定义方式

除了 `interface`，TS 还有 `type` 关键字。大部分时候它们可以互换：

```typescript
// interface 写法
interface Point {
  x: number;
  y: number;
}

// type 写法（效果一样）
type Point = {
  x: number;
  y: number;
};
```

初学者先用 `interface` 就行，后面遇到需要 `type` 的场景再介绍。

---

## 5. 类型带来的好处

### 好处一：编辑器智能提示

当你用 TS 写代码时，VS Code 会：

- 输入 `person.` 后，自动弹出 `name`、`age` 等字段列表
- 鼠标悬停在变量上，显示它的类型
- 传错参数时，红色波浪线立刻提醒你

这在 Python 里你可能需要装 Pylance 插件才能有类似体验。

### 好处二：编译期查错

```typescript
function getPrice(card: { price: number }): number {
  return card.price;
}

getPrice({ price: 5 });       // ✅ 正确
getPrice({ cost: 5 });        // ❌ 编译报错：没有 price 字段
getPrice({ price: "five" });  // ❌ 编译报错：类型不对
```

**关键**：这些错误在**写代码的时候**就发现了，而不是等到运行时报错。项目越大，这个优势越明显。

### 补充：为什么 VS Code 报错了还能运行？

你打开 `examples.ts` 会发现 VS Code 在第 1 节的 JS 代码上标了红色波浪线，但 `tsx examples.ts` 还是能正常运行。

原因很简单：

- **VS Code 的类型检查**：VS Code 内置了 TypeScript 语言服务，它分析你的 `.ts` 文件，发现 `let a = 1; a = "hello"` 这种代码——TS 推断 `a` 是 `number` 类型，但下一行赋了 `string`，所以报错。这是"静态检查"。
- **tsx 的运行机制**：`tsx` 的目的是让你快速跑 TS 代码，它把类型检查放得很宽松，重点是"转成 JS 并执行"。所以即使类型不匹配，它也能运行（因为转成 JS 后类型信息就没了）。

> **类比**：VS Code ≈ 严格的代码审查员，发现不规范就给你标红；tsx ≈ 宽松的翻译官，只要 JS 能理解就先帮你跑起来。

**那该怎么控制？** 通过 `tsconfig.json` 可以配置 TypeScript 的严格程度。比如 `"strict": true` 会让检查更严格，`"noImplicitAny": true` 要求所有变量都必须有类型。我们后面创建项目时会配置这个文件。

---

## 6. 动手：用 TypeScript 定义游戏的基础类型

在 `docs/lesson-04-TypeScript速览/` 下创建 `types.ts`：

```typescript
// 宝石颜色
type GemColor = "red" | "blue" | "green" | "white" | "black";

// 一张卡牌
interface Card {
  id: number;
  level: number;       // 卡牌等级 1/2/3
  gem: GemColor;       // 这张卡提供的宝石颜色
  points: number;      // 声望点数
  cost: Record<GemColor, number>;  // 购买需要的宝石
}

// 玩家
interface Player {
  id: number;
  name: string;
  gems: Record<GemColor, number>;   // 持有的宝石
  cards: Card[];                     // 已购买的卡牌
  points: number;                    // 总声望点数
}

// 测试一下
const sampleCard: Card = {
  id: 1,
  level: 1,
  gem: "red",
  points: 1,
  cost: { red: 0, blue: 0, green: 0, white: 0, black: 3 }
};

console.log("Card:", sampleCard);
console.log("Cost for black gems:", sampleCard.cost.black);
```

运行：

```bash
tsx docs/lesson-04-TypeScript速览/types.ts
```

> 这里的 `Record<GemColor, number>` 是 TS 内置的工具类型，意思是"一个对象，key 是 GemColor，value 是 number"。等价于手写 `{ red: number; blue: number; green: number; white: number; black: number }`。

---

## 7. 总结

| 概念 | 一句话 | Python 类比 |
|------|--------|------------|
| **TypeScript** | 加了类型的 JavaScript | — |
| **类型注解** | `变量: 类型` 声明变量的类型 | 类型注解 |
| **interface** | 定义对象的"形状" | dataclass / struct |
| **type** | 另一种定义类型的方式 | — |
| **好处** | 编辑器提示 + 编译期查错 | mypy 类型检查 |

---

## 思考题（附答案）

1. **TypeScript 代码能直接在浏览器里跑吗？**
   - 答：不能。浏览器只认识 JavaScript。TypeScript 代码需要先编译（转换成）成 JS，然后才能在浏览器或 Node.js 中运行。`tsx` 帮我们自动完成了这步。

2. **`interface` 和 `type` 有什么区别？**
   - 答：大部分场景可以互换。主要区别是：`interface` 可以重复声明合并（同名 interface 自动合并），`type` 不可以。初学者先用 `interface` 就行。

3. **`const` 和 `let` 有什么区别？**
   - 答：`const` 声明常量，一旦赋值不能重新指向；`let` 声明变量，可以重新赋值。这和 C++ 的 `const` 类似。在 TS 里优先用 `const`，只有需要重新赋值时才用 `let`。

---

准备好了告诉我，进入**第 5 课：终端基础与开发环境**。
