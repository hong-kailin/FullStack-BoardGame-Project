import * as readline from "readline";
import { GameState, Player, TokenType, Card } from "./types";
import { shuffleDeck, getLevelDeck } from "./card-pool";
import { createBoard, takeTokens } from "./board";
import { renderGameState } from "./renderer";
import { switchPlayer, checkWinCondition, checkRoyalCardEligibility, enforceTokenLimit } from "./game";
import { getPlayerBonuses, getActualCost, canAfford, purchaseCard } from "./purchase";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function createInitialState(): GameState {
  const allTokens: TokenType[] = [
    "red", "blue", "green", "white", "black",
    "red", "blue", "green", "white", "black",
    "red", "blue", "green", "white", "black",
    "red", "blue", "green", "white", "black",
    "pearl", "pearl", "gold", "gold", "gold"
  ];

  const shuffledTokens = shuffleDeck(allTokens);
  const board = createBoard(shuffledTokens);

  return {
    players: [
      {
        id: 0, name: "玩家 1",
        tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
        cards: [], royalCards: [], reservedCards: [], privileges: 0
      },
      {
        id: 1, name: "玩家 2",
        tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
        cards: [], royalCards: [], reservedCards: [], privileges: 0
      }
    ],
    boardTokens: board,
    pyramid: [
      shuffleDeck(getLevelDeck(1)).slice(0, 5),
      shuffleDeck(getLevelDeck(2)).slice(0, 4),
      shuffleDeck(getLevelDeck(3)).slice(0, 3),
    ],
    availableRoyalCards: [],
    currentPlayerIndex: 0,
    winner: null,
    bag: []
  };
}

function findCardInPyramid(pyramid: Card[][], cardId: number): { level: number; card: Card } | null {
  for (let level = 0; level < pyramid.length; level++) {
    for (const card of pyramid[level]) {
      if (card.id === cardId) return { level, card };
    }
  }
  return null;
}

