import { type BoardState, createEmptyBoard, type Point, type StoneColor } from '../engine/goLogic';

export interface Level {
  id: number;
  chapter: 1 | 2;
  title: string;
  badge: string;
  boardSize: number;
  playerColor: StoneColor;
  story: string;
  voiceText: string;
  goal: string;
  hint: string;
  solutionMoves?: Point[];
  targetCaptures?: number;
  setup: () => BoardState;
}

export const CHAPTERS = [
  {
    id: 1,
    title: '第一章：呼吸与基础篇',
    desc: '认识棋子的呼吸门，学会捉迷藏与一步吃子',
    badge: '🌱',
  },
  {
    id: 2,
    title: '第二章：吃子小神技篇',
    desc: '掌握门吃、抱吃、双打吃与危机反提大绝招',
    badge: '⚡',
  },
];

export const LEVELS: Level[] = [
  // ================= 第一章：呼吸与基础篇 =================
  {
    id: 1,
    chapter: 1,
    title: '呼吸的小门',
    badge: '🌱',
    boardSize: 3,
    playerColor: 'black',
    story: '中间有一只迷路的小白兔，棋子上下左右交叉的小十字是它的“呼吸门”。小黑猫，试着在它旁边下一个子，堵住它的一扇门吧！',
    voiceText: '中间有一只迷路的小白兔，它有四扇呼吸门。小黑猫，快在它旁边下一个子吧！',
    goal: '在小白兔任意一个相邻的门上落子',
    hint: '点击小白兔上面的、下面的、左边的或者右边的交叉点都可以哦！',
    solutionMoves: [
      { r: 0, c: 1 },
      { r: 2, c: 1 },
      { r: 1, c: 0 },
      { r: 1, c: 2 },
    ],
    setup: () => {
      const b = createEmptyBoard(3);
      b[1][1] = 'white'; // 初始 4 气，合规
      return b;
    },
  },
  {
    id: 2,
    chapter: 1,
    title: '捉迷藏·一步吃子',
    badge: '🐱',
    boardSize: 3,
    playerColor: 'black',
    story: '看！小白兔的三扇门都被小黑猫堵住了，只剩下最后 1 扇门啦！这就是围棋里的“打吃”！小黑猫快堵住最后的门，把它捉住吧！',
    voiceText: '小白兔只剩下最后一扇门啦！快堵住它，捉迷藏胜利！',
    goal: '吃掉中间的小白兔',
    hint: '看到小白兔右边那个闪光的小门了吗？点击它就能吃掉小白兔啦！',
    targetCaptures: 1,
    solutionMoves: [{ r: 1, c: 2 }],
    setup: () => {
      const b = createEmptyBoard(3);
      b[1][1] = 'white'; // 仅剩 (1, 2) 1气，合规
      b[0][1] = 'black';
      b[2][1] = 'black';
      b[1][0] = 'black';
      return b;
    },
  },
  {
    id: 3,
    chapter: 1,
    title: '墙角的小白兔',
    badge: '🐾',
    boardSize: 3,
    playerColor: 'black',
    story: '小白兔躲到了最角落的墙壁旁！在角落里的棋子，天然只有 2 扇门哦！现在小黑猫已经守住了 1 扇门，快去把另 1 扇门堵住吧！',
    voiceText: '角落里的小白兔天然只有两扇门。快把最后一扇门也关上吧！',
    goal: '在角落完成吃子',
    hint: '点击小白兔正下方的空位，关上它最后的大门！',
    targetCaptures: 1,
    solutionMoves: [{ r: 1, c: 0 }],
    setup: () => {
      const b = createEmptyBoard(3);
      b[0][0] = 'white'; // 角落白兔，剩 (1, 0) 1气，合规
      b[0][1] = 'black';
      return b;
    },
  },
  {
    id: 4,
    chapter: 1,
    title: '小手拉大手·连通',
    badge: '🤝',
    boardSize: 5,
    playerColor: 'black',
    story: '这只小黑猫快被两只白兔包围了！快在它的旁边紧挨着再放一只小黑猫，让它们两只手拉手连在一起，气就会变多，变得更强大！',
    voiceText: '小黑猫快被包围了！快在它旁边放一只小黑猫，手拉手变强大！',
    goal: '将小黑猫连接起来，增加呼吸门',
    hint: '在孤单小黑猫的上面或者下面落子，手拉手连成一片！',
    solutionMoves: [
      { r: 1, c: 2 },
      { r: 3, c: 2 },
    ],
    setup: () => {
      const b = createEmptyBoard(5);
      b[2][2] = 'black'; // 居中黑猫，有上下2气，合规
      b[2][1] = 'white';
      b[2][3] = 'white';
      return b;
    },
  },
  {
    id: 5,
    chapter: 1,
    title: '避开危险火坑',
    badge: '🔥',
    boardSize: 5,
    playerColor: 'black',
    story: '仔细观察：白兔子们手拉手，在周围围起了一圈，里面的中心点一点呼吸的空气都没有，是个大火坑！围棋里不能跳进火坑自杀哦，请在安全的地方落子！',
    voiceText: '中间是个没有空气的火坑，可千万不能跳进去哦！请在安全的地方落子。',
    goal: '避开中间禁着点，在安全区域落子',
    hint: '不要点被完全包围的中心点(2,2)，选择周围宽阔安全的地方落子！',
    setup: () => {
      const b = createEmptyBoard(5);
      // 白棋围成十字圈，但外侧全有气
      b[1][2] = 'white';
      b[3][2] = 'white';
      b[2][1] = 'white';
      b[2][3] = 'white';
      return b;
    },
  },
  {
    id: 6,
    chapter: 1,
    title: '大挑战·5x5吃子对决',
    badge: '🏆',
    boardSize: 5,
    playerColor: 'black',
    story: '太棒了！你已经掌握了全部基础本领！现在白兔子要和你进行真正的对决，谁先吃掉对方 1 颗棋子，谁就是胜利者！加油！',
    voiceText: '大挑战开始啦！谁先吃掉对方一颗棋子，谁就是大赢家！',
    goal: '在实战中率先吃掉对方 1 颗子',
    hint: '围捕白兔，同时留意自己的小黑猫有没有被包围哦！',
    targetCaptures: 1,
    setup: () => {
      return createEmptyBoard(5);
    },
  },

  // ================= 第二章：吃子小神技篇 =================
  {
    id: 7,
    chapter: 2,
    title: '关门大吉·门吃',
    badge: '🚪',
    boardSize: 5,
    playerColor: 'black',
    story: '两只小黑猫已经在左右两侧站好了，就像胡同两侧结实的门柱！小白兔正急匆匆往胡同口逃跑。小黑猫快在正前方的两扇门柱之间落下一子（门吃），把大门紧紧关死！',
    voiceText: '小白兔想从胡同口溜出去，快在正前方把大门关上，门吃胜利！',
    goal: '在胡同口下子完成【门吃】',
    hint: '下在小白兔正前方的出口(1,2)，如同关上大门，瓮中捉兔！',
    targetCaptures: 1,
    solutionMoves: [{ r: 1, c: 2 }],
    setup: () => {
      const b = createEmptyBoard(5);
      b[2][2] = 'white'; // 企图逃跑的小白兔，仅剩 (1, 2) 这一口气！
      b[3][2] = 'black'; // 后方堵住
      b[2][1] = 'black'; // 左侧墙
      b[2][3] = 'black'; // 右侧墙
      b[1][1] = 'black'; // 左门柱
      b[1][3] = 'black'; // 右门柱
      return b;
    },
  },
  {
    id: 8,
    chapter: 2,
    title: '温暖大拥抱·抱吃',
    badge: '🤗',
    boardSize: 5,
    playerColor: 'black',
    story: '看！小白兔想往右边的草地逃跑，小黑猫们已经在右侧排成了一个弯弯的弧形“大怀抱”！小黑猫迎面落下一子，像张开双臂一样把它温柔地抱进怀里，抱吃成功！',
    voiceText: '小白兔想往右边逃跑，迎面给它一个大拥抱，抱吃成功！',
    goal: '迎面落子将逃跑的白兔【抱入怀中】',
    hint: '落在白兔逃跑正前方的(2,3)，迎面把小白兔抱进大怀抱里！',
    targetCaptures: 1,
    solutionMoves: [{ r: 2, c: 3 }],
    setup: () => {
      const b = createEmptyBoard(5);
      b[2][2] = 'white'; // 企图向右逃跑的受困白兔
      b[1][2] = 'black'; // 上挡
      b[3][2] = 'black'; // 下挡
      b[2][1] = 'black'; // 后堵

      // 右侧弧形大怀抱（呈弧度半圆包抄臂弯）
      b[1][3] = 'black'; // 上臂弯
      b[3][3] = 'black'; // 下臂弯
      b[2][4] = 'black'; // 怀抱胸膛
      // 白兔唯一的逃跑出口在正前方 (2, 3)，黑棋下在 (2, 3) 迎面抱入怀中吃子！
      return b;
    },
  },
  {
    id: 9,
    chapter: 2,
    title: '小羊扭头·连环征子',
    badge: '🚂',
    boardSize: 7,
    playerColor: 'black',
    story: '小白兔被抱吃后硬要逃跑救自己！聪明的小黑猫像开过山车一样，它往哪跑我们就往侧面拐弯打吃！看它像小羊扭头一样逃不出五指山，最后一口气吃掉一整列白兔小火车！',
    voiceText: '小兔子硬要逃跑，像开小火车一样连续拐弯打吃它！',
    goal: '连续拐弯打吃，一举提掉整串白兔',
    hint: '第1步下在(3,2)从下方打吃，第2步下在(2,4)从右边盖帽，第3步下在(4,3)提吃整串！',
    targetCaptures: 3,
    solutionMoves: [{ r: 3, c: 2 }, { r: 2, c: 4 }, { r: 4, c: 3 }],
    setup: () => {
      const b = createEmptyBoard(7);
      b[1][2] = 'black'; // 上方截断
      b[2][1] = 'black'; // 左方截断
      b[1][3] = 'black'; // 门框封锁
      b[3][4] = 'black'; // 前方接应大黑猫（守株待兔拦路虎）
      b[2][2] = 'white'; // 企图逃跑的白兔（拥有3,2和2,3整整2口气，绝非死子！）
      return b;
    },
  },
  {
    id: 10,
    chapter: 2,
    title: '一箭双雕·双打吃',
    badge: '🎯',
    boardSize: 5,
    playerColor: 'black',
    story: '看！左边的小白兔有两扇门，右边的小白兔也有两扇门！小黑猫只要落下一子在正中间，就能同时抓住它们俩的尾巴！这就是【双打吃】神技，让它们顾前不顾后！',
    voiceText: '看准正中间的位置，一箭双雕，同时给两只兔子带来危机！',
    goal: '落下一子同时打吃两边的白兔',
    hint: '点击正中间(2,2)的十字路口，让两边的白兔同时只剩一口气！',
    solutionMoves: [{ r: 2, c: 2 }],
    setup: () => {
      const b = createEmptyBoard(5);
      // 白兔 A 位于 (2, 1)，拥有 (1, 1) 和 (2, 2) 整整两口气！绝非死子！
      b[2][1] = 'white';
      b[2][0] = 'black';
      b[3][1] = 'black';

      // 白兔 B 位于 (1, 2)，拥有 (1, 1) 和 (2, 2) 整整两口气！绝非死子！
      b[1][2] = 'white';
      b[0][2] = 'black';
      b[1][3] = 'black';

      // 中间 (2, 2) 是它们俩共同的关键门！黑棋落在 (2, 2) 实现纯正双打吃！
      return b;
    },
  },
  {
    id: 11,
    chapter: 2,
    title: '先下手为强·反提救猫',
    badge: '⚡',
    boardSize: 5,
    playerColor: 'black',
    story: '糟糕！中间的小黑猫被包围，只剩最后一口气！但别慌张，仔细看紧挨着它的那只白兔也只剩最后一口气！先下手吃掉白兔，小黑猫就立刻安全啦！',
    voiceText: '别慌张！敌人也只剩一口气了，先下手为强，救出小黑猫！',
    goal: '先下手吃掉虚弱白兔，反提成功解救小黑猫',
    hint: '落在(1,1)，率先吃掉上方只有一口气的白兔(1,2)！',
    targetCaptures: 1,
    solutionMoves: [{ r: 1, c: 1 }],
    setup: () => {
      const b = createEmptyBoard(5);
      // 小黑猫在 (2, 2)，拥有右侧 (2, 3) 这一口气！【绝非 0 气死子，有 1 气被打吃】
      b[2][2] = 'black';
      b[3][2] = 'white'; // 下方白
      b[2][1] = 'white'; // 左方白

      // 上方白兔在 (1, 2)，自身也只剩下左侧 (1, 1) 这一口气！
      b[1][2] = 'white';
      b[0][2] = 'black'; // 白兔头顶有黑
      b[1][3] = 'black'; // 白兔右侧有黑
      return b;
    },
  },
  {
    id: 12,
    chapter: 2,
    title: '扣上大草帽·镇头封锁',
    badge: '👒',
    boardSize: 5,
    playerColor: 'black',
    story: '小白兔探出小脑袋，想顺着大路往上冲！我们在它正前方空一格的天元中心，像扣上一顶大草帽一样落下一子（镇头），阻断它的逃跑路线！',
    voiceText: '给小白兔扣上一顶大草帽，阻挡它的逃跑路线！',
    goal: '在正前方落子实现【镇头封锁】',
    hint: '点击小白兔正前方空一格的天元中心(2,2)，盖上大帽子！',
    solutionMoves: [{ r: 2, c: 2 }],
    setup: () => {
      const b = createEmptyBoard(5);
      b[4][2] = 'white'; // 底部小兔，拥有 (3, 2) 等多气，合规
      b[4][1] = 'black';
      b[4][3] = 'black';
      return b;
    },
  },
  {
    id: 13,
    chapter: 2,
    title: '终极大决战·7x7森林之王',
    badge: '👑',
    boardSize: 7,
    playerColor: 'black',
    story: '恭喜你！你已经掌握了全部围棋吃子小神技！现在来到辽阔的 7×7 森林，与机灵小狐狸进行终极较量，率先吃掉 2 颗棋子即可登顶【围棋小萌主】！加油！',
    voiceText: '终极大决战开始啦！率先吃掉两颗棋子，登顶围棋小萌主！',
    goal: '在 7×7 实战中率先吃掉对方 2 颗子',
    hint: '运用学到的门吃、抱吃、扭羊头绝招，步步为营！',
    targetCaptures: 2,
    setup: () => {
      return createEmptyBoard(7);
    },
  },
];
