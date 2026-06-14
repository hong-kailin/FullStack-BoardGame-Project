import type { Card } from "@splendor/core";

const ABILITY_LABELS: Record<string, string> = {
  extra_turn: "🔄 额外回合",
  take_privilege: "⭐ 获得特权",
  take_from_opponent: "👊 抢夺标记",
  take_matching_token: "🎨 拿取同色",
};

interface PyramidProps {
  pyramid: Card[][];
  onBuyCard: (cardId: number) => void;
  canAffordCard: (cardId: number) => boolean;
}

const GEM_COLORS: Record<string, string> = {
  red: "#e74c3c", blue: "#3498db", green: "#2ecc71",
  white: "#ecf0f1", black: "#2c3e50",
};

const GEM_EMOJI: Record<string, string> = {
  red: "🔴", blue: "🔵", green: "🟢",
  white: "⚪", black: "⚫",
  pearl: "🦪",
};

function formatCost(cost: Card["cost"]): string {
  return Object.entries(cost)
    .filter(([, amount]) => amount > 0)
    .map(([color, amount]) => `${GEM_EMOJI[color] || color}x${amount}`)
    .join(" ");
}

export default function Pyramid({ pyramid, onBuyCard, canAffordCard }: PyramidProps) {
  const reversed = [...pyramid].reverse();

  return (
    <div className="pyramid">
      <h3>金字塔</h3>
      {reversed.map((levelCards, i) => (
        <div key={i} className="pyramid-level">
          <div className="pyramid-cards">
            {levelCards.map((card) => {
              const affordable = canAffordCard(card.id);
              return (
              <div
                key={card.id}
                className={`pyramid-card ${affordable ? "affordable" : "unaffordable"}`}
                style={{ borderColor: GEM_COLORS[card.gem] || "#999" }}
                onClick={() => onBuyCard(card.id)}
              >
                <div className="card-gem" style={{ color: GEM_COLORS[card.gem] }}>
                  {card.gem}
                </div>
                <div className="card-points">{card.points} 分</div>
                {card.crowns > 0 && <div className="card-crowns">👑x{card.crowns}</div>}
                {card.ability && <div className="card-ability">{ABILITY_LABELS[card.ability]}</div>}
                <div className="card-cost">{formatCost(card.cost)}</div>
              </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}