import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("10/demo.txt", "utf-8")).trim();
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

function findBestPushesInt(
	target: number[],
	increments: number[][],
	currentCount: number,
	knownMinimum: number
): number {
	if (currentCount >= knownMinimum && Number.isFinite(knownMinimum))
		return knownMinimum;
	let zeros = 0;
	for (const v of target) {
		if (v < 0) return Infinity;
		if (v === 0) zeros++;
	}
	if (zeros === target.length) return currentCount;
	if (increments.length === 0) return Infinity;
	const [inc, ...newIncrements] = increments;
	const maxPossiblePresses = Math.min(...inc!.map((i) => target[i]!));
	let result = knownMinimum;
	for (let p = maxPossiblePresses; p >= 0; p--) {
		const newTarget = target.map((v, i) => (inc!.includes(i) ? v - p : v));
		result = Math.min(
			result,
			findBestPushesInt(newTarget, newIncrements, currentCount + p, result)
		);
	}
	return result;
}

function findBestPushes(target: number[], increments: number[][]): number {
	return findBestPushesInt(target, increments, 0, Infinity);
}

async function main() {
	const input = await readInput();
	const defs = input.filter(Boolean).map(parseDef);

	let res = 0;
	for (const def of defs) {
		const best = findBestPushes(
			def.jolts,
			def.buttons.toSorted((a, b) => b.length - a.length)
		);
		res += best;
	}

	console.log(res);
}

main().catch(console.error);
