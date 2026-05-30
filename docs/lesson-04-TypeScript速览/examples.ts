// ========================================
// 第 4 课：TypeScript 速览 — 全部代码示例
// 按章节组织，方便对照学习
// 运行: tsx docs/lesson-04-TypeScript速览/examples.ts
// ========================================

// ========================================
// 第 1 节：JavaScript vs TypeScript
// ========================================

console.log("=== 第 1 节：JS vs TS ===");

// --- JavaScript 的问题 ---
// 下面这些在 JS 里完全没问题，但容易藏 bug
let a = 1;
a = "hello";     // 同一个变量，从数字变成字符串
a = [1, 2, 3];   // 变成数组

function add(x, y) {
  return x + y;
}

console.log("JS add(1, 2):", add(1, 2));     // 3
console.log('JS add("1", "2"):', add("1", "2")); // "12" — 字符串拼接，不是加法！

// --- TypeScript 的解决方案 ---
// 加了类型，写错了编译期就报错

let aTyped: number = 1;
// aTyped = "hello";  // ❌ 编译报错：不能把 string 赋值给 number

function addTyped(x: number, y: number): number {
  return x + y;
}

console.log("TS addTyped(1, 2):", addTyped(1, 2)); // 3
// addTyped("1", "2");  // ❌ 编译报错：不能传 string


// ========================================
// 第 2 节：核心概念 — 类型注解
// ========================================

console.log("\n=== 第 2 节：类型注解 ===");

// 基本类型
const name: string = "Alice";   // ⚠️ VS Code 可能报错：name 是浏览器 API 的全局变量，冲突了。换个名字比如 username 即可
const age: number = 25;
const isActive: boolean = true;

console.log(`name: ${name}, age: ${age}, isActive: ${isActive}`);

// 数组
const scores: number[] = [90, 85, 95];
const names: string[] = ["Alice", "Bob"];

console.log("scores:", scores);
console.log("names:", names);

// 对象
const person: { name: string; age: number } = {
  name: "Alice",
  age: 25
};

console.log("person:", person);


// ========================================
// 第 3 节：interface — 定义"形状"
// ========================================

console.log("\n=== 第 3 节：interface ===");

interface Person {
  name: string;
  age: number;
  isStudent: boolean;
}

const alice: Person = {
  name: "Alice",
  age: 25,
  isStudent: true
};

console.log("alice:", alice);

// 可选字段
interface Config {
  host: string;
  port: number;
  debug?: boolean;  // ? 表示可选
}

const config1: Config = { host: "localhost", port: 3000 };
const config2: Config = { host: "localhost", port: 3000, debug: true };

console.log("config1:", config1);
console.log("config2:", config2);


// ========================================
// 第 4 节：type — 另一种定义方式
// ========================================

console.log("\n=== 第 4 节：type ===");

// interface 写法
interface PointInterface {
  x: number;
  y: number;
}

// type 写法（效果一样）
type PointType = {
  x: number;
  y: number;
};

const p1: PointInterface = { x: 10, y: 20 };
const p2: PointType = { x: 30, y: 40 };

console.log("p1 (interface):", p1);
console.log("p2 (type):", p2);


// ========================================
// 第 5 节：类型带来的好处
// ========================================

console.log("\n=== 第 5 节：类型带来的好处 ===");

function getPrice(card: { price: number }): number {
  return card.price;
}

console.log("getPrice({ price: 5 }):", getPrice({ price: 5 }));       // ✅ 正确
let result1:number = getPrice({ cost: 5 });        // ❌ 编译报错：没有 price 字段
let result2:number = getPrice({ price: "five" });  // ❌ 编译报错：类型不对
console.log("over");

