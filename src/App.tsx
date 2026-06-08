import { useState } from "react";
import Board from "./components/Board";
import Pyramid from "./components/Pyramid";
import PlayerInfo from "./components/PlayerInfo";
import { createInitialState, handleTakeTokens, handleBuyCard, handlePass } from "./game/gameState";
import { validateCellSelection } from "./game/board";
import "./App.css";

export default function App() {
  const [state, setState] = useState(createInitialState());
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  const handleBuy = (cardId: number) => {
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

  return (
    <div className="app">
      <h1>璀璨宝石对决</h1>
      {message && <div className="message">{message}</div>}
      <div className="game-layout">
        <div>
          <Board
            boardTokens={state.boardTokens}
            selectedCells={selectedCells}
            onCellClick={handleCellClick}
          />
          {error && <div className="board-error">{error}</div>}
          {!state.winner && selectedCells.length > 0 && (
            <button className="btn-take" onClick={handleTake}>
              拿取标记 ({selectedCells.length} 个)
            </button>
          )}
        </div>
        <Pyramid pyramid={state.pyramid} onBuyCard={handleBuy} />
      </div>
      <div className="players">
        <PlayerInfo player={state.players[0]} isCurrentPlayer={state.currentPlayerIndex === 0} />
        <PlayerInfo player={state.players[1]} isCurrentPlayer={state.currentPlayerIndex === 1} />
      </div>
      {!state.winner && (
        <button className="btn-pass" onClick={handleSkip}>
          跳过回合
        </button>
      )}
    </div>
  );
}