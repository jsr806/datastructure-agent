import { BINARY_SEARCH_TREE_REPLAY_FORMAT, restoreBinarySearchTreeRun } from '../../../shared/algorithms/final/g/bst-replay.js';

export async function requestJSON(path, { signal, body } = {}) {
  let response;
  try {
    response = await fetch(path, { method: body === undefined ? 'GET' : 'POST', signal,
      ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('无法连接服务，请检查后端是否已启动。');
  }
  let data;
  try { data = await response.json(); } catch { throw new Error('服务返回了无法读取的数据，请稍后重试。'); }
  if (!response.ok) throw new Error(typeof data?.error?.message === 'string' ? data.error.message : `请求失败（${response.status}）`);
  return data;
}

export async function createRun(input, signal, algorithm = 'binary-search') {
  const run = await requestJSON(`/api/algorithms/${algorithm}/runs`, { body: input, signal });
  if (algorithm !== 'binary-search-tree') return run;
  if (run?.format !== BINARY_SEARCH_TREE_REPLAY_FORMAT) throw new Error('无法识别二叉排序树的回放格式。');
  return restoreBinarySearchTreeRun(run);
}
