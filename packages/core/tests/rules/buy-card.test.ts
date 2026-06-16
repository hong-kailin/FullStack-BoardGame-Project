import { describe, it, expect } from "vitest";
import { executeAction } from "../../src/action.ts";
import { createTestState, makeCard, makePlayer } from "../helpers.ts";

describe("购买卡牌", () => {
  it("BC-01：宝石足够 → 购买成功，卡牌加入手牌", () => {
    const card = makeCard({ id: 1, cost: { red: 3 }, points: 1 });
    const state = createTestState({
      players: [makePlayer({ id: 0, tokens: { red: 3, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 } }), makePlayer({ id: 1 })],
      pyramid: [[card], [], []],
    });

    const result = executeAction(state, { type: "buy_card", cardId: 1 });

    expect(result.state.players[0].cards.length).toBe(1);
    expect(result.state.players[0].cards[0].id).toBe(1);
  });

  it("BC-02：宝石不足 → 购买失败，状态不变", () => {
    const card = makeCard({ id: 1, cost: { green: 5, black: 5, pearl: 2 }, points: 7 });
    const state = createTestState({
      players: [makePlayer({ id: 0 }), makePlayer({ id: 1 })],
      pyramid: [[card], [], []],
    });

    const result = executeAction(state, { type: "buy_card", cardId: 1 });

    expect(result.state.players[0].cards.length).toBe(0);
    expect(result.message).toContain("不足");
  });

  it("BC-03：使用黄金万能抵扣完成购买", () => {
    const card = makeCard({ id: 1, cost: { red: 3 }, points: 1 });
    const state = createTestState({
      players: [makePlayer({ id: 0, tokens: { red: 1, gold: 2 } }), makePlayer({ id: 1 })],
      pyramid: [[card], [], []],
    });

    const result = executeAction(state, { type: "buy_card", cardId: 1 });

    expect(result.state.players[0].cards.length).toBe(1);
    expect(result.state.players[0].tokens.red).toBe(0);
    expect(result.state.players[0].tokens.gold).toBe(0);
  });

  it("BC-04：使用奖励折扣减少费用", () => {
    const card = makeCard({ id: 1, cost: { red: 3 }, points: 1 });
    const bonusCard = makeCard({ id: 2, gem: "red", bonusCount: 2, cost: { red: 0 } });
    const state = createTestState({
      players: [makePlayer({ id: 0, tokens: { red: 1 }, cards: [bonusCard] }), makePlayer({ id: 1 })],
      pyramid: [[card], [], []],
    });

    const result = executeAction(state, { type: "buy_card", cardId: 1 });

    expect(result.state.players[0].cards.length).toBe(2);
    expect(result.state.players[0].tokens.red).toBe(0);
  });

  it("BC-05：购买 gem:any 卡牌 → 暂停等待选择颜色", () => {
    const card = makeCard({ id: 1, gem: "any", bonusCount: 1, cost: { red: 0 } });
    const state = createTestState({
      players: [makePlayer({ id: 0, tokens: { red: 0 } }), makePlayer({ id: 1 })],
      pyramid: [[card], [], []],
    });

    const result = executeAction(state, { type: "buy_card", cardId: 1 });

    expect(result.state.pendingGemCard).not.toBeNull();
    expect(result.state.pendingGemCard!.id).toBe(1);
    expect(result.state.players[0].cards.length).toBe(1);
  });

  it("BC-05b：选择颜色后卡牌 gem 更新为所选颜色", () => {
    const card = makeCard({ id: 1, gem: "any", bonusCount: 1, cost: { red: 0 } });
    const state = createTestState({
      players: [makePlayer({ id: 0, tokens: { red: 0 }, cards: [card] }), makePlayer({ id: 1 })],
      pendingGemCard: card,
    });

    const result = executeAction(state, { type: "set_gem_color", cardId: 1, color: "red" });

    expect(result.state.pendingGemCard).toBeNull();
    expect(result.state.players[0].cards[0].gem).toBe("red");
  });

  it("BC-06：购买后花费的标记进入袋子", () => {
    const card = makeCard({ id: 1, cost: { red: 2 }, points: 1 });
    const state = createTestState({
      players: [makePlayer({ id: 0, tokens: { red: 2 } }), makePlayer({ id: 1 })],
      pyramid: [[card], [], []],
      bag: [],
    });

    const result = executeAction(state, { type: "buy_card", cardId: 1 });

    expect(result.state.bag).toContain("red");
    expect(result.state.bag.length).toBe(2);
  });

  it("BC-07：购买后金字塔补牌", () => {
    const card1 = makeCard({ id: 1, cost: { red: 0 } });
    const card2 = makeCard({ id: 2, cost: { red: 0 } });
    const state = createTestState({
      players: [makePlayer({ id: 0, tokens: { red: 0 } }), makePlayer({ id: 1 })],
      pyramid: [[card1], [], []],
      decks: [[card2], [], []],
    });

    const result = executeAction(state, { type: "buy_card", cardId: 1 });

    expect(result.state.pyramid[0].length).toBe(1);
    expect(result.state.pyramid[0][0].id).toBe(2);
    expect(result.state.decks[0].length).toBe(0);
  });

  it("BC-08：购买后回合切换到对手", () => {
    const card = makeCard({ id: 1, cost: { red: 0 } });
    const state = createTestState({
      players: [makePlayer({ id: 0, tokens: { red: 0 } }), makePlayer({ id: 1 })],
      pyramid: [[card], [], []],
    });

    const result = executeAction(state, { type: "buy_card", cardId: 1 });

    expect(result.state.currentPlayerIndex).toBe(1);
  });

  it("BC-09：从保留区购买 → 保留区移除该卡牌", () => {
    const card = makeCard({ id: 1, cost: { red: 0 } });
    const state = createTestState({
      players: [makePlayer({ id: 0, tokens: { red: 0 }, reservedCards: [card] }), makePlayer({ id: 1 })],
    });

    const result = executeAction(state, { type: "buy_card", cardId: 1 });

    expect(result.state.players[0].cards.length).toBe(1);
    expect(result.state.players[0].reservedCards.length).toBe(0);
  });
});
