// tests/final-e.test.mjs
// E 包（线性表与数组）验收测试：预期值按任务单样例人工推演，不调用被测实现生成标准答案。
import assert from 'node:assert/strict';
import test from 'node:test';

import { generateSparseMatrixTransposeSteps } from '../shared/algorithms/final/e/sparse-matrix-transpose.js';

/** 通用不变量：编号连续、首步 init、末步 done、lineId 有效、非结束步不带 result。 */
function assertStepInvariants(run, label) {
  assert.ok(run.steps.length >= 2, `${label}: 步骤过少`);
  const lineIds = new Set(run.sourceLines.map((line) => line.lineId));
  run.steps.forEach((step, index) => {
    assert.equal(step.stepIndex, index, `${label}: stepIndex 不连续`);
    assert.equal(step.schemaVersion, '1.0', `${label}: schemaVersion 错误`);
    assert.equal(step.sourceVersion, run.sourceVersion, `${label}: sourceVersion 不一致`);
    assert.ok(lineIds.has(step.lineId), `${label}: lineId ${step.lineId} 不在 sourceLines`);
    assert.ok(typeof step.description === 'string' && step.description.length > 0, `${label}: description 为空`);
    if (!step.done) assert.equal(step.result, null, `${label}: 非结束步不应带 result`);
  });
  assert.equal(run.steps[0].event, 'init', `${label}: 首步应为 init`);
  assert.equal(run.steps.filter((s) => s.done).length, 1, `${label}: done 步应唯一`);
  assert.equal(run.steps.at(-1).done, true, `${label}: 末步应 done`);
}

/** 展示代码结构检查：拼起来后花括号配平、不提前闭合、lineId 不重复。 */
function assertSourceBalanced(run, label) {
  const ids = run.sourceLines.map((line) => line.lineId);
  assert.equal(new Set(ids).size, ids.length, `${label}: lineId 重复`);
  const code = run.sourceLines.map((line) => line.text).join('\n');
  let depth = 0;
  let minDepth = 0;
  for (const ch of code) {
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      minDepth = Math.min(minDepth, depth);
    }
  }
  assert.equal(depth, 0, `${label}: 花括号未配平`);
  assert.equal(minDepth, 0, `${label}: 花括号提前闭合`);
}

const triple = (t) => `(${t.i},${t.j},${t.e})`;

test('稀疏矩阵转置：乱序输入按快速转置三步走，输出保持行优先', () => {
  const run = generateSparseMatrixTransposeSteps({
    rows: 3,
    cols: 2,
    triples: [{ i: 2, j: 1, e: 9 }, { i: 0, j: 1, e: 8 }, { i: 1, j: 0, e: 4 }],
  });
  assertStepInvariants(run, '乱序样例');
  assertSourceBalanced(run, '乱序样例');

  // 原列计数：[第0列 1 个，第1列 2 个]
  const countSteps = run.steps.filter((s) => s.event === 'count_column');
  assert.equal(countSteps.length, 3, '每个三元组各记一次列计数');
  assert.deepEqual(countSteps.at(-1).variables.num, [1, 2], '原列计数应为 [1,2]');

  // 起始下标 = 前缀和
  const startStep = run.steps.find((s) => s.event === 'start_positions');
  assert.ok(startStep, '缺少起始下标步骤');
  assert.deepEqual(startStep.variables.cpos, [0, 1], '起始下标应为 [0,1]');

  // 逐项写入：每个三元组一步
  const writeSteps = run.steps.filter((s) => s.event === 'write_out');
  assert.equal(writeSteps.length, 3, '每个三元组各记一次写入');

  assert.deepEqual(run.result, {
    rows: 2,
    cols: 3,
    triples: [{ i: 0, j: 1, e: 4 }, { i: 1, j: 0, e: 8 }, { i: 1, j: 2, e: 9 }],
  });
  assert.deepEqual(run.steps.at(-1).result, run.result);
  assert.equal(run.result.triples.map(triple).join(' '), '(0,1,4) (1,0,8) (1,2,9)');
});

test('稀疏矩阵转置：非方阵（2×4 → 4×2）', () => {
  const run = generateSparseMatrixTransposeSteps({
    rows: 2,
    cols: 4,
    triples: [{ i: 1, j: 3, e: 7 }, { i: 0, j: 1, e: 5 }],
  });
  assertStepInvariants(run, '非方阵');
  assert.deepEqual(run.result, {
    rows: 4,
    cols: 2,
    triples: [{ i: 1, j: 0, e: 5 }, { i: 3, j: 1, e: 7 }],
  });
});

test('稀疏矩阵转置：空矩阵原样返回空三元组', () => {
  const run = generateSparseMatrixTransposeSteps({ rows: 2, cols: 2, triples: [] });
  assertStepInvariants(run, '空矩阵');
  assert.deepEqual(run.result, { rows: 2, cols: 2, triples: [] });
  assert.equal(run.steps.filter((s) => s.event === 'count_column').length, 0);
});

test('稀疏矩阵转置：拒绝重复坐标', () => {
  const run = generateSparseMatrixTransposeSteps({
    rows: 3,
    cols: 3,
    triples: [{ i: 0, j: 0, e: 1 }, { i: 0, j: 0, e: 2 }],
  });
  assert.equal(run.result, null, '重复坐标必须拒绝');
  const last = run.steps.at(-1);
  assert.equal(last.event, 'error');
  assert.equal(last.lineId, 'duplicate-check');
});

test('稀疏矩阵转置：拒绝非法元素与越界坐标', () => {
  const cases = [
    { rows: 1, cols: 1, triples: [{ i: 0, j: 0, e: 'x' }], why: '非数值元素' },
    { rows: 1, cols: 1, triples: [{ i: 0, j: 0, e: Number.NaN }], why: 'NaN 元素' },
    { rows: 1, cols: 1, triples: [{ i: 0.5, j: 0, e: 1 }], why: '非整数行号' },
    { rows: 2, cols: 2, triples: [{ i: 2, j: 0, e: 1 }], why: '行号越界' },
    { rows: 2, cols: 2, triples: [{ i: 0, j: -1, e: 1 }], why: '列号为负' },
  ];
  for (const c of cases) {
    const run = generateSparseMatrixTransposeSteps({ rows: c.rows, cols: c.cols, triples: c.triples });
    assert.equal(run.result, null, `${c.why}: 应被拒绝`);
    assert.equal(run.steps.at(-1).event, 'error', `${c.why}: 末步应为 error`);
    assert.equal(run.steps.at(-1).lineId, 'validate', `${c.why}: 应落在 validate 行`);
  }
});

test('稀疏矩阵转置：展示源码不依赖 <algorithm> 与 std::sort（适配 Open Watcom）', () => {
  const run = generateSparseMatrixTransposeSteps({ rows: 2, cols: 2, triples: [{ i: 0, j: 1, e: 3 }] });
  const code = run.sourceLines.map((line) => line.text).join('\n');
  assert.ok(!code.includes('#include <algorithm>'), '不得引入 <algorithm>');
  assert.ok(!code.includes('std::sort'), '不得使用 std::sort');
  assert.ok(code.includes('rowSort'), '应使用手写排序代替 std::sort');
});
