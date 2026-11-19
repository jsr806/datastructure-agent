// shared/algorithms/final/e/sparse-matrix-transpose.js
const SOURCE_VERSION = 'sparse-matrix-transpose-c-v2';
const NO_RESULT = Symbol('no-result');

// 展示源码只用裸 C++，不引入 <algorithm>（Open Watcom 打不开该头文件），排序用手写插入排序
const SOURCE_LINES = [
  { lineId: 'struct', text: 'struct Triple { int i; int j; double e; };' },
  { lineId: 'same-coord', text: 'bool sameCoord(const Triple& a, const Triple& b) { return a.i == b.i && a.j == b.j; }' },
  { lineId: 'row-sort', text: 'void rowSort(Triple t[], int n) { for(int k=1;k<n;k++){ Triple key=t[k]; int p=k-1; while(p>=0 && (t[p].i>key.i || (t[p].i==key.i && t[p].j>key.j))){ t[p+1]=t[p]; p--; } t[p+1]=key; } }' },
  { lineId: 'init', text: 'int sparse_transpose(int rows, int cols, Triple t[], int n, Triple out[]) {' },
  { lineId: 'validate', text: '  for(int k=0;k<n;k++) if(t[k].i<0 || t[k].i>=rows || t[k].j<0 || t[k].j>=cols) return -1;' },
  { lineId: 'duplicate-check', text: '  for(int a=0;a<n;a++) for(int b=a+1;b<n;b++) if(sameCoord(t[a],t[b])) return -2;  /* 坐标必须唯一 */' },
  { lineId: 'normalize-sort', text: '  rowSort(t, n);                                  /* 输入行优先规范化（i 升，i 同则 j 升） */' },
  { lineId: 'count-column', text: '  int num[64], cpos[64]; for(int c=0;c<cols;c++) num[c]=0; for(int k=0;k<n;k++) num[t[k].j]++;   /* 原矩阵各列非零个数 */' },
  { lineId: 'start-pos', text: '  cpos[0]=0; for(int c=1;c<cols;c++) cpos[c]=cpos[c-1]+num[c-1];   /* 各列在输出中的起始下标 */' },
  { lineId: 'write-out', text: '  for(int k=0;k<n;k++){ int col=t[k].j; out[cpos[col]].i=t[k].j; out[cpos[col]].j=t[k].i; out[cpos[col]].e=t[k].e; cpos[col]++; }' },
  { lineId: 'done', text: '  return n;' },
  { lineId: 'close', text: '}' },
];

/**
 * 稀疏矩阵快速转置：列计数 -> 起始下标前缀和 -> 按原矩阵行优先逐项写入
 * JS 与 C++ 展示源码使用同一规则（行优先规范化 + 坐标唯一校验），不依赖任何排序库
 * @param {{rows:number,cols:number,triples:{i:number,j:number,e:number}[]}} input
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
      record('error', 'validate', `非法行列坐标 (${t.i},${t.j})：必须是 [0,${rows}) x [0,${cols}) 内的整数`, {}, null);
      return { steps, result: null, sourceVersion: SOURCE_VERSION, sourceLines: SOURCE_LINES };
    }
    if (typeof t.e !== 'number' || !Number.isFinite(t.e)) {
      record('error', 'validate', `非法元素值 e=${t.e}：必须是有限数值`, {}, null);
      return { steps, result: null, sourceVersion: SOURCE_VERSION, sourceLines: SOURCE_LINES };
    }
  }

  const seen = new Set();
  for (const t of inputTriples) {
    const key = t.i + ',' + t.j;
    if (seen.has(key)) {
      record('error', 'duplicate-check', `重复坐标 (${t.i},${t.j})：同一位置只能有一个非零元素`, {}, null);
      return { steps, result: null, sourceVersion: SOURCE_VERSION, sourceLines: SOURCE_LINES };
    }
    seen.add(key);
  }

  const normalized = [...inputTriples].sort((a, b) => (a.i !== b.i ? a.i - b.i : a.j - b.j));
  record('normalize_sort', 'normalize-sort', '输入三元组按行优先（i 升，i 相同则 j 升）规范化排序', {
    triples: normalized,
  });

  const num = new Array(cols).fill(0);
  for (let k = 0; k < normalized.length; k++) {
    const col = normalized[k].j;
    num[col] += 1;
    record(
      'count_column',
      'count-column',
      `第 ${k + 1} 个三元组在原矩阵第 ${col} 列，num[${col}] = ${num[col]}`,
      { num: [...num], col, k }
    );
  }

  const cpos = new Array(cols).fill(0);
  for (let c = 1; c < cols; c++) cpos[c] = cpos[c - 1] + num[c - 1];
  record('start_positions', 'start-pos', `原列计数 [${num.join(',')}]，各列输出起始下标 [${cpos.join(',')}]`, {
    num: [...num],
    cpos: [...cpos],
  });

  const out = new Array(normalized.length).fill(null).map(() => ({ i: null, j: null, e: null }));
  const cursor = [...cpos];
  for (let k = 0; k < normalized.length; k++) {
    const t = normalized[k];
    const col = t.j;
    const pos = cursor[col];
    out[pos] = { i: t.j, j: t.i, e: t.e };
    cursor[col] += 1;
    record(
      'write_out',
      'write-out',
      `(${t.i},${t.j},${t.e}) 交换坐标后写入输出第 ${pos} 位，cpos[${col}] 前进到 ${cursor[col]}`,
      { out: clone(out), cpos: [...cursor], col, pos, k }
    );
  }

  const result = { rows: cols, cols: rows, triples: clone(out) };
  record(
    'done',
    'done',
    `${cols} 行 ${rows} 列转置完成，三元组 [${out.map((t) => `(${t.i},${t.j},${t.e})`).join(' ')}]`,
    { num: [...num], cpos: [...cursor], out: clone(out) },
    result
  );
  return { steps, result: { rows: cols, cols: rows, triples: clone(out) }, sourceVersion: SOURCE_VERSION, sourceLines: SOURCE_LINES };
}
