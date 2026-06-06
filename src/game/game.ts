import type { Player, GameState, RoyalCard, GemColor } from "./types";

export function getTotalPoints(player: Player): number {
  let total = 0;
  for (const card of player.cards) {
    total += card.points;
  }
  for (const card of player.royalCards) {
    total += card.points;
  }
  return total;
}

export function getTotalCrowns(player: Player): number {
  let total = 0;
  for (const card of player.cards) {
    total += card.crowns;
  }
  for (const card of player.royalCards) {
    total += card.crowns;
  }
  return total;
}

export function getPointsByGemColor(player: Player): Record<GemColor, number> {
  const points: Record<GemColor, number> = {
    red: 0, blue: 0, green: 0, white: 0, black: 0
  };

  for (const card of player.cards) {
    points[card.gem] += card.points;
  }

  return points;
}

export function checkWinCondition(player: Player): boolean {
  if (getTotalPoints(player) >= 20) return true;
  if (getTotalCrowns(player) >= 10) return true;

  const pointsByColor = getPointsByGemColor(player);
  for (const color of ["red", "blue", "green", "white", "black"] as GemColor[]) {
    if (pointsByColor[color] >= 10) return true;
  }

  return false;
}

export function switchPlayer(state: GameState): GameState {
  return {
    ...state,
    currentPlayerIndex: state.currentPlayerIndex === 0 ? 1 : 0
  };
}

export function checkRoyalCardEligibility(
  player: Player,
  availableRoyalCards: RoyalCard[]
): RoyalCard | null {
  const crowns = getTotalCrowns(player);
  const royalIndex = crowns === 3 ? 0 : crowns === 6 ? 1 : -1;

  if (royalIndex >= 0 && royalIndex < availableRoyalCards.length) {
    return availableRoyalCards[royalIndex];
  }

  return null;
}

export function enforceTokenLimit(player: Player): Player {
  // Object.values(player.tokens) 取出 tokens 对象中所有 value，组成数组，如 [3, 2, 1, 0, 4, 2, 1]
  // .reduce((a, b) => a + b, 0) 遍历数组，把每个元素累加起来，初始值 0
  // 等价于：let sum = 0; for (const v of Object.values(player.tokens)) { sum += v; }
  // 类比：Python 的 sum(player.tokens.values())
  const totalTokens = Object.values(player.tokens).reduce((a, b) => a + b, 0);

  if (totalTokens <= 10) return player;

  let remaining = totalTokens - 10;
  const newTokens = { ...player.tokens };

  for (const type of ["pearl", "red", "blue", "green", "white", "black", "gold"] as const) {
    if (remaining <= 0) break;
    const discard = Math.min(remaining, newTokens[type] || 0);
    newTokens[type] = (newTokens[type] || 0) - discard;
    remaining -= discard;
  }

  // { ...player, tokens: newTokens } 是对象展开 + 覆盖
  // ...player 把 player 的所有属性展开复制到新对象中
  // tokens: newTokens 覆盖 tokens 属性为新值
  // 效果：创建了一个新对象，除了 tokens 被替换，其他字段都和原 player 一样
  // 这样做是为了保持不可变性（immutable）——不修改原对象，而是返回新对象
  // 类比：Python 的 { **player, "tokens": newTokens } 或 dataclasses.replace(player, tokens=newTokens)
  return { ...player, tokens: newTokens };
}
