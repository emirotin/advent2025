import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("12/input.txt", "utf-8")).trim();
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

type CondensedBitmaskMatrix = {
	w: number;
	h: number;
	m: bigint;
};

const rowToBitmask = (row: boolean[]) =>
	row.reduce<number>((acc, v) => (acc << 1) | +v, 0);

const bitmaskToRow = (row: number, length: number): boolean[] => {
	const result = Array.from({ length }, () => false);
	let i = length - 1;
	while (row) {
		const v = row % 2 === 1;
		result[i] = v;
		row >>= 1;
		i--;
	}
	return result;
};

const bitmaskToCondensedBitmask = (mask: number[], w: number): bigint => {
	let result = 0n;
	const shift = BigInt(w);
	for (let i = mask.length - 1; i >= 0; i--) {
		result <<= shift;
		result |= BigInt(mask[i]!);
	}
	return result;
};

const condensedBitmaskToBitmask = (
	mask: bigint,
	w: number,
	h: number
): number[] => {
	let result = Array.from({ length: h }, () => 0);
	const extractor = (1n << BigInt(w)) - 1n;
	let i = 0;
	while (mask) {
		const v = mask & extractor;
		result[i] = Number(v);
		i++;
		mask >>= BigInt(w);
	}
	return result;
};

const bitmaskMatrixToCondensedBitmaskMatrix = (
	matrix: BitmaskMatrix,
	hostW: number
): CondensedBitmaskMatrix => ({
	...matrix,
	m: bitmaskToCondensedBitmask(matrix.m, hostW),
});

const condensedBitmaskMatrixToBitmaskMatrix = (
	matrix: CondensedBitmaskMatrix,
	hostW: number,
	hostH: number
): BitmaskMatrix => ({
	...matrix,
	m: condensedBitmaskToBitmask(matrix.m, hostW, hostH),
});

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
	m: matrix.m.map((r) => bitmaskToRow(r, matrix.w)),
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

const calcBits = (n: bigint) => {
	let res = 0;
	while (n) {
		res += Number(n & 1n);
		n >>= 1n;
	}
	return res;
};

const fitIfPossible = (
	shapes: BitmaskMatrix[][],
	w: number,
	h: number,
	shapeCounts: number[]
): bigint | null => {
	const seen = new Set<string>();

	const condensedShapes = shapes.map((s) =>
		s.map((v) => bitmaskMatrixToCondensedBitmaskMatrix(v, w))
	);

	const total = condensedShapes
		.map((s) => calcBits(s[0]!.m))
		.map((v, i) => v * shapeCounts[i]!)
		.reduce((a, b) => a + b);
	if (total > w * h) {
		// console.log("Early exit!");
		return null;
	}

	const inner = (
		shapeCounts: number[],
		currentState: bigint
	): bigint | null => {
		const desc = currentState + "|" + shapeCounts.join(",");
		if (seen.has(desc)) {
			// console.log("skip");
			return null;
		}
		seen.add(desc);
		// console.log(shapeCounts);

		const i = shapeCounts.findIndex((x) => x > 0);
		// all zeros, good
		if (i < 0) {
			return currentState;
		}

		const newCounts = shapeCounts.with(i, shapeCounts[i]! - 1);
		const shape = condensedShapes[i]!;
		const maxShiftTop = h - shape[0]!.h;
		const maxShiftRight = w - shape[0]!.w;

		for (const v of shape) {
			for (let r = 0; r <= maxShiftTop; r++) {
				for (let c = 0; c <= maxShiftRight; c++) {
					const mask = v.m << BigInt(r * w + c);
					const newState = currentState & mask ? null : currentState | mask;
					if (newState === null) continue;
					const res = inner(newCounts, newState);
					if (res) return res;
				}
			}
		}

		return null;
	};

	return inner(shapeCounts, 0n);
};

// const print = (condensedMask: bigint, w: number, h: number) => {
// 	const matrix = bitmaskMartrixToMatrix(
// 		condensedBitmaskMatrixToBitmaskMatrix(
// 			{
// 				w,
// 				h,
// 				m: condensedMask,
// 			},
// 			w,
// 			h
// 		)
// 	);
// 	console.log(
// 		matrix.m.map((r) => r.map((x) => (x ? "#" : ".")).join("")).join("\n")
// 	);
// };

async function main() {
	const input = await readInput();

	const problems = parseProblems(input.pop()!);
	const shapes = input.map(parseShape).map(produceVariations);

	let result = 0;
	for (const p of problems) {
		// console.log("----------");
		const r = fitIfPossible(shapes, p.w, p.h, p.shapeCounts);
		// if (r) {
		// 	console.log("OK");
		// } else {
		// 	console.log("No Way!");
		// }

		result += +Boolean(r);
	}

	console.log(result);
}

main().catch(console.error);
