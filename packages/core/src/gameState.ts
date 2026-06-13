import type { GameState, Player, TokenType, Card } from "./types";
import { shuffleDeck, getLevelDeck } from "./card-pool";
import { createBoard, takeTokens, refillBoard } from "./board";
import { checkWinCondition, checkRoyalCardEligibility } from "./game";
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

  const deck1 = shuffleDeck(getLevelDeck(1));
  const deck2 = shuffleDeck(getLevelDeck(2));
  const deck3 = shuffleDeck(getLevelDeck(3));

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
        privileges: 1
      }
    ],
    boardTokens: board,
    pyramid: [
      deck1.slice(0, 5),
      deck2.slice(0, 4),
      deck3.slice(0, 3),
    ],
    decks: [
      deck1.slice(5),
      deck2.slice(4),
      deck3.slice(3),
    ],
    availableRoyalCards: [],
    currentPlayerIndex: 0,
    winner: null,
    bag: [],
    privilegesAvailable: 2
  };
}

function refillPyramidLevel(
  pyramid: Card[][],
  decks: Card[][],
  level: number
): { pyramid: Card[][]; decks: Card[][] } {
  const newPyramid = pyramid.map(levelCards => [...levelCards]);
  const newDecks = decks.map(deck => [...deck]);
  const targetCount = level === 0 ? 5 : level === 1 ? 4 : 3;

  while (newPyramid[level].length < targetCount && newDecks[level].length > 0) {
    const card = newDecks[level].shift()!;
    newPyramid[level].push(card);
  }

  return { pyramid: newPyramid, decks: newDecks };
}

function findCardInPyramid(pyramid: Card[][], cardId: number): { level: number; card: Card } | null {
  for (let level = 0; level < pyramid.length; level++) {
    for (const card of pyramid[level]) {
      if (card.id === cardId) return { level, card };
    }
  }
  return null;
}

function givePrivilege(
  state: GameState,
  targetPlayerIndex: number
): { players: [Player, Player]; privilegesAvailable: number } {
  const opponentIndex = targetPlayerIndex === 0 ? 1 : 0;
  const target = state.players[targetPlayerIndex];
  const opponent = state.players[opponentIndex];

  if (state.privilegesAvailable > 0) {
    const newTarget = { ...target, privileges: Math.min(target.privileges + 1, 3) };
    const newPlayers: [Player, Player] = targetPlayerIndex === 0
      ? [newTarget, opponent]
      : [opponent, newTarget];
    return { players: newPlayers, privilegesAvailable: state.privilegesAvailable - 1 };
  }

  if (opponent.privileges > 0) {
    const newOpponent = { ...opponent, privileges: opponent.privileges - 1 };
    const newTarget = { ...target, privileges: Math.min(target.privileges + 1, 3) };
    const newPlayers: [Player, Player] = targetPlayerIndex === 0
      ? [newTarget, newOpponent]
      : [newOpponent, newTarget];
    return { players: newPlayers, privilegesAvailable: 0 };
  }

  return { players: state.players, privilegesAvailable: state.privilegesAvailable };
}

export function handleTakeTokens(
  state: GameState,
  positions: [number, number][]
): { state: GameState; message: string; needsDiscard: number } {
  const player = state.players[state.currentPlayerIndex];
  const opponentIndex = state.currentPlayerIndex === 0 ? 1 : 0;

  const result = takeTokens(state.boardTokens, positions);

  const newPlayer = { ...player, tokens: { ...player.tokens } };
  for (const token of result.taken) {
    newPlayer.tokens[token] = (newPlayer.tokens[token] || 0) + 1;
  }

  const totalTokens = Object.values(newPlayer.tokens).reduce((a, b) => a + b, 0);
  const needsDiscard = totalTokens > 10 ? totalTokens - 10 : 0;

  if (needsDiscard > 0) {
    let opponent = state.players[opponentIndex];
    let privilegesAvailable = state.privilegesAvailable;
    if (result.opponentGetsPrivilege) {
      const privResult = givePrivilege(state, opponentIndex);
      opponent = privResult.players[opponentIndex];
      privilegesAvailable = privResult.privilegesAvailable;
    }

    const newPlayers: [Player, Player] = state.currentPlayerIndex === 0
      ? [newPlayer, opponent]
      : [opponent, newPlayer];

    return {
      state: {
        ...state,
        players: newPlayers,
        boardTokens: result.board,
        privilegesAvailable,
      },
      message: `${player.name} 拿取了 ${result.taken.length} 个标记，标记超过 10 个，请选择要归还的标记`,
      needsDiscard
    };
  }

  let opponent = state.players[opponentIndex];
  let privilegesAvailable = state.privilegesAvailable;
  if (result.opponentGetsPrivilege) {
    const privResult = givePrivilege(state, opponentIndex);
    opponent = privResult.players[opponentIndex];
    privilegesAvailable = privResult.privilegesAvailable;
  }

  const newPlayers: [Player, Player] = state.currentPlayerIndex === 0
    ? [newPlayer, opponent]
    : [opponent, newPlayer];

  return {
    state: {
      ...state,
      players: newPlayers,
      boardTokens: result.board,
      privilegesAvailable,
      currentPlayerIndex: opponentIndex
    },
    message: `${player.name} 拿取了 ${result.taken.length} 个标记`,
    needsDiscard: 0
  };
}

