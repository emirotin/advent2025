import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("06/input.txt", "utf-8")).trimEnd();
	return content.split("\n");
}

const acc = (op: "+" | "*") =>
	op === "+"
		? (a: bigint, b: bigint) => a + b
		: (a: bigint, b: bigint) => a * b;

const init = (op: "+" | "*") => (op === "+" ? 0n : 1n);

const scanNums = (input: string[]): bigint[][] => {
	const l = Math.max(...input.map((s) => s.length));
	const nums: bigint[][] = [];

	let curr: bigint[] = [];

	for (let j = l - 1; j >= 0; j--) {
		const col = input.map((s) => s[j]);
		if (col.every((s) => !s || s === " ")) {
			if (curr.length > 0) nums.push(curr);
			curr = [];
			continue;
		}
		const n = BigInt(
			Number.parseInt(col.filter((s) => s && s !== " ").join(""))
		);
		curr.push(n);
	}
	if (curr.length > 0) nums.push(curr);

	return nums.reverse();
};

async function main() {
	const input = await readInput();
	const ops = input.pop()!.trim().split(/\s+/) as Array<"+" | "*">;
	const nums = scanNums(input);
	// console.log(nums);

	const results = ops.map((op, i) => nums[i]!.reduce(acc(op), init(op)));

	const res = results.reduce(acc("+"));

	console.log(res.toString());
}

main().catch(console.error);
