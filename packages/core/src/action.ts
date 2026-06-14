import type { GameState, Action } from "./types";
import {
  handleTakeTokens, handleBuyCard, handlePass, handleUsePrivilege,
  handleTakeGold, handleClaimRoyalCard, handleRefillBoard, handleDiscardTokens,
} from "./gameState";

export function executeAction(
  state: GameState,
  action: Action
): { state: GameState; message: string; needsDiscard: number } {
  switch (action.type) {
    case "take_tokens":
      return handleTakeTokens(state, action.positions);
    case "buy_card":
      return { ...handleBuyCard(state, action.cardId), needsDiscard: 0 };
    case "pass":
      return { ...handlePass(state), needsDiscard: 0 };
    case "use_privilege":
      return handleUsePrivilege(state, action.position);
    case "take_gold":
      return { ...handleTakeGold(state, action.position, action.cardId), needsDiscard: 0 };
    case "claim_royal_card":
      return { ...handleClaimRoyalCard(state, action.royalCardId), needsDiscard: 0 };
    case "refill_board":
      return { ...handleRefillBoard(state), needsDiscard: 0 };
    case "discard_tokens":
      return { ...handleDiscardTokens(state, action.discards), needsDiscard: 0 };
  }
}
