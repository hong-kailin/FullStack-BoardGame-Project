import { useState } from "react";
import type { TokenType } from "../game/types";

interface BoardProps {
  boardTokens: (TokenType | null)[][];
}

const TOKEN_LABELS: Record<string, string> = {
  red: "🔴", blue: "🔵", green: "🟢",
  white: "⚪", black: "⚫",
  pearl: "🦪", gold: "🟡",
};

export default function Board({ boardTokens }: BoardProps) {
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);

  const handleCellClick = (row: number, col: number) => {
    const isSameCell = selectedCell?.[0] === row && selectedCell?.[1] === col;
    setSelectedCell(isSameCell ? null : [row, col]);
  };

  const isSelected = (row: number, col: number) =>
    selectedCell?.[0] === row && selectedCell?.[1] === col;

  return (
    <div className="board">
      <h3>版图</h3>
      <div className="board-grid">
        {boardTokens.map((row, rowIndex) =>
          row.map((token, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`board-cell ${token ? "has-token" : "empty"} ${isSelected(rowIndex, colIndex) ? "selected" : ""}`}
              onClick={() => token && handleCellClick(rowIndex, colIndex)}
            >
              {token ? (
                <span>{TOKEN_LABELS[token]}</span>
              ) : (
                <span>·</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}