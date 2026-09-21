import {
  type BoardState,
  type Point,
  type StoneColor,
  getLegalMoves,
  playMove,
  getAllGroups,
  getGroupAndLiberties,
  getNeighbors,
} from './goLogic';

export type AiDifficulty = 'easy' | 'medium' | 'hard';

export interface AiMoveDecision {
  point: Point | null;
  comment: string;
}

/** 萌宠语录库 */
const EASY_COMMENTS = [
  '喵~ 我下在这里啦！',
  '哼哼，看我的喵喵拳！',
  '哎呀，我要和你做邻居~',
  '这里好舒服，我就坐在这里啦！',
  '轮到你啦，聪明的小主人！',
];

const MEDIUM_COMMENTS = [
  '看招！我发现了一个绝妙的要点！',
  '机灵小狐狸可是做足了准备的哦！',
  '步步为营，看你能否突破我的防线！',
  '这里的呼吸通道被我守住啦！',
];

const HARD_COMMENTS = [
  '神龙摆尾！这一手你可要想仔细啦！',
  '势如破竹！看清棋盘上的风云变幻！',
  '攻守兼备，这才是围棋真正的精髓！',
  '迎头痛击！封死你所有的出路！',
  '一子断开，看你顾左还是顾右！',
];

/** 检查某个点是否为己方真眼（避免自己填自己的眼位） */
function isOwnTrueEye(board: BoardState, r: number, c: number, color: StoneColor): boolean {
  const size = board.length;
  const neighbors = getNeighbors(r, c, size);
  if (neighbors.length === 0) return false;

  const allNeighborsSame = neighbors.every(nb => board[nb.r][nb.c] === color);
  if (!allNeighborsSame) return false;

  let diagTotal = 0;
  let diagSame = 0;
  for (const dr of [-1, 1]) {
    for (const dc of [-1, 1]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        diagTotal++;
        if (board[nr][nc] === color) {
          diagSame++;
        }
      }
    }
  }

  return diagSame >= (diagTotal <= 2 ? 1 : diagTotal - 1);
}

/** 检查落子点是否为关键切断点或扳头挡住点（战术形状感知） */
function getTacticalShapeBonus(
  board: BoardState,
  r: number,
  c: number,
  aiColor: StoneColor,
  opponentColor: StoneColor
): number {
  const size = board.length;
  const neighbors = getNeighbors(r, c, size);
  let oppNeighbors = 0;
  let myNeighbors = 0;

  for (const nb of neighbors) {
    if (board[nb.r][nb.c] === opponentColor) oppNeighbors++;
    else if (board[nb.r][nb.c] === aiColor) myNeighbors++;
  }

  let bonus = 0;

  // 1. 切断点（Cut Point）：若此点两侧有不同的对手棋子，下在此处可将其分断！
  if (oppNeighbors >= 2) {
    bonus += 180;
  }

  // 2. 迎头封堵 / 扳头（Block / Hane）：紧贴对手棋子正面，不让对手长气
  if (oppNeighbors >= 1 && myNeighbors >= 1) {
    bonus += 120;
  }

  // 3. 自身连接要害（Connect）：保护自身两块棋子的连接点
  if (myNeighbors >= 2) {
    bonus += 140;
  }

  return bonus;
}

/**
 * 盘面静态局势评价函数 (Leaf Evaluation)
 * 从 AI 视角评估局势（分数越高对 AI 越有利）
 */
function evaluateBoardState(
  board: BoardState,
  aiColor: StoneColor,
  _opponentColor: StoneColor,
  accumulatedAiCaptures: number = 0,
  accumulatedOppCaptures: number = 0
): number {
  let score = 0;

  // 提子累计分（吃子棋核心导向）
  score += accumulatedAiCaptures * 5000;
  score -= accumulatedOppCaptures * 6000;

  const allGroups = getAllGroups(board);
  let aiTotalLibs = 0;
  let oppTotalLibs = 0;

  for (const group of allGroups) {
    const libs = group.liberties.length;
    const stoneCount = group.stones.length;

    if (group.color === aiColor) {
      aiTotalLibs += libs;
      if (libs === 1) {
        // AI 自身有被叫吃的濒危块：极大惩罚
        score -= stoneCount * 2500;
      } else if (libs === 2) {
        score -= stoneCount * 300;
      } else {
        score += stoneCount * 100 + libs * 40;
      }
    } else {
      oppTotalLibs += libs;
      if (libs === 1) {
        // 对手有被叫吃的濒危块：极大奖励
        score += stoneCount * 3000;
      } else if (libs === 2) {
        score += stoneCount * 450;
      } else {
        score -= stoneCount * 80 + libs * 30;
      }
    }
  }

  // 全盘气数优势
  score += (aiTotalLibs - oppTotalLibs) * 25;

  return score;
}

