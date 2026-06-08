import type { GameState, Player, TokenType, Card } from "./types";
import { shuffleDeck, getLevelDeck } from "./card-pool";
import { createBoard, takeTokens } from "./board";
import { checkWinCondition, checkRoyalCardEligibility, enforceTokenLimit } from "./game";
import { getPlayerBonuses, getActualCost, canAfford, purchaseCard } from "./purchase";

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

function findCardInPyramid(pyramid: Card[][], cardId: number): { level: number; card: Card } | null {
  for (let level = 0; level < pyramid.length; level++) {
    for (const card of pyramid[level]) {
      if (card.id === cardId) return { level, card };
    }
  }
  return null;
}

export function handleTakeTokens(
  state: GameState,
  positions: [number, number][]
): { state: GameState; message: string } {
  const player = state.players[state.currentPlayerIndex];
  const opponentIndex = state.currentPlayerIndex === 0 ? 1 : 0;

  const result = takeTokens(state.boardTokens, positions);

  let newPlayer = { ...player, tokens: { ...player.tokens } };
  for (const token of result.taken) {
    newPlayer.tokens[token] = (newPlayer.tokens[token] || 0) + 1;
  }
  newPlayer = enforceTokenLimit(newPlayer);

  let opponent = state.players[opponentIndex];
  if (result.opponentGetsPrivilege) {
    opponent = { ...opponent, privileges: (opponent.privileges || 0) + 1 };
  }

  const newPlayers: [Player, Player] = state.currentPlayerIndex === 0
    ? [newPlayer, opponent]
    : [opponent, newPlayer];

  return {
    state: {
      ...state,
      players: newPlayers,
      boardTokens: result.board,
      currentPlayerIndex: opponentIndex
    },
    message: `${player.name} 拿取了 ${result.taken.length} 个标记`
  };
}

export function handleBuyCard(
  state: GameState,
  cardId: number
): { state: GameState; message: string } {
  const player = state.players[state.currentPlayerIndex];
  const opponentIndex = state.currentPlayerIndex === 0 ? 1 : 0;

  const found = findCardInPyramid(state.pyramid, cardId);
  if (!found) return { state, message: `卡牌 ID ${cardId} 不在金字塔中` };

  const bonuses = getPlayerBonuses(player);
  const actualCost = getActualCost(found.card, bonuses);

  if (!canAfford(player, actualCost)) {
    return { state, message: "宝石不足，无法购买该卡牌" };
  }

  const result = purchaseCard(player, found.card, actualCost);
  let newPlayer = result.player;

  const royalCard = checkRoyalCardEligibility(newPlayer, state.availableRoyalCards);
  if (royalCard) {
    newPlayer = { ...newPlayer, royalCards: [...newPlayer.royalCards, royalCard] };
  }

  if (checkWinCondition(newPlayer)) {
    return {
      state: { ...state, winner: newPlayer },
      message: `${player.name} 购买了卡牌 ${cardId}，达到胜利条件！`
    };
  }

  const newPyramid = state.pyramid.map(level => level.filter(c => c.id !== cardId));
  const newPlayers = [...state.players] as [Player, Player];
  newPlayers[state.currentPlayerIndex] = newPlayer;

  return {
    state: {
      ...state,
      players: newPlayers,
      pyramid: newPyramid,
      currentPlayerIndex: opponentIndex
    },
    message: `${player.name} 购买了卡牌 ${cardId}`
  };
}

export function handlePass(state: GameState): { state: GameState; message: string } {
  const player = state.players[state.currentPlayerIndex];
  const opponentIndex = state.currentPlayerIndex === 0 ? 1 : 0;
  return {
    state: { ...state, currentPlayerIndex: opponentIndex },
    message: `${player.name} 跳过了回合`
  };
}