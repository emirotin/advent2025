import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("12/demo.txt", "utf-8")).trim();
	return content.split("\n\n");
}

type Matrix = {
	w: number;
	h: number;
	m: (1 | 0)[][];
};

const initMatrix = (w: number, h: number) =>
	Array.from({ length: h }, () => Array.from({ length: w }, () => 0 as 0 | 1));

const parseShape = (s: string, i: number): Matrix => {
	const lines = s.trim().split("\n");
	const num = lines.shift()!.trim();
	if (num !== `${i}:`) throw new Error("Wrong index ${num}");
	const m = lines.map((l) =>
		l
			.trim()
			.split("")
			.map((s) => (s === "#" ? 1 : 0))
	);
	return {
		m,
		h: m.length,
		w: m[0]!.length,
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
			newM[w - c - 1]![r] = m[r]![c]!;
		}
	}

	return {
		w: matrix.h,
		h: matrix.w,
		m: newM,
	};
};

const flipH = (matrix: Matrix): Matrix => {
	const { w, h, m } = matrix;
	const newM = initMatrix(w, h);
	for (let r = 0; r < h; r++) {
		for (let c = 0; c < w; c++) {
			newM[r]![w - c - 1] = m[r]![c]!;
		}
	}

	return {
		w: matrix.h,
		h: matrix.w,
		m: newM,
	};
};

const flipV = (matrix: Matrix): Matrix => {
	const { w, h, m } = matrix;
	const newM = initMatrix(w, h);
	for (let r = 0; r < h; r++) {
		for (let c = 0; c < w; c++) {
			newM[h - r - 1]![c] = m[r]![c]!;
		}
	}

	return {
		w: matrix.h,
		h: matrix.w,
		m: newM,
	};
};

const clone = (matrix: Matrix): Matrix => {
	const { w, h, m } = matrix;
	const newM = initMatrix(w, h);
	for (let r = 0; r < h; r++) {
		for (let c = 0; c < w; c++) {
			newM[r]![c] = m[r]![c]!;
		}
	}

	return {
		w: matrix.h,
		h: matrix.w,
		m: newM,
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
		matrix.m.map((r) => r.map((x) => (x === 1 ? "#" : ".")).join("")).join("\n")
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
	result.forEach(print);
	removeDuplicates(result, eq);
	return result;
};

async function main() {
	const input = await readInput();

	const problems = parseProblems(input.pop()!);
	const shapes = input.map(parseShape).map(produceVariations);
}

main().catch(console.error);
