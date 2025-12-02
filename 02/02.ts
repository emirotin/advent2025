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

	const max = ranges.reduce((acc, r) => Math.max(acc, r[1]), 0);
	const top = Math.ceil(max / 10 ** (ndig(max) / 2));

	const ns = new Set<number>();

	for (let k = 1; k < top; k++) {
		const l = ndig(k);
		let x = k * 10 ** l + k;
		while (x <= max) {
			ns.add(x);
			x *= 10 ** l;
			x += k;
		}
	}

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
