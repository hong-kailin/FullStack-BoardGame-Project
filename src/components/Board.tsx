import { useState } from "react";
import type { TokenType } from "../game/types";
import { validateCellSelection } from "../game/board";

interface BoardProps {
  boardTokens: (TokenType | null)[][];
}

const TOKEN_LABELS: Record<string, string> = {
  red: "🔴", blue: "🔵", green: "🟢",
  white: "⚪", black: "⚫",
  pearl: "🦪", gold: "🟡",
};

export default function Board({ boardTokens }: BoardProps) {
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [error, setError] = useState("");

  const handleCellClick = (row: number, col: number) => {
    setError("");

    const index = selectedCells.findIndex(([r, c]) => r === row && c === col);
    if (index !== -1) {
      setSelectedCells(selectedCells.filter(([r, c]) => r !== row || c !== col));
      return;
    }

    const validationError = validateCellSelection(boardTokens, selectedCells, row, col);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedCells([...selectedCells, [row, col]]);
  };

  const isSelected = (row: number, col: number) =>
    selectedCells.some(([r, c]) => r === row && c === col);

  return (
    <div className="board">
      <h3>版图</h3>
      {error && <div className="board-error">{error}</div>}
      <div className="board-grid">
        {boardTokens.map((row, rowIndex) =>
          row.map((token, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`board-cell ${token ? "has-token" : "empty"} ${isSelected(rowIndex, colIndex) ? "selected" : ""}`}
              onClick={() => token && handleCellClick(rowIndex, colIndex)}
            >
              {token ? <span>{TOKEN_LABELS[token]}</span> : <span>·</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}