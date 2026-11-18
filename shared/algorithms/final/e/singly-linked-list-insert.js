// shared/algorithms/final/e/singly-linked-list-insert.js
const SOURCE_VERSION = 'singly-linked-insert-c-v1';
const SOURCE_LINES = [
  { lineId: 'init', text: 'int list_insert(ListNode* &head, int pos, int val) {' },
  { lineId: 'check-pos', text: '  if(pos<0) return -1;' },
  { lineId: 'create-node', text: '  ListNode *p=new ListNode(val);' },
  { lineId: 'insert-head', text: '  if(pos==0){ p->next=head; head=p; return 0; }' },
  { lineId: 'find-pre', text: '  ListNode *cur=head; for(int i=0;i<pos-1;i++){ if(!cur) return -1; cur=cur->next; }' },
  { lineId: 'link', text: '  p->next = cur->next; cur->next = p; return 0;' },
  { lineId: 'done', text: '}' },
];

/**
 * 单链表插入 二次复审修复版
 * @param {{list:number[],pos:number,value:number}} input
 * @returns {{steps:any[],result:number[]|null,sourceVersion:string,sourceLines:typeof SOURCE_LINES}}
 */
export function generateSinglyLinkedInsertSteps(input) {
  const { list, pos, value } = input;
  const steps = [];
  let nodes = list.map((v,id)=>({id,value:v,next:id+1<list.length?id+1:null}));

  function record(event, lineId, description, extraVars={}){
    const done = event==='sorted'||event==='error';
    const snapNodes = JSON.parse(JSON.stringify(nodes));
    steps.push({
      schemaVersion:'1.0',
      algorithm:'singly-linked-list-insert',
      stepIndex:steps.length,
      sourceVersion:SOURCE_VERSION,
      event,
      lineId,
      array: snapNodes.map(x=>x.value),
      variables:{ nodes:snapNodes, pos, value, ...extraVars },
      description,
      done,
      result: done ? (event === 'error' ? null : JSON.parse(JSON.stringify(snapNodes.map(x=>x.value)))) : null
    });
  }

  record('init','init',`原始链表 [${list.join(',')}]，pos=${pos}插入值${value}`);

  if(!Number.isInteger(pos) || pos < 0){
    record('error','check-pos',`pos=${pos}非法，必须非负整数`);
    return {steps,result:null,sourceVersion:SOURCE_VERSION,sourceLines:SOURCE_LINES};
  }
  if(pos > nodes.length){
    record('error','check-pos',`pos=${pos}超过链表长度${nodes.length}`);
    return {steps,result:null,sourceVersion:SOURCE_VERSION,sourceLines:SOURCE_LINES};
  }

  const newId = nodes.length;
  record('create-node','create-node',`新建节点 id=${newId}, value=${value}`);
  if(pos === 0){
    nodes.unshift({id:newId,value,next:0});
    for(let i=0;i<nodes.length;i++) nodes[i].id = i;
    for(let i=0;i<nodes.length-1;i++) nodes[i].next = i+1;
    nodes[nodes.length-1].next = null;
    record('insert-head','insert-head','头插完成');
  }else{
    let curId = 0;
    for(let i=0;i<pos-1;i++){
      record('find-pre','find-pre',`寻找前驱节点 i=${i}, curId=${curId}`);
      curId = nodes[curId].next;
    }
    const oldNext = nodes[curId].next;
    nodes.splice(curId+1,0,{id:newId,value,next:oldNext});
    for(let i=0;i<nodes.length;i++) nodes[i].id=i;
    for(let i=0;i<nodes.length-1;i++) nodes[i].next = i+1;
    nodes[nodes.length-1].next = null;
    record('link','link',`在curId=${curId}后插入新节点`);
  }

  record('sorted','done',`插入完成，链表：[${nodes.map(x=>x.value).join(',')}]`);
  return {steps, result: nodes.map(x=>x.value), sourceVersion:SOURCE_VERSION, sourceLines:SOURCE_LINES};
}

