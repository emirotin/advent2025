import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("07/input.txt", "utf-8")).trim();
	return content.split("\n");
}

async function main() {
	const input = await readInput();
	const lines = input.map((s) => s.trim().split("") as Array<"S" | "." | "^">);
	const w = lines[0]!.length;
	let beams = new Set([lines[0]!.indexOf("S")]);
	let splits = 0;
	for (let i = 1; i < lines.length; i++) {
		const newBeams = new Set<number>();
		for (const b of beams.values()) {
			if (lines[i]![b] === ".") {
				newBeams.add(b);
			} else if (lines[i]![b] === "^") {
				splits++;
				if (b > 0) {
					newBeams.add(b - 1);
				}
				if (b < w - 1) {
					newBeams.add(b + 1);
				}
			}
		}
		beams = newBeams;
	}

	console.log(splits);
}

main().catch(console.error);
