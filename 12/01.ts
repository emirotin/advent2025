import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("12/demo.txt", "utf-8")).trim();
	return content.split("\n\n");
}

type Matrix = {
	w: number;
	h: number;
	m: boolean[][];
};

type BitmaskMatrix = {
	w: number;
	h: number;
	m: number[];
};

const rowToBitmask = (row: boolean[]) =>
	row.reduce<number>((acc, v) => (acc << 1) | +v, 0);

const bitmaskToRow = (row: number, length: number): boolean[] => {
	const result = Array.from({ length }, () => false);
	let i = length - 1;
	while (row) {
		const v = row % 2 === 1;
		result[i] = v;
		row >> 1;
	}
	return result;
};

const initMatrix = (w: number, h: number): Matrix => {
	const m = Array.from({ length: h }, () =>
		Array.from({ length: w }, () => false)
	);
	return {
		w,
		h,
		m,
	};
};

const matrixToBitmaskMatrix = (matrix: Matrix): BitmaskMatrix => ({
	...matrix,
	m: matrix.m.map(rowToBitmask),
});

const bitmaskMartrixToMatrix = (matrix: BitmaskMatrix) => ({
	...matrix,
	m: matrix.m.map(bitmaskToRow),
});

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

const clone = (matrix: BitmaskMatrix): BitmaskMatrix => {
	return {
		w: matrix.w,
		h: matrix.h,
		m: matrix.m.slice(),
	};
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

const produceVariations = (matrix: Matrix): BitmaskMatrix[] => {
	const m1 = rotateCCW(matrix);
	const m2 = rotateCCW(m1);
	const m3 = rotateCCW(m2);
	const result = [matrix, m1, m2, m3, flipH(matrix), flipV(matrix)];
	removeDuplicates(result, eq);
	return result.map(matrixToBitmaskMatrix);
};

const fitShape = (
	host: BitmaskMatrix,
	shape: BitmaskMatrix,
	startR: number,
	startC: number
): BitmaskMatrix | null => {
	if (host.h - shape.h - startR < 0) return null;
	const shiftC = host.w - shape.w - startC;
	if (shiftC < 0) return null;

	const newHost = clone(host);

	for (let r = 0; r < shape.h; r++) {
		const x = shape.m[r]! << shiftC;
		if (host.m[r]! & x) return null;
		newHost.m[r]! |= x;
	}

	return newHost;
};

const fitIfPossibleInt = (
	p: Problem,
	shapes: BitmaskMatrix[][],
	currentState: BitmaskMatrix
): BitmaskMatrix | null => {
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

	const maxStartR = currentState.h - shape[0]!.h;
	const maxStartC = currentState.w - shape[0]!.w;

	for (const m of shape) {
		for (let r = 0; r <= maxStartR; r++) {
			for (let c = 0; c <= maxStartC; c++) {
				const newState = fitShape(currentState, m, r, c);
				if (!newState) continue;
				const res = fitIfPossibleInt(newP, shapes, newState);
				if (res) return res;
			}
		}
	}

	return null;
};

const fitIfPossible = (p: Problem, shapes: BitmaskMatrix[][]) => {
	return fitIfPossibleInt(
		p,
		shapes,
		matrixToBitmaskMatrix(initMatrix(p.w, p.h))
	);
};

async function main() {
	const input = await readInput();

	const problems = parseProblems(input.pop()!);
	const shapes = input.map(parseShape).map(produceVariations);

	for (const p of problems) {
		console.log("----------");
		const r = fitIfPossible(p, shapes);
		if (r) {
			console.log("OK");
			print(bitmaskMartrixToMatrix(r));
		} else {
			console.log("No Way!");
		}
	}
}

main().catch(console.error);
