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

console.log('--- 开始测试 5岁儿童围棋逻辑引擎与全部13关卡 ---');

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
assert(LEVELS.length === 13, '关卡总数应为 13 关');
for (const lvl of LEVELS) {
  const b = lvl.setup();
  const groups = getAllGroups(b);
  for (const group of groups) {
    assert(group.liberties.length >= 1, `关卡 ${lvl.id} 不能出现 0 气死子`);
  }
}
console.log('✅ 测试 2 通过：全部 13 关初始无任何 0 气死子');

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

// 测试 5：第 9 关扭羊头·连环征子完整推演
const lvl9 = LEVELS.find(l => l.id === 9)!;
let b9 = lvl9.setup();
// 步 1: 黑走 (3, 2) 往下打吃
const m1 = playMove(b9, 3, 2, 'black');
assert(m1.valid, '征子步1黑落子有效');
b9 = m1.newBoard;
// 白兔挣扎逃一步到 (2, 3)
const w1 = playMove(b9, 2, 3, 'white');
assert(w1.valid, '白兔逃跑有效');
b9 = w1.newBoard;

// 步 2: 黑走 (2, 4) 盖帽打吃
const m2 = playMove(b9, 2, 4, 'black');
assert(m2.valid, '征子步2黑落子有效');
b9 = m2.newBoard;
// 白兔再次挣扎逃跑至 (3, 3)
const w2 = playMove(b9, 3, 3, 'white');
assert(w2.valid, '白兔步2逃跑有效');
b9 = w2.newBoard;

// 步 3: 黑走 (4, 3) 迎头提吃整串！
const m3 = playMove(b9, 4, 3, 'black');
assert(m3.valid, '征子终极一步有效');
assert(m3.captured.length === 3, `应一举提吃整串 3 颗白兔，实际提吃: ${m3.captured.length}`);
console.log('✅ 测试 5 通过：第 9 关【小羊扭头·连环征子】3步完整征子提吃 3 颗白兔大成功！');

// 测试 6：第 10 关双打吃
const lvl10 = LEVELS.find(l => l.id === 10)!;
const b10 = lvl10.setup();
const res10 = playMove(b10, 2, 2, 'black');
assert(res10.valid, '双打吃落子合法');
const gA = getGroupAndLiberties(res10.newBoard, 2, 1)!;
const gB = getGroupAndLiberties(res10.newBoard, 1, 2)!;
assert(gA.liberties.length === 1 && gB.liberties.length === 1, '应同时使两只白兔变为1气');
console.log('✅ 测试 6 通过：第 10 关【双打吃】验证成功');

// 测试 7：第 11 关反提救猫
const lvl11 = LEVELS.find(l => l.id === 11)!;
const b11 = lvl11.setup();
const res11 = playMove(b11, 1, 1, 'black');
assert(res11.valid && res11.captured.length === 1, '反提应吃掉白兔');
console.log('✅ 测试 7 通过：第 11 关【反提救猫】验证成功');

console.log('🎉 全部 13 个关卡与扭羊头核心手筋严格逻辑验证通过！');
