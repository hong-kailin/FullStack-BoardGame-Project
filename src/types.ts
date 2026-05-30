// export 关键字的作用：
// 在一个 .ts 文件中定义的类型/变量/函数，默认其他文件不能访问。
// 加上 export 后，其他文件可以用 import 来引入使用。
//
// 类比：
//   export ≈ Python 中在 __init__.py 里声明 __all__
//   export ≈ C++ 中在头文件里声明函数签名
//
// 示例：在 index.ts 中我们写了：
//   export * from "./types";
//   这表示把 types.ts 中所有 export 的内容重新导出，
//   这样外部只用 import { Card } from "./src/index" 即可。
//
// 而 card-pool.ts 中我们写了：
//   import { Card } from "./types";
//   这表示从 types.ts 引入 Card 这个类型定义来使用。

export type GemColor = "red" | "blue" | "green" | "white" | "black";
export type TokenType = GemColor | "pearl" | "gold";

export interface Card {
  id: number;
  level: number;
  gem: GemColor;
  points: number;
  crowns: number;
  cost: Record<GemColor | "pearl", number>;
}

export interface RoyalCard {
  id: number;
  points: number;
  crowns: number;
  requirement: Record<GemColor, number>;
}

export interface Player {
  id: number;
  name: string;
  tokens: Record<TokenType, number>;
  cards: Card[];
  royalCards: RoyalCard[];
  reservedCards: Card[];
  privileges: number;
}

export interface GameState {
  players: [Player, Player];
  boardTokens: (TokenType | null)[][];
  pyramid: Card[][];
  availableRoyalCards: RoyalCard[];
  currentPlayerIndex: number;
  winner: Player | null;
  bag: TokenType[];
}
