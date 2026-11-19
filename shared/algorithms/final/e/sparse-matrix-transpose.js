// sparse-matrix-transpose.js
const sourceVersion = "e-package-v3-fix";
const sourceLines = "1-95";

export function generateSparseMatrixTransposeSteps({ rows, cols, triples }) {
    const steps = [];
    steps.push({ event: "init", variables: { rows, cols, triples } });

    for (const t of triples) {
        const { i, j, e } = t;
        if (!Number.isInteger(i) || !Number.isInteger(j) || i < 0 || j < 0 || i >= rows || j >= cols) {
            steps.push({ event: "error", result: null });
            return { steps, result: null, sourceVersion, sourceLines };
        }
        if (typeof e !== "number" || isNaN(e) || !isFinite(e)) {
            steps.push({ event: "error", result: null });
            return { steps, result: null, sourceVersion, sourceLines };
        }
    }

    const normalized = [...triples].sort((a, b) => {
        if (a.i !== b.i) return a.i - b.i;
        return a.j - b.j;
    });
    steps.push({
        event: "normalize_sort",
        comment: "输入三元组执行行优先规范化排序",
        variables: { normalized }
    });

    const transposedTriples = normalized.map(t => ({ i: t.j, j: t.i, e: t.e }));
    transposedTriples.sort((a, b) => {
        if (a.i !== b.i) return a.i - b.i;
        return a.j - b.j;
    });

    const outRows = cols;
    const outCols = rows;
    const result = { rows: outRows, cols: outCols, triples: transposedTriples };

    steps.push({
        event: "done",
        variables: { result },
        result
    });

    return { steps, result, sourceVersion, sourceLines };
}
