function wait(ms: number) {
  return new Promise((done) => setTimeout(() => done("🍕 外卖到了！"), ms));
}

async function example1() {
  console.log("--- 示例 1：同步代码 ---");
  console.log("A");
  console.log("B");
  console.log("C");
  console.log();
}

async function example2() {
  console.log("--- 示例 2：setTimeout — 代码不一定从上到下 ---");
  console.log("A");
  setTimeout(() => {
    console.log("B");
  }, 1000);
  console.log("C");
  await wait(1500);
  console.log();
}

async function example3() {
  console.log("--- 示例 3：await — 只暂停当前函数 ---");
  console.log("A");
  const result = await wait(1000);
  console.log(result);
  console.log("B");
  console.log();
}

async function example4() {
  console.log("--- 示例 4：await 让代码从上往下读 ---");
  console.log("1. 开始");
  const r1 = await wait(1000);
  console.log(r1);
  const r2 = await wait(1000);
  console.log(r2);
  console.log("3. 两秒后");
  console.log();
}

async function example5() {
  console.log("--- 示例 5：忘记 await 会怎样 ---");
  console.log("A");
  const result = wait(1000);
  console.log(result);
  console.log("B");
  await wait(1500);
  console.log();
}

async function main() {
  await example1();
  await example2();
  await example3();
  await example4();
  await example5();
  console.log("🏁 所有示例运行完毕");
}

main();
