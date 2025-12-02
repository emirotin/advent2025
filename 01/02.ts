import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("01/input.txt", "utf-8")).trim();
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
	for (let step of steps) {
		const prevPos = pos;

		while (step <= -100) {
			count++;
			step += 100;
		}
		while (step >= 100) {
			count++;
			step -= 100;
		}

		pos += step;

		if (pos === 0) {
			count++;
		}

		while (pos < 0) {
			if (prevPos !== 0) count++;
			pos += 100;
		}

		while (pos >= 100) {
			count++;
			pos -= 100;
		}
		// console.log({ step, pos, count });
	}
	console.log(count);
}

main().catch(console.error);
