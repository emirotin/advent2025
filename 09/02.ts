import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("09/demo.txt", "utf-8")).trim();
	return content.split("\n");
}

type Coords = readonly [number, number];

const area = (a: Coords, b: Coords) => {
	const xs = [a[0], b[0]];
	const ys = [a[1], b[1]];
	const w = Math.max(...xs) - Math.min(...xs) + 1;
	const h = Math.max(...ys) - Math.min(...ys) + 1;
	return w * h;
};

const lineEq = ([x1, y1]: Coords, [x2, y2]: Coords) => {
	const d = x1 * y2 - y1 * x2;
	const a = (y2 - y1) / d;
	const e = y1 * x2 - y2 * x1;
	const b = (x2 - x1) / e;
	return [a, b, 1] as const;
};

const isInside = ([p1, p2]: readonly [Coords, Coords], p: Coords) => {
	return (
		p[0] >= Math.min(p1[0], p2[0]) &&
		p[0] <= Math.max(p1[0], p2[0]) &&
		p[1] >= Math.min(p1[1], p2[1]) &&
		p[1] <= Math.max(p1[1], p2[1])
	);
};

const doIntersect = (e1: readonly [Coords, Coords], e2: [Coords, Coords]) => {
	const [a1, b1, c1] = lineEq(...e1);
	const [a2, b2, c2] = lineEq(...e2);

	const d1 = a1 * b2 - a2 * b1;
	if (d1 === 0) return false;
	const x = (c1 * b2 - c2 * b1) / d1;
	const d2 = a2 * b1 - a1 * b2;
	if (d2 === 0) return false;
	const y = (c1 * b1 - c2 * b2) / d2;
	return isInside(e1, [x, y]) && isInside(e2, [x, y]);
};

const isOutside = (edges: (readonly [Coords, Coords])[], p: Coords) => {
	const p0 = edges[0]![0];
	const intersections = edges.filter((e) => doIntersect(e, [p0, p]));
	return intersections.length % 2 === 1;
};

const range = (from: number, to: number) =>
	Array.from({ length: to - from + 1 }, (_, i) => from + i);

async function main() {
	const input = await readInput();
	const coords = input.map(
		(s) =>
			s
				.trim()
				.split(",")
				.map((s) => Number.parseInt(s)) as unknown as Coords
	);

	// TODO: shift each edge by 0.5 outside of the figure to obtain the proper edges
	const edges = coords.map(
		(c, i) =>
			[c, i === coords.length - 1 ? coords[0]! : coords[i + 1]!] as const
	);

	let maxArea = 0;
	const n = coords.length;
	for (let i = 0; i < n - 1; i++) {
		for (let j = i + 1; j < n; j++) {
			const c1 = coords[i]!;
			const c2 = coords[j]!;
			const minX = Math.min(c1[0], c2[0]);
			const maxX = Math.max(c1[0], c2[0]);
			const minY = Math.min(c1[1], c2[1]);
			const maxY = Math.max(c1[1], c2[1]);

			const edgeRects = [
				...range(minY, maxY).map((y) => [minX, y] as const),
				...range(minX, maxX).map((x) => [x, maxY] as const),
				...range(minY, maxY).map((y) => [maxX, y] as const),
				...range(minX, maxX).map((x) => [x, minY] as const),
			];

			if (edgeRects.every((p) => !isOutside(edges, p))) {
				maxArea = Math.max(maxArea, area(c1, c2));
			} else {
				console.log("OUTSIDE!");
			}
		}
	}

	console.log(maxArea);
}

main().catch(console.error);
