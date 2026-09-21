import { type BoardState, createEmptyBoard, type Point, type StoneColor } from '../engine/goLogic';

export interface Level {
  id: number;
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

export const LEVELS: Level[] = [
  {
    id: 1,
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
      // 只剩右边 (1, 2)
      return b;
    },
  },
  {
    id: 3,
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
      // 下方 (1, 0) 为唯一出口
      return b;
    },
  },
  {
    id: 4,
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
      // 白棋围成包围圈把 (2,2) 围住
      b[1][2] = 'white';
      b[3][2] = 'white';
      b[2][1] = 'white';
      b[2][3] = 'white';
      return b;
    },
  },
  {
    id: 6,
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
];
