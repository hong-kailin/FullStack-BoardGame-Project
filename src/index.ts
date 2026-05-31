export * from "./types";
export * from "./card-pool";
export * from "./board";
export * from "./purchase";
export * from "./game";

import { shuffleDeck, getLevelDeck } from "./card-pool";
import { createBoard } from "./board";
import { TokenType, Card, Player } from "./types";
import { renderGameState } from "./renderer";

const allTokens: TokenType[] = [
  "red", "blue", "green", "white", "black",
  "red", "blue", "green", "white", "black",
  "red", "blue", "green", "white", "black",
  "red", "blue", "green", "white", "black",
  "pearl", "pearl", "gold", "gold", "gold"
];

const shuffledTokens = shuffleDeck(allTokens);
const board = createBoard(shuffledTokens);

const player1: Player = {
  id: 0, name: "Alice",
  tokens: { red: 2, blue: 1, green: 0, white: 0, black: 3, pearl: 0, gold: 0 },
  cards: [
    { id: 1, level: 1, gem: "red", points: 1, crowns: 0, bonusCount: 1, cost: {} as any },
    { id: 2, level: 1, gem: "red", points: 2, crowns: 1, bonusCount: 1, cost: {} as any },
    { id: 4, level: 1, gem: "blue", points: 1, crowns: 0, bonusCount: 1, cost: {} as any },
  ],
  royalCards: [], reservedCards: [], privileges: 0
};

const player2: Player = {
  id: 1, name: "Bob",
  tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
  cards: [
    { id: 7, level: 1, gem: "white", points: 1, crowns: 0, bonusCount: 1, cost: {} as any },
  ],
  royalCards: [], reservedCards: [], privileges: 1
};

const pyramid: Card[][] = [
  shuffleDeck(getLevelDeck(1)).slice(0, 5),
  shuffleDeck(getLevelDeck(2)).slice(0, 4),
  shuffleDeck(getLevelDeck(3)).slice(0, 3),
];

renderGameState([player1, player2], board, pyramid, 0);
