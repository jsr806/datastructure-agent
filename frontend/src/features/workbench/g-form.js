const labels = {
  sequences: ['前序序列', '中序序列', '两列均以逗号或空格分隔，最多 64 个唯一节点。两列都留空表示空树。'],
  forest: ['根节点（按顺序）', '节点与孩子（每行一个节点）', '每行填写「节点: 孩子1, 孩子2」，叶节点只填名称。孩子和根节点的顺序决定遍历或转换顺序，最多 64 个节点。全部留空表示空森林。'],
  symbols: ['符号与权重（每行一对）', '', '每行填写「符号: 权重」。符号不能重复，最多 64 个；权重为 1 到 2147483647。留空表示无符号。'],
  operations: ['操作序列（每行一项）', '', '按行输入 insert 键 或 search 键。最多 128 次操作、64 个不同的插入键。键须为 32 位有符号整数，留空表示无操作。'],
};

function ids(text) {
  return text.trim().split(/[,，\s]+/).filter(Boolean);
}

function lines(text) {
  return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
}

function pair(line) {
  return line.split(/[:：]/).map(part => part.trim());
}

export function createGForm({ binaryForm, message, onChange }) {
  const byId = id => document.getElementById(id);
  const mode = byId('g-mode'), primary = byId('g-primary'), secondary = byId('g-secondary');
  let config = null, collapsed = false;
  const binary = () => config?.form === 'binary' || (config?.form === 'conversion' && mode.value === 'to-forest');
  const kind = () => config?.form === 'conversion' ? 'forest' : config?.form;

  function update() {
    const active = Boolean(config);
    byId('g-mode-field').hidden = !config?.modes || collapsed;
    byId('g-fields').hidden = !active || binary() || collapsed;
    byId('g-summary').hidden = !active || binary() || !collapsed;
    if (binary()) {
      byId('tree-links-help').textContent = mode.value === 'to-forest'
        ? '左链接指向首个孩子，右链接指向下一个兄弟。多棵树的根也用右链接串接。没有链接时留空。'
        : '为每个节点选择左右孩子，空孩子留空。所有节点须能从根到达，不能有环或共享孩子。';
      return;
    }
    if (!active) return;
    byId('fillDemo').parentElement.hidden = collapsed;
    byId('startBtn').hidden = collapsed;
    byId('bfs-next').hidden = true;
    byId('bfs-back').hidden = true;
    const [first, second, help] = labels[kind()];
    byId('g-primary-label').textContent = first;
    byId('g-secondary-label').textContent = second;
    byId('g-secondary-field').hidden = !second;
    byId('g-help').textContent = help;
    primary.rows = second ? 2 : 4;
  }

  mode.addEventListener('change', () => {
    if (config?.form === 'conversion') binaryForm.setActive(binary());
    update();
    onChange();
  });
  byId('g-edit').addEventListener('click', () => {
    collapsed = false;
    update();
    message('');
    primary.focus();
  });
  byId('tree-edit').addEventListener('click', () => {
    if (!config) return;
    collapsed = false;
    update();
  });
  for (const field of [primary, secondary]) field.addEventListener('input', onChange);

  return {
    setAlgorithm(next) {
      config = next;
      collapsed = false;
      primary.value = '';
      secondary.value = '';
      mode.replaceChildren(...(config?.modes ?? []).map(([value, label]) => new Option(label, value)));
      binaryForm.setActive(binary());
      update();
    },
    fillDemo() {
      if (binary()) {
        binaryForm.fillDemo(mode.value === 'to-forest'
          ? [['B', 'D'], ['', 'C'], ['', ''], ['', '']]
          : undefined);
        message('示例已填入，点「下一步」查看左右链接。');
      } else {
        const examples = {
          sequences: ['A, B, D, C', 'B, D, A, C'],
          forest: ['A, D', 'A: B, C\nB\nC\nD'],
          symbols: ['A: 2\nB: 3\nC: 7'],
          operations: ['insert 5\ninsert 3\ninsert 7\ninsert 4\nsearch 4\nsearch 6\ninsert 3'],
        };
        const [first, second = ''] = examples[kind()];
        primary.value = first;
        secondary.value = second;
        message('示例已填入，可修改输入后运行。');
      }
      collapsed = false;
      update();
    },
    read() {
      if (collapsed) return null;
      if (binary()) {
        const input = binaryForm.read();
        return input && (config.modes ? { ...input, mode: mode.value } : input);
      }
      if (kind() === 'sequences') return { preorder: ids(primary.value), inorder: ids(secondary.value) };
      if (kind() === 'forest') {
        const nodes = lines(secondary.value).map(line => {
          const [id, children = '', extra] = pair(line);
          if (!id || extra !== undefined) throw new Error('每行填写「节点: 孩子1, 孩子2」，叶节点可以只填名称。');
          return { id, children: ids(children) };
        });
        return { mode: mode.value, roots: ids(primary.value), nodes };
      }
      if (kind() === 'symbols') {
        const symbols = lines(primary.value).map(line => {
          const [id, weight, extra] = pair(line);
          if (!id || !/^\d+$/.test(weight ?? '') || extra !== undefined) throw new Error('每行填写一个符号和整数权重，例如 A: 2。');
          return { id, weight: Number(weight) };
        });
        return { symbols };
      }
      const operations = lines(primary.value).map(line => {
        const match = /^(insert|search)\s+([+-]?\d+)$/.exec(line);
        if (!match) throw new Error('每行填写 insert 键 或 search 键，例如 insert 5。');
        return { type: match[1], key: Number(match[2]) };
      });
      return { operations };
    },
    summarize(input) {
      collapsed = true;
      const modeLabel = config.modes?.find(([value]) => value === input.mode)?.[1];
      if (binary()) {
        binaryForm.summarize(input, modeLabel);
      } else {
        const details = input.roots ? input.nodes.length + ' 个节点 · ' + input.roots.length + ' 棵树'
          : input.preorder ? input.preorder.length + ' 个节点'
          : input.symbols ? input.symbols.length + ' 个符号' : input.operations.length + ' 次操作';
        byId('g-summary-text').textContent = (modeLabel ?? config.title) + ' · ' + details;
      }
      update();
      if (!binary()) byId('g-edit').focus();
    },
  };
}
