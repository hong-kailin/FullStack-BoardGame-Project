import type { GameState, Player, TokenType } from "../src/types";

export function createTestState(overrides?: Partial<GameState>): GameState {
  const emptyBoard: (TokenType | null)[][] = Array.from({ length: 5 }, () => Array(5).fill(null));

  const defaultPlayer: Player = {
    id: 0,
    name: "测试玩家",
    tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
    cards: [],
    royalCards: [],
    reservedCards: [],
    privileges: 0,
    claimedRoyalThresholds: [],
  };

  return {
    players: [
      { ...defaultPlayer, id: 0, name: "玩家 A" },
      { ...defaultPlayer, id: 1, name: "玩家 B", privileges: 1 },
    ],
    boardTokens: emptyBoard,
    pyramid: [[], [], []],
    decks: [[], [], []],
    availableRoyalCards: [],
    currentPlayerIndex: 0,
    winner: null,
    bag: [],
    privilegesAvailable: 2,
    pendingRoyalThresholds: [],
    ...overrides,
  };
}

export function setBoardToken(
  board: (TokenType | null)[][],
  row: number,
  col: number,
  token: TokenType
): (TokenType | null)[][] {
  const newBoard = board.map(r => [...r]);
  newBoard[row][col] = token;
  return newBoard;
}
