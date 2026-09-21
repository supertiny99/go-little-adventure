import {
  createEmptyBoard,
  playMove,
  getGroupAndLiberties,
} from './goLogic';
import { LEVELS } from '../data/levels';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Test failed: ${message}`);
  }
}

console.log('--- 开始测试 5岁儿童围棋逻辑引擎与全部12关卡 ---');

// 测试 1：基础气数计算
const b1 = createEmptyBoard(5);
b1[0][0] = 'black';
b1[0][2] = 'black';
b1[2][2] = 'black';
assert(getGroupAndLiberties(b1, 0, 0)?.liberties.length === 2, '角上单子应为 2 气');
assert(getGroupAndLiberties(b1, 0, 2)?.liberties.length === 3, '边上单子应为 3 气');
assert(getGroupAndLiberties(b1, 2, 2)?.liberties.length === 4, '中央单子应为 4 气');
console.log('✅ 测试 1 通过：气数计算正确');

// 测试 2：关卡配置全面自检
assert(LEVELS.length === 12, '关卡总数应为 12 关');
for (const lvl of LEVELS) {
  const b = lvl.setup();
  assert(b.length === lvl.boardSize, `关卡 ${lvl.id} 棋盘尺寸应为 ${lvl.boardSize}`);
  if (lvl.solutionMoves && lvl.solutionMoves.length > 0) {
    for (const m of lvl.solutionMoves) {
      assert(
        m.r >= 0 && m.r < lvl.boardSize && m.c >= 0 && m.c < lvl.boardSize,
        `关卡 ${lvl.id} 正解坐标 (${m.r}, ${m.c}) 超出盘面范围`
      );
    }
  }
}
console.log('✅ 测试 2 通过：全部 12 个关卡配置校验无误');

// 测试 3：第 7 关门吃实战验证
const lvl7 = LEVELS.find(l => l.id === 7)!;
const b7 = lvl7.setup();
const res7 = playMove(b7, lvl7.solutionMoves![0].r, lvl7.solutionMoves![0].c, 'black');
assert(res7.valid, '第 7 关门吃落子应合法');
assert(res7.captured.length >= 1, '第 7 关门吃应成功吃掉白兔');
console.log('✅ 测试 3 通过：第 7 关【门吃】验证成功，吃子数: ' + res7.captured.length);

// 测试 4：第 8 关抱吃实战验证
const lvl8 = LEVELS.find(l => l.id === 8)!;
const b8 = lvl8.setup();
const res8 = playMove(b8, lvl8.solutionMoves![0].r, lvl8.solutionMoves![0].c, 'black');
assert(res8.valid, '第 8 关抱吃落子应合法');
assert(res8.captured.length >= 1, '第 8 关抱吃应成功吃掉白兔');
console.log('✅ 测试 4 通过：第 8 关【抱吃】验证成功，吃子数: ' + res8.captured.length);

// 测试 5：第 10 关反提救猫验证
const lvl10 = LEVELS.find(l => l.id === 10)!;
const b10 = lvl10.setup();
const res10 = playMove(b10, lvl10.solutionMoves![0].r, lvl10.solutionMoves![0].c, 'black');
assert(res10.valid, '第 10 关反提落子应合法');
assert(res10.captured.length >= 1, '第 10 关反提应成功吃掉白兔解救黑猫');
console.log('✅ 测试 5 通过：第 10 关【反提救猫】验证成功');

console.log('🎉 全部 12 个启蒙关卡与围棋核心手筋测试 100% 通过！');
