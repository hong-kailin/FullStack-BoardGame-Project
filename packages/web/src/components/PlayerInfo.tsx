import type { Player, Card } from "@splendor/core";
import { getPlayerBonuses } from "@splendor/core";
import { getTotalPoints, getTotalCrowns } from "@splendor/core";

const ABILITY_LABELS: Record<string, string> = {
  extra_turn: "🔄",
  take_privilege: "⭐",
  take_from_opponent: "👊",
  take_matching_token: "🎨",
  copy_bonus: "📋",
};

const ROYAL_THRESHOLDS = [3, 6];

interface PlayerInfoProps {
  player: Player;
  isCurrentPlayer: boolean;
  onBuyReserved?: (cardId: number) => void;
}

const TOKEN_LABELS: Record<string, string> = {
  red: "🔴", blue: "🔵", green: "🟢",
  white: "⚪", black: "⚫",
  pearl: "🦪", gold: "🟡",
};

const GEM_EMOJI: Record<string, string> = {
  red: "🔴", blue: "🔵", green: "🟢",
  white: "⚪", black: "⚫",
  pearl: "🦪", any: "🟡",
};

const GEM_COLORS: Record<string, string> = {
  red: "#e74c3c", blue: "#3498db", green: "#2ecc71",
  white: "#ecf0f1", black: "#2c3e50", any: "#f39c12",
};

function formatCost(cost: Card["cost"]): string {
  return Object.entries(cost)
    .filter(([, amount]) => amount > 0)
    .map(([color, amount]) => `${GEM_EMOJI[color] || color}x${amount}`)
    .join(" ");
}

export default function PlayerInfo({ player, isCurrentPlayer, onBuyReserved }: PlayerInfoProps) {
  const { bonuses, wildBonus } = getPlayerBonuses(player);
  const crowns = getTotalCrowns(player);

  const tokenDisplay = Object.entries(player.tokens)
    .filter(([, amount]) => amount > 0)
    .map(([type, amount]) => `${TOKEN_LABELS[type]}x${amount}`)
    .join(" ");

  const bonusDisplay = Object.entries(bonuses)
    .filter(([, amount]) => amount > 0)
    .map(([color, amount]) => `${color}x${amount}`)
    .join(" ");
  const wildDisplay = wildBonus > 0 ? `万能x${wildBonus}` : "";

  const cardsByColor: Record<string, Card[]> = {
    red: [], blue: [], green: [], white: [], black: [], any: [], none: [],
  };
  for (const card of player.cards) {
    const key = card.gem || "none";
    cardsByColor[key].push(card);
  }

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
      <div className="player-bonuses">奖励: {bonusDisplay || "无"}{wildDisplay && ` | ${wildDisplay}`}</div>
      {player.reservedCards.length > 0 && (
        <div className="reserved-cards">
          <div className="reserved-label">保留卡牌:</div>
          <div className="reserved-list">
            {player.reservedCards.map((card) => (
              <div
                key={card.id}
                className="reserved-card"
                style={{ borderColor: GEM_COLORS[card.gem || ""] || "#999" }}
                onClick={() => onBuyReserved?.(card.id)}
                title="点击购买"
              >
                <div className="reserved-gem" style={{ color: GEM_COLORS[card.gem || ""] || "#999" }}>
                  {card.gem === "any" ? "万能" : card.gem || "—"}
                </div>
                <div className="reserved-points">{card.points}分</div>
                {card.crowns > 0 && <div className="reserved-crowns">👑x{card.crowns}</div>}
                {card.ability && <div className="reserved-ability">{ABILITY_LABELS[card.ability]}</div>}
                <div className="reserved-cost">{formatCost(card.cost)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
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
          {cardsByColor["any"].length > 0 && (
            <div className="color-group">
              <div className="color-group-header" style={{ color: "#f39c12" }}>
                🟡 万能 x{cardsByColor["any"].length}
              </div>
              <div className="color-group-cards">
                {cardsByColor["any"].map((card) => (
                  <div key={card.id} className="owned-card" style={{ borderColor: "#f39c12" }}
                    title={`${card.points}分 ${card.crowns}冠`}>
                    {card.points > 0 && <span>{card.points}</span>}
                    {card.crowns > 0 && <span>👑{card.crowns}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {cardsByColor["none"].length > 0 && (
            <div className="color-group">
              <div className="color-group-header" style={{ color: "#999" }}>
                ⬜ 无奖励 x{cardsByColor["none"].length}
              </div>
              <div className="color-group-cards">
                {cardsByColor["none"].map((card) => (
                  <div key={card.id} className="owned-card" style={{ borderColor: "#999" }}
                    title={`${card.points}分 ${card.crowns}冠`}>
                    {card.points > 0 && <span>{card.points}</span>}
                    {card.crowns > 0 && <span>👑{card.crowns}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}