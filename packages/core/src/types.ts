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

// 卡牌奖励颜色，包含"any"表示万能奖励
export type BonusColor = GemColor | "any" | null;

// 所有标记类型：五种基础宝石 + 珍珠 + 黄金（万能）
export type TokenType = GemColor | "pearl" | "gold";

// 卡牌能力类型
export type CardAbility = "extra_turn" | "take_privilege" | "take_from_opponent" | "take_matching_token";

// 一张卡牌
export interface Card {
  id: number;
  level: number;
  gem: BonusColor;
  points: number;
  crowns: number;
  bonusCount: number;
  cost: Record<GemColor | "pearl", number>;
  ability: CardAbility | null;
}

// 皇室卡牌：满足王冠数量条件时自动获得，提供额外声望点
export interface RoyalCard {
  id: number;                    // 唯一标识
  points: number;                // 获得后得到的声望点数
  crowns: number;                // 王冠数量（也会累加到玩家的总王冠数中）
  ability: CardAbility | null;   // 卡牌能力，获得后触发
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
  claimedRoyalThresholds: number[];  // 已领取皇室卡牌的王冠门槛（如 [3] 表示已领过第 3 王冠的卡）
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
  pendingRoyalThresholds: number[];
  pendingGemCard: Card | null;
  pendingGemLevel: number | null;
}

// 玩家操作 — 统一表示所有可能的行动
export type Action =
  | { type: "take_tokens"; positions: [number, number][] }
  | { type: "buy_card"; cardId: number }
  | { type: "pass" }
  | { type: "use_privilege"; position: [number, number] }
  | { type: "take_gold"; position: [number, number]; cardId: number }
  | { type: "claim_royal_card"; royalCardId: number }
  | { type: "refill_board" }
  | { type: "discard_tokens"; discards: TokenType[] }
  | { type: "set_gem_color"; cardId: number; color: GemColor };

// 系统自动触发的后续行动（与 Action 同类型，由 processPendingActions 处理）
export type PendingAction = Action;
