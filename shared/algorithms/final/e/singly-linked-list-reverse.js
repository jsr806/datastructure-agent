// shared/algorithms/final/e/singly-linked-list-reverse.js
const SOURCE_VERSION = 'singly-linked-reverse-c-v1';
const SOURCE_LINES = [
  { lineId: 'init', text: 'ListNode* list_reverse(ListNode* head) {' },
  { lineId: 'var-init', text: '  ListNode *pre=NULL,*cur=head,*next;' },
  { lineId: 'loop', text: '  while(cur){ next=cur->next; cur->next=pre; pre=cur; cur=next; }' },
  { lineId: 'return-pre', text: '  return pre;' },
  { lineId: 'done', text: '}' },
];

/**
 * 单链表反转 二次复审修复版
 * @param {{list:number[]}} input
 * @returns {{steps:any[],result:number[],sourceVersion:string,sourceLines:typeof SOURCE_LINES}}
 */
export function generateSinglyLinkedListReverseSteps(input) {
  const { list } = input;
  const steps = [];
  let nodes = list.map((v,id)=>({id,value:v,next:id+1<list.length?id+1:null}));

  function record(event, lineId, description, extraVars={}){
    const done = event==='sorted';
    const snapNodes = JSON.parse(JSON.stringify(nodes));
    steps.push({
      schemaVersion:'1.0',
      algorithm:'singly-linked-list-reverse',
      stepIndex:steps.length,
      sourceVersion:SOURCE_VERSION,
      event,
      lineId,
      array: snapNodes.map(x=>x.value),
      variables:{ nodes:snapNodes, ...extraVars },
      description,
      done,
      result: done ? JSON.parse(JSON.stringify(snapNodes.map(x=>x.value))) : null
    });
  }

  record('init','init',`原始链表 [${list.join(',')}]，开始反转`);
  if(nodes.length <=1){
    record('sorted','done',`无需反转 [${nodes.map(x=>x.value).join(',')}]`);
    return {steps, result: nodes.map(x=>x.value), sourceVersion:SOURCE_VERSION, sourceLines:SOURCE_LINES};
  }

  let preId = null;
  let curId = 0;
  record('var-init','var-init',`pre=null, cur=${curId}` , {preId,curId});
  while(curId !== null){
    const nextId = nodes[curId].next;
    record('loop','loop',`cur=${curId}, next=${nextId}，修改cur的next指向pre=${preId}`,{preId,curId,nextId});
    nodes[curId].next = preId;
    preId = curId;
    curId = nextId;
  }

  const revValues = [];
  let p = preId;
  while(p!==null){
    revValues.push(nodes[p].value);
    p = nodes[p].next;
  }
  nodes = revValues.map((v,idx)=>({id:idx,value:v,next:idx+1<revValues.length?idx+1:null}));

  record('sorted','done',`反转完成 [${revValues.join(',')}]`);
  return {steps, result: revValues, sourceVersion:SOURCE_VERSION, sourceLines:SOURCE_LINES};
}

