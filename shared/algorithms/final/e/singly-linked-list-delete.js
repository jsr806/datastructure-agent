// shared/algorithms/final/e/singly-linked-list-delete.js
const SOURCE_VERSION = 'singly-delete-c-v1';
const SOURCE_LINES = [
  { lineId: 'init', text: 'Node* list_delete(Node* head, int pos) {' },
  { lineId: 'empty-check', text: '  if (head == NULL) return NULL;' },
  { lineId: 'pos-check', text: '  if (pos == 0) {' },
  { lineId: 'head-del', text: '    Node* delp = head; head = head->next; delete delp; return head;' },
  { lineId: 'find-pre', text: '  Node* p = head; for(int i=0; i<pos-1; i++) p = p->next;' },
  { lineId: 'mark-del', text: '  Node* delp = p->next;' },
  { lineId: 'skip-del', text: '  p->next = delp->next;' },
  { lineId: 'free-del', text: '  delete delp;' },
  { lineId: 'return', text: '  return head;' },
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
 * 单链表删除轨迹生成
 * @param {{list: number[], pos: number}} input
 * @returns {Array} steps
 */
export function generateSinglyLinkedDeleteSteps(input) {
  const { list, pos } = input;
  const steps = [];
  let nodes = buildLinkedNodes(list);
  let headId = nodes.length === 0 ? null : 0;

  function record(event, lineId, description, extraVars = {}) {
    const done = event === 'sorted';
    steps.push({
      schemaVersion: '1.0',
      algorithm: 'singly-linked-list-delete',
      stepIndex: steps.length,
      sourceVersion: SOURCE_VERSION,
      event,
      lineId,
      array: list,
      variables: {
        headId,
        pos,
        nodes: JSON.parse(JSON.stringify(nodes)),
        ...extraVars,
      },
      description,
      done,
      result: done ? JSON.parse(JSON.stringify(nodes)) : null,
    });
  }

  record('init', 'init', `初始链表 [${list.join(',')}]，准备删除位置${pos}的结点`);

  // 空链表
  if (nodes.length === 0) {
    record('empty-check', 'empty-check', '链表为空，无需删除');
    record('sorted', 'done', '删除终止：链表为空');
    return steps;
  }

  // 位置越界判断
  if (pos < 0 || pos >= nodes.length) {
    record('reject', 'init', `删除位置${pos}越界，合法范围0~${nodes.length - 1}，拒绝操作`);
    record('sorted', 'done', '删除终止：位置非法');
    return steps;
  }

  if (pos === 0) {
    // 删除头结点
    const delId = headId;
    record('head-del', 'head-del', `删除头结点 id=${delId}, val=${nodes.find(n=>n.id===delId).val}`);
    headId = nodes.find(n => n.id === delId).next;
    // 删掉这个节点
    nodes = nodes.filter(n => n.id !== delId);
  } else {
    // 找前驱
    let preId = 0;
    let cur = nodes.find(n => n.id === preId);
    for (let i = 0; i < pos - 1; i++) {
      preId = cur.next;
      cur = nodes.find(n => n.id === preId);
    }
    record('find-pre', 'find-pre', `找到前驱结点 id=${preId}`);

    const delId = cur.next;
    const delNode = nodes.find(n => n.id === delId);
    record('mark-del', 'mark-del', `标记待删结点 id=${delId}, val=${delNode.val}`);

    // 前驱跳过待删节点
    cur.next = delNode.next;
    record('skip-del', 'skip-del', `前驱结点${preId}的next指向待删结点的后继 ${delNode.next}`);

    // 移除节点（释放）
    nodes = nodes.filter(n => n.id !== delId);
    record('free-del', 'free-del', `释放结点 id=${delId}`);
  }

  record('return', 'return', '链表删除逻辑执行完毕');
  record('sorted', 'done', `删除完成，可遍历链表：${traverseLinkedList(headId, nodes)}`);
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
