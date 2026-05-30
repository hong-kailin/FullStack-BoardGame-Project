type GemColor = "red" | "blue" | "green" | "white" | "black";
type TokenType = GemColor | "pearl" | "gold";

interface Card {
  id: number;
  level: number;
  gem: GemColor;
  points: number;
  crowns: number;
  // cost: Record<GemColor | "pearl", number>
  // Record<K, V> 是 TS 内置工具类型，表示"一个对象，所有 key 的类型是 K，所有 value 的类型是 V"
  // GemColor | "pearl" 表示 key 可以是 red/blue/green/white/black/pearl 这 6 种之一
  // number 表示每个 key 对应的 value 是数字（即需要几个该颜色的标记）
  // 等价于手写：{ red: number; blue: number; green: number; white: number; black: number; pearl: number }
  // 注意没有 gold，因为黄金是百搭，在支付时代替任意颜色，不是费用本身
  cost: Record<GemColor | "pearl", number>;
}

interface RoyalCard {
  id: number;
  points: number;
  crowns: number;
  requirement: Record<GemColor, number>;
}

interface Player {
  id: number;
  name: string;
  tokens: Record<TokenType, number>;
  cards: Card[];
  royalCards: RoyalCard[];
  reservedCards: Card[];
  privileges: number;
}

interface GameState {
  players: [Player, Player];
  boardTokens: (TokenType | null)[][];
  pyramid: Card[][];
  availableRoyalCards: RoyalCard[];
  currentPlayerIndex: number;
  winner: Player | null;
  bag: TokenType[];
}

const player1: Player = {
  id: 0,
  name: "Alice",
  tokens: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0, gold: 0 },
  cards: [],
  royalCards: [],
  reservedCards: [],
  privileges: 0
};

console.log("Player 1:", player1);
