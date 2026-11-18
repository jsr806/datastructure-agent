import test from 'node:test';
import assert from 'node:assert/strict';
import { handleCreateGraphRun } from '../backend/src/routes/runs.js';
import { validateRun } from '../frontend/src/features/workbench/input.js';
import { describeGraphStep } from '../frontend/src/features/visualization/graph-explanation.js';

function runGraph(algorithm, input) {
  const response = {
    writeHead(status) { this.status = status; },
    end(body) { this.body = JSON.parse(body); },
  };
  handleCreateGraphRun(response, JSON.stringify(input), algorithm);
  assert.equal(response.status, 200, JSON.stringify(response.body));
  return validateRun(response.body, algorithm);
}

test('Floyd 区分小数零权环和真实负权环', () => {
  const input = {
    nodes: ['A', 'B', 'C'],
    directed: true,
    edges: [['A', 'B', 0.3], ['B', 'C', -0.1], ['C', 'A', -0.2]],
  };
  const zero = runGraph('floyd', input);
  assert.deepEqual(zero.result, ['0, 0.3, 0.2', '-0.3, 0, -0.1', '-0.2, 0.1, 0']);
  assert.deepEqual(zero.steps.at(-1).result, zero.result);

  input.edges[2][2] = -0.20000000000000004;
  const negative = runGraph('floyd', input);
  assert.equal(negative.result, 'Has Negative Cycle');
  assert.equal(negative.steps.at(-1).lineId, 'negative-cycle');
});

test('Floyd 的矩阵和讲解共享精确的候选距离', () => {
  const nodes = ['A', 'B', 'C', 'D'];
  const run = runGraph('floyd', {
    nodes, directed: true, edges: [['A', 'B', 0.1], ['B', 'C', 0.2]],
  });
  const update = run.steps.find(step => step.event === 'update');
  assert.equal(update.variables.candidateDistance, '0.3');
  assert.equal(run.result[0], '0, 0.1, 0.3, ∞');
  assert.match(describeGraphStep(run, update).detail, /0\.1 \+ 0\.2 = 0\.3，/);

  const scientific = runGraph('floyd', {
    nodes, directed: true, edges: [['A', 'B', 1e-7], ['B', 'C', 2e-7]],
  });
  assert.equal(scientific.result[0], '0, 0.0000001, 0.0000003, ∞');
});

test('Kruskal 保存含连字符顶点名的完整选边', () => {
  const edges = [['A-B', 'C', 1], ['A', 'B-C', 2]];
  const run = runGraph('kruskal', {
    nodes: ['A-B', 'C', 'A', 'B-C'], directed: false, edges,
  });
  assert.deepEqual(run.result, { selectedEdges: edges, totalWeight: 3, isForest: true });
  assert.deepEqual(run.steps.at(-1).variables.selectedEdges, edges);
  assert.deepEqual(run.steps.find(step => step.event === 'sort').variables.sortedEdges, edges);
  assert.deepEqual(run.steps.find(step => step.event === 'union').variables.selectedEdges, [edges[0]]);
  assert.deepEqual(run.steps[0].variables.selectedEdges, []);
});
