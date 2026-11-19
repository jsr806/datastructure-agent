// shared/algorithms/final/e/sparse-matrix-transpose.js
const SOURCE_VERSION = 'sparse-matrix-transpose-c-v1';
const NO_RESULT = Symbol('no-result');

// C++ 展示源码：与 JS 使用完全相同的行优先排序规则（i 升，i 相同则 j 升）
const SOURCE_LINES = [
  { lineId: 'struct', text: 'struct Triple { int i; int j; double e; };' },
  { lineId: 'cmp', text: 'bool cmpTriple(const Triple& a, const Triple& b) { if(a.i != b.i) return a.i < b.i; return a.j < b.j; }' },
  { lineId: 'init', text: 'void sparse_transpose(int rows, int cols, Triple t[], int n, Triple out[]) {' },
  { lineId: 'validate', text: '  /* 校验：行列必须为整数且不越界；e 必须为有限数值 */' },
  { lineId: 'normalize-sort', text: '  std::sort(t, t + n, cmpTriple);            // 输入行优先规范化（i 升，i 同则 j 升）' },
  { lineId: 'transpose-loop', text: '  for(int k=0;k<n;k++){ out[k].i = t[k].j; out[k].j = t[k].i; out[k].e = t[k].e; }' },
  { lineId: 'sort-out', text: '  std::sort(out, out + n, cmpTriple);        // 转置结果再按行优先排序，与 JS 完全一致' },
  { lineId: 'done', text: '}' },
];

/**
 * 稀疏矩阵转置：JS 与 C++ 展示源码共用行优先规范化排序规则
 * @param {{rows:number,cols:number,triples:{i:number,j:number,e:number}[]}} input
 * @returns {{steps:any[],result:{rows:number,cols:number,triples:any[]}|null,sourceVersion:string,sourceLines:typeof SOURCE_LINES}}
 */
export function generateSparseMatrixTransposeSteps({ rows, cols, triples }) {
  const steps = [];
  const inputTriples = Array.isArray(triples) ? triples.map((t) => ({ i: t.i, j: t.j, e: t.e })) : [];
  const clone = (o) => JSON.parse(JSON.stringify(o));

  function record(event, lineId, description, vars = {}, finalResult = NO_RESULT) {
    const done = finalResult !== NO_RESULT;
    steps.push({
      schemaVersion: '1.0',
      algorithm: 'sparse-matrix-transpose',
      stepIndex: steps.length,
      sourceVersion: SOURCE_VERSION,
      event,
      lineId,
      variables: { rows, cols, triples: clone(inputTriples), ...clone(vars) },
      description,
      done,
      result: done ? clone(finalResult) : null,
    });
  }

  record('init', 'init', `${rows} 行 ${cols} 列，共 ${inputTriples.length} 个非零三元组`);

  for (const t of inputTriples) {
    if (!Number.isInteger(t.i) || !Number.isInteger(t.j) || t.i < 0 || t.j < 0 || t.i >= rows || t.j >= cols) {
      record(
        'error',
        'validate',
        `非法行列坐标 (${t.i},${t.j})：必须是 [0,${rows}) x [0,${cols}) 内的整数`,
        {},
        null
      );
      return { steps, result: null, sourceVersion: SOURCE_VERSION, sourceLines: SOURCE_LINES };
    }
    if (typeof t.e !== 'number' || !Number.isFinite(t.e)) {
      record('error', 'validate', `非法元素值 e=${t.e}：必须是有限数值`, {}, null);
      return { steps, result: null, sourceVersion: SOURCE_VERSION, sourceLines: SOURCE_LINES };
    }
  }

  const normalized = [...inputTriples].sort((a, b) => (a.i !== b.i ? a.i - b.i : a.j - b.j));
  record('normalize_sort', 'normalize-sort', '输入三元组按行优先（i 升，i 相同则 j 升）规范化排序', {
    triples: normalized,
  });

  const transposed = normalized.map((t) => ({ i: t.j, j: t.i, e: t.e }));
  record('transpose', 'transpose-loop', `i/j 互换完成，共 ${transposed.length} 个三元组`, { triples: transposed });

  const transposedTriples = [...transposed].sort((a, b) => (a.i !== b.i ? a.i - b.i : a.j - b.j));
  record('sort_out', 'sort-out', '转置结果再按行优先排序，确保与 C++ 输出顺序一致', {
    triples: transposedTriples,
  });

  const result = { rows: cols, cols: rows, triples: transposedTriples };
  record(
    'done',
    'done',
    `${cols} 行 ${rows} 列转置完成，三元组 [${transposedTriples.map((t) => `(${t.i},${t.j},${t.e})`).join(' ')}]`,
    { result },
    result
  );
  return { steps, result: { rows: cols, cols: rows, triples: clone(transposedTriples) }, sourceVersion: SOURCE_VERSION, sourceLines: SOURCE_LINES };
}
