import {
  type BoardState,
  type Point,
  type StoneColor,
  getLegalMoves,
  playMove,
  getAllGroups,
} from './goLogic';

export type AiDifficulty = 'easy' | 'medium';

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

const DANGER_COMMENTS = [
  '哇！我只剩一口气了，好紧张！',
  '救命救命，我要赶紧逃跑啦！',
  '你围得太紧了，我快透不过气了喵~',
];

const CAPTURE_COMMENTS = [
  '嘻嘻，看我抓到了一个小尾巴！',
  '吃掉一颗，真香喵~',
];

/** AI 决策函数 */
export function getAiMove(
  board: BoardState,
  aiColor: StoneColor,
  difficulty: AiDifficulty = 'easy'
): AiMoveDecision {
  const legalMoves = getLegalMoves(board, aiColor);
  if (legalMoves.length === 0) {
    return { point: null, comment: '我没有地方可以下了喵~ 认输啦！' };
  }

  const humanColor: StoneColor = aiColor === 'black' ? 'white' : 'black';

  // 1. 寻找是否能立即吃掉人类的子 (Winning / Capture Moves)
  const captureMoves: { point: Point; count: number }[] = [];
  for (const move of legalMoves) {
    const res = playMove(board, move.r, move.c, aiColor);
    if (res.valid && res.captured.length > 0) {
      captureMoves.push({ point: move, count: res.captured.length });
    }
  }

  // 2. 检查自己是否有只剩 1 口气的危险连通块（被叫吃 / Atari）
  const allGroups = getAllGroups(board);
  const myEndangeredGroups = allGroups.filter(
    g => g.color === aiColor && g.liberties.length === 1
  );

  // 如果处于简单难度（呆萌猫猫）：故意漏看，给孩子爽快感
  if (difficulty === 'easy') {
    // 30% 概率即使能吃子也走普通随机，让孩子能够抢先吃
    if (captureMoves.length > 0 && Math.random() < 0.6) {
      const best = captureMoves[0].point;
      return {
        point: best,
        comment: CAPTURE_COMMENTS[Math.floor(Math.random() * CAPTURE_COMMENTS.length)],
      };
    }

    // 随机选一步合法步
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return {
      point: randomMove,
      comment: EASY_COMMENTS[Math.floor(Math.random() * EASY_COMMENTS.length)],
    };
  }

  // 进阶难度（机灵小狐狸）：
  // 策略 A: 优先吃掉对方
  if (captureMoves.length > 0) {
    // 按吃子数量排序
    captureMoves.sort((a, b) => b.count - a.count);
    return {
      point: captureMoves[0].point,
      comment: '看准啦！我吃掉你的一颗小棋子咯！',
    };
  }

  // 策略 B: 自身有危险时，尝试逃跑（在唯一的那口气上下子）
  if (myEndangeredGroups.length > 0) {
    for (const danger of myEndangeredGroups) {
      const escapePoint = danger.liberties[0];
      // 验证这个逃跑点是否合法（长气）
      if (legalMoves.some(m => m.r === escapePoint.r && m.c === escapePoint.c)) {
        const testRes = playMove(board, escapePoint.r, escapePoint.c, aiColor);
        if (testRes.valid) {
          return {
            point: escapePoint,
            comment: DANGER_COMMENTS[Math.floor(Math.random() * DANGER_COMMENTS.length)],
          };
        }
      }
    }
  }

  // 策略 C: 叫吃人类处于 2 口气的棋子
  const humanTwoLibGroups = allGroups.filter(
    g => g.color === humanColor && g.liberties.length === 2
  );
  for (const group of humanTwoLibGroups) {
    for (const lib of group.liberties) {
      if (legalMoves.some(m => m.r === lib.r && m.c === lib.c)) {
        return {
          point: lib,
          comment: '盯上你啦！我要包围你的小棋子咯！',
        };
      }
    }
  }

  // 策略 D: 靠近中心或靠近已有棋子拓展
  const size = board.length;
  const center = (size - 1) / 2;
  legalMoves.sort((a, b) => {
    const distA = Math.hypot(a.r - center, a.c - center);
    const distB = Math.hypot(b.r - center, b.c - center);
    return distA - distB;
  });

  const bestMove = legalMoves[0];
  return {
    point: bestMove,
    comment: '我找到一个绝妙的好位置，看招！',
  };
}
