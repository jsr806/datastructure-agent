export const BINARY_SEARCH_TREE_REPLAY_FORMAT = 'bst-replay-v1';

export function freezeTree(root, nodes) {
  return Object.freeze({ root, nodes: Object.freeze(nodes) });
}

export function restoreBinarySearchTreeRun(replay) {
  const { format, treeStates, steps, result, sourceVersion, sourceLines, ...metadata } = replay;
  if (format !== BINARY_SEARCH_TREE_REPLAY_FORMAT) throw new TypeError('不支持的二叉排序树回放格式。');

  // Reuse immutable state across steps, including after a JSON round trip.
  const trees = structuredClone(treeStates).map(({ root, nodes }) =>
    freezeTree(root, nodes.map(node => Object.freeze(node))));
  const results = result.operations.map(entry => Object.freeze({ ...entry, path: Object.freeze([...entry.path]) }));
  const expandedSteps = steps.map((step, stepIndex) => {
    const { event, lineId, description, currentNode, edge, operationIndex, treeIndex, pathLength, lastResultIndex } = step;
    const { root, nodes } = trees[treeIndex];
    const currentOperation = results[operationIndex];
    const done = event === 'done';
    const variables = {
      root, nodes, currentNode, edge: edge && { ...edge }, operationIndex,
      operation: currentOperation ? { type: currentOperation.type, key: currentOperation.key } : null,
      path: currentOperation?.path.slice(0, pathLength) ?? [],
      lastResult: results[lastResultIndex] ?? null,
    };
    if (done) variables.inorder = [...result.inorder];
    return {
      schemaVersion: '1.0', algorithm: 'binary-search-tree', sourceVersion, stepIndex, event,
      lineId, description, variables, done, result: done ? structuredClone(result) : null,
    };
  });
  return { ...metadata, steps: expandedSteps, result: structuredClone(result), sourceVersion, sourceLines };
}
