import type { Player } from "../game/types";
import { getPlayerBonuses } from "../game/purchase";
import { getTotalPoints, getTotalCrowns } from "../game/game";

interface PlayerInfoProps {
  player: Player;
}

const TOKEN_LABELS: Record<string, string> = {
  red: "🔴", blue: "🔵", green: "🟢",
  white: "⚪", black: "⚫",
  pearl: "🦪", gold: "🟡",
};

export default function PlayerInfo({ player }: PlayerInfoProps) {
  const bonuses = getPlayerBonuses(player);

  const tokenDisplay = Object.entries(player.tokens)
    .filter(([, amount]) => amount > 0)
    .map(([type, amount]) => `${TOKEN_LABELS[type]}x${amount}`)
    .join(" ");

  const bonusDisplay = Object.entries(bonuses)
    .filter(([, amount]) => amount > 0)
    .map(([color, amount]) => `${color}x${amount}`)
    .join(" ");

  return (
    <div className="player-info">
      <h3>{player.name}</h3>
      <div className="player-tokens">{tokenDisplay || "无"}</div>
      <div className="player-stats">
        <span>声望: {getTotalPoints(player)}</span>
        <span>王冠: {getTotalCrowns(player)}</span>
        <span>卡牌: {player.cards.length} 张</span>
      </div>
      <div className="player-bonuses">奖励: {bonusDisplay || "无"}</div>
    </div>
  );
}