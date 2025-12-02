import fs from "node:fs/promises";

async function readInput() {
	const content = await fs.readFile("02/input.txt", "utf-8");
	return content.replaceAll(/\n/g, "").trim();
}

const ndig = (x: number) => {
	let l = Math.log10(x);
	if (l % 1) {
		return Math.ceil(l);
	}
	return l + 1;
};

const repeat = (x: number, n: number) => {
	let r = 0;
	const m = 10 ** ndig(x);
	while (n--) {
		r = r * m + x;
	}
	return r;
};

async function main() {
	const input = await readInput();
	const ranges = input
		.split(",")
		.map(
			(s) => s.split("-").map((s) => Number.parseInt(s)) as [number, number]
		);

	let res = 0;

	// Max amoung all hi boundaries
	const max = ranges.reduce((acc, r) => Math.max(acc, r[1]), 0);
	// The max number to check is the first "half" of this number
	const top = Math.ceil(max / 10 ** (ndig(max) / 2));

	// All unique numbers lower than max obtained by repeating some numeric sequence
	const ns = new Set<number>();
	// k is the sequence to repeat
	for (let k = 1; k <= top; k++) {
		const l = ndig(k);
		let x = k * 10 ** l + k;
		while (x <= max) {
			ns.add(x);
			x *= 10 ** l;
			x += k;
		}
	}

	// Now match all canidates to the ranges they can fall into
	for (const el of ns.values()) {
		const r = ranges.find(([lo, hi]) => lo <= el && el <= hi);
		if (r) {
			res += el;
		}
	}

	console.log("---");
	console.log(res.toString());
}

main().catch(console.error);
