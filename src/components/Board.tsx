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
  return (
    <div className="board">
      <h3>版图</h3>
      <div className="board-grid">
        {boardTokens.map((row, r) =>
          row.map((token, c) => (
            <div
              key={`${r}-${c}`}
              className={`board-cell ${token ? "has-token" : "empty"}`}
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