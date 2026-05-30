// 本节课的示例代码 — 真正的类型定义在 src/types.ts
// 这里只展示最基本的结构，方便对照学习

type GemColor = "red" | "blue" | "green" | "white" | "black";
type TokenType = GemColor | "pearl" | "gold";

interface Card {
  id: number;
  level: number;
  gem: GemColor;
  points: number;
  crowns: number;
  cost: Record<GemColor | "pearl", number>;
}

interface Player {
  id: number;
  name: string;
  tokens: Record<TokenType, number>;
  cards: Card[];
  reservedCards: Card[];
  privileges: number;
}

const sampleCard: Card = {
  id: 1,
  level: 1,
  gem: "red",
  points: 1,
  crowns: 2,
  cost: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 3 }
};

const player1: Player = {
  id: 0,
  name: "Alice",
  tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
  cards: [],
  reservedCards: [],
  privileges: 0
};

console.log("Sample card:", sampleCard);
console.log("Player 1:", player1);
