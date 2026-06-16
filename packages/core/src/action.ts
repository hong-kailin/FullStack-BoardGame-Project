import type { GameState, Action, PendingAction } from "./types";
import {
  handleTakeTokens, handleBuyCard, handlePass, handleUsePrivilege,
  handleTakeGold, handleClaimRoyalCard, handleRefillBoard, handleDiscardTokens,
  handleSetGemColor,
} from "./gameState";

export function executeAction(
  state: GameState,
  action: Action
): { state: GameState; message: string; needsDiscard: number; pendingActions: PendingAction[] } {
  switch (action.type) {
    case "take_tokens":
      return { ...handleTakeTokens(state, action.positions), pendingActions: [] };
    case "buy_card":
      return { ...handleBuyCard(state, action.cardId), needsDiscard: 0, pendingActions: [] };
    case "pass":
      return { ...handlePass(state), needsDiscard: 0, pendingActions: [] };
    case "use_privilege":
      return { ...handleUsePrivilege(state, action.position), pendingActions: [] };
    case "take_gold":
      return { ...handleTakeGold(state, action.position, action.cardId), needsDiscard: 0, pendingActions: [] };
    case "claim_royal_card":
      return { ...handleClaimRoyalCard(state, action.royalCardId), needsDiscard: 0, pendingActions: [] };
    case "refill_board":
      return { ...handleRefillBoard(state), needsDiscard: 0, pendingActions: [] };
    case "discard_tokens":
      return { ...handleDiscardTokens(state, action.discards), needsDiscard: 0, pendingActions: [] };
    case "set_gem_color":
      return { ...handleSetGemColor(state, action.color), needsDiscard: 0, pendingActions: [] };
  }
}

export function processPendingActions(
  state: GameState,
  pendingActions: PendingAction[]
): { state: GameState; pendingActions: PendingAction[] } {
  let currentState = state;
  let queue = [...pendingActions];

  while (queue.length > 0) {
    const action = queue.shift()!;
    const result = executeAction(currentState, action);
    currentState = result.state;
    queue = [...result.pendingActions, ...queue];
  }

  return { state: currentState, pendingActions: [] };
}
