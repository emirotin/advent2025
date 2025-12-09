import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("09/input.txt", "utf-8")).trim();
	return content.split("\n");
}

type Coords = [number, number];

const area = (a: Coords, b: Coords) => {
	const xs = [a[0], b[0]];
	const ys = [a[1], b[1]];
	const w = Math.max(...xs) - Math.min(...xs) + 1;
	const h = Math.max(...ys) - Math.min(...ys) + 1;
	return w * h;
};

async function main() {
	const input = await readInput();
	const coords = input.map(
		(s) =>
			s
				.trim()
				.split(",")
				.map((s) => Number.parseInt(s)) as Coords
	);
	let maxArea = 0;
	const n = coords.length;
	for (let i = 0; i < n - 1; i++) {
		for (let j = i + 1; j < n; j++) {
			maxArea = Math.max(maxArea, area(coords[i]!, coords[j]!));
		}
	}

	console.log(maxArea);
}

main().catch(console.error);
