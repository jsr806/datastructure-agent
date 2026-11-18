// shared/algorithms/final/e/array-list-reverse.js
const SOURCE_VERSION = 'array-reverse-c-v1';
const SOURCE_LINES = [
  { lineId: 'init', text: 'void array_reverse(SqList* L) {' },
  { lineId: 'loop-init', text: '  int i = 0, j = L->length - 1;' },
  { lineId: 'loop-cond', text: '  while (i < j) {' },
  { lineId: 'swap', text: '    swap(L->data[i], L->data[j]);' },
  { lineId: 'move-i', text: '    i++;' },
  { lineId: 'move-j', text: '    j--;' },
  { lineId: 'loop-end', text: '  }' },
  { lineId: 'done', text: '}' },
];

/**
 * 顺序表逆置轨迹生成
 * @param {{list: number[], maxSize: number}} input
 * @returns {Array} steps
 */
export function generateArrayListReverseSteps(input) {
  const { list, maxSize = 20 } = input;
  const steps = [];
  let arr = [...list];
  let len = arr.length;

  function record(event, lineId, description, extraVars = {}) {
    const done = event === 'sorted';
    steps.push({
      schemaVersion: '1.0',
      algorithm: 'array-list-reverse',
      stepIndex: steps.length,
      sourceVersion: SOURCE_VERSION,
      event,
      lineId,
      array: [...arr],
      variables: {
        arr: [...arr],
        length: len,
        maxSize,
        ...extraVars,
      },
      description,
      done,
      result: done ? [...arr] : null,
    });
  }

  record('init', 'init', `初始顺序表 [${arr.join(',')}]，准备逆置`);

  if (len <= 1) {
    record('sorted', 'done', `表长${len}无需逆置，结果：[${arr.join(',')}]`);
    return steps;
  }

  let i = 0;
  let j = len - 1;
  record('loop-init', 'loop-init', `初始化双指针 i=${i}, j=${j}`, { i, j });

  while (i < j) {
    // 交换
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
    record('swap', 'swap', `交换 data[${i}]=${arr[j]} 与 data[${j}]=${arr[i]}`, { i, j });

    i++;
    record('move-i', 'move-i', `i指针右移，i=${i}`, { i, j });

    j--;
    record('move-j', 'move-j', `j指针左移，j=${j}`, { i, j });
  }

  record('sorted', 'done', `逆置完成，顺序表：[${arr.join(',')}]`);
  return steps;
}
