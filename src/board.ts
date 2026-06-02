import { TokenType } from "./types";

const BOARD_SIZE = 5;

const SPIRAL_ORDER: [number, number][] = [
  [2, 2], [2, 3], [1, 3], [1, 2], [1, 1],
  [2, 1], [3, 1], [3, 2], [3, 3], [3, 4],
  [2, 4], [1, 4], [0, 4], [0, 3], [0, 2],
  [0, 1], [0, 0], [1, 0], [2, 0], [3, 0],
  [4, 0], [4, 1], [4, 2], [4, 3], [4, 4],
];

export function createBoard(tokens: TokenType[]): (TokenType | null)[][] {
  const board: (TokenType | null)[][] = Array.from(
    { length: BOARD_SIZE },
    () => Array(BOARD_SIZE).fill(null)
  );

  for (let i = 0; i < tokens.length && i < SPIRAL_ORDER.length; i++) {
    const [row, col] = SPIRAL_ORDER[i];
    board[row][col] = tokens[i];
  }

  return board;
}

function getLine(board: (TokenType | null)[][], row: number, col: number, dr: number, dc: number): TokenType[] {
  const tokens: TokenType[] = [];
  let r = row;
  let c = col;

  for (let i = 0; i < 3; i++) {
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
    const token = board[r][c];
    if (token === null || token === "gold") break;
    tokens.push(token);
    r += dr;
    c += dc;
  }

  return tokens;
}

export function getAdjacentTokens(board: (TokenType | null)[][], row: number, col: number): TokenType[][] {
  const directions: [number, number][] = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ];

  return directions
    .map(([dr, dc]) => getLine(board, row, col, dr, dc))
    .filter(line => line.length >= 1);
}

export function getFreePositions(board: (TokenType | null)[][]): [number, number][] {
  const free: [number, number][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const token = board[r][c];
      if (token === null || token === "gold") continue;

      for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE || board[nr][nc] === null) {
          free.push([r, c]);
          break;
        }
      }
    }
  }
  return free;
}

export function takeTokens(
  board: (TokenType | null)[][],
  positions: [number, number][]
): { taken: TokenType[]; board: (TokenType | null)[][]; opponentGetsPrivilege: boolean } {
  const newBoard = board.map(row => [...row]);
  const taken: TokenType[] = [];

  for (const [row, col] of positions) {
    const token = newBoard[row][col];
    if (token && token !== "gold") {
      taken.push(token);
      newBoard[row][col] = null;
    }
  }

  const allSameColor = taken.length === 3 && taken.every(t => t === taken[0]);
  const twoPearls = taken.filter(t => t === "pearl").length === 2;
  const opponentGetsPrivilege = allSameColor || twoPearls;

  return { taken, board: newBoard, opponentGetsPrivilege };
}
