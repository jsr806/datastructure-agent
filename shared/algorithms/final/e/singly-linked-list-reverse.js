// singly-linked-list-reverse.js
const sourceVersion = "e-package-v3-fix";
const sourceLines = "1-100";

export function generateSinglyLinkedListReverseSteps({ list }) {
    const steps = [];
    let nextAutoId = 0;

    let nodes = list.map(v => ({ id: nextAutoId++, value: v, next: null }));
    for (let i = 0; i < nodes.length - 1; i++) {
        nodes[i].next = nodes[i + 1].id;
    }
    let headId = nodes[0].id;

    steps.push({
        event: "init",
        variables: { nodes: JSON.parse(JSON.stringify(nodes)), headId }
    });

    let prevId = null;
    let currId = headId;
    while (currId !== null) {
        const currNode = nodes.find(n => n.id === currId);
        const nextSaveId = currNode.next;
        currNode.next = prevId;
        steps.push({
            event: "reverse_link",
            variables: { nodes: JSON.parse(JSON.stringify(nodes)), headId: currId },
            comment: `反转节点 ${currId} 的next指向 ${prevId}`
        });
        prevId = currId;
        currId = nextSaveId;
    }
    headId = prevId;

    const collectByHead = () => {
        const arr = [];
        let cid = headId;
        while (cid !== null) {
            const nd = nodes.find(x => x.id === cid);
            arr.push(nd.value);
            cid = nd.next;
        }
        return arr;
    };
    const finalResult = collectByHead();

    steps.push({
        event: "done",
        variables: { nodes: JSON.parse(JSON.stringify(nodes)), headId },
        result: finalResult
    });

    return { steps, result: finalResult, sourceVersion, sourceLines };
}
