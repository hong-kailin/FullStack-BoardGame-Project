import { describe, it, expect } from "vitest";
import { executeAction } from "../../src/action.ts";
import { createTestState, makeCard, makePlayer } from "../helpers.ts";
import type { RoyalCard } from "../../src/types.ts";

const royalCard: RoyalCard = { id: 101, points: 2, crowns: 0, ability: "take_privilege" };

describe("皇室卡牌", () => {
  it("RC-01：购买卡牌后王冠数从 2 到 3 → pendingRoyalThresholds 包含 3", () => {
    const card = makeCard({ id: 1, crowns: 1, cost: { red: 0 } });
    const state = createTestState({
      players: [
        makePlayer({ id: 0, tokens: { red: 0 }, cards: [makeCard({ id: 2, crowns: 2, cost: { red: 0 } })] }),
        makePlayer({ id: 1 }),
      ],
      pyramid: [[card], [], []],
      availableRoyalCards: [royalCard],
    });

    const result = executeAction(state, { type: "buy_card", cardId: 1 });

    expect(result.state.pendingRoyalThresholds).toContain(3);
  });

  it("RC-02：选择皇室卡牌 → 卡牌加入玩家、从可用列表移除", () => {
    const state = createTestState({
      availableRoyalCards: [royalCard],
      pendingRoyalThresholds: [3],
    });

    const result = executeAction(state, { type: "claim_royal_card", royalCardId: 101 });

    expect(result.state.players[0].royalCards.length).toBe(1);
    expect(result.state.players[0].royalCards[0].id).toBe(101);
    expect(result.state.availableRoyalCards.length).toBe(0);
    expect(result.state.pendingRoyalThresholds.length).toBe(0);
  });

  it("RC-03：选择有能力的皇室卡牌 → 能力被结算", () => {
    const state = createTestState({
      availableRoyalCards: [royalCard],
      pendingRoyalThresholds: [3],
      privilegesAvailable: 2,
      players: [makePlayer({ id: 0, privileges: 0 }), makePlayer({ id: 1 })],
    });

    const result = executeAction(state, { type: "claim_royal_card", royalCardId: 101 });

    expect(result.state.players[0].privileges).toBe(1);
  });

  it("RC-04：再次达到 3 王冠 → 不重复触发", () => {
    const card = makeCard({ id: 1, crowns: 1, cost: { red: 0 } });
    const state = createTestState({
      players: [
        makePlayer({ id: 0, tokens: { red: 0 }, cards: [makeCard({ id: 2, crowns: 2, cost: { red: 0 } })], claimedRoyalThresholds: [3] }),
        makePlayer({ id: 1 }),
      ],
      pyramid: [[card], [], []],
      availableRoyalCards: [royalCard],
    });

    const result = executeAction(state, { type: "buy_card", cardId: 1 });

    expect(result.state.pendingRoyalThresholds.length).toBe(0);
  });
});
