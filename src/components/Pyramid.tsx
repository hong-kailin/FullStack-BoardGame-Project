import type { Card } from "../game/types";

interface PyramidProps {
  pyramid: Card[][];
  onBuyCard: (cardId: number) => void;
}

function formatCost(cost: Card["cost"]): string {
  return Object.entries(cost)
    .filter(([, amount]) => amount > 0)
    .map(([color, amount]) => `${color}x${amount}`)
    .join(" ");
}

export default function Pyramid({ pyramid, onBuyCard }: PyramidProps) {
  return (
    <div className="pyramid">
      <h3>金字塔</h3>
      {pyramid.map((levelCards, levelIndex) => (
        <div key={levelIndex} className="pyramid-level">
          <h4>等级 {levelIndex + 1}</h4>
          <div className="pyramid-cards">
            {levelCards.map((card) => (
              <div
                key={card.id}
                className="pyramid-card"
                onClick={() => onBuyCard(card.id)}
              >
                <div>{card.gem}</div>
                <div>{card.points} 分</div>
                <div>王冠：{card.crowns}</div>
                <div>{formatCost(card.cost)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}