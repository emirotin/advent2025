import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("08/input.txt", "utf-8")).trim();
	return content.split("\n");
}

type Coords = [bigint, bigint, bigint];

const rand = () => Math.round(Math.random() * 10_000_000_000).toString(36);

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

	const coordToCircuit = coords.map(() => rand());

	const circuits = new Map(coordToCircuit.map((id, i) => [id, [i]]));

	const joinNodes = (i: number, j: number) => {
		const id1 = coordToCircuit[i]!;
		const id2 = coordToCircuit[j]!;
		if (id1 === id2) return;
		const a1 = circuits.get(id1)!;
		const a2 = circuits.get(id2)!;
		circuits.set(id1, a1.concat(a2));
		circuits.delete(id2);
		for (const i of a2) {
			coordToCircuit[i] = id1;
		}
	};

	for (const [_, i, j] of dists) {
		joinNodes(i, j);
		if (circuits.size === 1) {
			console.log((coords[i]![0] * coords[j]![0]).toString());
			return;
		}
	}
}

main().catch(console.error);
