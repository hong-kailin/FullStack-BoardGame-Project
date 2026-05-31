export * from "./types";
export * from "./card-pool";
export * from "./board";
export * from "./purchase";

import { getLevelDeck, shuffleDeck, dealCards } from "./card-pool";
import { createBoard, getAdjacentTokens, takeTokens } from "./board";
import { TokenType, Player, Card } from "./types";
import { getPlayerBonuses, getActualCost, getTotalTokenCost, canAfford, purchaseCard } from "./purchase";

const deck = shuffleDeck(getLevelDeck(1));
const { dealt, remaining } = dealCards(deck, 5);

console.log("Splendor Duel - Game Engine");
console.log("当前模块: types, card-pool, board, purchase");
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

const testPlayer: Player = {
  id: 0, name: "Alice",
  tokens: { red: 2, blue: 1, green: 0, white: 0, black: 3, pearl: 1, gold: 1 },
  cards: [
    // cost: {} as any — 空对象 as any 是类型断言，强制告诉 TS "别管类型检查"
    // 因为已购买的卡牌不需要关心费用字段（费用只在购买时用），
    // 但 Card 接口要求 cost 必须有值，所以用 as any 快速跳过类型检查。
    // 类比：Python 的 typing.cast(Any, {})，C++ 的 reinterpret_cast。
    // 实际项目中不推荐滥用，这里只是测试数据临时使用。
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
