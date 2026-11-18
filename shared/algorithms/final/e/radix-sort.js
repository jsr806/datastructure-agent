// shared/algorithms/final/e/radix-sort.js
const SOURCE_VERSION = 'radix-sort-c-v1';
const SOURCE_LINES = [
  { lineId: 'init', text: 'void radix_sort(int arr[], int n) {' },
  { lineId: 'find-max', text: '  int maxv = arr[0];' },
  { lineId: 'scan-max', text: '  for(int i=0;i<n;i++) maxv = max(maxv, arr[i]);' },
  { lineId: 'digit-loop', text: '  for(int exp = 1; maxv / exp > 0; exp *= 10) {' },
  { lineId: 'count-init', text: '    int cnt[10] = {0};' },
  { lineId: 'count-digit', text: '    for(int i=0;i<n;i++) cnt[(arr[i]/exp)%10]++;' },
  { lineId: 'prefix', text: '    for(int i=1;i<10;i++) cnt[i] += cnt[i-1];' },
  { lineId: 'fill-tmp', text: '    int tmp[n]; for(int i=n-1;i>=0;i--)' },
  { lineId: 'place', text: '      tmp[--cnt[(arr[i]/exp)%10]] = arr[i];' },
  { lineId: 'copy', text: '    for(int i=0;i<n;i++) arr[i] = tmp[i];' },
  { lineId: 'exp-next', text: '  }' },
  { lineId: 'done', text: '}' },
];

/**
 * LSD基数排序（低位优先，基于计数排序）轨迹生成
 * @param {{list: number[]}} input
 * @returns {Array} steps
 */
export function generateRadixSortSteps(input) {
  const { list } = input;
  const steps = [];
  let arr = [...list];
  const n = arr.length;

  function record(event, lineId, description, extraVars = {}) {
    const done = event === 'sorted';
    steps.push({
      schemaVersion: '1.0',
      algorithm: 'radix-sort',
      stepIndex: steps.length,
      sourceVersion: SOURCE_VERSION,
      event,
      lineId,
      array: [...arr],
      variables: {
        arr: [...arr],
        n,
        ...extraVars,
      },
      description,
      done,
      result: done ? [...arr] : null,
    });
  }

  record('init', 'init', `待排序数组 [${arr.join(',')}]，开始LSD基数排序`);
  if (n <= 1) {
    record('sorted', 'done', `数组长度${n}，无需排序：[${arr.join(',')}]`);
    return steps;
  }

  let maxv = arr[0];
  record('find-max', 'find-max', `初始化最大值 maxv=${maxv}`, { maxv });
  for (let i = 0; i < n; i++) {
    maxv = Math.max(maxv, arr[i]);
  }
  record('scan-max', 'scan-max', `扫描得到最大值 maxv=${maxv}`, { maxv });

  let exp = 1;
  while (Math.floor(maxv / exp) > 0) {
    record('digit-loop', 'digit-loop', `==== 处理第${Math.log10(exp)+1}位，exp=${exp} ====`, { exp, maxv });
    const cnt = new Array(10).fill(0);
    record('count-init', 'count-init', `初始化0~9计数数组 cnt=[${cnt.join(',')}]`, { cnt: [...cnt], exp });

    // 统计当前位频次
    for (let i = 0; i < n; i++) {
      const digit = Math.floor(arr[i] / exp) % 10;
      cnt[digit]++;
      record('count-digit', 'count-digit', `arr[${i}]=${arr[i]}，当前位${digit}，cnt[${digit}]++ → cnt=[${cnt.join(',')}]`, { cnt: [...cnt], exp });
    }

    // 前缀和
    for (let i = 1; i < 10; i++) {
      cnt[i] += cnt[i - 1];
      record('prefix', 'prefix', `前缀和 cnt[${i}] += cnt[${i-1}] → cnt=[${cnt.join(',')}]`, { cnt: [...cnt], exp });
    }

    const tmp = new Array(n);
    record('fill-tmp', 'fill-tmp', `开辟临时数组，从后往前填充保证稳定`, { cnt: [...cnt], tmp: [...tmp], exp });
    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / exp) % 10;
      const pos = --cnt[digit];
      tmp[pos] = arr[i];
      record('place', 'place', `arr[${i}]=${arr[i]} 本位${digit}，放到tmp[${pos}]，cnt=[${cnt.join(',')}]`, { cnt: [...cnt], tmp: [...tmp], exp });
    }

    // 拷贝回原数组
    for (let i = 0; i < n; i++) {
      arr[i] = tmp[i];
    }
    record('copy', 'copy', `本轮按当前位排序完成，数组：[${arr.join(',')}]`, { exp });

    exp *= 10;
  }

  record('sorted', 'done', `基数排序全部位数处理完毕，最终结果：[${arr.join(',')}]`);
  return steps;
}
