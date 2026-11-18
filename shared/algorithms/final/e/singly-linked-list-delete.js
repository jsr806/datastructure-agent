// shared/algorithms/final/e/singly-linked-list-delete.js
const SOURCE_VERSION = 'singly-linked-delete-c-v1';
const SOURCE_LINES = [
  { lineId: 'init', text: 'int list_delete(ListNode* &head, int pos) {' },
  { lineId: 'check-pos', text: '  if(pos<0 || !head) return -1;' },
  { lineId: 'del-head', text: '  if(pos==0){ ListNode* p=head; head=head->next; delete p; return 0; }' },
  { lineId: 'find-pre', text: '  ListNode* cur=head; for(int i=0;i<pos-1;i++){ if(!cur->next) return -1; cur=cur->next; }' },
  { lineId: 'del-link', text: '  ListNode* p=cur->next; cur->next = p->next; delete p; return 0;' },
  { lineId: 'done', text: '}' },
];

/**
 * 单链表按位置删除 二次复审修复版
 * @param {{list:number[],pos:number}} input
 * @returns {{steps:any[],result:number[]|null,sourceVersion:string,sourceLines:typeof SOURCE_LINES}}
 */
export function generateSinglyLinkedListDeleteSteps(input) {
  const { list, pos } = input;
  const steps = [];
  let nodes = list.map((v,id)=>({id,value:v,next:id+1<list.length?id+1:null}));

  function record(event, lineId, description, extraVars={}){
    const done = event==='sorted'||event==='error';
    const snapNodes = JSON.parse(JSON.stringify(nodes));
    steps.push({
      schemaVersion:'1.0',
      algorithm:'singly-linked-list-delete',
      stepIndex:steps.length,
      sourceVersion:SOURCE_VERSION,
      event,
      lineId,
      array: snapNodes.map(x=>x.value),
      variables:{ nodes:snapNodes, pos, ...extraVars },
      description,
      done,
      result: done ? (event === 'error' ? null : JSON.parse(JSON.stringify(snapNodes.map(x=>x.value)))) : null
    });
  }

  record('init','init',`原始链表 [${list.join(',')}]，删除pos=${pos}`);

  if(!Number.isInteger(pos) || pos<0 || pos >= nodes.length){
    record('error','check-pos',`pos=${pos}非法越界，需要合法整数下标`);
    return {steps,result:null,sourceVersion:SOURCE_VERSION,sourceLines:SOURCE_LINES};
  }

  if(pos === 0){
    record('del-head','del-head','删除头结点');
    nodes.shift();
  }else{
    let curId = 0;
    for(let i=0;i<pos-1;i++){
      record('find-pre','find-pre',`寻找前驱 i=${i}, curId=${curId}`);
      curId = nodes[curId].next;
    }
    record('del-link','del-link',`删除curId=${curId}的后继节点`);
    nodes.splice(curId+1,1);
  }
  for(let i=0;i<nodes.length;i++) nodes[i].id = i;
  for(let i=0;i<nodes.length-1;i++) nodes[i].next = i+1;
  if(nodes.length>0) nodes[nodes.length-1].next = null;

  record('sorted','done',`删除完成，链表 [${nodes.map(x=>x.value).join(',')}]`);
  return {steps, result: nodes.map(x=>x.value), sourceVersion:SOURCE_VERSION, sourceLines:SOURCE_LINES};
}
