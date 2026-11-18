// shared/algorithms/final/e/kth-from-end.js
const SOURCE_VERSION = 'kth-from-end-c-v1';
const SOURCE_LINES = [
  { lineId: 'init', text: 'ListNode* findKthFromEnd(ListNode* head, int k) {' },
  { lineId: 'check-k', text: '  if(k<=0) return nullptr;' },
  { lineId: 'fast-init', text: '  ListNode *fast=head,*slow=head;' },
  { lineId: 'fast-forward', text: '  for(int i=0;i<k;i++){ if(!fast) return nullptr; fast=fast->next; }' },
  { lineId: 'both-walk', text: '  while(fast){ fast=fast->next; slow=slow->next; }' },
  { lineId: 'return-res', text: '  return slow;' },
  { lineId: 'done', text: '}' },
];

/**
 * 单链表查找倒数第k节点
 * @param {{list:number[],k:number}} input
 * @returns {{steps:any[],result:{nodeId:number|null,value:number|null},sourceVersion:string,sourceLines:typeof SOURCE_LINES}}
 */
export function generateKthFromEndSteps(input) {
  const { list, k } = input;
  const steps = [];
  let nodes = list.map((val, idx) => ({ id: idx, value: val, next: idx + 1 < list.length ? idx + 1 : null }));

  function record(event, lineId, description, extraVars = {}) {
    const done = event === 'sorted' || event === 'error';
    const nodesSnap = JSON.parse(JSON.stringify(nodes));
    steps.push({
      schemaVersion: '1.0',
      algorithm: 'kth-from-end',
      stepIndex: steps.length,
      sourceVersion: SOURCE_VERSION,
      event,
      lineId,
      array: nodesSnap.map(x=>x.value),
      variables: { nodes: nodesSnap, ...extraVars },
      description,
      done,
      result: done ? JSON.parse(JSON.stringify(extraVars.retResult ?? {nodeId:null,value:null})) : null
    });
  }

  record('init', 'init', `链表 [${list.join(',')}]，查找倒数第${k}个结点`);

  if (!Number.isInteger(k) || k <= 0) {
    record('error', 'check-k', `k=${k}非法，k必须是正整数`, { retResult:{nodeId:null,value:null} });
    return { steps, result:{nodeId:null,value:null}, sourceVersion: SOURCE_VERSION, sourceLines: SOURCE_LINES };
  }
  if(k > nodes.length){
    record('error','check-k',`k=${k}超过链表长度${nodes.length}`,{retResult:{nodeId:null,value:null}});
    return { steps, result:{nodeId:null,value:null}, sourceVersion: SOURCE_VERSION, sourceLines: SOURCE_LINES };
  }

  let fastId = 0;
  let slowId = 0;
  record('fast-init', 'fast-init', `fast、slow指向头结点 id=${fastId}`, { fastId, slowId });

  for(let i=0;i<k;i++){
    record('fast-forward','fast-forward',`fast指针向前走一步，i=${i}`,{fastId,slowId});
    fastId = nodes[fastId].next;
  }

  while(fastId !== null){
    fastId = nodes[fastId].next;
    slowId = nodes[slowId].next;
    record('both-walk','both-walk',`fast与slow同步向后移动`,{fastId,slowId});
  }

  const retResult = { nodeId: slowId, value: nodes[slowId].value };
  record('return-res','return-res',`fast到达末尾，slow指向目标节点 id=${slowId}, value=${retResult.value}`,{fastId,slowId,retResult});
  record('sorted','done',`倒数第${k}个节点值为：${retResult.value}`,{retResult});

  return { steps, result: retResult, sourceVersion: SOURCE_VERSION, sourceLines: SOURCE_LINES };
}
