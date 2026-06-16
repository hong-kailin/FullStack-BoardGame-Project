import { describe, it, expect } from "vitest";
import { executeAction } from "../../src/action.ts";
import { createTestState, setBoardToken, makePlayer } from "../helpers.ts";

describe("拿取标记", () => {
  it("TT-01：拿取 1 个红色标记 → 版图移除、玩家获得、回合切换", () => {
    let board = createTestState().boardTokens;
    board = setBoardToken(board, 2, 2, "red");

    const state = createTestState({ boardTokens: board });
    const result = executeAction(state, { type: "take_tokens", positions: [[2, 2]] });

    expect(result.state.boardTokens[2][2]).toBeNull();
    expect(result.state.players[0].tokens.red).toBe(1);
    expect(result.state.currentPlayerIndex).toBe(1);
    expect(result.needsDiscard).toBe(0);
  });

  it("TT-02：拿取 3 个相邻共线的标记 → 全部拿到", () => {
    let board = createTestState().boardTokens;
    board = setBoardToken(board, 2, 2, "red");
    board = setBoardToken(board, 2, 3, "blue");
    board = setBoardToken(board, 2, 4, "green");

    const state = createTestState({ boardTokens: board });
    const result = executeAction(state, { type: "take_tokens", positions: [[2, 2], [2, 3], [2, 4]] });

    expect(result.state.players[0].tokens.red).toBe(1);
    expect(result.state.players[0].tokens.blue).toBe(1);
    expect(result.state.players[0].tokens.green).toBe(1);
  });

  it("TT-03：拿取 3 个同色标记 → 对手特权 +1", () => {
    let board = createTestState().boardTokens;
    board = setBoardToken(board, 2, 2, "red");
    board = setBoardToken(board, 2, 3, "red");
    board = setBoardToken(board, 2, 4, "red");

    const state = createTestState({ boardTokens: board });
    const result = executeAction(state, { type: "take_tokens", positions: [[2, 2], [2, 3], [2, 4]] });

    expect(result.state.players[1].privileges).toBe(2);
  });

  it("TT-04：拿取 2 个珍珠 → 对手特权 +1", () => {
    let board = createTestState().boardTokens;
    board = setBoardToken(board, 2, 2, "pearl");
    board = setBoardToken(board, 2, 3, "pearl");

    const state = createTestState({ boardTokens: board });
    const result = executeAction(state, { type: "take_tokens", positions: [[2, 2], [2, 3]] });

    expect(result.state.players[1].privileges).toBe(2);
  });

  it("TT-05：拿取 2 个不同色标记 → 对手特权不变", () => {
    let board = createTestState().boardTokens;
    board = setBoardToken(board, 2, 2, "red");
    board = setBoardToken(board, 2, 3, "blue");

    const state = createTestState({ boardTokens: board });
    const result = executeAction(state, { type: "take_tokens", positions: [[2, 2], [2, 3]] });

    expect(result.state.players[1].privileges).toBe(1);
  });

  it("TT-06：拿取后标记 11 个 → needsDiscard = 1", () => {
    let board = createTestState().boardTokens;
    board = setBoardToken(board, 2, 2, "red");

    const state = createTestState({
      boardTokens: board,
      players: [
        makePlayer({ id: 0, tokens: { red: 5, blue: 5, green: 0, white: 0, black: 0, pearl: 0, gold: 0 } }),
        makePlayer({ id: 1 }),
      ],
    });

    const result = executeAction(state, { type: "take_tokens", positions: [[2, 2]] });
    expect(result.needsDiscard).toBe(1);
  });

  it("TT-07：拿取后标记 10 个 → needsDiscard = 0", () => {
    let board = createTestState().boardTokens;
    board = setBoardToken(board, 2, 2, "red");

    const state = createTestState({
      boardTokens: board,
      players: [
        makePlayer({ id: 0, tokens: { red: 4, blue: 5, green: 0, white: 0, black: 0, pearl: 0, gold: 0 } }),
        makePlayer({ id: 1 }),
      ],
    });

    const result = executeAction(state, { type: "take_tokens", positions: [[2, 2]] });
    expect(result.needsDiscard).toBe(0);
  });
});
