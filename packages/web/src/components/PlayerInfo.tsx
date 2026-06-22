import type { Player } from "@splendor/core";
import { getPlayerBonuses } from "@splendor/core";
import { getTotalPoints, getTotalCrowns } from "@splendor/core";

const ROYAL_THRESHOLDS = [3, 6];

const ABILITY_LABELS: Record<string, string> = {
  extra_turn: "🔄",
  take_privilege: "⭐",
  take_from_opponent: "👊",
  take_matching_token: "🎨",
};

interface PlayerInfoProps {
  player: Player;
  isCurrentPlayer: boolean;
  onBuyReserved?: (cardId: number) => void;
  canAffordReserved?: (cardId: number) => boolean;
}

const TOKEN_LABELS: Record<string, string> = {
  red: "🔴", blue: "🔵", green: "🟢",
  white: "⚪", black: "⚫",
  pearl: "🦪", gold: "🟡",
};

const GEM_COLORS: Record<string, string> = {
  red: "#e74c3c", blue: "#3498db", green: "#2ecc71",
  white: "#ecf0f1", black: "#2c3e50", any: "#f39c12",
};

const GEM_EMOJI: Record<string, string> = {
  red: "🔴", blue: "🔵", green: "🟢",
  white: "⚪", black: "⚫",
  pearl: "🦪", any: "🟡",
};

type ColorStat = { points: number; tokens: number; bonus: number };

export default function PlayerInfo({ player, isCurrentPlayer, onBuyReserved, canAffordReserved }: PlayerInfoProps) {
  const bonuses = getPlayerBonuses(player);
  const crowns = getTotalCrowns(player);

  const colors = ["red", "blue", "green", "white", "black"] as const;

  const stats: Record<string, ColorStat> = {};
  for (const color of colors) {
    stats[color] = { points: 0, tokens: player.tokens[color] || 0, bonus: bonuses[color] || 0 };
  }
  stats["pearl"] = { points: 0, tokens: player.tokens["pearl"] || 0, bonus: 0 };
  stats["any"] = { points: 0, tokens: 0, bonus: 0 };
  stats["none"] = { points: 0, tokens: 0, bonus: 0 };

  for (const card of player.cards) {
    const key = card.gem || "none";
    stats[key].points += card.points;
    if (card.gem === "any") {
      stats["any"].bonus += card.bonusCount;
    }
  }

  const tokenDisplay = Object.entries(player.tokens)
    .filter(([, amount]) => amount > 0)
    .map(([type, amount]) => `${TOKEN_LABELS[type]}x${amount}`)
    .join(" ");

  return (
    <div className={`player-info ${isCurrentPlayer ? "current" : ""}`}>
      <h3>{isCurrentPlayer ? "▶ " : ""}{player.name}</h3>
      <div className="player-tokens">{tokenDisplay || "无"}</div>
      <div className="player-stats">
        <span>声望: {getTotalPoints(player)}</span>
        <span>王冠: {crowns}</span>
        <span>卡牌: {player.cards.length} 张</span>
        <span>特权: {player.privileges}</span>
      </div>
      <div className="player-royal-hint">
        {ROYAL_THRESHOLDS.map(t => {
          const reached = crowns >= t;
          const claimed = player.claimedRoyalThresholds.includes(t);
          if (claimed) return <span key={t} className="royal-hint claimed">👑x{t} ✅</span>;
          if (reached) return <span key={t} className="royal-hint available">👑x{t} 可选!</span>;
          return <span key={t} className="royal-hint locked">👑x{t}</span>;
        })}
      </div>
      {player.reservedCards.length > 0 && (
        <div className="reserved-stack-inline">
          <div className="reserved-stack-inline-label">保留:</div>
          <div className="reserved-stack-inline-cards">
            {player.reservedCards.map((card) => (
              <div key={card.id}
                className={`reserved-stack-inline-card ${isCurrentPlayer && canAffordReserved?.(card.id) ? "affordable" : ""}`}
                style={{ borderColor: GEM_COLORS[card.gem || ""] || "#999" }}
                onClick={() => onBuyReserved?.(card.id)}>
                <span style={{ color: GEM_COLORS[card.gem || ""] || "#999" }}>
                  {card.gem === "any" ? "万能" : card.gem || "—"}
                </span>
                <span>{card.points}分</span>
                {card.crowns > 0 && <span>👑{card.crowns}</span>}
                <div className="reserved-popup">
                  <div className="popup-gem" style={{ color: GEM_COLORS[card.gem || ""] || "#999" }}>
                    {card.gem === "any" ? "万能" : card.gem || "—"}
                    {card.bonusCount > 1 && <span className="card-bonus-count">x{card.bonusCount}</span>}
                  </div>
                  <div className="popup-points">{card.points} 分</div>
                  {card.crowns > 0 && <div className="popup-crowns">👑x{card.crowns}</div>}
                  {card.ability && <div className="popup-ability">{ABILITY_LABELS[card.ability]}</div>}
                  <div className="popup-cost">
                    {Object.entries(card.cost).filter(([, v]) => v > 0).map(([c, v]) => `${c}x${v}`).join(" ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {player.cards.length > 0 && (
        <table className="stats-table">
          <thead>
            <tr>
              <th></th>
              {colors.map(c => <th key={c} style={{ color: GEM_COLORS[c] }}>{GEM_EMOJI[c]}</th>)}
              <th style={{ color: "#999" }}>🦪</th>
              <th style={{ color: "#f39c12" }}>🟡</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>分数</td>
              {colors.map(c => <td key={c}>{stats[c].points || "-"}</td>)}
              <td>-</td>
              <td>{stats["any"].points || "-"}</td>
            </tr>
            <tr>
              <td>宝石</td>
              {colors.map(c => <td key={c}>{stats[c].tokens || "-"}</td>)}
              <td>{stats["pearl"].tokens || "-"}</td>
              <td>-</td>
            </tr>
            <tr>
              <td>代替</td>
              {colors.map(c => <td key={c}>{stats[c].bonus || "-"}</td>)}
              <td>-</td>
              <td>{stats["any"].bonus || "-"}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
