import fs from "node:fs/promises";

async function readInput() {
	const content = await fs.readFile("02/input.txt", "utf-8");
	return content.replaceAll(/\n/g, "").trim();
}

const divCeil = (x: bigint, y: bigint) => {
	const d = x / y;
	const r = x - y * d;
	return r > 0n ? d + 1n : d;
};

async function main() {
	const input = await readInput();
	const ranges = input
		.split(",")
		.map(
			(s) => s.split("-").map((s) => Number.parseInt(s)) as [number, number]
		);

	let res = 0n;

	for (const [lo, hi] of ranges) {
		console.log();
		console.log(lo, hi);

		const nlo = Math.ceil(Math.log10(lo));
		const nhi = Math.ceil(Math.log10(hi));
		if (nlo === nhi && nlo % 2) {
			console.log("Odd boundaries, skip");
			continue;
		}
		if (nlo !== nhi) {
			console.log("Multiple ranges");
		}

		let n = BigInt(Math.ceil(nlo / 2));
		let min = 10n ** (n - 1n);
		let max = min * 10n;
		for (; ; n++) {
			const d = max + 1n;
			if (d > hi) break;

			let base = divCeil(BigInt(lo), d);
			let x = base * d;
			while (base >= min && base < max && x <= hi) {
				console.log(x);

				res += x;
				base++;
				x += d;
			}

			min = max;
			max *= 10n;
		}
	}

	console.log("---");
	console.log(res.toString());
}

main().catch(console.error);
