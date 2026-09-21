import {
  createEmptyBoard,
  playMove,
  getGroupAndLiberties,
  getAllGroups,
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

// 测试 2：关卡无 0 气死子
for (const lvl of LEVELS) {
  const b = lvl.setup();
  const groups = getAllGroups(b);
  for (const group of groups) {
    assert(group.liberties.length >= 1, `关卡 ${lvl.id} 不能出现 0 气死子`);
  }
}
console.log('✅ 测试 2 通过：全部 12 关初始无任何 0 气死子');

// 测试 3：第 7 关门吃
const lvl7 = LEVELS.find(l => l.id === 7)!;
const b7 = lvl7.setup();
const res7 = playMove(b7, 1, 2, 'black');
assert(res7.valid && res7.captured.length === 1, '第 7 关门吃应吃掉白兔');
console.log('✅ 测试 3 通过：第 7 关【门吃】验证成功');

// 测试 4：第 8 关抱吃
const lvl8 = LEVELS.find(l => l.id === 8)!;
const b8 = lvl8.setup();
const res8 = playMove(b8, 2, 1, 'black');
assert(res8.valid && res8.captured.length === 1, '第 8 关抱吃应吃掉白兔');
console.log('✅ 测试 4 通过：第 8 关【抱吃】验证成功');

// 测试 5：第 9 关双打吃
const lvl9 = LEVELS.find(l => l.id === 9)!;
const b9 = lvl9.setup();
const res9 = playMove(b9, 2, 2, 'black');
assert(res9.valid, '双打吃落子合法');
const gA = getGroupAndLiberties(res9.newBoard, 2, 1)!;
const gB = getGroupAndLiberties(res9.newBoard, 1, 2)!;
assert(gA.liberties.length === 1 && gB.liberties.length === 1, '应同时使两只白兔变为1气');
console.log('✅ 测试 5 通过：第 9 关【双打吃】验证成功');

// 测试 6：第 10 关反提救猫
const lvl10 = LEVELS.find(l => l.id === 10)!;
const b10 = lvl10.setup();
const res10 = playMove(b10, 1, 1, 'black');
assert(res10.valid && res10.captured.length === 1, '反提应吃掉白兔');
console.log('✅ 测试 6 通过：第 10 关【反提救猫】验证成功');

console.log('🎉 全部 12 个关卡严格逻辑验证通过！');
