import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("11/input.txt", "utf-8")).trim();
	return content.split("\n");
}

const parseLine = (s: string) => {
	const [from, tos] = s.split(": ");
	return {
		from: from!,
		to: tos!.split(" "),
	};
};

class Node {
	connections: Node[] = [];
	constructor(public name: string) {}
}

async function main() {
	const input = await readInput();
	const devices = input.map(parseLine);

	const allNames = new Set(devices.flatMap((d) => d.to.concat(d.from)));
	const nodes = allNames
		.values()
		.toArray()
		.map((name) => new Node(name));
	const nodesByName = new Map(nodes.map((n) => [n.name, n] as const));
	for (const d of devices) {
		const n = nodesByName.get(d.from)!;
		n.connections = d.to.map((name) => nodesByName.get(name)!);
	}

	const getPathsCount = (from: Node, to: string): number => {
		const cache = new Map([[nodesByName.get(to), 1]]);

		const inner = (from: Node): number => {
			const cached = cache.get(from);
			if (cached !== undefined) return cached;

			const result = from.connections.map(inner).reduce((a, b) => a + b, 0);

			cache.set(from, result);
			return result;
		};

		return inner(from);
	};

	const a1 = getPathsCount(nodesByName.get("svr")!, "fft");
	const a2 = getPathsCount(nodesByName.get("fft")!, "dac");
	const a3 = getPathsCount(nodesByName.get("dac")!, "out");

	const b1 = getPathsCount(nodesByName.get("svr")!, "dac");
	const b2 = getPathsCount(nodesByName.get("dac")!, "fft");
	const b3 = getPathsCount(nodesByName.get("fft")!, "out");

	console.log(a1 * a2 * a3 + b1 * b2 * b3);
}

main().catch(console.error);
