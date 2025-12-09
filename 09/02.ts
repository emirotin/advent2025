import fs from "node:fs/promises";

async function readInput() {
	const content = (await fs.readFile("09/input.txt", "utf-8")).trim();
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

const epsilon = 1e-6;

const isBetween = ([p1, p2]: readonly [Coords, Coords], p: Coords) => {
	return (
		p[0] >= Math.min(p1[0], p2[0]) - epsilon &&
		p[0] <= Math.max(p1[0], p2[0]) + epsilon &&
		p[1] >= Math.min(p1[1], p2[1]) - epsilon &&
		p[1] <= Math.max(p1[1], p2[1]) + epsilon
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
	const y = (c1 * a2 - c2 * a1) / d2;
	return isBetween(e1, [x, y]) && isBetween(e2, [x, y]);
};

function* range(from: number, to: number) {
	if (from <= to) {
		for (let i = from; i <= to; i++) {
			yield i;
		}
	}
	for (let i = from; i >= to; i--) {
		yield i;
	}
}

const vect = (a: Coords, b: Coords) => [b[0] - a[0], b[1] - a[1]] as const;

const getVectDir = (vect: Coords) => {
	const isHoriz = vect[1] === 0;
	const isVert = !isHoriz;
	const isRight = isHoriz && vect[0] > 0;
	const isLeft = isHoriz && !isRight;
	const isDown = isVert && vect[1] > 0;
	const isUp = isVert && !isDown;

	return {
		isHoriz,
		isVert,
		isLeft,
		isRight,
		isDown,
		isUp,
	};
};

type VectDir = ReturnType<typeof getVectDir>;

const getOuterV = (v: Coords, currDir: VectDir, nextDir: VectDir) => {
	// outer turns

	if (currDir.isRight && nextDir.isDown) {
		return [v[0] + 0.5, v[1] - 0.5] as const;
	}

	if (currDir.isDown && nextDir.isLeft) {
		return [v[0] + 0.5, v[1] + 0.5] as const;
	}

	if (currDir.isLeft && nextDir.isUp) {
		return [v[0] - 0.5, v[1] + 0.5] as const;
	}

	if (currDir.isUp && nextDir.isRight) {
		return [v[0] - 0.5, v[1] - 0.5] as const;
	}

	// inner turns

	if (currDir.isRight && nextDir.isUp) {
		return [v[0] - 0.5, v[1] - 0.5] as const;
	}

	if (currDir.isLeft && nextDir.isDown) {
		return [v[0] + 0.5, v[1] + 0.5] as const;
	}

	if (currDir.isDown && nextDir.isRight) {
		return [v[0] + 0.5, v[1] - 0.5] as const;
	}

	if (currDir.isUp && nextDir.isLeft) {
		return [v[0] - 0.5, v[1] + 0.5] as const;
	}

	return v;
};

// it makes hard assumption that we're going CW, starting from the horizontal segment, making right turn to the 2nd segment
const buildEdges = (vs: Coords[]) => {
	const outerVs: Coords[] = [];
	for (let i = 0; i < vs.length; i++) {
		const prev = vs[(i + vs.length - 1) % vs.length]!;
		const curr = vs[i]!;
		const next = vs[(i + 1) % vs.length]!;
		const vCurr = vect(prev, curr);
		const vNext = vect(curr, next);

		const currDir = getVectDir(vCurr);
		const nextDir = getVectDir(vNext);

		outerVs.push(getOuterV(curr, currDir, nextDir));
	}
	return outerVs.map(
		(c, i) =>
			[c, i === outerVs.length - 1 ? outerVs[0]! : outerVs[i + 1]!] as const
	);
};

function* perimeterSquares({
	minX,
	maxX,
	minY,
	maxY,
}: {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
}) {
	for (const y of range(minY + 1, maxY)) yield [minX, y] as const;
	for (const x of range(minX + 1, maxX)) yield [x, maxY] as const;
	for (const y of range(maxY - 1, minY)) yield [maxX, y] as const;
	for (const x of range(maxX - 1, minX)) yield [x, minY] as const;
}

async function main() {
	const input = await readInput();
	const coords = input.map(
		(s) =>
			s
				.trim()
				.split(",")
				.map((s) => Number.parseInt(s)) as unknown as Coords
	);

	const allXs = coords.map(([x]) => x);
	const allYs = coords.map(([_, y]) => y);
	const globalMinX = Math.min(...allXs);
	const globalMaxX = Math.max(...allXs);
	const globalMinY = Math.min(...allYs);
	const globalMaxY = Math.max(...allYs);

	const edges = buildEdges(coords);
	const pIn = coords[0]!;

	const cache = new Map<string, boolean>();

	const _isOutside = (px: Coords) => {
		if (
			px[0] < globalMinX ||
			px[0] > globalMaxX ||
			px[1] < globalMinY ||
			px[1] > globalMaxY
		)
			return true;
		const intersections = edges.filter((e) => doIntersect(e, [pIn, px]));
		return intersections.length % 2 === 1;
	};

	const isOutside = (px: Coords) => {
		const key = `${px[0]}:${px[1]}`;
		const cached = cache.get(key);
		if (cached !== undefined) return cached;
		const result = _isOutside(px);
		cache.set(key, result);
		return result;
	};

	const isInvalidRect = (c1: Coords, c2: Coords) => {
		const minX = Math.min(c1[0], c2[0]);
		const maxX = Math.max(c1[0], c2[0]);
		const minY = Math.min(c1[1], c2[1]);
		const maxY = Math.max(c1[1], c2[1]);

		for (const c of perimeterSquares({ minX, maxX, minY, maxY })) {
			if (isOutside(c)) return true;
		}

		return false;
	};

	const n = coords.length;
	const areas: [number, Coords, Coords][] = [];
	for (let i = 0; i < n - 1; i++) {
		const c1 = coords[i]!;
		for (let j = i + 1; j < n; j++) {
			const c2 = coords[j]!;
			areas.push([area(c1, c2), c1, c2] as const);
		}
	}

	areas.sort(([a1], [a2]) => a2 - a1);
	const total = areas.length;
	let i = 0;

	for (const [a, c1, c2] of areas) {
		i++;
		if (!isInvalidRect(c1, c2)) {
			console.log("Result", a);
			break;
		}
		if (i % 1_000 === 1) {
			console.log(`${i}/${total}: Current guess ${a}, not valid`);
			console.log(`Cached: ${cache.size}`);
		}
	}
}

main().catch(console.error);
