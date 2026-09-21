import {
  createEmptyBoard,
  playMove,
  getGroupAndLiberties,
} from './goLogic';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Test failed: ${message}`);
  }
}

console.log('--- 开始测试 5岁儿童围棋逻辑引擎 ---');

// 测试 1：角部、边部、中央单子气数
const b1 = createEmptyBoard(5);
b1[0][0] = 'black'; // 角上
b1[0][2] = 'black'; // 边上
b1[2][2] = 'black'; // 中央

const cornerGroup = getGroupAndLiberties(b1, 0, 0);
assert(cornerGroup !== null && cornerGroup.liberties.length === 2, '角上单子应为 2 气');

const edgeGroup = getGroupAndLiberties(b1, 0, 2);
assert(edgeGroup !== null && edgeGroup.liberties.length === 3, '边上单子应为 3 气');

const centerGroup = getGroupAndLiberties(b1, 2, 2);
assert(centerGroup !== null && centerGroup.liberties.length === 4, '中央单子应为 4 气');
console.log('✅ 测试 1 通过：气数计算正确 (角2气/边3气/中央4气)');

// 测试 2：一步吃子 (Atari Capture)
const b2 = createEmptyBoard(3);
b2[1][1] = 'white'; // 中间白子
b2[0][1] = 'black';
b2[2][1] = 'black';
b2[1][0] = 'black';
// 此时白子剩 (1, 2) 一口气

const capRes = playMove(b2, 1, 2, 'black');
assert(capRes.valid, '落子应合法');
assert(capRes.captured.length === 1, '应成功吃掉 1 颗白子');
assert(capRes.captured[0].r === 1 && capRes.captured[0].c === 1, '吃掉的坐标应为 (1, 1)');
assert(capRes.newBoard[1][1] === null, '盘面上白子已被提空');
console.log('✅ 测试 2 通过：吃子 (Capture) 提子逻辑正确');

// 测试 3：自杀/禁着点判断
const b3 = createEmptyBoard(3);
b3[0][1] = 'white';
b3[2][1] = 'white';
b3[1][0] = 'white';
b3[1][2] = 'white';
// 中心 (1,1) 已被白棋四周堵死，黑棋如果落入 (1,1) 是无气且不能吃对方的禁着点

const suicideRes = playMove(b3, 1, 1, 'black');
assert(!suicideRes.valid, '禁着点（无气自杀）应该被拒绝');
console.log('✅ 测试 3 通过：禁着点 (Suicide move) 判定拦截正确');

console.log('🎉 全部围棋规则核心测试通过！');
