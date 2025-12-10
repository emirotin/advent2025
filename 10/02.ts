import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("10/input.txt", "utf-8")).trim();
	return content.split("\n");
}

const parseDef = (s: string) => {
	const parts = s.split(" ");
	const lightsStr = parts.shift();
	const joltsStr = parts.pop();
	const buttonStrs = parts;

	if (!joltsStr?.match(/^{[,\d]+}$/)) {
		throw new Error(`Invalid jolts`, {
			cause: { lightsStr },
		});
	}
	const jolts = joltsStr
		.slice(1, -1)
		.split(",")
		.map((s) => Number.parseInt(s));

	const buttons = buttonStrs.map((buttonStr) => {
		if (!buttonStr?.match(/^\([,\d]+\)$/)) {
			throw new Error(`Invalid button`, {
				cause: { buttonStr },
			});
		}
		return buttonStr
			.slice(1, -1)
			.split(",")
			.map((s) => Number.parseInt(s));
	});

	return { buttons, jolts };
};

function findBestPushes(target: number[], increments: number[][]): number {
	const experiments = [[target, increments, 0 as number] as const];
	let bestResult = Infinity;

	let experiment: (typeof experiments)[number] | undefined;
	while ((experiment = experiments.shift())) {
		const [target, increments, currentCount] = experiment;
		if (currentCount >= bestResult) continue;
		if (target.some((v) => v < 0)) continue;
		if (target.every((v) => v === 0)) {
			bestResult = Math.min(bestResult, currentCount);
		}
		if (!increments.length) continue;
		const [inc, ...restIncrements] = increments;
		const maxPossiblePresses = Math.min(...inc!.map((i) => target[i]!));
		for (let p = 0; p <= maxPossiblePresses; p++) {
			experiments.push([
				target.map((v, i) => (inc!.includes(i) ? v - p : v)),
				restIncrements,
				currentCount + p,
			] as const);
		}
	}

	return bestResult;
}

async function main() {
	const input = await readInput();
	const defs = input.filter(Boolean).map(parseDef);

	let res = 0;
	for (const def of defs) {
		console.log(def);
		const best = findBestPushes(
			def.jolts,
			def.buttons.toSorted((a, b) => b.length - a.length)
		);
		res += best;
	}

	console.log(res);
}

main().catch(console.error);
