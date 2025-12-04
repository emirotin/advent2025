import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("04/input.txt", "utf-8")).trim();
	return content.split("\n");
}

async function main() {
	const input = await readInput();
	const grid = input.map((s) => s.split("") as Array<"." | "@">);

	const rs = grid.length;
	const cs = grid[0]!.length;

	let res = 0;

	for (let r = 0; r < rs; r++) {
		for (let c = 0; c < cs; c++) {
			if (grid[r]![c] !== "@") continue;
			const ns = [
				{ r: r - 1, c: c - 1 },
				{ r: r - 1, c },
				{ r: r - 1, c: c + 1 },
				{ r, c: c - 1 },
				{ r, c: c + 1 },
				{ r: r + 1, c: c - 1 },
				{ r: r + 1, c },
				{ r: r + 1, c: c + 1 },
			].filter(({ r, c }) => r >= 0 && r < rs && c >= 0 && c < cs);
			const cnt = ns.filter(({ r, c }) => grid[r]![c] === "@").length;
			res += cnt < 4 ? 1 : 0;
		}
	}

	console.log(res);
}

main().catch(console.error);
