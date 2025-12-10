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

	if (!lightsStr?.match(/^\[[.#]+\]$/)) {
		throw new Error(`Invalid lights`, {
			cause: { lightsStr },
		});
	}
	const lights = lightsStr
		.slice(1, -1)
		.split("")
		.map((s) => (s === "#" ? 1 : 0));

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

	const lightsCount = lights.length;
	// lights as binary points
	const targetNumber = lights.reduce<number>((acc, b) => acc * 2 + b, 0);

	const buttonNumbers = buttons.map((ns) => {
		const arr = Array.from({ length: lightsCount }, (_, i) =>
			ns.includes(i) ? 1 : 0
		);
		return arr.reduce<number>((acc, b) => acc * 2 + b, 0);
	});

	return { lights, buttons, lightsCount, targetNumber, buttonNumbers };
};

// type Def = ReturnType<typeof parseDef>;

function findBestXorInt(
	target: number,
	candidates: number[],
	currentCount: number
): number {
	if (target === 0) return currentCount;
	return Math.min(
		...candidates.map((n, i) =>
			findBestXorInt(
				target ^ n,
				// only need to check the buttons to the right of the current
				candidates.slice(i + 1),
				currentCount + 1
			)
		)
	);
}

function findBestXor(target: number, candidates: number[]): number {
	return findBestXorInt(target, candidates, 0);
}

async function main() {
	const input = await readInput();
	const defs = input.filter(Boolean).map(parseDef);

	console.log(
		defs
			.map((def) => findBestXor(def.targetNumber, def.buttonNumbers))
			.reduce((a, b) => a + b)
	);
}

main().catch(console.error);
