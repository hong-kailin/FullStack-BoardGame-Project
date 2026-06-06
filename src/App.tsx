import { useState } from "react";
import Board from "./components/Board";
import { createInitialState } from "./game/gameState";
import "./App.css";

export default function App() {
  const [state] = useState(createInitialState());
  const [selectedPositions, setSelectedPositions] = useState<[number, number][]>([]);

  const handleCellClick = (row: number, col: number) => {
    const already = selectedPositions.find(([r, c]) => r === row && c === col);
    if (already) {
      setSelectedPositions(
        selectedPositions.filter(([r, c]) => r !== row || c !== col)
      );
    } else {
      if (selectedPositions.length >= 3) return;
      setSelectedPositions([...selectedPositions, [row, col] as [number, number]]);
    }
  };

  return (
    <div className="app">
      <h1>璀璨宝石对决</h1>
      <Board
        boardTokens={state.boardTokens}
        selectedPositions={selectedPositions}
        onCellClick={handleCellClick}
      />
    </div>
  );
}