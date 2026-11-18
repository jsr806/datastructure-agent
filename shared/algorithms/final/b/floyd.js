import { validateGraphInput } from './validate-util.js';

const SOURCE_VERSION = 'floyd-c-v3';
const SOURCE_LINES = [
  { lineId: 'distance-type', text: 'template <typename Distance>' },
  { lineId: 'init', text: 'bool floyd(Distance *dist[], const Distance &infinity, int n) {' },
  { lineId: 'loop-k', text: '  for (int k = 0; k < n; k++) {' },
  { lineId: 'loop-i', text: '    for (int i = 0; i < n; i++) {' },
  { lineId: 'loop-j', text: '      for (int j = 0; j < n; j++) {' },
  { lineId: 'relax', text: '        if (dist[i][k] == infinity || dist[k][j] == infinity) continue;' },
  { lineId: 'candidate', text: '        Distance candidate = dist[i][k] + dist[k][j];' },
  { lineId: 'update', text: '        if (dist[i][j] == infinity || candidate < dist[i][j]) dist[i][j] = candidate;' },
  { lineId: 'close-loops', text: '      }\n    }\n  }' },
  { lineId: 'negative-cycle', text: '  for (int i = 0; i < n; i++) if (dist[i][i] < 0) return false;' },
  { lineId: 'end', text: '  return true;\n}' }
];

function decimalParts(weight) {
  const [mantissa, exponent = '0'] = String(weight).split('e');
  const [whole, fraction = ''] = mantissa.split('.');
  return { units: BigInt(whole + fraction), places: fraction.length - Number(exponent) };
}

function formatDistance(value, places) {
  if (value === null) return '∞';
  if (places === 0) return String(value);
  const negative = value < 0n;
  const digits = String(negative ? -value : value).padStart(places + 1, '0');
  const whole = digits.slice(0, -places);
  const fraction = digits.slice(-places).replace(/0+$/, '');
  return (negative ? '-' : '') + whole + (fraction ? '.' + fraction : '');
}

export function generateFloydSteps(input) {
  const validEdges = validateGraphInput(input, 'Floyd', true);
  const { nodes, directed } = input;
  
  const n = nodes.length;
  const nodeIndex = new Map(nodes.map((node, i) => [node, i]));
  const dist = Array.from({ length: n }, () => Array(n).fill(null));
  const weights = validEdges.map(({ w }) => decimalParts(w));
  const places = weights.reduce((max, weight) => Math.max(max, weight.places), 0);
  
  for (let i = 0; i < n; i++) dist[i][i] = 0n;

  function setEdge(from, to, weight) {
    if (dist[from][to] === null || weight < dist[from][to]) dist[from][to] = weight;
  }
  validEdges.forEach(({ u, v }, index) => {
    const ui = nodeIndex.get(u);
    const vi = nodeIndex.get(v);
    const { units, places: edgePlaces } = weights[index];
    const weight = units * 10n ** BigInt(places - edgePlaces);
    setEdge(ui, vi, weight);
    if (!directed) setEdge(vi, ui, weight);
  });

  const steps = [];
  function formatMatrix() { return dist.map(row => row.map(value => formatDistance(value, places)).join(', ')); }

  function record(event, lineId, description, { k = null, i = null, j = null, candidate = null, result = null } = {}) {
    const done = event === 'end';
    steps.push({
      schemaVersion: '1.0', algorithm: 'floyd', stepIndex: steps.length,
      sourceVersion: SOURCE_VERSION, event, lineId,
      variables: {
        matrix: formatMatrix(),
        currentK: k === null ? null : nodes[k],
        currentI: i === null ? null : nodes[i],
        currentJ: j === null ? null : nodes[j],
        candidateDistance: j === null ? null : formatDistance(candidate, places),
      },
      description, done, result
    });
  }

  record('init', 'init', '初始化 Floyd，边权按共同的十进制精度换算为定点整数。');
  record('init-dist', 'init', '录入边权并初始化距离矩阵，未连通的位置标为 ∞。');

  for (let k = 0; k < n; k++) {
    record('loop-k', 'loop-k', `中转点 k = ${nodes[k]}。`, { k });
    for (let i = 0; i < n; i++) {
      record('loop-i', 'loop-i', `起点 i = ${nodes[i]}。`, { k, i });
      for (let j = 0; j < n; j++) {
        const left = dist[i][k], right = dist[k][j];
        const candidate = left === null || right === null ? null : left + right;
        record('loop-j', 'loop-j', `终点 j = ${nodes[j]}。`, { k, i, j, candidate });

        if (candidate !== null && (dist[i][j] === null || candidate < dist[i][j])) {
          dist[i][j] = candidate;
          record('update', 'update', `更新 ${nodes[i]}->${nodes[j]} 为 ${formatDistance(candidate, places)}。`, { k, i, j, candidate });
        }
      }
    }
  }

  const hasNegativeCycle = dist.some((row, index) => row[index] < 0n);
  const finalResult = hasNegativeCycle ? 'Has Negative Cycle' : formatMatrix();
  record('end', hasNegativeCycle ? 'negative-cycle' : 'end',
    hasNegativeCycle ? '对角线发现负数，存在负权环！' : 'Floyd 结束。', { result: finalResult });
  return { steps, result: finalResult, sourceVersion: SOURCE_VERSION, sourceLines: SOURCE_LINES };
}
