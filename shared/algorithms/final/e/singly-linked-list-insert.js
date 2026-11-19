// singly-linked-list-insert.js
const sourceVersion = "e-package-v3-fix";
const sourceLines = "1-120";

export function generateSinglyLinkedInsertSteps({ list, pos, value }) {
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

    if (pos < 0 || pos > list.length) {
        steps.push({
            event: "error",
            variables: { nodes: JSON.parse(JSON.stringify(nodes)), headId },
            result: null
        });
        return { steps, result: null, sourceVersion, sourceLines };
    }

    const newNodeId = nextAutoId++;
    const newNode = { id: newNodeId, value, next: null };
    nodes.push(newNode);

    steps.push({
        event: "create_node",
        variables: { nodes: JSON.parse(JSON.stringify(nodes)), headId },
        comment: `创建新节点 id=${newNodeId}, value=${value}`
    });

    if (pos === 0) {
        newNode.next = headId;
        headId = newNodeId;
        steps.push({
            event: "link_head_insert",
            variables: { nodes: JSON.parse(JSON.stringify(nodes)), headId }
        });
    } else {
        let currId = headId;
        let currNode = nodes.find(n => n.id === currId);
        for (let i = 0; i < pos - 1; i++) {
            currId = currNode.next;
            currNode = nodes.find(n => n.id === currId);
        }
        newNode.next = currNode.next;
        currNode.next = newNodeId;
        steps.push({
            event: "link_mid_insert",
            variables: { nodes: JSON.parse(JSON.stringify(nodes)), headId }
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

    return {
        steps,
        result: finalResult,
        sourceVersion,
        sourceLines
    };
}
