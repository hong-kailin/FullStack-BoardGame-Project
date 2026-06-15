import { describe, it, expect } from "vitest";
import { executeAction } from "../../src/action.ts";
import { createTestState } from "../helpers.ts";
import type { Card } from "../../src/types.ts";

const cheapCard: Card = {
  id: 999, level: 1, gem: "red", points: 1, crowns: 0,
  bonusCount: 1, cost: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0 },
  ability: null,
};

describe("购买卡牌", () => {
  it("宝石足够 → 购买成功", () => {
    const state = createTestState({
      players: [
        {
          id: 0, name: "玩家 A",
          tokens: { red: 3, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
          cards: [], royalCards: [], reservedCards: [], privileges: 0, claimedRoyalThresholds: [],
        },
        {
          id: 1, name: "玩家 B",
          tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
          cards: [], royalCards: [], reservedCards: [], privileges: 1, claimedRoyalThresholds: [],
        },
      ],
      pyramid: [[cheapCard], [], []],
    });

    const result = executeAction(state, { type: "buy_card", cardId: 999 });

    expect(result.state.players[0].cards.length).toBe(1);
    expect(result.state.players[0].cards[0].id).toBe(999);
    expect(result.state.currentPlayerIndex).toBe(1);
  });

  it("宝石不足 → 购买失败", () => {
    const expensiveCard: Card = {
      id: 998, level: 3, gem: "red", points: 7, crowns: 3,
      bonusCount: 2, cost: { red: 0, blue: 0, green: 5, white: 0, black: 5, pearl: 2 },
      ability: null,
    };

    const state = createTestState({
      players: [
        {
          id: 0, name: "玩家 A",
          tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
          cards: [], royalCards: [], reservedCards: [], privileges: 0, claimedRoyalThresholds: [],
        },
        {
          id: 1, name: "玩家 B",
          tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
          cards: [], royalCards: [], reservedCards: [], privileges: 1, claimedRoyalThresholds: [],
        },
      ],
      pyramid: [[expensiveCard], [], []],
    });

    const result = executeAction(state, { type: "buy_card", cardId: 998 });

    expect(result.state.players[0].cards.length).toBe(0);
    expect(result.message).toContain("不足");
  });

  it("使用黄金万能抵扣", () => {
    const card: Card = {
      id: 997, level: 1, gem: "red", points: 1, crowns: 0,
      bonusCount: 1, cost: { red: 3, blue: 0, green: 0, white: 0, black: 0, pearl: 0 },
      ability: null,
    };

    const state = createTestState({
      players: [
        {
          id: 0, name: "玩家 A",
          tokens: { red: 1, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 2 },
          cards: [], royalCards: [], reservedCards: [], privileges: 0, claimedRoyalThresholds: [],
        },
        {
          id: 1, name: "玩家 B",
          tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
          cards: [], royalCards: [], reservedCards: [], privileges: 1, claimedRoyalThresholds: [],
        },
      ],
      pyramid: [[card], [], []],
    });

    const result = executeAction(state, { type: "buy_card", cardId: 997 });

    expect(result.state.players[0].cards.length).toBe(1);
    expect(result.state.players[0].tokens.red).toBe(0);
    expect(result.state.players[0].tokens.gold).toBe(0);
  });
});
