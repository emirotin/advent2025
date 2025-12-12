import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("12/demo.txt", "utf-8")).trim();
	return content.split("\n\n");
}

type Matrix = {
	w: number;
	h: number;
	m: boolean[][];
	emptyCells: Array<readonly [number, number]>;
};

const initMatrix = (w: number, h: number): Matrix => {
	const m = Array.from({ length: h }, () =>
		Array.from({ length: w }, () => false)
	);
	return {
		w,
		h,
		m,
		emptyCells: Array.from({ length: h }, (_, r) =>
			Array.from({ length: w }, (_, c) => [r, c] as const)
		).flat(),
	};
};

const parseShape = (s: string, i: number): Matrix => {
	const lines = s.trim().split("\n");
	const num = lines.shift()!.trim();
	if (num !== `${i}:`) throw new Error("Wrong index ${num}");
	const m = lines.map((l) =>
		l
			.trim()
			.split("")
			.map((s) => s === "#")
	);
	const h = m.length;
	const w = m[0]!.length;
	return {
		m,
		h,
		w,
		emptyCells: Array.from({ length: h }, (_, r) =>
			Array.from({ length: w }, (_, c) => [r, c] as const)
		)
			.flat()
			.filter(([r, c]) => !m[r]![c]),
	};
};

const parseProblems = (s: string) => {
	return s
		.trim()
		.split("\n")
		.map((l) => {
			const [size, shapes] = l.split(": ");
			const [w, h] = size!.split("x").map((s) => Number.parseInt(s));
			const shapeCounts = shapes!.split(" ").map((s) => Number.parseInt(s));
			return {
				w: w!,
				h: h!,
				shapeCounts,
			};
		});
};

type Problem = ReturnType<typeof parseProblems>[number];

const rotateCCW = (matrix: Matrix): Matrix => {
	const { w, h, m } = matrix;
	const newM = initMatrix(h, w);
	for (let r = 0; r < h; r++) {
		for (let c = 0; c < w; c++) {
			newM.m[w - c - 1]![r] = m[r]![c]!;
		}
	}

	return newM;
};

const flipH = (matrix: Matrix): Matrix => {
	const { w, h, m } = matrix;
	const newM = initMatrix(w, h);
	for (let r = 0; r < h; r++) {
		for (let c = 0; c < w; c++) {
			newM.m[r]![w - c - 1] = m[r]![c]!;
		}
	}

	return newM;
};

const flipV = (matrix: Matrix): Matrix => {
	const { w, h, m } = matrix;
	const newM = initMatrix(w, h);
	for (let r = 0; r < h; r++) {
		for (let c = 0; c < w; c++) {
			newM.m[h - r - 1]![c] = m[r]![c]!;
		}
	}

	return newM;
};

const clone = (matrix: Matrix): Matrix => {
	const { w, h, m } = matrix;
	const newM = initMatrix(w, h);
	for (let r = 0; r < h; r++) {
		for (let c = 0; c < w; c++) {
			newM.m[r]![c] = m[r]![c]!;
		}
	}

	return { ...newM, emptyCells: matrix.emptyCells.slice() };
};

const eq = (m1: Matrix, m2: Matrix) => {
	if (m1.h !== m2.h) return false;
	if (m1.w !== m2.w) return false;
	const { w, h, m } = m1;
	for (let r = 0; r < h; r++) {
		for (let c = 0; c < w; c++) {
			if (m[r]![c] !== m2.m[r]![c!]) return false;
		}
	}
	return true;
};

const print = (matrix: Matrix) => {
	console.log(
		matrix.m.map((r) => r.map((x) => (x ? "#" : ".")).join("")).join("\n")
	);
};

const removeDuplicates = <T>(arr: T[], eq: (x: T, y: T) => boolean) => {
	for (let i = 0; i < arr.length - 1; i++) {
		let j = i + 1;
		while (j < arr.length) {
			if (eq(arr[i]!, arr[j]!)) {
				arr.splice(j);
			} else {
				j++;
			}
		}
	}
};

const produceVariations = (matrix: Matrix) => {
	const m1 = rotateCCW(matrix);
	const m2 = rotateCCW(m1);
	const m3 = rotateCCW(m2);
	const result = [matrix, m1, m2, m3, flipH(matrix), flipV(matrix)];
	removeDuplicates(result, eq);
	return result;
};

const fitShape = (
	host: Matrix,
	shape: Matrix,
	startR: number,
	startC: number
): Matrix | null => {
	const newHost = clone(host);
	const emptyCells = new Set(host.emptyCells.map(([r, c]) => `${r}:${c}`));

	for (let r = 0; r < shape.h; r++) {
		const hostR = startR + r;
		if (hostR >= host.h) return null;
		for (let c = 0; c < shape.w; c++) {
			const hostC = startC + c;
			if (hostC >= host.w) return null;
			if (shape.m[r]![c]!) {
				const coords = `${hostR}:${hostC}`;
				if (!emptyCells.has(coords)) return null;
				emptyCells.delete(coords);
				newHost.m[hostR]![hostC] = shape.m[r]![c]!;
			}
		}
	}

	return {
		...newHost,
		emptyCells: emptyCells
			.values()
			.toArray()
			.map(
				(s) =>
					s.split(":").map((x) => Number.parseInt(x)) as unknown as readonly [
						number,
						number
					]
			),
	};
};

const fitIfPossibleInt = (
	p: Problem,
	shapes: Matrix[][],
	currentState: Matrix
): Matrix | null => {
	if (p.w !== currentState.w || p.h !== currentState.h)
		throw new Error("Wrong state dimensions");
	if (p.shapeCounts.length !== shapes.length)
		throw new Error("Wrong shapes count");

	const i = p.shapeCounts.findIndex((x) => x > 0);
	// all zeros, good
	if (i < 0) return currentState;

	const shape = shapes[i]!;
	const newCounts = p.shapeCounts.slice();
	newCounts[i]! -= 1;
	const newP = {
		...p,
		shapeCounts: newCounts,
	};

	for (const m of shape) {
		for (const [r, c] of currentState.emptyCells) {
			const newState = fitShape(currentState, m, r, c);
			if (!newState) continue;
			const res = fitIfPossibleInt(newP, shapes, newState);
			if (res) return res;
		}
	}

	return null;
};

const fitIfPossible = (p: Problem, shapes: Matrix[][]) => {
	const totalArea = p.w * p.h;
	const shapeAreas = shapes.map((shape) => {
		const v = shape[0]!;
		return v.m
			.map((row) => row.reduce<number>((a, b) => a + +b, 0))
			.reduce((a, b) => a + b);
	});
	const shapesTotalArea = shapeAreas
		.map((a, i) => a * p.shapeCounts[i]!)
		.reduce((a, b) => a + b);
	if (shapesTotalArea > totalArea) return null;
	return fitIfPossibleInt(p, shapes, initMatrix(p.w, p.h));
};

async function main() {
	const input = await readInput();

	const problems = parseProblems(input.pop()!);
	const shapes = input.map(parseShape).map(produceVariations);

	for (const p of problems) {
		console.log("----------");
		const r = fitIfPossible(p, shapes);
		if (r) {
			print(r);
		} else {
			console.log("No Way!");
		}
	}
}

main().catch(console.error);
