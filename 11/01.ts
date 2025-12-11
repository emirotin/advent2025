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

function getPathesInt(from: Node, to: string, seenNodes: string[]): Node[][] {
	if (from.name === to) return [[from]];

	let result: Node[][] = [];
	for (const n of from.connections) {
		if (seenNodes.includes(n.name)) continue;
		result = result.concat(getPathesInt(n, to, seenNodes.concat(n.name)));
	}
	return result.map((p) => [from].concat(p));
}

function getPathes(from: Node, to: string): Node[][] {
	return getPathesInt(from, to, []);
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

	const root = nodesByName.get("you")!;
	console.log(getPathes(root, "out").length);
}

main().catch(console.error);
