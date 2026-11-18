// shared/algorithms/final/e/array-list-delete-range.js
const SOURCE_VERSION = 'array-del-range-c-v1';
const SOURCE_LINES = [
  { lineId: 'init', text: 'bool array_del_range(SqList* L, int l, int r) {' },
  { lineId: 'empty-check', text: '  if (L->length == 0) return false;' },
  { lineId: 'range-check', text: '  if (l < 0 || r >= L->length || l > r) return false;' },
  { lineId: 'move-loop', text: '  for(int i = r + 1; i < L->length; i++)' },
  { lineId: 'move-item', text: '    L->data[i - (r - l + 1)] = L->data[i];' },
  { lineId: 'len-sub', text: '  L->length -= (r - l + 1);' },
  { lineId: 'return', text: '  return true;' },
  { lineId: 'done', text: '}' },
];

/**
 * 顺序表区间删除轨迹生成
 * @param {{list: number[], left: number, right: number, maxSize: number}} input
 * @returns {Array} steps
 */
export function generateArrayListDeleteRangeSteps(input) {
  const { list, left, right, maxSize = 20 } = input;
  const steps = [];
  let arr = [...list];
  let len = arr.length;
  const delCount = right - left + 1;

  function record(event, lineId, description, extraVars = {}) {
    const done = event === 'sorted';
    steps.push({
      schemaVersion: '1.0',
      algorithm: 'array-list-delete-range',
      stepIndex: steps.length,
      sourceVersion: SOURCE_VERSION,
      event,
      lineId,
      array: [...arr],
      variables: {
        arr: [...arr],
        length: len,
        maxSize,
        left,
        right,
        delCount,
        ...extraVars,
      },
      description,
      done,
      result: done ? [...arr] : null,
    });
  }

  record('init', 'init', `初始顺序表 [${arr.join(',')}]，准备删除下标 [${left},${right}] 区间元素`);

  if (len === 0) {
    record('empty-check', 'empty-check', '顺序表为空，无法删除区间');
    record('sorted', 'done', '删除终止：表空');
    return steps;
  }

  if (left < 0 || right >= len || left > right) {
    record('range-check', 'range-check', `区间[${left},${right}]非法`);
    record('sorted', 'done', '删除终止：区间越界');
    return steps;
  }

  record('move-loop', 'move-loop', `开始搬运：区间后面元素向前移动${delCount}格`);
  for (let i = right + 1; i < len; i++) {
    arr[i - delCount] = arr[i];
    record('move-item', 'move-item', `data[${i}] → data[${i - delCount}]`);
  }

  len -= delCount;
  record('len-sub', 'len-sub', `表长减少${delCount}，新表长=${len}`);

  record('return', 'return', '区间删除执行完毕');
  record('sorted', 'done', `删除完成，顺序表：[${arr.join(',')}]`);
  return steps;
}
