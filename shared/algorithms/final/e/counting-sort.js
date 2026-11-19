// counting-sort.js
const sourceVersion = "e-package-v3-fix";
const sourceLines = "1-140";

export function generateCountingSortSteps({ list }) {
    const steps = [];
    const input = [...list];
    steps.push({ event: "init", variables: { input } });

    for (const num of input) {
        if (!Number.isInteger(num)) {
            steps.push({ event: "error", result: null });
            return { steps, result: null, sourceVersion, sourceLines };
        }
    }

    if (input.length === 0) {
        steps.push({ event: "done", result: [] });
        return { steps, result: [], sourceVersion, sourceLines };
    }

    const min = Math.min(...input);
    const max = Math.max(...input);
    let count = new Array(max - min + 1).fill(0);
    steps.push({ event: "count_init", variables: { min, max } });

    // 频次统计
    for (const val of input) {
        const idx = val - min;
        const old = count[idx];
        count[idx] += 1;
        steps.push({
            event: "count_inc",
            variables: { countDiff: { index: idx, old, new: count[idx] }, min, max },
            comment: `统计数值 ${val} 频次`
        });
    }

    // 前缀和，使用countDiff增量，不保存完整数组快照
    for (let i = 1; i < count.length; i++) {
        const oldVal = count[i];
        count[i] = count[i] + count[i - 1];
        steps.push({
            event: "prefix_sum",
            variables: { countDiff: { index: i, old: oldVal, new: count[i] }, min, max },
            comment: `前缀计算下标 ${i + min}`
        });
    }

    // 回填结果
    const output = new Array(input.length).fill(null);
    // 反向遍历保证稳定性
    for (let p = input.length - 1; p >= 0; p--) {
        const val = input[p];
        const cIdx = val - min;
        const pos = count[cIdx] - 1;
        output[pos] = val;
        const oldCnt = count[cIdx];
        count[cIdx] -= 1;
        steps.push({
            event: "place_output",
            variables: {
                output: [...output],
                countDiff: { index: cIdx, old: oldCnt, new: count[cIdx] },
                min, max
            },
            comment: `放置 ${val} 到输出[${pos}]`
        });
    }

    steps.push({
        event: "done",
        variables: { output },
        result: output
    });

    return { steps, result: output, sourceVersion, sourceLines };
}
