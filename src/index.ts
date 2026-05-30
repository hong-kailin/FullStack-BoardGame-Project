export * from "./types";
export * from "./card-pool";

import { getLevelDeck, shuffleDeck, dealCards } from "./card-pool";
import { createBoard, getAdjacentTokens, takeTokens } from "./board";
import { TokenType } from "./types";

const deck = shuffleDeck(getLevelDeck(1));
const { dealt, remaining } = dealCards(deck, 5);

console.log("Splendor Duel - Game Engine");
console.log("当前模块: types, card-pool, board");
console.log("---");
console.log(`等级 1 卡牌: 共 ${getLevelDeck(1).length} 张`);
console.log(`洗牌后发 ${dealt.length} 张到桌面，牌堆剩余 ${remaining.length} 张`);

const allTokens: TokenType[] = [
  "red", "blue", "green", "white", "black",
  "red", "blue", "green", "white", "black",
  "red", "blue", "green", "white", "black",
  "red", "blue", "green", "white", "black",
  "pearl", "pearl", "gold", "gold", "gold"
];

const shuffledTokens = shuffleDeck(allTokens);
const board = createBoard(shuffledTokens);

console.log("\n版图初始状态:");
console.log(board.map(row => row.map(t => (t ?? "  ").padEnd(6)).join("")).join("\n"));

const adjacent = getAdjacentTokens(board, 2, 2);
console.log("\n中央位置 (2,2) 的各方向相邻标记:");
adjacent.forEach((line, i) => console.log(`  方向 ${i}:`, line));
