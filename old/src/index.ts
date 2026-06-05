export * from "./types";
export * from "./card-pool";
export * from "./board";
export * from "./purchase";
export * from "./game";

import { startGame } from "./game-loop";

startGame();
