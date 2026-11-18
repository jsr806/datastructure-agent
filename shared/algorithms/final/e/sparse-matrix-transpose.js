// shared/algorithms/final/e/sparse-matrix-transpose.js
const SOURCE_VERSION = 'sparse-transpose-c-v1';
const SOURCE_LINES = [
  { lineId: 'init', text: 'void sparse_transpose(TSMatrix A, TSMatrix *B) {' },
  { lineId: 'assign-meta', text: '  B->mu = A.nu; B->nu = A.mu; B->tu = A.tu;' },
  { lineId: 'judge-zero', text: '  if (B->tu == 0) return;' },
  { lineId: 'col-loop', text: '  int q = 0; for(int col=0; col<A.nu; col++)' },
  { lineId: 'scan-item', text: '    for(int p=0; p<A.tu; p++)' },
  { lineId: 'match-col', text: '      if(A.data[p].j == col) {' },
  { lineId: 'assign-val', text: '        B->data[q].i = A.data[p].j;' },
  { lineId: 'assign-col', text: '        B->data[q].j = A.data[p].i;' },
  { lineId: 'assign-num', text: '        B->data[q].e = A.data[p].e; q++;' },
  { lineId: 'done', text: '}' },
];

/**
 * 稀疏矩阵（三元组表）普通转置轨迹生成
 * @param {{rows: number, cols: number, triples: {i:number,j:number,e:number}[]}} input
 * @returns {Array} steps
 */
export function generateSparseMatrixTransposeSteps(input) {
  const { rows, cols, triples } = input;
  const steps = [];
  const A = { mu: rows, nu: cols, tu: triples.length, data: JSON.parse(JSON.stringify(triples)) };
  const B = { mu: A.nu, nu: A.mu, tu: A.tu, data: [] };

  function record(event, lineId, description, extraVars = {}) {
    const done = event === 'sorted';
    steps.push({
      schemaVersion: '1.0',
      algorithm: 'sparse-matrix-transpose',
      stepIndex: steps.length,
      sourceVersion: SOURCE_VERSION,
      event,
      lineId,
      array: [],
      variables: {
        A: JSON.parse(JSON.stringify(A)),
        B: JSON.parse(JSON.stringify(B)),
        ...extraVars,
      },
      description,
      done,
      result: done ? JSON.parse(JSON.stringify(B)) : null,
    });
  }

  record('init', 'init', `原始稀疏矩阵：${A.mu}行${A.nu}列，非零元数量${A.tu}`);

  record('assign-meta', 'assign-meta', `转置矩阵：行数=${B.mu}，列数=${B.nu}，非零元个数=${B.tu}`);

  if (B.tu === 0) {
    record('judge-zero', 'judge-zero', '没有非零元素，转置结果为空三元组');
    record('sorted', 'done', '稀疏矩阵转置完成，无元素');
    return steps;
  }

  let q = 0;
  record('col-loop', 'col-loop', `开始按原矩阵列优先遍历，q=${q}`, { q });
  for (let col = 0; col < A.nu; col++) {
    for (let p = 0; p < A.tu; p++) {
      const item = A.data[p];
      record('scan-item', 'scan-item', `扫描A.data[${p}] = (${item.i},${item.j},${item.e})，当前目标列col=${col}`, { col, p, q });
      if (item.j === col) {
        record('match-col', 'match-col', `匹配到列号col=${col}`);
        B.data[q] = { i: item.j, j: item.i, e: item.e };
        record('assign-val', 'assign-val', `B.data[${q}].i = ${item.j}`);
        record('assign-col', 'assign-col', `B.data[${q}].j = ${item.i}`);
        record('assign-num', 'assign-num', `B.data[${q}].e = ${item.e}，q自增到${q+1}`);
        q++;
      }
    }
  }

  record('sorted', 'done', `稀疏矩阵转置完成，转置三元组：${JSON.stringify(B.data)}`);
  return steps;
}
