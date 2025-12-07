import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("07/input.txt", "utf-8")).trim();
	return content.split("\n");
}

const setAdd = <T>(m: Map<T, number>, k: T, v: number) => {
	const c = m.get(k) ?? 0;
	m.set(k, c + v);
};

async function main() {
	const input = await readInput();
	const lines = input.map((s) => s.trim().split("") as Array<"S" | "." | "^">);
	const w = lines[0]!.length;
	let history = new Map([[lines[0]!.indexOf("S"), 1]]);
	for (let i = 1; i < lines.length; i++) {
		const newHistory = new Map<number, number>();
		for (const [pos, hist] of history.entries()) {
			if (lines[i]![pos] === ".") {
				setAdd(newHistory, pos, hist);
			} else if (lines[i]![pos] === "^") {
				if (pos > 0) {
					setAdd(newHistory, pos - 1, hist);
				}
				if (pos < w - 1) {
					setAdd(newHistory, pos + 1, hist);
				}
			}
		}
		history = newHistory;
	}

	const res = Array.from(history.values()).reduce((a, b) => a + b);
	console.log(res);
}

main().catch(console.error);