/**
 * 智能候选着法生成与剪枝排序 (Move Generation & Pruning)
 * 仅保留最具威胁与价值的候选点，排除远离战场的废棋
 */
function getOrderedCandidateMoves(
  board: BoardState,
  color: StoneColor,
  maxCandidates: number = 10
): { point: Point; priority: number }[] {
  const legalMoves = getLegalMoves(board, color);
  if (legalMoves.length === 0) return [];

  const opponentColor: StoneColor = color === 'black' ? 'white' : 'black';
  const size = board.length;
  const center = (size - 1) / 2;
  const allGroups = getAllGroups(board);

  // 收集盘面上已有的所有棋子坐标
  const existingStones: Point[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== null) existingStones.push({ r, c });
    }
  }

  const scored: { point: Point; priority: number }[] = [];

  for (const move of legalMoves) {
    // 快速过滤：如果是空盘或第一步，靠近天元
    if (existingStones.length === 0) {
      const dist = Math.hypot(move.r - center, move.c - center);
      scored.push({ point: move, priority: 1000 - dist * 10 });
      continue;
    }

    // 计算到最近已有棋子的曼哈顿距离
    let minDist = 999;
    for (const stone of existingStones) {
      const d = Math.abs(move.r - stone.r) + Math.abs(move.c - stone.c);
      if (d < minDist) minDist = d;
    }

    // 排除距离战斗区域超过 2 格的远端废点
    if (minDist > 2) continue;

    let priority = 0;

    // 1. 尝试该走步
    const res = playMove(board, move.r, move.c, color);
    if (!res.valid) continue;

    // 提子超高优先
    if (res.captured.length > 0) {
      priority += 10000 + res.captured.length * 2000;
    }

    // 2. 检查落子后的自身气数（防白给送死）
    const myGroup = getGroupAndLiberties(res.newBoard, move.r, move.c);
    if (myGroup) {
      if (myGroup.liberties.length === 1) {
        // 自投虎口扣分
        priority -= 4000;
      } else {
        priority += myGroup.liberties.length * 80;
      }
    }

    // 3. 检查是否能叫吃对方
    for (const g of allGroups) {
      if (g.color === opponentColor && g.liberties.some(l => l.r === move.r && l.c === move.c)) {
        if (g.liberties.length === 1) {
          // 提子（已在上方处理）
        } else if (g.liberties.length === 2) {
          // 叫吃！
          priority += 3500;
        }
      }
    }

    // 4. 战术形状加分（扳头、切断、补断）
    priority += getTacticalShapeBonus(board, move.r, move.c, color, opponentColor);

    // 5. 自身解救（己方处于叫吃时，落子长气）
    for (const g of allGroups) {
      if (g.color === color && g.liberties.length === 1) {
        if (g.liberties.some(l => l.r === move.r && l.c === move.c)) {
          if (myGroup && myGroup.liberties.length >= 2) {
            priority += 4500; // 成功逃跑长气
          }
        }
      }
    }

    // 6. 防自填真眼
    if (res.captured.length === 0 && isOwnTrueEye(board, move.r, move.c, color)) {
      priority -= 5000;
    }

    // 贴身作战优先（紧挨着对方棋子）
    if (minDist === 1) priority += 100;

    scored.push({ point: move, priority });
  }

  // 按优先级排序，只保留前 maxCandidates 个优质点
  scored.sort((a, b) => b.priority - a.priority);
  return scored.slice(0, maxCandidates);
}

/**
 * 深度 3 步 Minimax 对抗博弈搜索（带 Alpha-Beta 剪枝）
 * isMaximizing: true 代表轮到 AI，false 代表轮到人类
 */
function alphaBeta(
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiColor: StoneColor,
  opponentColor: StoneColor,
  accumAiCaps: number,
  accumOppCaps: number
): number {
  // 达到吃子目标或搜索达到最深层：静态评估
  if (accumAiCaps >= 1 || accumOppCaps >= 1 || depth === 0) {
    return evaluateBoardState(board, aiColor, opponentColor, accumAiCaps, accumOppCaps);
  }

  const currentColor = isMaximizing ? aiColor : opponentColor;
  const candidates = getOrderedCandidateMoves(board, currentColor, depth >= 2 ? 8 : 6);

  if (candidates.length === 0) {
    // 无处下子
    return evaluateBoardState(board, aiColor, opponentColor, accumAiCaps, accumOppCaps);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const cand of candidates) {
      const move = cand.point;
      const res = playMove(board, move.r, move.c, aiColor);
      if (!res.valid) continue;

      const newAiCaps = accumAiCaps + res.captured.length;
      // 产生吃子，提前剪枝
      if (newAiCaps >= 1) return 100000;

      const evalScore = alphaBeta(
        res.newBoard,
        depth - 1,
        alpha,
        beta,
        false,
        aiColor,
        opponentColor,
        newAiCaps,
        accumOppCaps
      );

      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Beta 剪枝
    }
    return maxEval;
  } else {
    // 模拟人类的最狠反击
    let minEval = Infinity;
    for (const cand of candidates) {
      const move = cand.point;
      const res = playMove(board, move.r, move.c, opponentColor);
      if (!res.valid) continue;

      const newOppCaps = accumOppCaps + res.captured.length;
      // 人类达成吃子，对手必胜
      if (newOppCaps >= 1) return -100000;

      const evalScore = alphaBeta(
        res.newBoard,
        depth - 1,
        alpha,
        beta,
        true,
        aiColor,
        opponentColor,
        accumAiCaps,
        newOppCaps
      );

      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha 剪枝
    }
    return minEval;
  }
}

