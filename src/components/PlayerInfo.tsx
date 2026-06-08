import type { Player, Card } from "../game/types";
import { getPlayerBonuses } from "../game/purchase";
import { getTotalPoints, getTotalCrowns } from "../game/game";

interface PlayerInfoProps {
  player: Player;
  isCurrentPlayer: boolean;
}

const TOKEN_LABELS: Record<string, string> = {
  red: "🔴", blue: "🔵", green: "🟢",
  white: "⚪", black: "⚫",
  pearl: "🦪", gold: "🟡",
};

const GEM_EMOJI: Record<string, string> = {
  red: "🔴", blue: "🔵", green: "🟢",
  white: "⚪", black: "⚫",
};

const GEM_COLORS: Record<string, string> = {
  red: "#e74c3c", blue: "#3498db", green: "#2ecc71",
  white: "#ecf0f1", black: "#2c3e50",
};

export default function PlayerInfo({ player, isCurrentPlayer }: PlayerInfoProps) {
  const bonuses = getPlayerBonuses(player);

  const tokenDisplay = Object.entries(player.tokens)
    .filter(([, amount]) => amount > 0)
    .map(([type, amount]) => `${TOKEN_LABELS[type]}x${amount}`)
    .join(" ");

  const bonusDisplay = Object.entries(bonuses)
    .filter(([, amount]) => amount > 0)
    .map(([color, amount]) => `${color}x${amount}`)
    .join(" ");

  const cardsByColor: Record<string, Card[]> = {
    red: [], blue: [], green: [], white: [], black: [],
  };
  for (const card of player.cards) {
    cardsByColor[card.gem].push(card);
  }

  return (
    <div className={`player-info ${isCurrentPlayer ? "current" : ""}`}>
      <h3>{isCurrentPlayer ? "▶ " : ""}{player.name}</h3>
      <div className="player-tokens">{tokenDisplay || "无"}</div>
      <div className="player-stats">
        <span>声望: {getTotalPoints(player)}</span>
        <span>王冠: {getTotalCrowns(player)}</span>
        <span>卡牌: {player.cards.length} 张</span>
      </div>
      <div className="player-bonuses">奖励: {bonusDisplay || "无"}</div>
      {player.cards.length > 0 && (
        <div className="owned-cards">
          {(["red", "blue", "green", "white", "black"] as const).map((color) =>
            cardsByColor[color].length > 0 && (
              <div key={color} className="color-group">
                <div className="color-group-header" style={{ color: GEM_COLORS[color] }}>
                  {GEM_EMOJI[color]} x{cardsByColor[color].length}
                </div>
                <div className="color-group-cards">
                  {cardsByColor[color].map((card) => (
                    <div
                      key={card.id}
                      className="owned-card"
                      style={{ borderColor: GEM_COLORS[color] }}
                      title={`${card.points}分 ${card.crowns}冠`}
                    >
                      {card.points > 0 && <span>{card.points}</span>}
                      {card.crowns > 0 && <span>👑{card.crowns}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}