import type { TokenType } from "./types";

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

export function validateTakePositions(positions: [number, number][]): string | null {
  if (positions.length < 1 || positions.length > 3) {
    return "每次只能拿取 1-3 个标记";
  }

  if (positions.length >= 2) {
    const [r1, c1] = positions[0];
    const [r2, c2] = positions[1];
    const dr = r2 - r1;
    const dc = c2 - c1;
    if (!(Math.abs(dr) <= 1 && Math.abs(dc) <= 1 && (dr !== 0 || dc !== 0))) {
      return "标记必须相邻";
    }
    for (let i = 2; i < positions.length; i++) {
      const [r, c] = positions[i];
      const [pr, pc] = positions[i - 1];
      if (r - pr !== dr || c - pc !== dc) {
        return "标记必须相邻且方向一致";
      }
    }
  }

  return null;
}

export function validateCellSelection(
  boardTokens: (TokenType | null)[][],
  selectedCells: [number, number][],
  newRow: number,
  newCol: number
): string | null {
  const clickedToken = boardTokens[newRow][newCol];

  const hasGold = selectedCells.some(([r, c]) => boardTokens[r][c] === "gold");

  if (clickedToken === "gold") {
    if (selectedCells.length > 0) {
      return "黄金只能单独拿取";
    }
    return null;
  }

  if (hasGold) {
    return "黄金不能和其他宝石一起拿取";
  }

  if (selectedCells.length >= 3) {
    return "最多只能拿取 3 个标记";
  }

  const newSelected: [number, number][] = [...selectedCells, [newRow, newCol]];
  return validateTakePositions(newSelected);
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
