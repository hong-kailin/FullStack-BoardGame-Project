import type { Card, Player, GemColor } from "./types";

export function getPlayerBonuses(player: Player): Record<GemColor, number> {
  const bonuses: Record<GemColor, number> = {
    red: 0, blue: 0, green: 0, white: 0, black: 0
  };

  for (const card of player.cards) {
    if (card.gem && card.gem !== "any") {
      bonuses[card.gem] += card.bonusCount;
    }
  }

  return bonuses;
}

export function getActualCost(
  card: Card,
  playerBonuses: Record<GemColor, number>
): Record<GemColor | "pearl", number> {
  const cost: Record<GemColor | "pearl", number> = {
    red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0
  };

  for (const color of ["red", "blue", "green", "white", "black"] as GemColor[]) {
    const needed = card.cost[color] || 0;
    const bonus = playerBonuses[color] || 0;
    cost[color] = Math.max(0, needed - bonus);
  }
  cost.pearl = card.cost.pearl || 0;

  return cost;
}

export function getTotalTokenCost(actualCost: Record<GemColor | "pearl", number>): number {
  let total = 0;
  for (const key of Object.keys(actualCost) as (keyof typeof actualCost)[]) {
    total += actualCost[key];
  }
  return total;
}

export function canAfford(
  player: Player,
  actualCost: Record<GemColor | "pearl", number>
): boolean {
  const totalNeeded = getTotalTokenCost(actualCost);
  const playerTotal = Object.values(player.tokens).reduce((a, b) => a + b, 0);

  if (playerTotal < totalNeeded) return false;

  let goldNeeded = 0;
  for (const color of ["red", "blue", "green", "white", "black", "pearl"] as const) {
    const needed = actualCost[color];
    const have = player.tokens[color] || 0;
    if (needed > have) {
      goldNeeded += needed - have;
    }
  }

  return goldNeeded <= (player.tokens.gold || 0);
}

export function purchaseCard(
  player: Player,
  card: Card,
  actualCost: Record<GemColor | "pearl", number>
): { player: Player; spent: Record<string, number> } {
  const newPlayer: Player = {
    ...player,
    tokens: { ...player.tokens },
    cards: [...player.cards]
  };

  const spent: Record<string, number> = {};

  for (const color of ["red", "blue", "green", "white", "black", "pearl"] as const) {
    let needed = actualCost[color];
    const have = newPlayer.tokens[color] || 0;
    const useFromColor = Math.min(needed, have);
    newPlayer.tokens[color] = have - useFromColor;
    spent[color] = useFromColor;
    needed -= useFromColor;

    if (needed > 0) {
      newPlayer.tokens.gold = (newPlayer.tokens.gold || 0) - needed;
      spent["gold"] = (spent["gold"] || 0) + needed;
    }
  }

  newPlayer.cards.push(card);

  return { player: newPlayer, spent };
}
