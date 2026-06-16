import type { Card, RoyalCard, GemColor, BonusColor, CardAbility } from "./types";
import cardsData from "../data/cards.json" with { type: "json" };

const ALL_COLORS: (GemColor | "pearl")[] = ["red", "blue", "green", "white", "black", "pearl"];

function fillCost(cost: Record<string, unknown>): Record<GemColor | "pearl", number> {
  const filled: Record<string, number> = {};
  for (const color of ALL_COLORS) {
    filled[color] = (cost[color] as number) || 0;
  }
  return filled as Record<GemColor | "pearl", number>;
}

function validateCardData(data: typeof cardsData): void {
  const validAbilities: (CardAbility | null)[] = [null, "extra_turn", "take_privilege", "take_from_opponent", "take_matching_token"];
  const validGems: string[] = ["red", "blue", "green", "white", "black", "any"];

  for (const card of data.jewelCards) {
    const c = card as Record<string, unknown>;
    if (typeof c.id !== "number" || (c.id as number) < 1) throw new Error(`无效卡牌 id: ${c.id}`);
    if (![1, 2, 3].includes(c.level as number)) throw new Error(`卡牌 ${c.id} 等级无效: ${c.level}`);
    if (c.gem !== null && c.gem !== undefined && !validGems.includes(c.gem as string)) throw new Error(`卡牌 ${c.id} 颜色无效: ${c.gem}`);
    if (typeof c.points !== "number" || (c.points as number) < 0) throw new Error(`卡牌 ${c.id} 分数无效: ${c.points}`);
    if (typeof c.crowns !== "number" || (c.crowns as number) < 0) throw new Error(`卡牌 ${c.id} 王冠数无效: ${c.crowns}`);
    if (typeof c.bonusCount !== "number" || (c.bonusCount as number) < 0) throw new Error(`卡牌 ${c.id} 奖励数无效: ${c.bonusCount}`);
    if (c.ability !== undefined && !validAbilities.includes(c.ability as CardAbility | null)) {
      throw new Error(`卡牌 ${c.id} 能力无效: ${c.ability}`);
    }
    if (typeof c.cost !== "object" || Object.keys(c.cost as Record<string, unknown>).length === 0) {
      throw new Error(`卡牌 ${c.id} 费用无效`);
    }
  }

  for (const card of data.royalCards) {
    if (typeof card.id !== "number" || card.id < 101) throw new Error(`皇室卡牌 id 无效: ${card.id}`);
    if (typeof card.points !== "number" || card.points < 0) throw new Error(`皇室卡牌 ${card.id} 分数无效`);
    if (card.ability !== undefined && !validAbilities.includes(card.ability as CardAbility | null)) {
      throw new Error(`皇室卡牌 ${card.id} 能力无效: ${card.ability}`);
    }
  }
}

validateCardData(cardsData);

const jewelCards: Card[] = cardsData.jewelCards.map(c => {
  const raw = c as Record<string, unknown>;
  return {
    id: raw.id as number,
    level: raw.level as number,
    gem: (raw.gem as BonusColor) || null,
    points: raw.points as number,
    crowns: raw.crowns as number,
    bonusCount: raw.bonusCount as number,
    cost: fillCost(raw.cost as Record<string, unknown>),
    ability: (raw.ability as CardAbility | null) || null,
  } as Card;
});

const royalCardsData: RoyalCard[] = cardsData.royalCards.map(c => ({
  id: c.id,
  points: c.points,
  crowns: c.crowns,
  ability: c.ability as CardAbility | null,
}));

const level1Cards = jewelCards.filter(c => c.level === 1);
const level2Cards = jewelCards.filter(c => c.level === 2);
const level3Cards = jewelCards.filter(c => c.level === 3);

export function getLevelDeck(level: number): Card[] {
  switch (level) {
    case 1: return [...level1Cards];
    case 2: return [...level2Cards];
    case 3: return [...level3Cards];
    default: return [];
  }
}

export function shuffleDeck<T>(deck: T[]): T[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards<T>(deck: T[], count: number): { dealt: T[]; remaining: T[] } {
  return {
    dealt: deck.slice(0, count),
    remaining: deck.slice(count)
  };
}

export function getRoyalCards(): RoyalCard[] {
  return [...royalCardsData];
}
