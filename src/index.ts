export * from "./types";
export * from "./card-pool";
export * from "./board";
export * from "./purchase";
export * from "./game";

import { getLevelDeck, shuffleDeck, dealCards } from "./card-pool";
import { createBoard, getAdjacentTokens, takeTokens } from "./board";
import { TokenType, Player, Card } from "./types";
import { getPlayerBonuses, getActualCost, getTotalTokenCost, canAfford, purchaseCard } from "./purchase";
import {
  getTotalPoints, getTotalCrowns, getPointsByGemColor,
  checkWinCondition, enforceTokenLimit
} from "./game";

console.log("Splendor Duel - Game Engine");
console.log("当前模块: types, card-pool, board, purchase, game");
console.log("---");

// 卡牌池测试
const deck = shuffleDeck(getLevelDeck(1));
const { dealt, remaining } = dealCards(deck, 5);
console.log(`等级 1 卡牌: 共 ${getLevelDeck(1).length} 张`);
console.log(`洗牌后发 ${dealt.length} 张到桌面，牌堆剩余 ${remaining.length} 张`);

// 版图测试
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

// 购买测试
const testPlayer: Player = {
  id: 0, name: "Alice",
  tokens: { red: 2, blue: 1, green: 0, white: 0, black: 3, pearl: 1, gold: 1 },
  cards: [
    { id: 1, level: 1, gem: "red", points: 1, crowns: 0, cost: {} as any },
    { id: 2, level: 1, gem: "red", points: 2, crowns: 1, cost: {} as any },
    { id: 3, level: 1, gem: "red", points: 0, crowns: 0, cost: {} as any },
    { id: 4, level: 1, gem: "blue", points: 1, crowns: 0, cost: {} as any },
    { id: 5, level: 1, gem: "blue", points: 0, crowns: 0, cost: {} as any },
    { id: 6, level: 1, gem: "green", points: 1, crowns: 0, cost: {} as any },
  ],
  royalCards: [], reservedCards: [], privileges: 0
};

const targetCard: Card = {
  id: 18, level: 3, gem: "red", points: 7, crowns: 3,
  cost: { red: 0, blue: 0, green: 5, white: 0, black: 5, pearl: 2 }
};

const bonuses = getPlayerBonuses(testPlayer);
console.log("\n玩家奖励:", bonuses);

const actualCost = getActualCost(targetCard, bonuses);
console.log("目标卡牌:", targetCard.id, "实际费用:", actualCost);
console.log("需要支付标记数:", getTotalTokenCost(actualCost));
console.log("是否买得起:", canAfford(testPlayer, actualCost));

if (canAfford(testPlayer, actualCost)) {
  const updatedPlayer = purchaseCard(testPlayer, targetCard, actualCost);
  console.log("购买后剩余标记:", updatedPlayer.tokens);
  console.log("购买后卡牌数:", updatedPlayer.cards.length);
}

// 胜利条件测试
const winningPlayer: Player = {
  id: 0, name: "Alice",
  tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
  cards: [
    { id: 10, level: 2, gem: "red", points: 4, crowns: 2, cost: {} as any },
    { id: 14, level: 2, gem: "green", points: 5, crowns: 2, cost: {} as any },
    { id: 18, level: 3, gem: "red", points: 7, crowns: 3, cost: {} as any },
  ],
  royalCards: [], reservedCards: [], privileges: 0
};

console.log("\n--- 胜利条件测试 ---");
console.log("声望:", getTotalPoints(winningPlayer));
console.log("王冠:", getTotalCrowns(winningPlayer));
console.log("同色声望:", getPointsByGemColor(winningPlayer));
console.log("是否获胜:", checkWinCondition(winningPlayer));

// 标记上限测试
const tokenRichPlayer: Player = {
  id: 1, name: "Bob",
  tokens: { red: 3, blue: 2, green: 1, white: 0, black: 4, pearl: 2, gold: 1 },
  cards: [], royalCards: [], reservedCards: [], privileges: 0
};

const totalTokens = Object.values(tokenRichPlayer.tokens).reduce((a, b) => a + b, 0);
console.log("\nBob 标记数:", totalTokens);
const limited = enforceTokenLimit(tokenRichPlayer);
console.log("弃到 10 后:", limited.tokens);