/**
 * AI 综合决策入口
 */
export function getAiMove(
  board: BoardState,
  aiColor: StoneColor,
  difficulty: AiDifficulty = 'easy'
): AiMoveDecision {
  const legalMoves = getLegalMoves(board, aiColor);
  if (legalMoves.length === 0) {
    return { point: null, comment: '我没有地方可以下了喵~ 认输啦！' };
  }

  const opponentColor: StoneColor = aiColor === 'black' ? 'white' : 'black';

  // 1. Easy 难度（呆萌猫猫）：保留 45% 适度放水机制
  if (difficulty === 'easy') {
    const directCaptures = legalMoves
      .map(m => ({ move: m, res: playMove(board, m.r, m.c, aiColor) }))
      .filter(item => item.res.valid && item.res.captured.length > 0);

    if (directCaptures.length > 0 && Math.random() < 0.55) {
      const bestCap = directCaptures[0].move;
      return {
        point: bestCap,
        comment: '嘻嘻，抓到了一个小尾巴！',
      };
    }

    const candidates = getOrderedCandidateMoves(board, aiColor, 6);
    const chosen = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)].point : legalMoves[0];
    return {
      point: chosen,
      comment: EASY_COMMENTS[Math.floor(Math.random() * EASY_COMMENTS.length)],
    };
  }

  // 2. Medium 难度（机灵小狐）：候选点 2-Ply 深度评估
  if (difficulty === 'medium') {
    const candidates = getOrderedCandidateMoves(board, aiColor, 8);
    if (candidates.length === 0) {
      return { point: legalMoves[0], comment: '步步为营，看招！' };
    }

    // 检查是否有绝对优先的一步提子
    const bestCand = candidates[0];
    const testMove = playMove(board, bestCand.point.r, bestCand.point.c, aiColor);
    if (testMove.captured.length > 0) {
      return {
        point: bestCand.point,
        comment: '抓准破绽！吃掉你的小棋子啦！',
      };
    }

    // 从前 2 个优质点中微随机挑选
    const topSlice = candidates.slice(0, Math.min(2, candidates.length));
    const chosen = topSlice[Math.floor(Math.random() * topSlice.length)].point;
    return {
      point: chosen,
      comment: MEDIUM_COMMENTS[Math.floor(Math.random() * MEDIUM_COMMENTS.length)],
    };
  }

  // 3. Hard 难度（功夫小龙）：深度 3 步 Minimax + Alpha-Beta 对抗搜索 + 战术切断扳头
  const candidates = getOrderedCandidateMoves(board, aiColor, 10);
  if (candidates.length === 0) {
    return { point: legalMoves[0], comment: '神龙出招！' };
  }

  // 检查直接绝杀（1 步提子）
  for (const cand of candidates) {
    const testPlay = playMove(board, cand.point.r, cand.point.c, aiColor);
    if (testPlay.valid && testPlay.captured.length > 0) {
      return {
        point: cand.point,
        comment: '神龙见首！看我一举吃掉你的棋子！',
      };
    }
  }

  let bestMove = candidates[0].point;
  let bestScore = -Infinity;

  for (const cand of candidates) {
    const move = cand.point;
    const res = playMove(board, move.r, move.c, aiColor);
    if (!res.valid) continue;

    // 进行深度 3 步 Alpha-Beta 对抗推演（计算人类最强反制）
    const score = alphaBeta(
      res.newBoard,
      2, // 接下来算人类反击(1) + 小龙应对(2)
      -Infinity,
      Infinity,
      false, // 轮到人类走最强步
      aiColor,
      opponentColor,
      res.captured.length,
      0
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return {
    point: bestMove,
    comment: HARD_COMMENTS[Math.floor(Math.random() * HARD_COMMENTS.length)],
  };
}
