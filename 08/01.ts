import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("08/input.txt", "utf-8")).trim();
	return content.split("\n");
}

const CONNS = 1000;

type Coords = [bigint, bigint, bigint];

const dist = (a: Coords, b: Coords) => {
	const c = a.map((_, i) => a[i]! - b[i]!);
	return c.map((x) => x * x).reduce((x, y) => x + y);
};

async function main() {
	const input = await readInput();
	const coords = input.map(
		(s) =>
			s
				.trim()
				.split(",")
				.map((s) => BigInt(Number.parseInt(s))) as Coords
	);
	const dists: [bigint, number, number][] = [];
	const n = coords.length;
	for (let i = 0; i < n - 1; i++) {
		for (let j = i + 1; j < n; j++) {
			dists.push([dist(coords[i]!, coords[j]!), i, j] as const);
		}
	}
	// sort ASC
	dists.sort(([d1], [d2]) => (d1 < d2 ? -11 : d1 > d2 ? 1 : 0));
	const shortestDists = dists.slice(0, CONNS);

	const nodeToCircuit = coords.map((_, i) => i);
	const circuits = coords.map((_, i) => [i]);
	const joinNodes = (i: number, j: number) => {
		const id1 = nodeToCircuit[i]!;
		const id2 = nodeToCircuit[j]!;
		if (id1 === id2) return;
		const a1 = circuits[id1]!;
		const a2 = circuits[id2]!;
		circuits[id1] = a1.concat(a2);
		circuits[id2] = [];
		for (const i of a2) {
			nodeToCircuit[i] = id1;
		}
	};

	for (const [_, i, j] of shortestDists) {
		joinNodes(i, j);
	}

	const circuitSizes = Array.from(circuits.values()).map((is) => is.length);
	circuitSizes.sort((a, b) => b - a);

	console.log(circuitSizes[0]! * circuitSizes[1]! * circuitSizes[2]!);
}

main().catch(console.error);
