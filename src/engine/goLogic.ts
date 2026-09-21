export type StoneColor = 'black' | 'white';
export type BoardState = (StoneColor | null)[][];

export interface Point {
  r: number;
  c: number;
}

export interface Group {
  color: StoneColor;
  stones: Point[];
  liberties: Point[]; // 去重后的所有气的位置
}

export interface MoveResult {
  valid: boolean;
  newBoard: BoardState;
  captured: Point[];
  reason?: string;
}

/** 创建指定大小的空棋盘 */
export function createEmptyBoard(size: number): BoardState {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

/** 深度拷贝棋盘 */
export function cloneBoard(board: BoardState): BoardState {
  return board.map(row => [...row]);
}

/** 获取上下左右相邻坐标 */
export function getNeighbors(r: number, c: number, size: number): Point[] {
  const neighbors: Point[] = [];
  if (r > 0) neighbors.push({ r: r - 1, c });
  if (r < size - 1) neighbors.push({ r: r + 1, c });
  if (c > 0) neighbors.push({ r, c: c - 1 });
  if (c < size - 1) neighbors.push({ r, c: c + 1 });
  return neighbors;
}

/** 获取 (r, c) 处的同色连通块以及所有的气 */
export function getGroupAndLiberties(board: BoardState, startR: number, startC: number): Group | null {
  const size = board.length;
  const color = board[startR][startC];
  if (!color) return null;

  const visitedStones: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const visitedLiberties = new Set<string>();

  const stones: Point[] = [];
  const liberties: Point[] = [];
  const queue: Point[] = [{ r: startR, c: startC }];
  visitedStones[startR][startC] = true;

  while (queue.length > 0) {
    const current = queue.shift()!;
    stones.push(current);

    for (const nb of getNeighbors(current.r, current.c, size)) {
      const nbColor = board[nb.r][nb.c];
      if (nbColor === null) {
        const key = `${nb.r},${nb.c}`;
        if (!visitedLiberties.has(key)) {
          visitedLiberties.add(key);
          liberties.push(nb);
        }
      } else if (nbColor === color && !visitedStones[nb.r][nb.c]) {
        visitedStones[nb.r][nb.c] = true;
        queue.push(nb);
      }
    }
  }

  return { color, stones, liberties };
}

/** 获取棋盘上所有的连通块 */
export function getAllGroups(board: BoardState): Group[] {
  const size = board.length;
  const processed: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const groups: Group[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== null && !processed[r][c]) {
        const group = getGroupAndLiberties(board, r, c);
        if (group) {
          groups.push(group);
          for (const stone of group.stones) {
            processed[stone.r][stone.c] = true;
          }
        }
      }
    }
  }

  return groups;
}

/** 执行一步落子逻辑（含气数计算、提子、禁着点判断） */
export function playMove(
  board: BoardState,
  r: number,
  c: number,
  color: StoneColor,
  allowSuicide: boolean = false
): MoveResult {
  const size = board.length;

  // 1. 越界或已有棋子
  if (r < 0 || r >= size || c < 0 || c >= size || board[r][c] !== null) {
    return { valid: false, newBoard: board, captured: [], reason: '此处已有棋子或超出棋盘' };
  }

  const opponentColor: StoneColor = color === 'black' ? 'white' : 'black';
  const newBoard = cloneBoard(board);
  newBoard[r][c] = color;

  // 2. 检查并提掉周围没气的对方棋子
  const captured: Point[] = [];
  const checkedOpponentGroups = new Set<string>();

  for (const nb of getNeighbors(r, c, size)) {
    if (newBoard[nb.r][nb.c] === opponentColor) {
      const key = `${nb.r},${nb.c}`;
      if (!checkedOpponentGroups.has(key)) {
        const oppGroup = getGroupAndLiberties(newBoard, nb.r, nb.c);
        if (oppGroup) {
          for (const s of oppGroup.stones) {
            checkedOpponentGroups.add(`${s.r},${s.c}`);
          }
          if (oppGroup.liberties.length === 0) {
            // 提子！
            for (const s of oppGroup.stones) {
              captured.push(s);
              newBoard[s.r][s.c] = null;
            }
          }
        }
      }
    }
  }

  // 3. 提子完毕后，检查自身连通块是否还有气
  const myGroup = getGroupAndLiberties(newBoard, r, c);
  if (!allowSuicide && myGroup && myGroup.liberties.length === 0) {
    // 提子后自身仍然没气，属于自杀（禁着点）
    return {
      valid: false,
      newBoard: board,
      captured: [],
      reason: '这里没有气，像掉进陷阱里了，不能下在这里哦！',
    };
  }

  return { valid: true, newBoard, captured };
}

/** 检查某位置是否为合法的落子点 */
export function isValidMove(board: BoardState, r: number, c: number, color: StoneColor): boolean {
  return playMove(board, r, c, color).valid;
}

/** 获取盘面上所有的合法落子点 */
export function getLegalMoves(board: BoardState, color: StoneColor): Point[] {
  const size = board.length;
  const moves: Point[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === null && isValidMove(board, r, c, color)) {
        moves.push({ r, c });
      }
    }
  }
  return moves;
}
