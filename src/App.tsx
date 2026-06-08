import { useState } from "react";
import Board from "./components/Board";
import Pyramid from "./components/Pyramid";
import PlayerInfo from "./components/PlayerInfo";
import { createInitialState, handleTakeTokens, handleBuyCard, handlePass, handleTakeGold } from "./game/gameState";
import { validateCellSelection } from "./game/board";
import { getPlayerBonuses, getActualCost, canAfford } from "./game/purchase";
import "./App.css";

export default function App() {
  const [state, setState] = useState(createInitialState());
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [goldMode, setGoldMode] = useState(false);

  const handleCellClick = (row: number, col: number) => {
    setError("");

    const index = selectedCells.findIndex(([r, c]) => r === row && c === col);
    if (index !== -1) {
      setSelectedCells(selectedCells.filter(([r, c]) => r !== row || c !== col));
      return;
    }

    const validationError = validateCellSelection(
      state.boardTokens, selectedCells, row, col
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedCells([...selectedCells, [row, col]]);
  };

  const handleTake = () => {
    if (selectedCells.length === 0) return;
    const result = handleTakeTokens(state, selectedCells);
    setState(result.state);
    setMessage(result.message);
    setSelectedCells([]);
  };

  const handleTakeGoldAction = () => {
    if (selectedCells.length !== 1) return;
    const pos = selectedCells[0];
    const token = state.boardTokens[pos[0]][pos[1]];
    if (token !== "gold") return;
    setGoldMode(true);
    setMessage("请选择一张要保留的卡牌");
  };

  const handleBuy = (cardId: number) => {
    if (goldMode) {
      const result = handleTakeGold(state, selectedCells[0], cardId);
      setState(result.state);
      setMessage(result.message);
      setSelectedCells([]);
      setGoldMode(false);
      return;
    }
    const result = handleBuyCard(state, cardId);
    setState(result.state);
    setMessage(result.message);
  };

  const handleBuyReserved = (cardId: number) => {
    const result = handleBuyCard(state, cardId);
    setState(result.state);
    setMessage(result.message);
  };

  const handleSkip = () => {
    const result = handlePass(state);
    setState(result.state);
    setMessage(result.message);
    setSelectedCells([]);
  };

  const player = state.players[state.currentPlayerIndex];
  const bonuses = getPlayerBonuses(player);

  const canAffordCard = (cardId: number) => {
    for (const level of state.pyramid) {
      const card = level.find(c => c.id === cardId);
      if (card) {
        const actualCost = getActualCost(card, bonuses);
        return canAfford(player, actualCost);
      }
    }
    return false;
  };

  const isGoldSelected = selectedCells.length === 1 &&
    state.boardTokens[selectedCells[0][0]]?.[selectedCells[0][1]] === "gold";

  return (
    <div className="app">
      <h1>璀璨宝石对决</h1>
      {message && <div className="message">{message}</div>}
      {goldMode && <div className="message">请点击金字塔中的一张卡牌来保留</div>}
      <div className="game-layout">
        <div>
          <Board
            boardTokens={state.boardTokens}
            selectedCells={selectedCells}
            onCellClick={handleCellClick}
          />
          {error && <div className="board-error">{error}</div>}
          {!state.winner && !goldMode && selectedCells.length > 0 && (
            isGoldSelected ? (
              <button className="btn-take" onClick={handleTakeGoldAction}>
                拿取黄金并保留卡牌
              </button>
            ) : (
              <button className="btn-take" onClick={handleTake}>
                拿取标记 ({selectedCells.length} 个)
              </button>
            )
          )}
        </div>
        <Pyramid pyramid={state.pyramid} onBuyCard={handleBuy} canAffordCard={canAffordCard} />
      </div>
      <div className="players">
        <PlayerInfo player={state.players[0]} isCurrentPlayer={state.currentPlayerIndex === 0} onBuyReserved={handleBuyReserved} />
        <PlayerInfo player={state.players[1]} isCurrentPlayer={state.currentPlayerIndex === 1} onBuyReserved={handleBuyReserved} />
      </div>
      {!state.winner && !goldMode && (
        <button className="btn-pass" onClick={handleSkip}>
          跳过回合
        </button>
      )}
    </div>
  );
}