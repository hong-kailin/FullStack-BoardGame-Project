// 本节课的示例代码 — 真正的卡牌池在 src/card-pool.ts
// 这里只展示核心函数，方便对照学习

interface Card {
  id: number;
  level: number;
  gem: string;
  points: number;
  crowns: number;
  cost: Record<string, number>;
}

function shuffleDeck<T>(deck: T[]): T[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function dealCards<T>(deck: T[], count: number): { dealt: T[]; remaining: T[] } {
  return {
    dealt: deck.slice(0, count),
    remaining: deck.slice(count)
  };
}

const sampleCards: Card[] = [
  { id: 1, level: 1, gem: "red", points: 1, crowns: 0, cost: { black: 3, pearl: 0 } },
  { id: 2, level: 1, gem: "red", points: 2, crowns: 1, cost: { green: 2, white: 1, pearl: 0 } },
  { id: 3, level: 1, gem: "blue", points: 1, crowns: 0, cost: { black: 3, pearl: 0 } },
  { id: 4, level: 1, gem: "green", points: 1, crowns: 0, cost: { red: 1, pearl: 2 } },
  { id: 5, level: 1, gem: "white", points: 1, crowns: 0, cost: { blue: 2, pearl: 1 } },
];

const shuffled = shuffleDeck(sampleCards);
const result = dealCards(shuffled, 3);

console.log("=== 洗牌后发 3 张 ===");
console.log("发到的卡牌:", result.dealt);
console.log("剩余:", result.remaining.length, "张");
