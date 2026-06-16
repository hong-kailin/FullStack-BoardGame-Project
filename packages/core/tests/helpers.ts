import type { GameState, Player, TokenType, Card, RoyalCard, GemColor, CardAbility, BonusColor } from "../src/types";

export function makeCard(overrides: Record<string, unknown>): Card {
  const allColors: (GemColor | "pearl")[] = ["red", "blue", "green", "white", "black", "pearl"];
  const cost: Record<GemColor | "pearl", number> = { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0 };
  const rawCost = (overrides.cost || {}) as Record<string, number>;
  for (const color of allColors) {
    cost[color] = rawCost[color] || 0;
  }
  return {
    id: overrides.id as number,
    level: (overrides.level as number) || 1,
    gem: (overrides.gem as BonusColor) || "red",
    points: (overrides.points as number) || 0,
    crowns: (overrides.crowns as number) || 0,
    bonusCount: (overrides.bonusCount as number) || 0,
    ability: (overrides.ability as CardAbility | null) || null,
    cost,
  } as Card;
}

export function makePlayer(overrides: Record<string, unknown>): Player {
  const id = overrides.id as number;
  const rawTokens = (overrides.tokens || {}) as Record<string, number>;
  return {
    id,
    name: `玩家 ${id === 0 ? "A" : "B"}`,
    tokens: {
      red: rawTokens.red || 0, blue: rawTokens.blue || 0, green: rawTokens.green || 0,
      white: rawTokens.white || 0, black: rawTokens.black || 0, pearl: rawTokens.pearl || 0, gold: rawTokens.gold || 0,
    },
    cards: (overrides.cards as Card[]) || [],
    royalCards: (overrides.royalCards as RoyalCard[]) || [],
    reservedCards: (overrides.reservedCards as Card[]) || [],
    privileges: (overrides.privileges as number) ?? (id === 1 ? 1 : 0),
    claimedRoyalThresholds: (overrides.claimedRoyalThresholds as number[]) || [],
  };
}

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
    pendingGemCard: null,
    pendingGemLevel: null,
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
