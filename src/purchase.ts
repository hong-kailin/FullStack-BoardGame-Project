import { Card, Player, GemColor } from "./types";

export function getPlayerBonuses(player: Player): Record<GemColor, number> {
  const bonuses: Record<GemColor, number> = {
    red: 0, blue: 0, green: 0, white: 0, black: 0
  };

  for (const card of player.cards) {
    bonuses[card.gem]++;
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

  // "red", "blue", "green", "white", "black" as GemColor[]
  // TypeScript 推断这个数组的类型是 string[]，但我们需要它被识别为 GemColor[]
  // as GemColor[] 是类型断言，告诉 TS"这是一个 GemColor 数组"
  // 这样下面用 color 作为索引访问 Record<GemColor, number> 时就不会报类型错误
  // 如果不加 as GemColor[]，TS 会报错：string 不能作为 GemColor 的索引
  for (const color of ["red", "blue", "green", "white", "black"] as GemColor[]) {
    // card.cost[color] || 0 — 如果 card.cost[color] 的值是 undefined 或 null（即卡牌费用中没有这个颜色），
    // 就使用默认值 0。|| 是"逻辑或"运算符，在 JS/TS 中它的行为是：如果左边是 falsy（undefined/null/0/""/false），就返回右边。
    // 同理 playerBonuses[color] || 0 — 如果玩家没有该颜色的奖励，就用 0。
    // 类比：Python 的 card.cost.get(color, 0)
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
): Player {
  const newPlayer: Player = {
    ...player,
    tokens: { ...player.tokens },
    cards: [...player.cards]
  };

  for (const color of ["red", "blue", "green", "white", "black", "pearl"] as const) {
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
