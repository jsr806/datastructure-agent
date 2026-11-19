// kth-from-end.js
const sourceVersion = "e-package-v3-fix";
const sourceLines = "1-110";

export function generateKthFromEndSteps({ list, k }) {
    const steps = [];
    let autoId = 0;
    const nodes = list.map(v => ({ id: autoId++, value: v, next: null }));
    for (let i = 0; i < nodes.length - 1; i++) {
        nodes[i].next = nodes[i + 1].id;
    }
    let headId = nodes[0].id;

    steps.push({
        event: "init",
        variables: { nodes: JSON.parse(JSON.stringify(nodes)), headId }
    });

    if (!Number.isInteger(k) || k <= 0 || k > list.length) {
        const errResult = { nodeId: null, value: null };
        steps.push({
            event: "error",
            variables: { nodes: JSON.parse(JSON.stringify(nodes)), headId },
            result: errResult
        });
        return {
            steps,
            result: errResult,
            sourceVersion,
            sourceLines
        };
    }

    let fastId = headId;
    let slowId = headId;
    for (let s = 0; s < k; s++) {
        const nd = nodes.find(x => x.id === fastId);
        fastId = nd.next;
    }
    steps.push({
        event: "fast_forward",
        variables: { nodes: JSON.parse(JSON.stringify(nodes)), headId, fastId, slowId }
    });

    while (fastId !== null) {
        const fnd = nodes.find(x => x.id === fastId);
        const snd = nodes.find(x => x.id === slowId);
        fastId = fnd.next;
        slowId = snd.next;
        steps.push({
            event: "move_both",
            variables: { nodes: JSON.parse(JSON.stringify(nodes)), headId, fastId, slowId }
        });
    }

    const targetNode = nodes.find(x => x.id === slowId);
    const okResult = { nodeId: targetNode.id, value: targetNode.value };
    steps.push({
        event: "done",
        variables: { nodes: JSON.parse(JSON.stringify(nodes)), headId, fastId, slowId },
        result: okResult
    });

    return { steps, result: okResult, sourceVersion, sourceLines };
}

