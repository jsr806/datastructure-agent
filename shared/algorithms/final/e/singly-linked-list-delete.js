// singly-linked-list-delete.js
const sourceVersion = "e-package-v3-fix";
const sourceLines = "1-115";

export function generateSinglyLinkedListDeleteSteps({ list, pos }) {
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

    if (pos < 0 || pos >= list.length) {
        steps.push({
            event: "error",
            variables: { nodes: JSON.parse(JSON.stringify(nodes)), headId },
            result: null
        });
        return { steps, result: null, sourceVersion, sourceLines };
    }

    let delNodeId;
    if (pos === 0) {
        delNodeId = headId;
        const oldHead = nodes.find(n => n.id === headId);
        headId = oldHead.next;
        steps.push({
            event: "delete_head",
            variables: { nodes: JSON.parse(JSON.stringify(nodes)), headId },
            comment: `删除头节点 ${delNodeId}，该id永久废弃，不复用`
        });
    } else {
        let prevId = headId;
        let prev = nodes.find(x => x.id === prevId);
        for (let i = 0; i < pos - 1; i++) {
            prevId = prev.next;
            prev = nodes.find(x => x.id === prevId);
        }
        delNodeId = prev.next;
        const delNd = nodes.find(x => x.id === delNodeId);
        prev.next = delNd.next;
        steps.push({
            event: "delete_mid",
            variables: { nodes: JSON.parse(JSON.stringify(nodes)), headId },
            comment: `删除节点 ${delNodeId}，id永久废弃不复用`
        });
    }

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
