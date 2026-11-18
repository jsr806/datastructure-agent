// shared/algorithms/final/e/sparse-matrix-transpose.js
const SOURCE_VERSION = 'sparse-transpose-fast-c-v1';
const SOURCE_LINES = [
  { lineId: 'init', text: 'void sparse_fast_transpose(TSMatrix A, TSMatrix *B) {' },
  { lineId: 'assign-meta', text: '  B->mu = A.nu; B->nu = A.mu; B->tu = A.tu;' },
  { lineId: 'judge-zero', text: '  if (B->tu == 0) return;' },
  { lineId: 'stat-num', text: '  int num[MAX_COL]={0}; for(int p=0;p<A.tu;p++) num[A.data[p].j]++;' },
  { lineId: 'calc-cpot', text: '  int cpot[MAX_COL]={0}; for(int col=1;col<A.nu;col++) cpot[col]=cpot[col-1]+num[col-1];' },
  { lineId: 'fill-b', text: '  for(int p=0;p<A.tu;p++){' },
  { lineId: 'get-col', text: '    int col = A.data[p].j; int q = cpot[col];' },
  { lineId: 'assign', text: '    B->data[q].i = A.data[p].j; B->data[q].j = A.data[p].i; B->data[q].e = A.data[p].e;' },
  { lineId: 'cpot-inc', text: '    cpot[col]++;' },
  { lineId: 'end-for', text: '  }' },
  { lineId: 'done', text: '}' },
];

/**
 * 稀疏矩阵快速转置
 * @param {{rows: number, cols: number, triples: {i:number,j:number,e:number}[]}} input
 * @returns {{steps:any[],result:{mu:number,nu:number,tu:number,data:{i:number,j:number,e:number}[]}|null,sourceVersion:string,sourceLines:typeof SOURCE_LINES}}
 */
export function generateSparseMatrixTransposeSteps(input) {
  const { rows, cols, triples } = input;
  const steps = [];
  const A = JSON.parse(JSON.stringify({ mu: rows, nu: cols, tu: triples.length, data: triples }));
  const B = { mu: A.nu, nu: A.mu, tu: A.tu, data: new Array(A.tu) };

  function record(event, lineId, description, extraVars = {}) {
    const done = event === 'sorted' || event === 'error';
    const Asnap = JSON.parse(JSON.stringify(A));
    const Bsnap = JSON.parse(JSON.stringify(B));
    steps.push({
      schemaVersion: '1.0',
      algorithm: 'sparse-matrix-transpose',
      stepIndex: steps.length,
      sourceVersion: SOURCE_VERSION,
      event,
      lineId,
      array: [],
      variables: { A: Asnap, B: Bsnap, ...extraVars },
      description,
      done,
      result: done ? JSON.parse(JSON.stringify(Bsnap)) : null
    });
  }

  record('init', 'init', `原始矩阵 ${A.mu}行${A.nu}列，非零元${A.tu}`);

  // 输入校验
  if(!Number.isInteger(rows)||!Number.isInteger(cols)||rows<=0||cols<=0){
    record('error','init','行列数必须正整数');
    return {steps,result:null,sourceVersion:SOURCE_VERSION,sourceLines:SOURCE_LINES};
  }
  const seen = new Set();
  for(const t of A.data){
    if(t.e === 0){
      record('error','init','不允许e=0零元素');
      return {steps,result:null,sourceVersion:SOURCE_VERSION,sourceLines:SOURCE_LINES};
    }
    if(t.i<0||t.i>=A.mu||t.j<0||t.j>=A.nu){
      record('error','init',`三元组越界 i=${t.i},j=${t.j}`);
      return {steps,result:null,sourceVersion:SOURCE_VERSION,sourceLines:SOURCE_LINES};
    }
    const key = `${t.i},${t.j}`;
    if(seen.has(key)){
      record('error','init',`重复坐标 ${key}`);
      return {steps,result:null,sourceVersion:SOURCE_VERSION,sourceLines:SOURCE_LINES};
    }
    seen.add(key);
  }

  record('assign-meta','assign-meta',`B矩阵元信息 mu=${B.mu}, nu=${B.nu}, tu=${B.tu}`);
  if(B.tu === 0){
    record('judge-zero','judge-zero','没有非零元素');
    record('sorted','done','转置完成');
    return {steps, result: JSON.parse(JSON.stringify(B)), sourceVersion:SOURCE_VERSION, sourceLines:SOURCE_LINES};
  }

  const num = new Array(A.nu).fill(0);
  for(let p=0;p<A.tu;p++){
    const col = A.data[p].j;
    num[col]++;
    record('stat-num','stat-num',`p=${p}, A.data[${p}]列=${col}, num[${col}]++`,{num:[...num]});
  }

  const cpot = new Array(A.nu).fill(0);
  for(let col=1;col<A.nu;col++){
    cpot[col] = cpot[col-1] + num[col-1];
    record('calc-cpot','calc-cpot',`col=${col}，cpot[${col}]=${cpot[col]}`,{cpot:[...cpot],num:[...num]});
  }

  for(let p=0;p<A.tu;p++){
    const col = A.data[p].j;
    const q = cpot[col];
    record('get-col','get-col',`p=${p},原列col=${col},写入B下标q=${q}`,{p,col,q,cpot:[...cpot]});
    B.data[q] = { i:A.data[p].j, j:A.data[p].i, e:A.data[p].e };
    record('assign','assign',`B.data[${q}]赋值 {${B.data[q].i},${B.data[q].j},${B.data[q].e}}`);
    cpot[col]++;
    record('cpot-inc','cpot-inc',`cpot[${col}]自增为${cpot[col]}`,{cpot:[...cpot]});
  }

  record('sorted','done',`快速转置完成，输出三元组${JSON.stringify(B.data)}`);
  return { steps, result: JSON.parse(JSON.stringify(B)), sourceVersion: SOURCE_VERSION, sourceLines: SOURCE_LINES };
}
