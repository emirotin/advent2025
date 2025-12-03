import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("03/input.txt", "utf-8")).trim();
	return content.split("\n");
}

const maxTwelveSeq = (ns: number[]) => {
	let res = 0;
	let hay = ns;
	for (let i = 1; i <= 12; i++) {
		// Last iteration? Skip nothing. Otherwise, exclude last 12-i elements
		const max = Math.max(...hay.slice(0, i === 12 ? undefined : -12 + i));
		const j = hay.indexOf(max);
		hay = hay.slice(j + 1);
		res = res * 10 + max;
	}
	// console.log({ ns, res });
	return res;
};

async function main() {
	const input = await readInput();
	const batteries = input.map((s) =>
		s.split("").map((s) => Number.parseInt(s))
	);

	const res = batteries.map(maxTwelveSeq).reduce((a, b) => a + b);
	console.log(res);
}

main().catch(console.error);
