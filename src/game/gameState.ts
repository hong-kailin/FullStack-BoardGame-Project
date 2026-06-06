import type { GameState, TokenType } from "./types";
import { shuffleDeck, getLevelDeck } from "./card-pool";
import { createBoard } from "./board";

export function createInitialState(): GameState {
  const allTokens: TokenType[] = [
    "red", "blue", "green", "white", "black",
    "red", "blue", "green", "white", "black",
    "red", "blue", "green", "white", "black",
    "red", "blue", "green", "white", "black",
    "pearl", "pearl", "gold", "gold", "gold"
  ];

  const shuffledTokens = shuffleDeck(allTokens);
  const board = createBoard(shuffledTokens);

  return {
    players: [
      {
        id: 0,
        name: "玩家 1",
        tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
        cards: [],
        royalCards: [],
        reservedCards: [],
        privileges: 0
      },
      {
        id: 1,
        name: "玩家 2",
        tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
        cards: [],
        royalCards: [],
        reservedCards: [],
        privileges: 0
      }
    ],
    boardTokens: board,
    pyramid: [
      shuffleDeck(getLevelDeck(1)).slice(0, 5),
      shuffleDeck(getLevelDeck(2)).slice(0, 4),
      shuffleDeck(getLevelDeck(3)).slice(0, 3),
    ],
    availableRoyalCards: [],
    currentPlayerIndex: 0,
    winner: null,
    bag: []
  };
}