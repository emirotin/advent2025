import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("03/input.txt", "utf-8")).trim();
	return content.split("\n");
}

const maxTwoSeq = (ns: number[]) => {
	let first = 0;
	let second = 0;
	const max = Math.max(...ns);
	const maxI = ns.findIndex((x) => x === max);
	if (maxI < ns.length - 1) {
		first = max;
		second = Math.max(...ns.slice(maxI + 1));
	} else {
		second = max;
		first = Math.max(...ns.slice(0, -1));
	}
	// console.log({ ns, first, second });
	return first * 10 + second;
};

async function main() {
	const input = await readInput();
	const batteries = input.map((s) =>
		s.split("").map((s) => Number.parseInt(s))
	);

	const res = batteries.map(maxTwoSeq).reduce((a, b) => a + b);
	console.log(res);
}

main().catch(console.error);
