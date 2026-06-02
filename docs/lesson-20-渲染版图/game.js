// src/board.ts
function takeTokens(board, positions) {
  const newBoard = board.map((row) => [...row]);
  const taken = [];
  for (const [row, col] of positions) {
    const token = newBoard[row][col];
    if (token && token !== "gold") {
      taken.push(token);
      newBoard[row][col] = null;
    }
  }
  const allSameColor = taken.length === 3 && taken.every((t) => t === taken[0]);
  const twoPearls = taken.filter((t) => t === "pearl").length === 2;
  const opponentGetsPrivilege = allSameColor || twoPearls;
  return { taken, board: newBoard, opponentGetsPrivilege };
}

// src/purchase.ts
function getPlayerBonuses(player) {
  const bonuses = {
    red: 0,
    blue: 0,
    green: 0,
    white: 0,
    black: 0
  };
  for (const card of player.cards) {
    bonuses[card.gem] += card.bonusCount;
  }
  return bonuses;
}
function getActualCost(card, playerBonuses) {
  const cost = {
    red: 0,
    blue: 0,
    green: 0,
    white: 0,
    black: 0,
    pearl: 0
  };
  for (const color of ["red", "blue", "green", "white", "black"]) {
    const needed = card.cost[color] || 0;
    const bonus = playerBonuses[color] || 0;
    cost[color] = Math.max(0, needed - bonus);
  }
  cost.pearl = card.cost.pearl || 0;
  return cost;
}
function getTotalTokenCost(actualCost) {
  let total = 0;
  for (const key of Object.keys(actualCost)) {
    total += actualCost[key];
  }
  return total;
}
function canAfford(player, actualCost) {
  const totalNeeded = getTotalTokenCost(actualCost);
  const playerTotal = Object.values(player.tokens).reduce((a, b) => a + b, 0);
  if (playerTotal < totalNeeded) return false;
  let goldNeeded = 0;
  for (const color of ["red", "blue", "green", "white", "black", "pearl"]) {
    const needed = actualCost[color];
    const have = player.tokens[color] || 0;
    if (needed > have) {
      goldNeeded += needed - have;
    }
  }
  return goldNeeded <= (player.tokens.gold || 0);
}
function purchaseCard(player, card, actualCost) {
  const newPlayer = {
    ...player,
    tokens: { ...player.tokens },
    cards: [...player.cards]
  };
  for (const color of ["red", "blue", "green", "white", "black", "pearl"]) {
    let needed = actualCost[color];
    const have = newPlayer.tokens[color] || 0;
    const useFromColor = Math.min(needed, have);
    newPlayer.tokens[color] = have - useFromColor;
    needed -= useFromColor;
    if (needed > 0) {
      newPlayer.tokens.gold = (newPlayer.tokens.gold || 0) - needed;
    }
  }
  newPlayer.cards.push(card);
  return newPlayer;
}

// src/game.ts
function getTotalPoints(player) {
  let total = 0;
  for (const card of player.cards) {
    total += card.points;
  }
  for (const card of player.royalCards) {
    total += card.points;
  }
  return total;
}
function getTotalCrowns(player) {
  let total = 0;
  for (const card of player.cards) {
    total += card.crowns;
  }
  for (const card of player.royalCards) {
    total += card.crowns;
  }
  return total;
}
function getPointsByGemColor(player) {
  const points = {
    red: 0,
    blue: 0,
    green: 0,
    white: 0,
    black: 0
  };
  for (const card of player.cards) {
    points[card.gem] += card.points;
  }
  return points;
}
function checkWinCondition(player) {
  if (getTotalPoints(player) >= 20) return true;
  if (getTotalCrowns(player) >= 10) return true;
  const pointsByColor = getPointsByGemColor(player);
  for (const color of ["red", "blue", "green", "white", "black"]) {
    if (pointsByColor[color] >= 10) return true;
  }
  return false;
}

