import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("05/input.txt", "utf-8")).trim();
	return content.split("\n\n");
}

type Range = readonly [bigint, bigint];

const maxN = (a: bigint, b: bigint) => (a > b ? a : b);

async function main() {
	const [rangesStr] = await readInput();
	const ranges = rangesStr!
		.split("\n")
		.map((s) => s.split("-"))
		.map((a) => a.map((x) => BigInt(Number.parseInt(x))) as unknown as Range);

	// console.log(ranges);

	ranges.sort(([a1, b1], [a2, b2]) => {
		if (a1 < a2) return -1;
		if (a1 > a2) return 1;
		if (b1 < b2) return -1;
		if (b1 > b2) return 1;
		return 0;
	});

	// console.log(ranges);

	const merge = ([a1, b1]: Range, [a2, b2]: Range) => {
		if (a2 > b1 + 1n) return null;
		return [a1, maxN(b1, b2)] as const;
	};

	let i = 0;
	while (i < ranges.length - 1) {
		const merged = merge(ranges[i]!, ranges[i + 1]!);
		if (!merged) {
			i++;
			continue;
		}
		ranges[i] = merged;
		ranges.splice(i + 1, 1);
		// console.log(ranges);
	}

	// console.log(ranges);

	const res = ranges.reduce((acc, [a, b]) => acc + b - a + 1n, 0n);
	console.log(res.toString());
}

main().catch(console.error);
