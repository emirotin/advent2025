import fs from "node:fs/promises";

async function readInput() {
	const content = await fs.readFile("01/input.txt", "utf-8");
	return content.split("\n");
}

async function main() {
	const input = await readInput();
	const steps = input.map((line) => {
		const dir = line[0];
		let amount = Number.parseInt(line.slice(1));
		if (dir === "L") {
			amount = -amount;
		}
		return amount;
	});
	let pos = 50;
	let count = 0;
	for (const step of steps) {
		pos = (pos + step) % 100;
		if (pos === 0) {
			count++;
		}
	}
	console.log(count);
}

main().catch(console.error);
