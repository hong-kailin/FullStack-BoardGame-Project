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

// 五种基础宝石颜色，也是卡牌上提供的"宝石奖励"的颜色
export type GemColor = "red" | "blue" | "green" | "white" | "black";

// 所有标记类型：五种基础宝石 + 珍珠 + 黄金（万能）
export type TokenType = GemColor | "pearl" | "gold";

// 卡牌能力类型
export type CardAbility = "extra_turn" | "take_privilege" | "take_from_opponent" | "take_matching_token";

// 一张卡牌
export interface Card {
  id: number;                    // 唯一标识，1~24
  level: number;                 // 卡牌等级 1/2/3，等级越高费用越高、分数越高
  gem: GemColor;                 // 这张卡提供的宝石奖励颜色
  points: number;                // 购买后获得的声望点数（胜利条件之一）
  crowns: number;                // 王冠数量，集满 10 个王冠直接获胜
  bonusCount: number;            // 奖励数量——购买后相当于持有了几个该颜色的"永久折扣"
  cost: Record<GemColor | "pearl", number>;  // 购买费用，每种颜色/珍珠需要支付的数量
  ability: CardAbility | null;   // 卡牌能力，购买后触发
}

// 皇室卡牌：满足王冠数量条件时自动获得，提供额外声望点
export interface RoyalCard {
  id: number;                    // 唯一标识
  points: number;                // 获得后得到的声望点数
  crowns: number;                // 王冠数量（也会累加到玩家的总王冠数中）
  requirement: Record<GemColor, number>;  // 需要玩家拥有的各颜色奖励数量
}

// 一位玩家
export interface Player {
  id: number;                    // 0 或 1
  name: string;                  // 玩家名称
  tokens: Record<TokenType, number>;  // 当前持有的各种标记的数量（7 种）
  cards: Card[];                 // 已购买的卡牌（提供声望点、王冠、奖励）
  royalCards: RoyalCard[];       // 已获得的皇室卡牌
  reservedCards: Card[];         // 保留的卡牌（从金字塔拿走暂存，最多 3 张）
  privileges: number;            // 特权次数——可以额外拿取一枚标记
}

// 完整的游戏状态
export interface GameState {
  players: [Player, Player];
  boardTokens: (TokenType | null)[][];
  pyramid: Card[][];
  decks: Card[][];
  availableRoyalCards: RoyalCard[];
  currentPlayerIndex: number;
  winner: Player | null;
  bag: TokenType[];
  privilegesAvailable: number;
}
