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
  '攻守兼备，这可是围棋正理！',
];

/** 检查某个点是否为己方真眼（避免自己填自己的眼位） */
function isOwnTrueEye(board: BoardState, r: number, c: number, color: StoneColor): boolean {
  const size = board.length;
  const neighbors = getNeighbors(r, c, size);
  if (neighbors.length === 0) return false;

  // 四周相邻交叉点必须全部是己方棋子
  const allNeighborsSame = neighbors.every(nb => board[nb.r][nb.c] === color);
  if (!allNeighborsSame) return false;

  // 角上或边上至少需要对角点绝大多数也是己方
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

  // 边角容错：如果对角点大部分都是己方，则是真眼
  return diagSame >= (diagTotal <= 2 ? 1 : diagTotal - 1);
}

/**
 * 2-Ply（深度前瞻）单步评估器
 * 综合评估：提子得分、真假自救、防落入虎口、叫吃威胁、连通性与占中
 */
function evaluateMove(
  board: BoardState,
  move: Point,
  aiColor: StoneColor,
  opponentColor: StoneColor
): { score: number; comment: string } {
  const size = board.length;
  const center = (size - 1) / 2;

  // 1. 模拟自身落子
  const res = playMove(board, move.r, move.c, aiColor);
  if (!res.valid) {
    return { score: -99999, comment: '' };
  }

  let score = 0;
  let bestComment = '';

  // 2. 检查原盘面上，AI 自己是否有只剩 1 口气的濒危棋块（被叫吃）
  const originalGroups = getAllGroups(board);
  const myOriginalEndangered = originalGroups.filter(
    g => g.color === aiColor && g.liberties.length === 1
  );

  // 3. 立即提子（Capture）评估
  if (res.captured.length > 0) {
    score += res.captured.length * 2000;
    bestComment = `抓住机会！吃掉你 ${res.captured.length} 只小棋子喵~`;

    // 提子是否解救了原本濒危的自己（反提）
    if (myOriginalEndangered.length > 0) {
      score += 1500;
      bestComment = '先下手为强！反提成功，解救危机！';
    }
  }

  // 4. 落子后自身新连通块的安全性前瞻
  const myNewGroup = getGroupAndLiberties(res.newBoard, move.r, move.c);
  const myNewLibs = myNewGroup ? myNewGroup.liberties.length : 0;

  // 关键增强 A：避开送死（Lookahead Antisuicide）
  if (myNewLibs === 1) {
    // 落子后自己依然只有 1 气！
    // 检查对手下一步是否能直接提吃
    const onlyLib = myNewGroup!.liberties[0];
    const oppKill = playMove(res.newBoard, onlyLib.r, onlyLib.c, opponentColor);
    if (oppKill.valid && oppKill.captured.length > 0) {
      // 致命送死：走上去就被对方下一手提掉！重度惩罚！
      score -= 4000;
    } else {
      score -= 1000;
    }
  } else if (myNewLibs >= 2) {
    // 自身安全长气
    score += myNewLibs * 50;

    // 如果原先有被叫吃的子，这手棋真正将其气数扩大到了 2 气以上（成功逃跑）
    if (myOriginalEndangered.length > 0) {
      const rescued = myOriginalEndangered.some(d =>
        d.liberties.some(l => l.r === move.r && l.c === move.c)
      );
      if (rescued) {
        score += 900;
        bestComment = '呼~ 成功长出一口气，逃出生天！';
      }
    }
  }

  // 关键增强 B：进攻制造叫吃（Atari Threat）
  const afterOppGroups = getAllGroups(res.newBoard).filter(
    g => g.color === opponentColor && g.liberties.length === 1
  );
  const beforeOppEndangered = originalGroups.filter(
    g => g.color === opponentColor && g.liberties.length === 1
  );

  if (afterOppGroups.length > beforeOppEndangered.length) {
    // 新制造了打吃！
    score += 450;
    if (!bestComment) bestComment = '盯紧你啦！你的小棋子危险咯~';

    // 前瞻对手下一步：对手在最后一口气上能否顺利逃跑？
    for (const oppGroup of afterOppGroups) {
      const oppEscapePoint = oppGroup.liberties[0];
      const oppEscapeRes = playMove(res.newBoard, oppEscapePoint.r, oppEscapePoint.c, opponentColor);
      if (!oppEscapeRes.valid) {
        // 对手连合法落子逃跑都做不到（死棋）
        score += 600;
      } else {
        const oppEscapedGroup = getGroupAndLiberties(oppEscapeRes.newBoard, oppEscapePoint.r, oppEscapePoint.c);
        if (!oppEscapedGroup || oppEscapedGroup.liberties.length <= 1) {
          // 对手逃跑后仍然只有 1 气（假逃跑，征子/抱吃杀）！
          score += 500;
        }
      }
    }
  }

  // 关键增强 C：防自填真眼
  if (res.captured.length === 0 && isOwnTrueEye(board, move.r, move.c, aiColor)) {
    score -= 2500;
  }

  // 关键增强 D：连接与分断价值（小手拉大手）
  const friendlyNeighbors = getNeighbors(move.r, move.c, size).filter(
    nb => board[nb.r][nb.c] === aiColor
  );
  if (friendlyNeighbors.length >= 2) {
    score += 120; // 连通两块友军
  }

  // 关键增强 E：中心与星位几何距离分
  const distToCenter = Math.hypot(move.r - center, move.c - center);
  score += Math.max(0, (center * 1.5 - distToCenter) * 20);

  return { score, comment: bestComment };
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

  // 针对 Easy 难度（呆萌猫猫）：保留儿童友好放水机制
  if (difficulty === 'easy') {
    // 1. 寻找直接提子机会，45% 概率放水漏看
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

    // 其余情况：从前几个不直接送死的合理步中随机挑选
    const scored = legalMoves.map(move => ({
      move,
      ...evaluateMove(board, move, aiColor, opponentColor),
    })).filter(s => s.score > -2000); // 排除极恶送死步

    const candidatePool = scored.length > 0 ? scored : legalMoves.map(m => ({ move: m, score: 0, comment: '' }));
    // 随机选一步
    const chosen = candidatePool[Math.floor(Math.random() * candidatePool.length)];
    return {
      point: chosen.move,
      comment: chosen.comment || EASY_COMMENTS[Math.floor(Math.random() * EASY_COMMENTS.length)],
    };
  }

  // 针对 Medium / Hard 难度：全面启用 2-Ply 深度前瞻打分
  const scoredMoves = legalMoves.map(move => {
    const evaluation = evaluateMove(board, move, aiColor, opponentColor);
    return {
      move,
      score: evaluation.score,
      comment: evaluation.comment,
    };
  });

  // 按综合评分从高到低排序
  scoredMoves.sort((a, b) => b.score - a.score);

  if (difficulty === 'medium') {
    // 机灵小狐：如果在最高分之外有得分接近的优秀步（分差 <= 150），才进行微随机选择；若有明显提子/解危绝对优势，坚决执行！
    const bestScore = scoredMoves[0].score;
    const closeCandidates = scoredMoves.filter(s => bestScore - s.score <= 150);
    const chosen = closeCandidates[Math.floor(Math.random() * closeCandidates.length)];
    return {
      point: chosen.move,
      comment: chosen.comment || MEDIUM_COMMENTS[Math.floor(Math.random() * MEDIUM_COMMENTS.length)],
    };
  }

  // Hard 难度（功夫小龙）：极致最优算力（严格选取最高分步）
  const bestMove = scoredMoves[0];
  return {
    point: bestMove.move,
    comment: bestMove.comment || HARD_COMMENTS[Math.floor(Math.random() * HARD_COMMENTS.length)],
  };
}
