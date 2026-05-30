export * from "./types";
export * from "./card-pool";

import { getLevelDeck, shuffleDeck, dealCards } from "./card-pool";

const deck = shuffleDeck(getLevelDeck(1));
const { dealt, remaining } = dealCards(deck, 5);

console.log("Splendor Duel - Game Engine");
console.log("当前模块: types（类型定义）, card-pool（卡牌池）");
console.log("---");
console.log(`等级 1 卡牌: 共 ${getLevelDeck(1).length} 张`);
console.log(`洗牌后发 ${dealt.length} 张到桌面，牌堆剩余 ${remaining.length} 张`);
