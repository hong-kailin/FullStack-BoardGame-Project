import { useState, useCallback } from "react";
import { createInitialState, executeAction, getPlayerBonuses, getActualCost, canAfford, validateCellSelection } from "@splendor/core";
import type { TokenType, GameState } from "@splendor/core";

export function useGameController() {
  const [state, setState] = useState<GameState>(createInitialState());
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [goldMode, setGoldMode] = useState(false);
  const [discardMode, setDiscardMode] = useState(false);
  const [discardNeeded, setDiscardNeeded] = useState(0);
  const [discardSelection, setDiscardSelection] = useState<Record<string, number>>({});
  const [privilegeMode, setPrivilegeMode] = useState(false);

  const player = state.players[state.currentPlayerIndex];
  const bonuses = getPlayerBonuses(player);

  const canAffordCard = useCallback((cardId: number) => {
    for (const level of state.pyramid) {
      const card = level.find(c => c.id === cardId);
      if (card) {
        const actualCost = getActualCost(card, bonuses);
        return canAfford(player, actualCost);
      }
    }
    return false;
  }, [state.pyramid, bonuses, player]);

  const isGoldSelected = selectedCells.length === 1 &&
    state.boardTokens[selectedCells[0][0]]?.[selectedCells[0][1]] === "gold";

  const handleCellClick = useCallback((row: number, col: number) => {
    setError("");

    if (privilegeMode) {
      const token = state.boardTokens[row][col];
      if (!token || token === "gold") {
        setError("只能拿取非黄金标记");
        return;
      }
      const result = executeAction(state, { type: "use_privilege", position: [row, col] });
      setState(result.state);
      setPrivilegeMode(false);
      if (result.needsDiscard > 0) {
        setDiscardMode(true);
        setDiscardNeeded(result.needsDiscard);
        setDiscardSelection({});
      }
      setMessage(result.message);
      return;
    }

    const index = selectedCells.findIndex(([r, c]) => r === row && c === col);
    if (index !== -1) {
      setSelectedCells(selectedCells.filter(([r, c]) => r !== row || c !== col));
      return;
    }

    const validationError = validateCellSelection(state.boardTokens, selectedCells, row, col);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedCells([...selectedCells, [row, col]]);
  }, [state, selectedCells, privilegeMode]);

  const handleTake = useCallback(() => {
    if (selectedCells.length === 0) return;
    const result = executeAction(state, { type: "take_tokens", positions: selectedCells });
    setState(result.state);
    setSelectedCells([]);
    setMessage(result.message);
    if (result.needsDiscard > 0) {
      setDiscardMode(true);
      setDiscardNeeded(result.needsDiscard);
      setDiscardSelection({});
    }
  }, [state, selectedCells]);

  const handleDiscardSelect = useCallback((type: TokenType) => {
    const current = discardSelection[type] || 0;
    const totalSelected = Object.values(discardSelection).reduce((a, b) => a + b, 0);
    const available = player.tokens[type] || 0;

    if (current < available && totalSelected < discardNeeded) {
      setDiscardSelection({ ...discardSelection, [type]: current + 1 });
    } else if (current > 0) {
      const newSelection = { ...discardSelection };
      newSelection[type] = current - 1;
      if (newSelection[type] === 0) delete newSelection[type];
      setDiscardSelection(newSelection);
    }
  }, [discardSelection, discardNeeded, player]);

  const handleDiscardConfirm = useCallback(() => {
    const totalSelected = Object.values(discardSelection).reduce((a, b) => a + b, 0);
    if (totalSelected !== discardNeeded) return;
    const discards: TokenType[] = [];
    for (const [type, count] of Object.entries(discardSelection)) {
      for (let i = 0; i < count; i++) {
        discards.push(type as TokenType);
      }
    }
    const result = executeAction(state, { type: "discard_tokens", discards });
    setState(result.state);
    setMessage(result.message);
    setDiscardMode(false);
    setDiscardNeeded(0);
    setDiscardSelection({});
  }, [state, discardSelection, discardNeeded]);

  const handleTakeGoldAction = useCallback(() => {
    if (selectedCells.length !== 1) return;
    const pos = selectedCells[0];
    const token = state.boardTokens[pos[0]][pos[1]];
    if (token !== "gold") return;
    setGoldMode(true);
    setMessage("请选择一张要保留的卡牌");
  }, [state, selectedCells]);

  const handleBuy = useCallback((cardId: number) => {
    if (goldMode) {
      const result = executeAction(state, { type: "take_gold", position: selectedCells[0], cardId });
      setState(result.state);
      setMessage(result.message);
      setSelectedCells([]);
      setGoldMode(false);
      return;
    }
    const result = executeAction(state, { type: "buy_card", cardId });
    setState(result.state);
    setMessage(result.message);
  }, [state, goldMode, selectedCells]);

  const handleBuyReserved = useCallback((cardId: number) => {
    const result = executeAction(state, { type: "buy_card", cardId });
    setState(result.state);
    setMessage(result.message);
  }, [state]);

  const handleSkip = useCallback(() => {
    const result = executeAction(state, { type: "pass" });
    setState(result.state);
    setMessage(result.message);
    setSelectedCells([]);
  }, [state]);

  const handleRefill = useCallback(() => {
    const result = executeAction(state, { type: "refill_board" });
    setState(result.state);
    setMessage(result.message);
    setSelectedCells([]);
  }, [state]);

  const handleClaimRoyal = useCallback((royalCardId: number) => {
    const result = executeAction(state, { type: "claim_royal_card", royalCardId });
    setState(result.state);
    setMessage(result.message);
  }, [state]);

  const handleSetGemColor = useCallback((cardId: number, color: TokenType) => {
    const result = executeAction(state, { type: "set_gem_color", cardId, color: color as any });
    setState(result.state);
    setMessage(result.message);
  }, [state]);

  const togglePrivilegeMode = useCallback(() => {
    setPrivilegeMode(p => !p);
    setSelectedCells([]);
  }, []);

  return {
    state, message, error,
    selectedCells, goldMode, discardMode, discardNeeded, discardSelection, privilegeMode,
    player, bonuses, canAffordCard, isGoldSelected,
    handleCellClick, handleTake, handleDiscardSelect, handleDiscardConfirm,
    handleTakeGoldAction, handleBuy, handleBuyReserved,
    handleSkip, handleRefill, handleClaimRoyal, handleSetGemColor,
    togglePrivilegeMode,
  };
}
