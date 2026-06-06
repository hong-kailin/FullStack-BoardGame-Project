import type { TokenType } from "../game/types";

interface BoardProps {
  boardTokens: (TokenType | null)[][];
  selectedPositions: [number, number][];
  onCellClick: (row: number, col: number) => void;
}

const TOKEN_LABELS: Record<string, string> = {
  red: "🔴", blue: "🔵", green: "🟢",
  white: "⚪", black: "⚫",
  pearl: "🦪", gold: "🟡",
};

export default function Board({ boardTokens, selectedPositions, onCellClick }: BoardProps) {
  const isSelected = (r: number, c: number) =>
    selectedPositions.some(([sr, sc]) => sr === r && sc === c);

  return (
    <div className="board">
      <h3>版图</h3>
      <div className="board-grid">
        {boardTokens.map((row, r) =>
          row.map((token, c) => (
            <div
              key={`${r}-${c}`}
              className={`board-cell ${token ? "has-token" : "empty"} ${isSelected(r, c) ? "selected" : ""}`}
              onClick={() => token && onCellClick(r, c)}
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