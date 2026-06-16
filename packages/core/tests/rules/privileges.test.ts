import { describe, it, expect } from "vitest";
import { executeAction } from "../../src/action.ts";
import { createTestState, setBoardToken, makePlayer } from "../helpers.ts";

describe("特权系统", () => {
  it("PR-01：使用特权拿取 1 个红色标记 → 特权 -1，标记 +1", () => {
    let board = createTestState().boardTokens;
    board = setBoardToken(board, 2, 2, "red");

    const state = createTestState({
      boardTokens: board,
      players: [makePlayer({ id: 0, privileges: 1 }), makePlayer({ id: 1 })],
    });

    const result = executeAction(state, { type: "use_privilege", position: [2, 2] });

    expect(result.state.players[0].privileges).toBe(0);
    expect(result.state.players[0].tokens.red).toBe(1);
    expect(result.state.boardTokens[2][2]).toBeNull();
  });

  it("PR-02：版图有特权 → 从版图分配", () => {
    const state = createTestState({
      privilegesAvailable: 2,
      players: [makePlayer({ id: 0, privileges: 0 }), makePlayer({ id: 1, privileges: 1 })],
    });

    let board = createTestState().boardTokens;
    board = setBoardToken(board, 2, 2, "red");
    board = setBoardToken(board, 2, 3, "red");
    board = setBoardToken(board, 2, 4, "red");

    const state2 = createTestState({
      boardTokens: board,
      privilegesAvailable: 2,
      players: [makePlayer({ id: 0 }), makePlayer({ id: 1, privileges: 1 })],
    });

    const result = executeAction(state2, { type: "take_tokens", positions: [[2, 2], [2, 3], [2, 4]] });

    expect(result.state.privilegesAvailable).toBe(1);
    expect(result.state.players[1].privileges).toBe(2);
  });

  it("PR-03：版图无特权，对手有 → 从对手抢夺", () => {
    let board = createTestState().boardTokens;
    board = setBoardToken(board, 2, 2, "red");
    board = setBoardToken(board, 2, 3, "red");
    board = setBoardToken(board, 2, 4, "red");

    const state = createTestState({
      boardTokens: board,
      privilegesAvailable: 0,
      players: [makePlayer({ id: 0 }), makePlayer({ id: 1, privileges: 2 })],
    });

    const result = executeAction(state, { type: "take_tokens", positions: [[2, 2], [2, 3], [2, 4]] });

    expect(result.state.privilegesAvailable).toBe(0);
    expect(result.state.players[1].privileges).toBe(2);
  });

  it("PR-04：双方都无特权 → 无事发生", () => {
    let board = createTestState().boardTokens;
    board = setBoardToken(board, 2, 2, "red");
    board = setBoardToken(board, 2, 3, "red");
    board = setBoardToken(board, 2, 4, "red");

    const state = createTestState({
      boardTokens: board,
      privilegesAvailable: 0,
      players: [makePlayer({ id: 0 }), makePlayer({ id: 1, privileges: 0 })],
    });

    const result = executeAction(state, { type: "take_tokens", positions: [[2, 2], [2, 3], [2, 4]] });

    expect(result.state.players[1].privileges).toBe(0);
  });

  it("PR-05：已有 3 个特权 → 再获得时不变", () => {
    let board = createTestState().boardTokens;
    board = setBoardToken(board, 2, 2, "red");
    board = setBoardToken(board, 2, 3, "red");
    board = setBoardToken(board, 2, 4, "red");

    const state = createTestState({
      boardTokens: board,
      privilegesAvailable: 3,
      players: [makePlayer({ id: 0 }), makePlayer({ id: 1, privileges: 3 })],
    });

    const result = executeAction(state, { type: "take_tokens", positions: [[2, 2], [2, 3], [2, 4]] });

    expect(result.state.players[1].privileges).toBe(3);
  });

  it("PR-06：使用特权后标记超 10 → 需要归还", () => {
    let board = createTestState().boardTokens;
    board = setBoardToken(board, 2, 2, "red");

    const state = createTestState({
      boardTokens: board,
      players: [makePlayer({ id: 0, privileges: 1, tokens: { red: 5, blue: 5, green: 0, white: 0, black: 0, pearl: 0, gold: 0 } }), makePlayer({ id: 1 })],
    });

    const result = executeAction(state, { type: "use_privilege", position: [2, 2] });

    expect(result.needsDiscard).toBe(1);
  });
});
