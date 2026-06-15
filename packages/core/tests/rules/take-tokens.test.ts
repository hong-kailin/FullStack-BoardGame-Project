import { describe, it, expect } from "vitest";
import { executeAction } from "../../src/action.ts";
import { createTestState, setBoardToken } from "../helpers.ts";

describe("拿取标记", () => {
  it("拿取 1 个非黄金标记", () => {
    let board = createTestState().boardTokens;
    board = setBoardToken(board, 2, 2, "red");

    const state = createTestState({ boardTokens: board });
    const result = executeAction(state, { type: "take_tokens", positions: [[2, 2]] });

    expect(result.state.boardTokens[2][2]).toBeNull();
    expect(result.state.players[0].tokens.red).toBe(1);
    expect(result.needsDiscard).toBe(0);
  });

  it("拿取 3 个同色标记 → 对手获得 1 个特权", () => {
    let board = createTestState().boardTokens;
    board = setBoardToken(board, 2, 2, "red");
    board = setBoardToken(board, 2, 3, "red");
    board = setBoardToken(board, 2, 4, "red");

    const state = createTestState({ boardTokens: board });
    const result = executeAction(state, { type: "take_tokens", positions: [[2, 2], [2, 3], [2, 4]] });

    expect(result.state.players[0].tokens.red).toBe(3);
    expect(result.state.players[1].privileges).toBe(2);
  });

  it("拿取 2 个珍珠 → 对手获得 1 个特权", () => {
    let board = createTestState().boardTokens;
    board = setBoardToken(board, 2, 2, "pearl");
    board = setBoardToken(board, 2, 3, "pearl");

    const state = createTestState({ boardTokens: board });
    const result = executeAction(state, { type: "take_tokens", positions: [[2, 2], [2, 3]] });

    expect(result.state.players[0].tokens.pearl).toBe(2);
    expect(result.state.players[1].privileges).toBe(2);
  });

  it("拿取不同色标记 → 对手不获得特权", () => {
    let board = createTestState().boardTokens;
    board = setBoardToken(board, 2, 2, "red");
    board = setBoardToken(board, 2, 3, "blue");

    const state = createTestState({ boardTokens: board });
    const result = executeAction(state, { type: "take_tokens", positions: [[2, 2], [2, 3]] });

    expect(result.state.players[1].privileges).toBe(1);
  });

  it("标记超过 10 个 → 需要归还", () => {
    let board = createTestState().boardTokens;
    board = setBoardToken(board, 2, 2, "red");

    const state = createTestState({
      boardTokens: board,
      players: [
        {
          id: 0, name: "玩家 A",
          tokens: { red: 5, blue: 5, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
          cards: [], royalCards: [], reservedCards: [], privileges: 0, claimedRoyalThresholds: [],
        },
        {
          id: 1, name: "玩家 B",
          tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
          cards: [], royalCards: [], reservedCards: [], privileges: 1, claimedRoyalThresholds: [],
        },
      ],
    });

    const result = executeAction(state, { type: "take_tokens", positions: [[2, 2]] });
    expect(result.needsDiscard).toBe(1);
  });
});
