import fs from "node:fs/promises";
import Fraction from "fraction.js";

async function readInput() {
	const content = (await fs.readFile("10/input.txt", "utf-8")).trim();
	return content.split("\n");
}

const parseDef = (s: string) => {
	const parts = s.split(" ");
	const lightsStr = parts.shift();
	const joltsStr = parts.pop();
	const buttonStrs = parts;

	if (!joltsStr?.match(/^{[,\d]+}$/)) {
		throw new Error(`Invalid jolts`, {
			cause: { lightsStr },
		});
	}
	const jolts = joltsStr
		.slice(1, -1)
		.split(",")
		.map((s) => Number.parseInt(s));

	const buttons = buttonStrs.map((buttonStr) => {
		if (!buttonStr?.match(/^\([,\d]+\)$/)) {
			throw new Error(`Invalid button`, {
				cause: { buttonStr },
			});
		}
		return buttonStr
			.slice(1, -1)
			.split(",")
			.map((s) => Number.parseInt(s));
	});

	return { buttons, jolts };
};

const zero = new Fraction(0, 1);
const one = new Fraction(1, 1);
const isZero = (x: Fraction | undefined) => x !== undefined && x.equals(zero);

const DEBUG = false;

const printMatrix = (matrix: Fraction[][], v: Fraction[]) => {
	if (!DEBUG) return;
	console.log(
		matrix
			.map(
				(r, i) =>
					r.map((x) => x.toString().padStart(3, " ")).join(" ") +
					" | " +
					v[i]!.toString().padStart(3, " ")
			)
			.join("\n")
	);
	console.log();
};
const log = (s: string) => {
	if (!DEBUG) return;
	console.log(s);
};

function diagonalize(matrix: Fraction[][], v: Fraction[]) {
	matrix = matrix.map((r) => r.slice());
	v = v.slice();

	let n = matrix.length;
	const m = matrix[0]!.length;

	if (v.length !== n) {
		throw new Error("Vector must have the same length");
	}
	if (matrix.some((r) => r.length !== m)) {
		throw new Error("Matrix must be rectangular");
	}

	const print = () => printMatrix(matrix, v);

	print();

	const swapRows = (r1: number, r2: number) => {
		const tmpRow = matrix[r1]!;
		matrix[r1] = matrix[r2]!;
		matrix[r2] = tmpRow;
		const tmpV = v[r1]!;
		v[r1] = v[r2]!;
		v[r2] = tmpV;
	};

	const sub = (r: number, c: number) => {
		const d = matrix[r]![c]!;
		if (isZero(d)) throw new Error("Zero diagonal element");
		v[r] = v[r]!.div(d);
		for (let c1 = c; c1 < m; c1++) {
			matrix[r]![c1] = matrix[r]![c1]!.div(d);
		}

		for (let r2 = r + 1; r2 < n; r2++) {
			const d = matrix[r2]![c]!;
			if (isZero(d)) return;
			v[r2] = v[r2]!.sub(v[r].mul(d));
			for (let c1 = c; c1 < m; c1++) {
				matrix[r2]![c1] = matrix[r2]![c1]!.sub(matrix[r]![c1]!.mul(d));
			}
		}
	};

	let currCol = 0;
	for (let r = 0; r < n && r < m; r++) {
		log(`Row ${r}`);

		// Find the first column that has non-zero values
		while (
			currCol < m &&
			Array.from({ length: n - r }, (_, i) => i + r).every((r2) =>
				isZero(matrix[r2]![currCol])
			)
		) {
			currCol++;
		}

		if (currCol >= m) {
			break;
		}

		// Move all rows where the next column is not zero up, and the rest down
		let r2 = r;
		while (r2 < n) {
			if (!isZero(matrix[r2]![currCol]!)) {
				r2++;
				continue;
			}

			let found = false;
			for (let r3 = r2 + 1; r3 < n; r3++) {
				if (!isZero(matrix[r3]![currCol]!)) {
					log("Swap rows");
					found = true;
					swapRows(r2, r3);
					r2++;
					print();
					break;
				}
			}

			if (!found) break;
		}

		if (!isZero(matrix[r]![currCol]!)) {
			log("Sub");
			sub(r, currCol);
			print();
		}
	}

	for (let r1 = n - 1; r1 >= 0; r1--) {
		if (matrix[r1]!.every(isZero)) {
			if (!isZero(v[r1]!)) throw new Error("Non-zero value in zero row");
			log(`Removing zero row ${r1}`);
			matrix.splice(r1, 1);
			v.splice(r1, 1);
			n--;
			print();
		}
	}

	return { matrix, v };
}