// src/card-pool.ts
var level1Cards = [
  { id: 1, level: 1, gem: "red", points: 1, crowns: 0, bonusCount: 1, cost: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 3 } },
  { id: 2, level: 1, gem: "red", points: 2, crowns: 1, bonusCount: 1, cost: { red: 0, blue: 0, green: 2, white: 1, black: 0, pearl: 0 } },
  { id: 3, level: 1, gem: "blue", points: 1, crowns: 0, bonusCount: 1, cost: { red: 0, blue: 0, green: 0, white: 0, black: 3, pearl: 0 } },
  { id: 4, level: 1, gem: "blue", points: 2, crowns: 1, bonusCount: 2, cost: { red: 0, blue: 0, green: 0, white: 2, black: 1, pearl: 0 } },
  { id: 5, level: 1, gem: "green", points: 1, crowns: 0, bonusCount: 1, cost: { red: 1, blue: 0, green: 0, white: 0, black: 0, pearl: 2 } },
  { id: 6, level: 1, gem: "green", points: 2, crowns: 0, bonusCount: 1, cost: { red: 3, blue: 0, green: 0, white: 0, black: 0, pearl: 0 } },
  { id: 7, level: 1, gem: "white", points: 1, crowns: 0, bonusCount: 1, cost: { red: 0, blue: 2, green: 0, white: 0, black: 0, pearl: 1 } },
  { id: 8, level: 1, gem: "black", points: 1, crowns: 0, bonusCount: 1, cost: { red: 0, blue: 0, green: 1, white: 0, black: 0, pearl: 2 } }
];
var level2Cards = [
  { id: 9, level: 2, gem: "red", points: 3, crowns: 1, bonusCount: 1, cost: { red: 0, blue: 3, green: 0, white: 2, black: 0, pearl: 1 } },
  { id: 10, level: 2, gem: "red", points: 4, crowns: 2, bonusCount: 2, cost: { red: 0, blue: 0, green: 4, white: 0, black: 3, pearl: 0 } },
  { id: 11, level: 2, gem: "blue", points: 3, crowns: 1, bonusCount: 1, cost: { red: 2, blue: 0, green: 0, white: 0, black: 3, pearl: 0 } },
  { id: 12, level: 2, gem: "blue", points: 4, crowns: 2, bonusCount: 2, cost: { red: 0, blue: 0, green: 0, white: 4, black: 0, pearl: 2 } },
  { id: 13, level: 2, gem: "green", points: 3, crowns: 0, bonusCount: 1, cost: { red: 3, blue: 0, green: 0, white: 0, black: 3, pearl: 0 } },
  { id: 14, level: 2, gem: "green", points: 5, crowns: 2, bonusCount: 2, cost: { red: 0, blue: 0, green: 0, white: 3, black: 3, pearl: 1 } },
  { id: 15, level: 2, gem: "white", points: 3, crowns: 0, bonusCount: 1, cost: { red: 2, blue: 2, green: 0, white: 0, black: 0, pearl: 2 } },
  { id: 16, level: 2, gem: "black", points: 4, crowns: 1, bonusCount: 1, cost: { red: 0, blue: 2, green: 2, white: 0, black: 0, pearl: 1 } }
];
var level3Cards = [
  { id: 17, level: 3, gem: "red", points: 5, crowns: 2, bonusCount: 1, cost: { red: 0, blue: 4, green: 0, white: 4, black: 0, pearl: 2 } },
  { id: 18, level: 3, gem: "red", points: 7, crowns: 3, bonusCount: 2, cost: { red: 0, blue: 0, green: 5, white: 0, black: 5, pearl: 2 } },
  { id: 19, level: 3, gem: "blue", points: 5, crowns: 2, bonusCount: 1, cost: { red: 4, blue: 0, green: 0, white: 0, black: 4, pearl: 2 } },
  { id: 20, level: 3, gem: "blue", points: 7, crowns: 3, bonusCount: 2, cost: { red: 5, blue: 0, green: 0, white: 5, black: 0, pearl: 2 } },
  { id: 21, level: 3, gem: "green", points: 5, crowns: 1, bonusCount: 1, cost: { red: 4, blue: 0, green: 0, white: 0, black: 4, pearl: 1 } },
  { id: 22, level: 3, gem: "green", points: 6, crowns: 2, bonusCount: 2, cost: { red: 3, blue: 3, green: 0, white: 0, black: 3, pearl: 1 } },
  { id: 23, level: 3, gem: "white", points: 6, crowns: 2, bonusCount: 2, cost: { red: 0, blue: 4, green: 4, white: 0, black: 0, pearl: 2 } },
  { id: 24, level: 3, gem: "black", points: 5, crowns: 2, bonusCount: 1, cost: { red: 0, blue: 0, green: 4, white: 4, black: 0, pearl: 2 } }
];
function getLevelDeck(level) {
  switch (level) {
    // [...level1Cards] 是数组展开（spread operator），创建一个新数组，内容和 level1Cards 完全一样
    // 这样外部拿到数组后随便改（push、pop、排序等），都不会影响 level1Cards 原始数据
    // 类比：Python 的 level1Cards.copy()，C++ 的 std::vector<int> copy = original;
    case 1:
      return [...level1Cards];
    case 2:
      return [...level2Cards];
    case 3:
      return [...level3Cards];
    default:
      return [];
  }
}
function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
export {
  canAfford,
  checkWinCondition,
  getActualCost,
  getLevelDeck,
  getPlayerBonuses,
  getPointsByGemColor,
  getTotalCrowns,
  getTotalPoints,
  purchaseCard,
  shuffleDeck,
  takeTokens
};
