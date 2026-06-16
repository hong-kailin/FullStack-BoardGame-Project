import { describe, it, expect } from "vitest";
import { executeAction } from "../../src/action.ts";
import { createTestState, setBoardToken, makeCard, makePlayer } from "../helpers.ts";

describe("卡牌能力", () => {
  it("AB-01：购买 extra_turn 卡牌 → 回合不切换", () => {
    const card = makeCard({ id: 1, cost: { red: 0 }, ability: "extra_turn" });
    const state = createTestState({
      players: [makePlayer({ id: 0, tokens: { red: 0 } }), makePlayer({ id: 1 })],
      pyramid: [[card], [], []],
    });

    const result = executeAction(state, { type: "buy_card", cardId: 1 });

    expect(result.state.currentPlayerIndex).toBe(0);
  });

  it("AB-02：购买 take_privilege 卡牌 → 获得 1 特权", () => {
    const card = makeCard({ id: 1, cost: { red: 0 }, ability: "take_privilege" });
    const state = createTestState({
      players: [makePlayer({ id: 0, tokens: { red: 0 } }), makePlayer({ id: 1 })],
      pyramid: [[card], [], []],
    });

    const result = executeAction(state, { type: "buy_card", cardId: 1 });

    expect(result.state.players[0].privileges).toBe(1);
  });

  it("AB-03：购买 take_from_opponent 卡牌 → 从对手拿标记", () => {
    const card = makeCard({ id: 1, cost: { red: 0 }, ability: "take_from_opponent" });
    const state = createTestState({
      players: [
        makePlayer({ id: 0, tokens: { red: 0 } }),
        makePlayer({ id: 1, tokens: { red: 2, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 } }),
      ],
      pyramid: [[card], [], []],
    });

    const result = executeAction(state, { type: "buy_card", cardId: 1 });

    const player0Red = result.state.players[0].tokens.red;
    const player1Red = result.state.players[1].tokens.red;
    expect(player0Red + player1Red).toBe(2);
    expect(player0Red).toBe(1);
    expect(player1Red).toBe(1);
  });

  it("AB-04：对手无标记 → take_from_opponent 无事发生", () => {
    const card = makeCard({ id: 1, cost: { red: 0 }, ability: "take_from_opponent" });
    const state = createTestState({
      players: [makePlayer({ id: 0, tokens: { red: 0 } }), makePlayer({ id: 1 })],
      pyramid: [[card], [], []],
    });

    const result = executeAction(state, { type: "buy_card", cardId: 1 });

    expect(result.state.players[0].cards.length).toBe(1);
  });

  it("AB-05：购买 take_matching_token 卡牌 → 拿取同色标记", () => {
    const card = makeCard({ id: 1, gem: "red", cost: { red: 0 }, ability: "take_matching_token" });
    let board = createTestState().boardTokens;
    board = setBoardToken(board, 2, 2, "red");

    const state = createTestState({
      boardTokens: board,
      players: [makePlayer({ id: 0, tokens: { red: 0 } }), makePlayer({ id: 1 })],
      pyramid: [[card], [], []],
    });

    const result = executeAction(state, { type: "buy_card", cardId: 1 });

    expect(result.state.players[0].tokens.red).toBe(1);
    expect(result.state.boardTokens[2][2]).toBeNull();
  });

  it("AB-06：版图无同色标记 → take_matching_token 无事发生", () => {
    const card = makeCard({ id: 1, gem: "red", cost: { red: 0 }, ability: "take_matching_token" });
    const state = createTestState({
      players: [makePlayer({ id: 0, tokens: { red: 0 } }), makePlayer({ id: 1 })],
      pyramid: [[card], [], []],
    });

    const result = executeAction(state, { type: "buy_card", cardId: 1 });

    expect(result.state.players[0].tokens.red).toBe(0);
  });
});
