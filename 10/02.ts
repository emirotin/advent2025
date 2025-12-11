import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("10/demo.txt", "utf-8")).trim();
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

function solve(targetValues: number[], matrixIndices: number[][]): number {
	const n = targetValues.length;
	const m = matrixIndices.length;
	const matrix = Array.from({ length: n }, (_, r) =>
		Array.from({ length: m }, (_, c) => (matrixIndices[c]?.includes(r) ? 1 : 0))
	);
	const v = targetValues;

	const print = () => {
		console.log(matrix.map((r, i) => r.join(" ") + " | " + v[i]).join("\n"));
		console.log();
	};

	print();

	const swapRows = (r1: number, r2: number) => {
		const tmpRow = matrix[r1]!;
		matrix[r1] = matrix[r2]!;
		matrix[r2] = tmpRow;
		const tmpV = v[r1]!;
		v[r1] = v[r2]!;
		v[r2] = tmpV;
	};

	const swapCols = (c1: number, c2: number) => {
		for (let r = 0; r < n; r++) {
			const v = matrix[r]![c1]!;
			matrix[r]![c1]! = matrix[r]![c2]!;
			matrix[r]![c2]! = v;
		}
	};

	const sub = (r: number) => {
		const d = matrix[r]![r]!;
		if (d === 0) throw new Error("Zero diagonal element");
		v[r]! /= d;
		for (let c = 0; c < m; c++) {
			matrix[r]![c]! /= d;
		}

		for (let r2 = r + 1; r2 < n; r2++) {
			const d = matrix[r2]![r]!;
			if (d === 0) return;
			v[r2]! -= v[r]! * d;
			for (let c = r; c < m; c++) {
				matrix[r2]![c]! -= matrix[r]![c]! * d;
			}
		}
	};

	for (let r = 0; r < n; r++) {
		console.log(`Row ${r}`);

		let r2 = r;
		while (r2 < n) {
			if (matrix[r2]![r] !== 0) {
				r2++;
				continue;
			}

			let found = false;
			for (let r3 = r2 + 1; r3 < n; r3++) {
				if (matrix[r3]![r] !== 0) {
					found = true;
					console.log("Swap rows");
					swapRows(r2, r3);
					print();
					break;
				}
			}

			if (!found) break;
		}

		if (matrix[r]![r] !== undefined && matrix[r]![r] !== 0) {
			console.log("Sub");
			sub(r);
			print();
		}
	}

	for (let c = 0; c < m && c < n; c++) {
		console.log(`Column ${c}`);
		if (matrix[c]![c] !== 0) continue;
		let found = false;
		for (let c2 = c + 1; c2 < m; c2++) {
			if (matrix[c]![c2] !== 0) {
				found = true;
				console.log("Swap cols");
				swapCols(c, c2);
				print();
				break;
			}
		}

		if (!found) break;
	}

	for (let r = n - 1; r >= 0; r--) {
		if (!matrix[r]!.every((x) => x === 0)) break;
		if (v[r] !== 0) throw new Error("Non-zero value in zero row");
		console.log(`Removing zero row ${r}`);
		matrix.pop();
		v.pop();
		print();
	}

	const freeVarsCount = matrix[0]!.length - matrix.length;
	console.log({ freeVarsCount });

	return 0;
}

async function main() {
	const input = await readInput();
	const defs = input.filter(Boolean).map(parseDef);

	let res = 0;
	for (const def of defs.slice(2)) {
		// console.log(def);
		const best = solve(def.jolts, def.buttons);
		// console.log({ best });
		res += best;
	}

	console.log(res);
}

main().catch(console.error);
