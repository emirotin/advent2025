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

const gcd = (a: bigint, b: bigint) => {
	let [x, y] = [a, b];
	while (true) {
		if (x < y) {
			[x, y] = [y, x];
		}
		if (y === 0n) {
			return x;
		}
		[x, y] = [x % y, y];
	}
};

const isDivisible = (a: bigint, b: bigint) => {
	return a % b === 0n;
};

function findMinimalCombination(
	targetArray: number[],
	incrementArrays: number[][]
): number {
	const base = BigInt(1 + Math.max(...targetArray));
	const toBased = (ns: number[]) =>
		ns.reduce((acc, n) => acc * base + BigInt(n), 0n);

	const increments = incrementArrays
		.map((arr) => {
			const positions = targetArray.map((_, i) => (arr.includes(i) ? 1 : 0));
			return toBased(positions);
		})
		.toSorted((a, b) => {
			if (a > b) return 1;
			if (a < b) return -1;
			return 0;
		});

	const experiments = [
		[toBased(targetArray), increments, 0 as number] as const,
	];
	let bestResult = Infinity;

	let experiment: (typeof experiments)[number] | undefined;
	while ((experiment = experiments.pop())) {
		let [target, increments, currentCount] = experiment;
		if (currentCount >= bestResult) continue;
		if (target < 0n) continue;
		if (target === 0n) {
			bestResult = Math.min(bestResult, currentCount);
			continue;
		}
		if (!increments.length) continue;

		const d = increments.length === 1 ? increments[0]! : increments.reduce(gcd);
		if (!isDivisible(target, d)) continue;
		target /= d;
		increments = increments.map((x) => x / d);

		if (d > 1n) console.log("gcd", d);
		return 0;

		const [inc, ...restIncrements] = increments;
		const maxPossibleCoeff = Number(target / inc!);
		for (let c = maxPossibleCoeff; c >= 0; c--) {
			experiments.push([
				target - BigInt(c) * inc!,
				restIncrements,
				currentCount + c,
			] as const);
		}
		// console.log(experiments.length, increments.length);
	}

	if (!Number.isFinite(bestResult)) throw new Error("No solution found");
	return bestResult;
}

async function main() {
	const input = await readInput();
	const defs = input.filter(Boolean).map(parseDef);

	let res = 0;
	for (const def of defs) {
		// console.log(def);
		const best = findMinimalCombination(def.jolts, def.buttons);
		// console.log({ best });
		res += best;
	}

	console.log(res);
}

main().catch(console.error);
