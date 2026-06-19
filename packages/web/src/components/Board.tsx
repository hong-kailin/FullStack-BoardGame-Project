import type { TokenType } from "@splendor/core";

interface BoardProps {
  boardTokens: (TokenType | null)[][];
  selectedCells: [number, number][];
  onCellClick: (row: number, col: number) => void;
  privilegesAvailable: number;
}

const TOKEN_LABELS: Record<string, string> = {
  red: "🔴", blue: "🔵", green: "🟢",
  white: "⚪", black: "⚫",
  pearl: "🦪", gold: "🟡",
};

export default function Board({ boardTokens, selectedCells, onCellClick, privilegesAvailable }: BoardProps) {
  const isSelected = (row: number, col: number) =>
    selectedCells.some(([r, c]) => r === row && c === col);

  return (
    <div className="board">
      <h3>版图 {privilegesAvailable > 0 && <span className="privilege-count">⭐ x{privilegesAvailable}</span>}</h3>
      <div className="board-grid">
        {boardTokens.map((row, rowIndex) =>
          row.map((token, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`board-cell ${token ? "has-token" : "empty"} ${isSelected(rowIndex, colIndex) ? "selected" : ""}`}
              onClick={() => token && onCellClick(rowIndex, colIndex)}
            >
              {token ? <span>{TOKEN_LABELS[token]}</span> : <span>·</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}