function solve(diagonalMatrix: Fraction[][], v: Fraction[]) {
	const totalVarsCount = diagonalMatrix[0]!.length;
	const freeVarsCount = totalVarsCount - diagonalMatrix.length;

	const freeVarIndices: number[] = [];
	let currCol = 0;
	for (let r = 0; r < diagonalMatrix.length; r++) {
		while (
			diagonalMatrix[r]![currCol] === undefined ||
			isZero(diagonalMatrix[r]![currCol])
		) {
			freeVarIndices.push(currCol);
			currCol++;
		}
		currCol++;
	}
	let nextVar = totalVarsCount - 1;
	while (freeVarIndices.length < freeVarsCount) {
		while (freeVarIndices.includes(nextVar)) {
			nextVar--;
		}
		freeVarIndices.push(nextVar);
		nextVar--;
	}
	freeVarIndices.sort((a, b) => a - b);

	log("freeVarIndices: " + freeVarIndices.join(","));

	// coeffs for each var are {freeVarsCount+1} long, first {freeVarsCount} are coefficients for x_free_{i} (left to right),
	// the last is the free term
	// so, each x_j = coeffs(-1) + SUM[coeff(i) * freeVar(i)]
	// which is also true if x_j is a free var itself
	const coeffs = Array.from({ length: totalVarsCount }, () => [] as Fraction[]);

	let currRow = diagonalMatrix.length;
	for (let i = totalVarsCount - 1; i >= 0; i--) {
		const k = freeVarIndices.indexOf(i);
		if (k >= 0) {
			coeffs[i] = Array.from({ length: freeVarsCount + 1 }, (_, j) =>
				j === k ? one : zero
			);
			continue;
		}

		currRow--;
		const row = diagonalMatrix[currRow]!;
		const currCoeffs = Array.from({ length: freeVarsCount + 1 }, () => zero);
		currCoeffs[currCoeffs.length - 1] = v[currRow]!;
		for (let j = totalVarsCount - 1; j > i; j--) {
			const c = row[j]!;
			const jCoeffs = coeffs[j]!;
			for (let p = freeVarsCount; p >= 0; p--) {
				currCoeffs[p] = currCoeffs[p]!.sub(jCoeffs[p]!.mul(c));
			}
		}
		coeffs[i] = currCoeffs;
	}

	log("Free vars: " + freeVarIndices.join(", "));

	return { freeVarIndices, coeffs };
}

function findOptimal(targetValues: number[], adjMatrix: number[][]): number {
	const n = targetValues.length;
	const m = adjMatrix.length;
	const originaMatrix = Array.from({ length: n }, (_, r) =>
		Array.from({ length: m }, (_, c) =>
			adjMatrix[c]?.includes(r) ? one : zero
		)
	);

	const { matrix, v } = diagonalize(
		originaMatrix,
		targetValues.map((v) => new Fraction(v, 1))
	);

	const { freeVarIndices: freeButtonIndices, coeffs } = solve(matrix, v);

	let bestResult = Infinity;
	let bestPresses: Fraction[] = [];
	const experiments = [[freeButtonIndices, [] as number[]] as const];
	let experiment: (typeof experiments)[number] | undefined;

	while ((experiment = experiments.pop())) {
		const [availableButtons, freeButtonPresses] = experiment;
		if (availableButtons.length > 0) {
			const [b, ...restButtons] = availableButtons;
			const maxPresses = Math.min(
				...adjMatrix[b!]!.map((i) => targetValues[i]!)
			);
			for (let p = 0; p <= maxPresses; p++) {
				experiments.push([restButtons, freeButtonPresses.concat(p)]);
			}
			continue;
		}

		const allPresses = Array.from({ length: m }, (_, i) => {
			const buttonCoeffs = coeffs[i]!;
			let result = buttonCoeffs.at(-1)!;
			for (let i = 0; i < freeButtonIndices.length; i++) {
				result = result.add(buttonCoeffs[i]!.mul(freeButtonPresses[i]!));
			}
			return result;
		});

		if (allPresses.some((x) => x.lt(zero))) continue;
		const totalPresses = allPresses
			.reduce((a, b) => a.add(b))
			.round()
			.valueOf();
		if (totalPresses < bestResult) {
			bestPresses = allPresses;
			bestResult = totalPresses;

			const allTargets = Array.from({ length: targetValues.length }, (_, i) => {
				const relevantButtons = adjMatrix
					.map((b, bi) => (b.includes(i) ? bi : null))
					.filter((x) => x !== null);
				return relevantButtons
					.map((bi) => allPresses[bi]!)
					.reduce((a, b) => a.add(b))
					.round()
					.valueOf();
			});
			if (targetValues.join(",") !== allTargets.join(",")) {
				console.log("Mismatch!");
				console.log("Target:", targetValues.join(","));
				console.log("Actual:", allTargets.join(","));
			}
		}
	}

	return bestResult;
}

// .filter(
// 	(d) => d.jolts.join(",") === "65,97,74,63,32,50,72,115"
// )

async function main() {
	const input = await readInput();
	const defs = input.filter(Boolean).map(parseDef);

	let res = 0;
	for (const def of defs) {
		const best = findOptimal(def.jolts, def.buttons);
		res += best;
	}

	console.log(res);
}

main().catch(console.error);
