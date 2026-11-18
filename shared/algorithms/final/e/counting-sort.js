// shared/algorithms/final/e/counting-sort.js
const SOURCE_VERSION = 'counting-sort-c-v1';
const SOURCE_LINES = [
  { lineId: 'init', text: 'void counting_sort(int arr[], int n) {' },
  { lineId: 'find-minmax', text: '  int minv = arr[0], maxv = arr[0];' },
  { lineId: 'scan-minmax', text: '  for(int i=0;i<n;i++){ minv=min(minv,arr[i]); maxv=max(maxv,arr[i]); }' },
  { lineId: 'alloc-count', text: '  int range = maxv - minv + 1; int* cnt = new int[range]; memset(cnt,0,sizeof(int)*range);' },
  { lineId: 'count-loop', text: '  for(int i=0;i<n;i++) cnt[arr[i]-minv]++;' },
  { lineId: 'prefix-loop', text: '  for(int i=1;i<range;i++) cnt[i] += cnt[i-1];' },
  { lineId: 'fill-ans', text: '  int* tmp = new int[n]; for(int i=n-1;i>=0;i--)' },
  { lineId: 'place-item', text: '    tmp[--cnt[arr[i]-minv]] = arr[i];' },
  { lineId: 'copy-back', text: '  for(int i=0;i<n;i++) arr[i]=tmp[i];' },
  { lineId: 'free', text: '  delete[] cnt; delete[] tmp;' },
  { lineId: 'done', text: '}' },
];

/**
 * 计数排序（稳定版，支持负数，值域保护，符合项目返回契约）
 * @param {{list: number[]}} input
 * @returns {{steps:any[],result:number[]|null,sourceVersion:string,sourceLines:typeof SOURCE_LINES}}
 */
export function generateCountingSortSteps(input) {
  const { list } = input;
  const steps = [];
  const arr = JSON.parse(JSON.stringify(list));
  const n = arr.length;

  function record(event, lineId, description, extraVars = {}) {
    const done = event === 'sorted' || event === 'error';
    const arrSnap = JSON.parse(JSON.stringify(arr));
    steps.push({
      schemaVersion: '1.0',
      algorithm: 'counting-sort',
      stepIndex: steps.length,
      sourceVersion: SOURCE_VERSION,
      event,
      lineId,
      array: arrSnap,
      variables: {
        arr: arrSnap,
        n,
        ...extraVars,
      },
      description,
      done,
      result: done ? JSON.parse(JSON.stringify(arr)) : null,
    });
  }

  record('init', 'init', `待排序数组 [${arr.join(',')}]，开始稳定计数排序`);
  if (n <= 1) {
    record('sorted', 'done', `数组长度${n}，无需排序：[${arr.join(',')}]`);
    return { steps, result: [...arr], sourceVersion: SOURCE_VERSION, sourceLines: SOURCE_LINES };
  }

  let minv = arr[0];
  let maxv = arr[0];
  record('find-minmax', 'find-minmax', `初始化 min=${minv}, max=${maxv}`, { minv, maxv });
  for (let i = 0; i < n; i++) {
    minv = Math.min(minv, arr[i]);
    maxv = Math.max(maxv, arr[i]);
  }
  record('scan-minmax', 'scan-minmax', `扫描完成，min=${minv}, max=${maxv}` , { minv, maxv });

  const range = maxv - minv + 1;
  const MAX_RANGE = 5000;

  // 校验全部元素为整数
  if (!arr.every(x => Number.isInteger(x))) {
    record('error', 'alloc-count', '存在非整数元素，计数排序终止');
    return { steps, result: null, sourceVersion: SOURCE_VERSION, sourceLines: SOURCE_LINES };
  }
  // 校验值域跨度上限
  if (range > MAX_RANGE) {
    record('error','alloc-count',`值域跨度${range}超过最大允许${MAX_RANGE}，终止`);
    return { steps, result: null, sourceVersion: SOURCE_VERSION, sourceLines: SOURCE_LINES };
  }

  const cnt = new Array(range).fill(0);
  record('alloc-count', 'alloc-count', `开辟计数数组，区间长度range=${range}，cnt初始全0`, { cnt:[...cnt], minv, maxv, range });

  // 统计频次
  for (let i = 0; i < n; i++) {
    const idx = arr[i] - minv;
    cnt[idx] += 1;
    record('count-loop', 'count-loop', `统计 arr[${i}]=${arr[i]}，cnt[${idx}]++ → cnt=[${cnt.join(',')}]`, { cnt:[...cnt] });
  }

  // 前缀和
  for (let i = 1; i < range; i++) {
    cnt[i] += cnt[i - 1];
    record('prefix-loop', 'prefix-loop', `计算前缀和 cnt[${i}] += cnt[${i-1}] → cnt=[${cnt.join(',')}]`, { cnt:[...cnt] });
  }

  const tmp = new Array(n);
  record('fill-ans', 'fill-ans', `开辟临时数组tmp，从后向前放置元素保证稳定`, { cnt:[...cnt], tmp:[...tmp] });
  for (let i = n - 1; i >= 0; i--) {
    const idx = arr[i] - minv;
    const pos = --cnt[idx];
    tmp[pos] = arr[i];
    record('place-item', 'place-item', `arr[${i}]=${arr[i]}，放到tmp[${pos}], cnt=[${cnt.join(',')}]`, { cnt:[...cnt], tmp:[...tmp] });
  }

  // 拷贝回原数组
  for (let i = 0; i < n; i++) {
    arr[i] = tmp[i];
  }
  record('copy-back', 'copy-back', `将临时数组拷贝回原数组`);

  record('sorted', 'done', `计数排序完成，结果：[${arr.join(',')}]`);
  return { steps, result: [...arr], sourceVersion: SOURCE_VERSION, sourceLines: SOURCE_LINES };
}
