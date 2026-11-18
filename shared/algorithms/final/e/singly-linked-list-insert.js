// shared/algorithms/final/e/singly-linked-list-insert.js
const SOURCE_VERSION = 'singly-insert-c-v1';
const SOURCE_LINES = [
  { lineId: 'init', text: 'Node* list_insert(Node* head, int pos, int val) {' },
  { lineId: 'new-node', text: '  Node* newp = new Node(val);' },
  { lineId: 'pos-check', text: '  if (pos == 0) {' },
  { lineId: 'head-insert', text: '    newp->next = head; head = newp; return head;' },
  { lineId: 'pos-loop', text: '  Node* p = head; for(int i=0; i<pos-1; i++) p = p->next;' },
  { lineId: 'link-next', text: '  newp->next = p->next;' },
  { lineId: 'link-prev', text: '  p->next = newp;' },
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
 * 单链表插入轨迹生成
 * @param {{list: number[], pos: number, value: number}} input
 * @returns {Array} steps
 */
export function generateSinglyLinkedInsertSteps(input) {
  const { list, pos, value } = input;
  const steps = [];
  let nodeIdBase = list.length; // 新结点分配id
  let nodes = buildLinkedNodes(list);
  let headId = nodes.length === 0 ? null : 0;

  function record(event, lineId, description, extraVars = {}) {
    const done = event === 'sorted';
    steps.push({
      schemaVersion: '1.0',
      algorithm: 'singly-linked-list-insert',
      stepIndex: steps.length,
      sourceVersion: SOURCE_VERSION,
      event,
      lineId,
      array: list,
      variables: {
        headId,
        pos,
        insertVal: value,
        nodeIdBase,
        nodes: JSON.parse(JSON.stringify(nodes)),
        ...extraVars,
      },
      description,
      done,
      result: done ? JSON.parse(JSON.stringify(nodes)) : null,
    });
  }

  // 初始化
  record('init', 'init', `初始链表 [${list.join(',')}]，准备在位置${pos}插入值${value}`);

  // 边界校验：pos不合法
  if (pos < 0 || pos > nodes.length) {
    record('reject', 'init', `插入位置${pos}越界，合法范围0~${nodes.length}，拒绝操作`);
    record('sorted', 'done', '插入终止：位置非法');
    return steps;
  }

  // 创建新结点
  const newNodeId = nodeIdBase++;
  const newNode = { val: value, id: newNodeId, next: null };
  nodes.push(newNode);
  record('new-node', 'new-node', `分配新结点 id=${newNodeId}, val=${value}`);

  if (pos === 0) {
    // 头插
    newNode.next = headId;
    headId = newNodeId;
    record('head-insert', 'head-insert', `头插：新结点后继指向原头${newNode.next}，更新头指针为${newNodeId}`);
  } else {
    // 找前驱结点
    let preId = 0;
    let cur = nodes.find(n => n.id === preId);
    for (let i = 0; i < pos - 1; i++) {
      preId = cur.next;
      cur = nodes.find(n => n.id === preId);
    }
    record('pos-loop', 'pos-loop', `找到前驱结点 id=${preId}，准备在后插入新结点`, { preId });

    // 先接后继
    newNode.next = cur.next;
    record('link-next', 'link-next', `新结点 next 指向 ${newNode.next}`);
    // 修改前驱的next
    cur.next = newNodeId;
    record('link-prev', 'link-prev', `前驱结点 ${preId} 的next修改为新结点id ${newNodeId}`);
  }

  record('return', 'return', '链表插入逻辑执行完毕');
  record('sorted', 'done', `插入完成，可遍历链表：${traverseLinkedList(headId, nodes)}`);
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