function processCommand(state: GameState, input: string): { state: GameState; message: string } {
  const parts = input.trim().split(/\s+/);
  if (parts.length === 0) return { state, message: "请输入命令" };

  const cmd = parts[0].toLowerCase();
  const player = state.players[state.currentPlayerIndex];
  const opponentIndex = state.currentPlayerIndex === 0 ? 1 : 0;

  if (cmd === "take") {
    if (parts.length < 2) return { state, message: "用法: take r,c [r,c [r,c]]" };

    const positions: [number, number][] = [];
    for (let i = 1; i < parts.length; i++) {
      // 正则 /^(\d+),(\d+)$/ 解释：
      // ^       字符串开头
      // (\d+)   第一组：一个或多个数字（行号 r）
      // ,       逗号分隔
      // (\d+)   第二组：一个或多个数字（列号 c）
      // $       字符串结尾
      // 匹配成功 → match = ["3,4", "3", "4"]
      // 匹配失败 → match = null
      const match = parts[i].match(/^(\d+),(\d+)$/);
      if (!match) return { state, message: `无效坐标: ${parts[i]}，格式应为 r,c` };
      positions.push([parseInt(match[1]), parseInt(match[2])]);
    }

    if (positions.length < 1 || positions.length > 3) {
      return { state, message: "每次只能拿取 1-3 个标记" };
    }

    // 检查位置是否在版图内且不是黄金
    for (const [r, c] of positions) {
      if (r < 0 || r >= 5 || c < 0 || c >= 5) {
        return { state, message: `位置 (${r},${c}) 超出版图范围` };
      }
      const token = state.boardTokens[r][c];
      if (token === null) {
        return { state, message: `位置 (${r},${c}) 没有标记` };
      }
      if (token === "gold") {
        return { state, message: `位置 (${r},${c}) 是黄金，不能通过 take 拿取` };
      }
    }

    // 检查是否在同一条直线（水平/垂直/对角线）上且相邻
    if (positions.length >= 2) {
      const [r1, c1] = positions[0];
      const [r2, c2] = positions[1];
      const dr = r2 - r1;
      const dc = c2 - c1;
      // dr 和 dc 每个只能是 -1, 0, 或 1（必须相邻）
      // 且不能两个都为 0（同一个点）
      if (!(Math.abs(dr) <= 1 && Math.abs(dc) <= 1 && (dr !== 0 || dc !== 0))) {
        return { state, message: "标记必须相邻" };
      }
      for (let i = 2; i < positions.length; i++) {
        const [r, c] = positions[i];
        const [pr, pc] = positions[i - 1];
        if (r - pr !== dr || c - pc !== dc) {
          return { state, message: "标记必须相邻且方向一致" };
        }
      }
    }

    const tokenTypes = positions.map(([r, c]) => state.boardTokens[r][c]);

    if (positions.length === 3) {
      const uniqueColors = new Set(tokenTypes);
      if (uniqueColors.size !== 3) {
        return { state, message: "拿取 3 个标记时必须为不同颜色" };
      }
    }

    const result = takeTokens(state.boardTokens, positions);

    let newPlayer = { ...player, tokens: { ...player.tokens } };
    for (const token of result.taken) {
      newPlayer.tokens[token] = (newPlayer.tokens[token] || 0) + 1;
    }
    newPlayer = enforceTokenLimit(newPlayer);

    let opponent = state.players[opponentIndex];
    if (result.opponentGetsPrivilege) {
      opponent = { ...opponent, privileges: (opponent.privileges || 0) + 1 };
    }

    const newPlayers: [Player, Player] = state.currentPlayerIndex === 0
      ? [newPlayer, opponent]
      : [opponent, newPlayer];

    return {
      state: {
        ...state,
        players: newPlayers,
        boardTokens: result.board,
        currentPlayerIndex: opponentIndex
      },
      message: `${player.name} 拿取了 ${result.taken.length} 个标记`
    };
  }

  if (cmd === "buy") {
    if (parts.length < 2) return { state, message: "用法: buy <卡牌ID>" };
    const cardId = parseInt(parts[1]);
    if (isNaN(cardId)) return { state, message: "无效卡牌ID" };

    const found = findCardInPyramid(state.pyramid, cardId);
    if (!found) return { state, message: `卡牌 ID ${cardId} 不在金字塔中` };

    const bonuses = getPlayerBonuses(player);
    const actualCost = getActualCost(found.card, bonuses);

    if (!canAfford(player, actualCost)) {
      return { state, message: "宝石不足，无法购买该卡牌" };
    }

    let newPlayer = purchaseCard(player, found.card, actualCost);

    const royalCard = checkRoyalCardEligibility(newPlayer, state.availableRoyalCards);
    if (royalCard) {
      newPlayer = { ...newPlayer, royalCards: [...newPlayer.royalCards, royalCard] };
    }

    if (checkWinCondition(newPlayer)) {
      return {
        state: { ...state, winner: newPlayer },
        message: `${player.name} 购买了卡牌 ${cardId}，达到胜利条件！`
      };
    }

    const newPyramid = state.pyramid.map(level => level.filter(c => c.id !== cardId));
    const newPlayers = [...state.players] as [Player, Player];
    newPlayers[state.currentPlayerIndex] = newPlayer;

    return {
      state: {
        ...state,
        players: newPlayers,
        pyramid: newPyramid,
        currentPlayerIndex: opponentIndex
      },
      message: `${player.name} 购买了卡牌 ${cardId}`
    };
  }

  if (cmd === "show") {
    return { state, message: "" };
  }

  if (cmd === "pass") {
    return {
      state: { ...state, currentPlayerIndex: opponentIndex },
      message: `${player.name} 跳过了回合`
    };
  }

  if (cmd === "quit") {
    rl.close();
    process.exit(0);
  }

  return { state, message: "未知命令。可用: take, buy, show, pass, quit" };
}

export function startGame(): void {
  let state = createInitialState();

  console.log("\n🎮 璀璨宝石对决 — 终端版");
  console.log("命令列表：");
  console.log("  take r,c [r,c [r,c]]   拿取标记");
  console.log("  buy <卡牌ID>           购买卡牌");
  console.log("  show                   重新显示");
  console.log("  pass                   跳过回合");
  console.log("  quit                   退出\n");

  function loop() {
    if (state.winner) {
      console.log(`\n🏆 ${state.winner.name} 获胜！`);
      rl.close();
      return;
    }

    renderGameState(state.players, state.boardTokens, state.pyramid, state.currentPlayerIndex);

    const player = state.players[state.currentPlayerIndex];
    rl.question(`\n${player.name} 的操作 > `, (input) => {
      const result = processCommand(state, input.trim());
      state = result.state;
      if (result.message) console.log(`\n${result.message}`);
      loop();
    });
  }

  loop();
}
