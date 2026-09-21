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
assert(LEVELS.length === 12, '关卡总数应为 12 关');
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
const res8 = playMove(b8, 2, 3, 'black');
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

// 测试 7：AI 智能决策测试 - 绝不盲目落入虎口送死
import { getAiMove } from './ai';
const bTiger = createEmptyBoard(5);
// 黑棋摆出三面虎口，留 (1,1) 一处陷阱
bTiger[0][1] = 'black';
bTiger[1][0] = 'black';
bTiger[2][1] = 'black';
// 此时若白棋在 (1,1) 盲目落子，直接处于只剩 1 口气（即 (1,2)）的极度危险中
const aiDecision = getAiMove(bTiger, 'white', 'medium');
assert(
  aiDecision.point !== null && !(aiDecision.point.r === 1 && aiDecision.point.c === 1),
  'AI 应聪明避开自投虎口的 (1,1) 陷阱'
);
console.log('✅ 测试 7 通过：轻量增强 AI 成功识破陷阱，避开盲目送死！');

// 测试 8：AI 智能决策测试 - 抓住 100% 提子机会
const bCap = createEmptyBoard(5);
bCap[1][1] = 'black'; // 黑子只剩 (1,2) 一口气
bCap[0][1] = 'white';
bCap[2][1] = 'white';
bCap[1][0] = 'white';
const aiCapDecision = getAiMove(bCap, 'white', 'medium');
assert(
  aiCapDecision.point?.r === 1 && aiCapDecision.point?.c === 2,
  'AI 应精准落在 (1,2) 提掉濒危黑子'
);
console.log('✅ 测试 8 通过：AI 精准锁定叫吃提子要点！');

console.log('🎉 全部 12 个关卡与轻量增强 AI 决策引擎 100% 验证通过！');
