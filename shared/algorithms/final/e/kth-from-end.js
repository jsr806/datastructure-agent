// shared/algorithms/final/e/kth-from-end.js
const SOURCE_VERSION = 'kth-end-c-v1';
const SOURCE_LINES = [
  { lineId: 'init', text: 'Node* kth_from_end(Node* head, int k) {' },
  { lineId: 'k-check', text: '  if (k <= 0) return NULL;' },
  { lineId: 'fast-init', text: '  Node* fast = head; Node* slow = head;' },
  { lineId: 'fast-move', text: '  for(int i=0; i<k; i++) {' },
  { lineId: 'fast-null', text: '    if (fast == NULL) return NULL;' },
  { lineId: 'fast-next', text: '    fast = fast->next;' },
  { lineId: 'both-move', text: '  while(fast != NULL) {' },
  { lineId: 'slow-next', text: '    slow = slow->next; fast = fast->next;' },
  { lineId: 'return', text: '  return slow;' },
  { lineId: 'done', text: '}' },
];

/**
 * 构造链表结点数组
 * @param {number[]} arr
 * @returns {{val:number,id:number,next:number|null}[]}
 */
function buildLinkedNodes(arr) {
  const nodes = arr.map((v, idx) => ({ val: v, id: idx, next: idx + 1 }));
  if (nodes.length > 0) nodes[nodes.length - 1].next = null;
  return nodes;
}

/**
 * 单链表倒数第k个结点轨迹生成（快慢指针）
 * @param {{list: number[], k: number}} input
 * @returns {Array} steps
 */
export function generateKthFromEndSteps(input) {
  const { list, k } = input;
  const steps = [];
  let nodes = buildLinkedNodes(list);
  let headId = nodes.length === 0 ? null : 0;

  function record(event, lineId, description, extraVars = {}) {
    const done = event === 'sorted';
    steps.push({
      schemaVersion: '1.0',
      algorithm: 'kth-from-end',
      stepIndex: steps.length,
      sourceVersion: SOURCE_VERSION,
      event,
      lineId,
      array: list,
      variables: {
        headId,
        k,
        nodes: JSON.parse(JSON.stringify(nodes)),
        ...extraVars,
      },
      description,
      done,
      result: done ? JSON.parse(JSON.stringify(nodes)) : null,
    });
  }

  record('init', 'init', `初始链表 [${list.join(',')}]，查找倒数第${k}个结点`);

  if (k <= 0) {
    record('k-check', 'k-check', `k=${k}非法，k必须大于0`);
    record('sorted', 'done', '查找终止：k非法');
    return steps;
  }

  let fastId = headId;
  let slowId = headId;
  record('fast-init', 'fast-init', `初始化 fast=${fastId}, slow=${slowId}`, { fastId, slowId });

  // 快指针先走k步
  for (let i = 0; i < k; i++) {
    if (fastId === null) {
      record('fast-null', 'fast-null', `快指针在第${i}步已到表尾，链表长度不足k，无此结点`);
      record('sorted', 'done', '查找终止：链表长度小于k');
      return steps;
    }
    fastId = nodes.find(n => n.id === fastId).next;
    record('fast-next', 'fast-next', `快指针前进一步，fast=${fastId}`, { fastId, slowId });
  }

  // 双指针同步走
  while (fastId !== null) {
    slowId = nodes.find(n => n.id === slowId).next;
    fastId = nodes.find(n => n.id === fastId).next;
    record('slow-next', 'slow-next', `快慢指针同步后移：slow=${slowId}, fast=${fastId}`, { fastId, slowId });
  }

  const resultNode = nodes.find(n => n.id === slowId);
  record('return', 'return', `fast到达表尾，slow指向目标结点 id=${slowId}, val=${resultNode ? resultNode.val : null}`);
  record('sorted', 'done', `倒数第${k}个结点值为：${resultNode ? resultNode.val : '不存在'}`);
  return steps;
}
