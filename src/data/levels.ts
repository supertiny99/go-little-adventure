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
  // --- 第一章：呼吸与基础篇 ---
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
      b[1][1] = 'white';
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
      b[1][1] = 'white'; // 目标在中间
      b[0][1] = 'black'; // 上
      b[2][1] = 'black'; // 下
      b[1][0] = 'black'; // 左
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
      b[0][0] = 'white'; // 角落小白兔
      b[0][1] = 'black'; // 右边已堵
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
      b[2][2] = 'black'; // 居中黑猫
      b[2][1] = 'white'; // 左右被白兔挤住
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

  // --- 第二章：吃子小神技篇 ---
  {
    id: 7,
    chapter: 2,
    title: '关门大吉·门吃',
    badge: '🚪',
    boardSize: 5,
    playerColor: 'black',
    story: '两只小黑猫已经在左右两侧站好了，就像胡同的两堵墙！小白兔正急匆匆往胡同口逃跑。小黑猫快在它的正前方把大门关上（门吃），把它捉拿归案！',
    voiceText: '小白兔想从胡同口溜出去，快在正前方把大门关上，门吃胜利！',
    goal: '使用【门吃】在正前方关门捉兔',
    hint: '下在小白兔正前方的出口(1,2)，关上胡同大门！',
    targetCaptures: 1,
    solutionMoves: [{ r: 1, c: 2 }],
    setup: () => {
      const b = createEmptyBoard(5);
      b[2][2] = 'white'; // 中间企图逃跑的小白兔
      b[3][2] = 'black'; // 后方黑猫封路
      b[1][1] = 'black'; // 左门框
      b[2][1] = 'black';
      b[1][3] = 'black'; // 右门框
      b[2][3] = 'black';
      // 唯一出口正前方 (1, 2)
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
    story: '小白兔快被逼到绝境了，它想往左边溜走。小黑猫不要直接追在屁股后面，而是从左侧迎上去给它一个大拥抱（抱吃），直接把它抱进包围圈里！',
    voiceText: '从侧面迎上去给它一个大拥抱，抱吃成功！',
    goal: '使用【抱吃】封住逃跑侧翼并吃子',
    hint: '落在小白兔逃跑的侧面(2,1)，张开双臂抱住它！',
    targetCaptures: 1,
    solutionMoves: [{ r: 2, c: 1 }],
    setup: () => {
      const b = createEmptyBoard(5);
      b[2][2] = 'white'; // 目标白兔
      b[1][2] = 'black'; // 上方有黑猫
      b[3][2] = 'black'; // 下方有黑猫
      b[2][3] = 'black'; // 右方有黑猫
      // 唯一出口在左侧 (2, 1)
      return b;
    },
  },
  {
    id: 9,
    chapter: 2,
    title: '一箭双雕·双打吃',
    badge: '🎯',
    boardSize: 5,
    playerColor: 'black',
    story: '仔细瞧！这里有两只贪玩的小白兔，每只都只剩最后 2 扇门。神奇的小黑猫只要落下一子在中间，就能同时叫吃两只兔子！这就是传说中的【双打吃】！',
    voiceText: '看准正中间的位置，一箭双雕，同时抓住两只兔子的小尾巴！',
    goal: '落下一子同时打吃两只白兔',
    hint: '点击正中间(2,2)的十字路口，同时给两边的白兔带来致命威胁！',
    solutionMoves: [{ r: 2, c: 2 }],
    setup: () => {
      const b = createEmptyBoard(5);
      // 左白兔 (2, 1)
      b[2][1] = 'white';
      b[1][1] = 'black';
      b[3][1] = 'black';
      b[2][0] = 'black';
      // 右白兔 (2, 3)
      b[2][3] = 'white';
      b[1][3] = 'black';
      b[3][3] = 'black';
      b[2][4] = 'black';
      // 共同唯一气口在中间 (2, 2)
      return b;
    },
  },
  {
    id: 10,
    chapter: 2,
    title: '先下手为强·反提救猫',
    badge: '⚡',
    boardSize: 5,
    playerColor: 'black',
    story: '不好了！中间的小黑猫被包围，只剩最后一口气（被打吃）！但请擦亮眼睛：包围它的其中一只白兔也只剩一口气！快先下手吃掉白兔，小黑猫就立刻安全啦！',
    voiceText: '别慌张！敌人也只剩一口气了，先下手为强，救出小黑猫！',
    goal: '吃掉危险的白兔，成功反提解救小黑猫',
    hint: '找到只有一口气的白兔(2,3)，落在(1,3)先吃掉它！',
    targetCaptures: 1,
    solutionMoves: [{ r: 1, c: 3 }],
    setup: () => {
      const b = createEmptyBoard(5);
      b[2][2] = 'black'; // 陷入危险的小黑猫
      b[1][2] = 'white';
      b[3][2] = 'white';
      b[2][1] = 'white';
      // 右侧白兔 (2, 3) 自身也很脆弱
      b[2][3] = 'white';
      b[3][3] = 'black';
      b[2][4] = 'black';
      // 白兔在 (1, 3) 是它最后一口气！黑棋下在此处即可先提掉 (2, 3)
      return b;
    },
  },
  {
    id: 11,
    chapter: 2,
    title: '扣上大草帽·镇头封锁',
    badge: '👒',
    boardSize: 5,
    playerColor: 'black',
    story: '小白兔探出小脑袋，正一步步想往大路狂奔！我们在它正前方空一格的位置（天元），像扣大草帽一样落下一子，居高临下封锁它的逃跑路线！',
    voiceText: '给小白兔扣上一顶大草帽，阻挡它的逃跑路线！',
    goal: '在正前方落子实现【镇头封锁】',
    hint: '点击小白兔正前方空一格的天元中心(2,2)，盖上大帽子！',
    solutionMoves: [{ r: 2, c: 2 }],
    setup: () => {
      const b = createEmptyBoard(5);
      b[4][2] = 'white'; // 底部小兔
      b[4][1] = 'black';
      b[4][3] = 'black';
      // 正前方天元 (2, 2) 镇头
      return b;
    },
  },
  {
    id: 12,
    chapter: 2,
    title: '终极大决战·7x7森林之王',
    badge: '👑',
    boardSize: 7,
    playerColor: 'black',
    story: '恭喜你！你已经掌握了全部围棋吃子小神技！现在来到辽阔的 7×7 森林，与机灵小狐狸进行终极较量，率先吃掉 2 颗棋子即可登顶【围棋小萌主】！加油！',
    voiceText: '终极大决战开始啦！率先吃掉两颗棋子，登顶围棋小萌主！',
    goal: '在 7×7 实战中率先吃掉对方 2 颗子',
    hint: '运用学到的门吃、抱吃与打吃绝招，步步为营！',
    targetCaptures: 2,
    setup: () => {
      return createEmptyBoard(7);
    },
  },
];
