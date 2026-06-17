import type { GameState, Player, TokenType, Card, CardAbility, BonusColor, GemColor } from "./types";
import { shuffleDeck, getLevelDeck, getRoyalCards } from "./card-pool";
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
        privileges: 0,
        claimedRoyalThresholds: []
      },
      {
        id: 1,
        name: "玩家 2",
        tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
        cards: [],
        royalCards: [],
        reservedCards: [],
        privileges: 1,
        claimedRoyalThresholds: []
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
    availableRoyalCards: getRoyalCards(),
    currentPlayerIndex: 0,
    winner: null,
    bag: [],
    privilegesAvailable: 2,
    pendingRoyalThresholds: [],
    pendingGemCard: null,
    pendingGemLevel: null,
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

function removeCardAndRefillPyramid(
  pyramid: Card[][],
  decks: Card[][],
  cardId: number,
  fromLevel: number | null
): { pyramid: Card[][]; decks: Card[][] } {
  if (fromLevel === null) return { pyramid, decks };
  const newPyramid = pyramid.map(level => level.filter(c => c.id !== cardId));
  const refill = refillPyramidLevel(newPyramid, decks, fromLevel);
  return refill;
}

function resolveCardAbility(
  state: GameState,
  card: { ability: CardAbility | null; gem?: BonusColor }
): { state: GameState; message: string } {
  if (!card.ability) return { state, message: "" };

  const playerIndex = state.currentPlayerIndex;
  const opponentIndex = playerIndex === 0 ? 1 : 0;
  const player = state.players[playerIndex];
  const opponent = state.players[opponentIndex];

  switch (card.ability) {
    case "extra_turn":
      return { state, message: "获得额外回合！" };

    case "take_privilege": {
      const privResult = givePrivilege(state, playerIndex);
      return {
        state: { ...state, players: privResult.players, privilegesAvailable: privResult.privilegesAvailable },
        message: "获得 1 个特权！"
      };
    }

    case "take_from_opponent": {
      const nonGoldTokens = (Object.keys(opponent.tokens) as TokenType[]).filter(
        t => t !== "gold" && (opponent.tokens[t] || 0) > 0
      );
      if (nonGoldTokens.length === 0) {
        return { state, message: "对手没有可拿取的标记" };
      }
      const takenType = nonGoldTokens[Math.floor(Math.random() * nonGoldTokens.length)];
      const newPlayer = { ...player, tokens: { ...player.tokens } };
      newPlayer.tokens[takenType] = (newPlayer.tokens[takenType] || 0) + 1;
      const newOpponent = { ...opponent, tokens: { ...opponent.tokens } };
      newOpponent.tokens[takenType] = Math.max(0, (newOpponent.tokens[takenType] || 0) - 1);
      const newPlayers: [Player, Player] = playerIndex === 0
        ? [newPlayer, newOpponent]
        : [newOpponent, newPlayer];
      return {
        state: { ...state, players: newPlayers },
        message: `从对手处拿取了 1 个 ${takenType} 标记！`
      };
    }

    case "take_matching_token": {
      if (!card.gem || card.gem === "any") return { state, message: "" };
      const gemColor = card.gem as GemColor;
      const newBoard = state.boardTokens.map(row => [...row]);
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (newBoard[r][c] === gemColor) {
            newBoard[r][c] = null;
            const newPlayer = { ...player, tokens: { ...player.tokens } };
            newPlayer.tokens[gemColor] = (newPlayer.tokens[gemColor] || 0) + 1;
            const newPlayers: [Player, Player] = playerIndex === 0
              ? [newPlayer, opponent]
              : [opponent, newPlayer];
            return {
              state: { ...state, players: newPlayers, boardTokens: newBoard },
              message: `拿取了 1 个 ${gemColor} 标记！`
            };
          }
        }
      }
      return { state, message: `版图上没有 ${gemColor} 标记可拿取` };
    }

    default:
      return { state, message: "" };
  }
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

  const purchaseResult = purchaseCard(player, card, actualCost);
  let newPlayer = purchaseResult.player;

  const spentTokens: TokenType[] = [];
  for (const [type, count] of Object.entries(purchaseResult.spent)) {
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

  const pyramidRefill = removeCardAndRefillPyramid(
    state.pyramid, state.decks, cardId, fromPyramid ? fromPyramid.level : null
  );

  const newPlayers = [...state.players] as [Player, Player];
  newPlayers[state.currentPlayerIndex] = newPlayer;

  if (card.gem === "any") {
    return {
      state: {
        ...state,
        players: newPlayers,
        pyramid: pyramidRefill.pyramid,
        decks: pyramidRefill.decks,
        bag: newBag,
        pendingGemCard: card,
        pendingGemLevel: fromPyramid ? fromPyramid.level : null,
      },
      message: `${player.name} 购买了万能奖励卡牌，请选择奖励颜色！`
    };
  }

  const newThresholds = checkRoyalCardEligibility(newPlayer);
  if (newThresholds.length > 0) {
    return {
      state: {
        ...state,
        players: newPlayers,
        pyramid: pyramidRefill.pyramid,
        decks: pyramidRefill.decks,
        bag: newBag,
        pendingRoyalThresholds: newThresholds,
      },
      message: `${player.name} 达到了 ${newThresholds.join("/")} 王冠，请选择一张皇室卡牌！`
    };
  }

  if (checkWinCondition(newPlayer)) {
    return {
      state: {
        ...state, players: newPlayers,
        pyramid: pyramidRefill.pyramid, decks: pyramidRefill.decks,
        bag: newBag, winner: newPlayer,
      },
      message: `${player.name} 购买了卡牌 ${cardId}，达到胜利条件！`
    };
  }

  const stateAfterPurchase = {
    ...state,
    players: newPlayers,
    pyramid: pyramidRefill.pyramid,
    decks: pyramidRefill.decks,
    bag: newBag,
  };

  const abilityResult = resolveCardAbility(stateAfterPurchase, card);
  const isExtraTurn = card.ability === "extra_turn";

  return {
    state: {
      ...abilityResult.state,
      currentPlayerIndex: isExtraTurn ? state.currentPlayerIndex : opponentIndex
    },
    message: abilityResult.message
      ? `${player.name} 购买了卡牌 ${cardId}。${abilityResult.message}`
      : `${player.name} 购买了卡牌 ${cardId}`
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

export function handleClaimRoyalCard(
  state: GameState,
  royalCardId: number
): { state: GameState; message: string } {
  const playerIndex = state.currentPlayerIndex;
  const player = state.players[playerIndex];

  const card = state.availableRoyalCards.find(c => c.id === royalCardId);
  if (!card) return { state, message: "皇室卡牌不存在" };

  const newPlayer = {
    ...player,
    royalCards: [...player.royalCards, card],
    claimedRoyalThresholds: [...player.claimedRoyalThresholds],
  };

  for (const t of state.pendingRoyalThresholds) {
    if (!newPlayer.claimedRoyalThresholds.includes(t)) {
      newPlayer.claimedRoyalThresholds.push(t);
    }
  }

  const newAvailable = state.availableRoyalCards.filter(c => c.id !== royalCardId);

  const newPlayers = [...state.players] as [Player, Player];
  newPlayers[playerIndex] = newPlayer;

  const stateAfterClaim = {
    ...state,
    players: newPlayers,
    availableRoyalCards: newAvailable,
    pendingRoyalThresholds: [],
  };

  const abilityResult = resolveCardAbility(stateAfterClaim, card);

  return {
    state: abilityResult.state,
    message: abilityResult.message
      ? `${player.name} 获得了皇室卡牌（+${card.points}分）。${abilityResult.message}`
      : `${player.name} 获得了皇室卡牌（+${card.points}分）`
  };
}

export function handleSetGemColor(
  state: GameState,
  color: GemColor
): { state: GameState; message: string } {
  const pendingCard = state.pendingGemCard;
  if (!pendingCard) return { state, message: "没有待选择颜色的卡牌" };

  const playerIndex = state.currentPlayerIndex;
  const opponentIndex = playerIndex === 0 ? 1 : 0;
  const player = state.players[playerIndex];

  const updatedCard = { ...pendingCard, gem: color };
  const newPlayer = {
    ...player,
    cards: player.cards.map(c => c.id === pendingCard.id ? updatedCard : c),
  };

  const newPlayers = [...state.players] as [Player, Player];
  newPlayers[playerIndex] = newPlayer;

  let finalPyramid = state.pyramid;
  let finalDecks = state.decks;
  if (state.pendingGemLevel !== null) {
    const refill = refillPyramidLevel(state.pyramid, state.decks, state.pendingGemLevel);
    finalPyramid = refill.pyramid;
    finalDecks = refill.decks;
  }

  const stateAfterColor = {
    ...state,
    players: newPlayers,
    pyramid: finalPyramid,
    decks: finalDecks,
    pendingGemCard: null,
    pendingGemLevel: null,
  };

  const abilityResult = resolveCardAbility(stateAfterColor, updatedCard);
  const isExtraTurn = updatedCard.ability === "extra_turn";

  return {
    state: {
      ...abilityResult.state,
      currentPlayerIndex: isExtraTurn ? playerIndex : opponentIndex,
    },
    message: abilityResult.message
      ? `${player.name} 选择了 ${color} 奖励。${abilityResult.message}`
      : `${player.name} 选择了 ${color} 奖励`,
  };
}