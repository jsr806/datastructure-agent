// shared/algorithms/final/e/singly-linked-list-reverse.js
const SOURCE_VERSION = 'singly-reverse-c-v1';
const SOURCE_LINES = [
  { lineId: 'init', text: 'Node* list_reverse(Node* head) {' },
  { lineId: 'var-init', text: '  Node* pre = NULL; Node* cur = head; Node* next;' },
  { lineId: 'loop', text: '  while (cur != NULL) {' },
  { lineId: 'save-next', text: '    next = cur->next;' },
  { lineId: 'turn-arrow', text: '    cur->next = pre;' },
  { lineId: 'pre-move', text: '    pre = cur;' },
  { lineId: 'cur-move', text: '    cur = next;' },
  { lineId: 'loop-end', text: '  }' },
  { lineId: 'return', text: '  return pre;' },
  { lineId: 'done', text: '}' },
];

/**
 * 构造链表结点数组，方便前端渲染
 * @param {number[]} arr
 * @returns {{val:number,id:number,next:number|null}[]}
 */
function buildLinkedNodes(arr) {
  const nodes = arr.map((v, idx) => ({ val: v, id: idx, next: idx + 1 }));
  if (nodes.length > 0) nodes[nodes.length - 1].next = null;
  return nodes;
}

/**
 * 单链表反转轨迹生成
 * @param {{list: number[]}} input
 * @returns {Array} steps
 */
export function generateSinglyLinkedReverseSteps(input) {
  const { list } = input;
  const steps = [];
  let nodes = buildLinkedNodes(list);
  let headId = nodes.length === 0 ? null : 0;

  function record(event, lineId, description, extraVars = {}) {
    const done = event === 'sorted';
    steps.push({
      schemaVersion: '1.0',
      algorithm: 'singly-linked-list-reverse',
      stepIndex: steps.length,
      sourceVersion: SOURCE_VERSION,
      event,
      lineId,
      array: list,
      variables: {
        headId,
        nodes: JSON.parse(JSON.stringify(nodes)),
        ...extraVars,
      },
      description,
      done,
      result: done ? JSON.parse(JSON.stringify(nodes)) : null,
    });
  }

  record('init', 'init', `初始链表 [${list.join(',')}]，准备反转链表`);

  if (nodes.length === 0) {
    record('sorted', 'done', '链表为空，反转结束，结果为空链表');
    return steps;
  }

  let preId = null;
  let curId = headId;
  let nextId = null;
  record('var-init', 'var-init', `初始化指针 pre=null，cur=${curId}` , {preId,curId,nextId});

  while (curId !== null) {
    nextId = nodes.find(n => n.id === curId).next;
    record('save-next', 'save-next', `暂存cur的后继 next=${nextId}`, {preId,curId,nextId});

    // 反转箭头：cur指向pre
    nodes.find(n => n.id === curId).next = preId;
    record('turn-arrow', 'turn-arrow', `修改结点${curId}的next，指向pre=${preId}`, {preId,curId,nextId});

    preId = curId;
    record('pre-move', 'pre-move', `pre指针前移到${preId}`, {preId,curId,nextId});

    curId = nextId;
    record('cur-move', 'cur-move', `cur指针前移到${curId}`, {preId,curId,nextId});
  }

  headId = preId;
  record('return', 'return', `循环结束，新头结点是pre=${headId}`);
  record('sorted', 'done', `反转完成，可遍历链表：${traverseLinkedList(headId, nodes)}`);
  return steps;
}

function traverseLinkedList(headId, allNodes) {
  const res = [];
  let p = headId;
  while (p !== null) {
    const nd = allNodes.find(x => x.id === p);
    if (!nd) break;
    res.push(nd.val);
    p = nd.next;
  }
  return `[${res.join(',')}]`;
}
