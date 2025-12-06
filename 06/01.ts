import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("06/input.txt", "utf-8")).trim();
	return content.split("\n");
}

const acc = (op: "+" | "*") =>
	op === "+"
		? (a: bigint, b: bigint) => a + b
		: (a: bigint, b: bigint) => a * b;

const init = (op: "+" | "*") => (op === "+" ? 0n : 1n);

async function main() {
	const input = await readInput();
	const lines = input.map((s) => s.trim().split(/\s+/));
	const ops = lines.pop() as Array<"+" | "*">;
	const nums = lines.map((l) => l.map((x) => BigInt(Number.parseInt(x))));

	const results = ops.map((op, i) =>
		nums.map((ns) => ns[i]!).reduce(acc(op), init(op))
	);

	const res = results.reduce(acc("+"));

	console.log(res.toString());
}

main().catch(console.error);
