import { Player, Card, TokenType, GemColor } from "./types";
import { getPlayerBonuses } from "./purchase";
import { getTotalPoints, getTotalCrowns } from "./game";

const TOKEN_SYMBOLS: Record<TokenType, string> = {
  red: "R", blue: "B", green: "G", white: "W", black: "K",
  pearl: "P", gold: "O",
};

const TOKEN_COLORS: Record<TokenType, string> = {
  red: "\x1b[31m", blue: "\x1b[34m", green: "\x1b[32m",
  white: "\x1b[37m", black: "\x1b[90m", pearl: "\x1b[35m", gold: "\x1b[33m",
};

const RESET = "\x1b[0m";

const GEM_COLORS: GemColor[] = ["red", "blue", "green", "white", "black"];

export function renderBoard(board: (TokenType | null)[][]): void {
  console.log("\n版图:");
  for (let r = 0; r < board.length; r++) {
    let line = "  ";
    for (let c = 0; c < board[r].length; c++) {
      const token = board[r][c];
      if (token) {
        const color = TOKEN_COLORS[token];
        const sym = TOKEN_SYMBOLS[token];
        if (r === 2 && c === 2) {
          line += `${color}[${sym}]${RESET} `;
        } else {
          line += `${color} ${sym} ${RESET} `;
        }
      } else {
        line += "  .  ";
      }
    }
    console.log(line);
  }
}

export function renderPyramid(pyramid: Card[][]): void {
  console.log("\n金字塔:");
  for (let level = 0; level < pyramid.length; level++) {
    console.log(`  等级 ${level + 1}:`);
    for (const card of pyramid[level]) {
      // 将 cost 对象（如 { red: 0, blue: 0, green: 5, white: 0, black: 5, pearl: 2 }）
      // 转为字符串如 "greenx5 blackx5 pearlx2"
      //
      // Object.entries(card.cost) — 把对象转为 [key, value] 数组
      //   如 [["red", 0], ["blue", 0], ["green", 5], ["white", 0], ["black", 5], ["pearl", 2]]
      //
      // .filter(([, v]) => v > 0) — 只保留 value > 0 的条目
      //   参数 [, v] 中的第一个逗号表示忽略 key，只取 value
      //   结果: [["green", 5], ["black", 5], ["pearl", 2]]
      //
      // .map(([color, amount]) => `${color}x${amount}`) — 转成 "颜色x数量" 格式
      //   结果: ["greenx5", "blackx5", "pearlx2"]
      //
      // .join(" ") — 用空格拼接成字符串
      //   结果: "greenx5 blackx5 pearlx2"
      const costStr = Object.entries(card.cost)
        .filter(([, v]) => v > 0)
        .map(([color, amount]) => `${color}x${amount}`)
        .join(" ");
      console.log(`    [${card.id}] ${card.gem} ${card.points}分 ${card.crowns}冠 | 费用: ${costStr}`);
    }
  }
}

export function renderPlayer(player: Player, isCurrentPlayer: boolean): void {
  const prefix = isCurrentPlayer ? "▶ " : "  ";
  console.log(`\n${prefix}${player.name}${isCurrentPlayer ? "（当前回合）" : ""}:`);

  const tokensStr = Object.entries(player.tokens)
    .filter(([, v]) => v > 0)
    .map(([type, amount]) => `${TOKEN_SYMBOLS[type as TokenType]}x${amount}`)
    .join(" ");
  console.log(`  标记: ${tokensStr || "无"}`);

  const bonuses = getPlayerBonuses(player);
  const bonusStr = GEM_COLORS
    .filter(c => bonuses[c] > 0)
    .map(c => `${c}x${bonuses[c]}`)
    .join(" ");
  console.log(`  奖励: ${bonusStr || "无"}`);

  console.log(`  卡牌: ${player.cards.length} 张 | 声望: ${getTotalPoints(player)} | 王冠: ${getTotalCrowns(player)}`);

  if (player.reservedCards.length > 0) {
    console.log(`  保留卡牌: ${player.reservedCards.length} 张`);
  }

  if (player.privileges > 0) {
    console.log(`  特权: ${player.privileges} 个`);
  }
}

export function renderGameState(
  players: [Player, Player],
  board: (TokenType | null)[][],
  pyramid: Card[][],
  currentPlayerIndex: number
): void {
  console.log("\n========================================");
  console.log("      璀璨宝石对决 — 终端版");
  console.log("========================================");

  renderBoard(board);
  renderPyramid(pyramid);

  for (let i = 0; i < players.length; i++) {
    renderPlayer(players[i], i === currentPlayerIndex);
  }

  console.log("\n========================================\n");
}
