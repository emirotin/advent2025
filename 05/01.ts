import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("05/input.txt", "utf-8")).trim();
	return content.split("\n\n");
}

async function main() {
	const [rangesStr, ingredientsStr] = await readInput();
	const ranges = rangesStr!
		.split("\n")
		.map((s) => s.split("-"))
		.map((a) => a.map((x) => Number.parseInt(x)) as [number, number]);
	const ingredients = ingredientsStr!
		.split("\n")
		.map((x) => Number.parseInt(x));

	const res = ingredients.filter((n) =>
		ranges.some(([a, b]) => a <= n && b >= n)
	).length;

	console.log(res);
}

main().catch(console.error);