export function handleDiscardTokens(
  state: GameState,
  discards: TokenType[]
): { state: GameState; message: string } {
  const player = state.players[state.currentPlayerIndex];
  const opponentIndex = state.currentPlayerIndex === 0 ? 1 : 0;

  const newPlayer = { ...player, tokens: { ...player.tokens } };
  for (const type of discards) {
    newPlayer.tokens[type] = Math.max(0, (newPlayer.tokens[type] || 0) - 1);
  }

  const newBag = [...state.bag, ...discards];

  const newPlayers = [...state.players] as [Player, Player];
  newPlayers[state.currentPlayerIndex] = newPlayer;

  return {
    state: {
      ...state,
      players: newPlayers,
      bag: newBag,
      currentPlayerIndex: opponentIndex
    },
    message: `${player.name} 归还了 ${discards.length} 个标记`
  };
}

export function handleBuyCard(
  state: GameState,
  cardId: number
): { state: GameState; message: string } {
  const player = state.players[state.currentPlayerIndex];
  const opponentIndex = state.currentPlayerIndex === 0 ? 1 : 0;

  const fromPyramid = findCardInPyramid(state.pyramid, cardId);
  const fromReserved = player.reservedCards.find(c => c.id === cardId);
  const card = fromPyramid?.card || fromReserved;

  if (!card) return { state, message: `卡牌 ID ${cardId} 不存在` };

  const bonuses = getPlayerBonuses(player);
  const actualCost = getActualCost(card, bonuses);

  if (!canAfford(player, actualCost)) {
    return { state, message: "宝石不足，无法购买该卡牌" };
  }

  const result = purchaseCard(player, card, actualCost);
  let newPlayer = result.player;

  const spentTokens: TokenType[] = [];
  for (const [type, count] of Object.entries(result.spent)) {
    for (let i = 0; i < count; i++) {
      spentTokens.push(type as TokenType);
    }
  }
  const newBag = [...state.bag, ...spentTokens];

  if (fromReserved) {
    newPlayer = {
      ...newPlayer,
      reservedCards: newPlayer.reservedCards.filter(c => c.id !== cardId)
    };
  }

  const royalCard = checkRoyalCardEligibility(newPlayer, state.availableRoyalCards);
  if (royalCard) {
    newPlayer = { ...newPlayer, royalCards: [...newPlayer.royalCards, royalCard] };
  }

  if (checkWinCondition(newPlayer)) {
    return {
      state: { ...state, bag: newBag, winner: newPlayer },
      message: `${player.name} 购买了卡牌 ${cardId}，达到胜利条件！`
    };
  }

  const newPyramid = fromPyramid
    ? state.pyramid.map(level => level.filter(c => c.id !== cardId))
    : state.pyramid;

  let finalPyramid = newPyramid;
  let finalDecks = state.decks;
  if (fromPyramid) {
    const refill = refillPyramidLevel(newPyramid, state.decks, fromPyramid.level);
    finalPyramid = refill.pyramid;
    finalDecks = refill.decks;
  }

  const newPlayers = [...state.players] as [Player, Player];
  newPlayers[state.currentPlayerIndex] = newPlayer;

  return {
    state: {
      ...state,
      players: newPlayers,
      pyramid: finalPyramid,
      decks: finalDecks,
      bag: newBag,
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

export function handleTakeGold(
  state: GameState,
  position: [number, number],
  cardId: number
): { state: GameState; message: string } {
  const player = state.players[state.currentPlayerIndex];
  const opponentIndex = state.currentPlayerIndex === 0 ? 1 : 0;

  const newBoard = state.boardTokens.map(row => [...row]);
  newBoard[position[0]][position[1]] = null;

  let newPlayer = { ...player, tokens: { ...player.tokens } };
  newPlayer.tokens.gold = (newPlayer.tokens.gold || 0) + 1;

  const found = findCardInPyramid(state.pyramid, cardId);
  if (!found) return { state, message: "卡牌不存在" };

  if (newPlayer.reservedCards.length >= 3) {
    return { state, message: "最多只能保留 3 张卡牌" };
  }

  newPlayer = {
    ...newPlayer,
    reservedCards: [...newPlayer.reservedCards, found.card]
  };

  const newPyramid = state.pyramid.map(level =>
    level.filter(c => c.id !== cardId)
  );

  const refill = refillPyramidLevel(newPyramid, state.decks, found.level);

  const newPlayers: [Player, Player] = state.currentPlayerIndex === 0
    ? [newPlayer, state.players[1]]
    : [state.players[0], newPlayer];

  return {
    state: {
      ...state,
      players: newPlayers,
      boardTokens: newBoard,
      pyramid: refill.pyramid,
      decks: refill.decks,
      currentPlayerIndex: opponentIndex
    },
    message: `${player.name} 拿取了黄金并保留了卡牌`
  };
}

export function handleRefillBoard(state: GameState): { state: GameState; message: string } {
  const player = state.players[state.currentPlayerIndex];
  const opponentIndex = state.currentPlayerIndex === 0 ? 1 : 0;

  if (state.bag.length === 0) {
    return { state, message: "袋子为空，无法补充版图" };
  }

  const result = refillBoard(state.boardTokens, state.bag);

  const privResult = givePrivilege(state, opponentIndex);

  const newPlayers: [Player, Player] = state.currentPlayerIndex === 0
    ? [state.players[0], privResult.players[opponentIndex]]
    : [privResult.players[opponentIndex], state.players[1]];

  return {
    state: {
      ...state,
      players: newPlayers,
      boardTokens: result.board,
      bag: result.bag,
      privilegesAvailable: privResult.privilegesAvailable,
    },
    message: `${player.name} 补充了版图，对手获得 1 个特权`
  };
}

export function handleUsePrivilege(
  state: GameState,
  position: [number, number]
): { state: GameState; message: string; needsDiscard: number } {
  const player = state.players[state.currentPlayerIndex];

  if (player.privileges <= 0) {
    return { state, message: "没有可用的特权", needsDiscard: 0 };
  }

  const token = state.boardTokens[position[0]][position[1]];
  if (!token || token === "gold") {
    return { state, message: "该位置没有可拿取的非黄金标记", needsDiscard: 0 };
  }

  const newBoard = state.boardTokens.map(row => [...row]);
  newBoard[position[0]][position[1]] = null;

  const newPlayer = {
    ...player,
    tokens: { ...player.tokens },
    privileges: player.privileges - 1,
  };
  newPlayer.tokens[token] = (newPlayer.tokens[token] || 0) + 1;

  const totalTokens = Object.values(newPlayer.tokens).reduce((a, b) => a + b, 0);
  const needsDiscard = totalTokens > 10 ? totalTokens - 10 : 0;

  const newPlayers = [...state.players] as [Player, Player];
  newPlayers[state.currentPlayerIndex] = newPlayer;

  return {
    state: {
      ...state,
      players: newPlayers,
      boardTokens: newBoard,
      privilegesAvailable: state.privilegesAvailable + 1,
    },
    message: needsDiscard > 0
      ? `${player.name} 使用特权拿取了 1 个 ${token} 标记，标记超过 10 个，请选择要归还的标记`
      : `${player.name} 使用特权拿取了 1 个 ${token} 标记`,
    needsDiscard,
  };
}