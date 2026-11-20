/**
 * The ASCII garland at the foot of the page: vines across the width, leaves drawn with stroke
 * edges and flowers in the sea cats' coat colors. Every glyph sits on a faint tile of its own
 * color, like the cats in the sea.
 *
 * `grow()` lays it out from a fixed seed, so the composition is the same on every visit.
 * `mountGarden(canvas)` draws it, sways leaves and flowers in a light wind, lets the pointer brush
 * through them, pauses off screen and holds still for reduced motion.
 */

import { tweaks } from '@/tweaks.svelte';

export const COLS = 184;
export const ROWS = 32;
/** A character cell is this much narrower than it is tall. */
const ASPECT = 0.6;

type RGB = readonly [number, number, number];

/* ---------- palette ---------- */

// Each hue comes in three shades: deep, base, light. Slots index into the flat list below.
const HUES = {
	leaf: 0, // greens get five shades, see GREENS
	twig: 5,
	amber: 8,
	orange: 11,
	coral: 14,
	rose: 17,
	pink: 20,
	periwinkle: 23,
	lavender: 26
} as const;
const BLOOMS = [HUES.amber, HUES.orange, HUES.orange, HUES.coral, HUES.rose, HUES.pink, HUES.periwinkle, HUES.lavender, HUES.amber, HUES.coral];

const shades = (c: RGB, dark: boolean): RGB[] => {
	const mix = (t: RGB, k: number): RGB => [c[0] + (t[0] - c[0]) * k, c[1] + (t[1] - c[1]) * k, c[2] + (t[2] - c[2]) * k];
	// shade toward plum, never black, so warm hues don't go brown
	return [mix([90, 30, 90], dark ? 0.32 : 0.22), c, mix([255, 255, 255], dark ? 0.28 : 0.12)];
};

function palette(dark: boolean): RGB[] {
	const greens: RGB[] = dark
		? [[56, 100, 46], [78, 128, 58], [106, 158, 72], [140, 188, 96], [182, 214, 136]]
		: [[40, 82, 34], [56, 104, 42], [74, 126, 50], [98, 146, 62], [128, 166, 86]];
	const hues: RGB[] = dark
		? [[150, 160, 128], [255, 196, 64], [255, 150, 70], [255, 120, 96], [255, 98, 120], [255, 170, 200], [150, 156, 255], [192, 168, 246]]
		: [[118, 128, 96], [214, 146, 0], [226, 110, 30], [224, 84, 60], [212, 60, 92], [210, 100, 150], [92, 98, 226], [128, 100, 214]];
	return [...greens, ...hues.flatMap((c) => shades(c, dark))];
}

/* ---------- layout ---------- */

export type Garden = {
	ch: string[];
	color: Uint8Array;
	/** Strength of the tile behind the glyph, 0 for none. */
	tile: Float32Array;
	/** Which leaf or flower a cell belongs to, -1 for what doesn't sway. */
	group: Int16Array;
	/** How far a cell sits from where its group is attached, 0 to 1. Sway grows with it. */
	reach: Float32Array;
	groups: number;
	/** The first and last rows anything grows on; the canvas shows only these. */
	top: number;
	bottom: number;
};

function rng(seed: number) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** The stroke that runs along angle `a` (screen space, y down). */
const stroke = (a: number) => {
	const t = ((a % Math.PI) + Math.PI) % Math.PI;
	return t < Math.PI / 8 || t > (7 * Math.PI) / 8 ? '-' : t < (3 * Math.PI) / 8 ? '\\' : t < (5 * Math.PI) / 8 ? '|' : '/';
};

const LEAF = ':=+*xo%';
const BLOOM = '+*xo%#@';
/** A glyph from a ramp, 0 the sparsest and 1 the densest. */
const at = (ramp: string, t: number) => ramp[Math.max(0, Math.min(ramp.length - 1, Math.floor(t * ramp.length)))];

const DEFAULT_SEED = 23;

export function grow(seed = DEFAULT_SEED): Garden {
	const r = rng(seed);
	const between = (a: number, b: number) => a + r() * (b - a);
	const pick = <T>(list: readonly T[]) => list[Math.floor(r() * list.length)];
	const n = COLS * ROWS;
	const g: Garden = {
		ch: Array(n).fill(' '), color: new Uint8Array(n), tile: new Float32Array(n),
		group: new Int16Array(n).fill(-1), reach: new Float32Array(n), groups: 0, top: 0, bottom: ROWS - 1
	};

	const put = (x: number, y: number, ch: string, color: number, tile: number, group = -1, reach = 0) => {
		x = Math.round(x);
		y = Math.round(y);
		if (x < 0 || y < 0 || x >= COLS || y >= ROWS || ch === ' ') return;
		const i = y * COLS + x;
		g.ch[i] = ch;
		g.color[i] = color;
		g.tile[i] = tile;
		g.group[i] = group;
		g.reach[i] = reach;
	};

	// A leaf: pointed at both ends, attached at (x, y), pointing along `a`. Its edge is drawn in
	// strokes that follow the leaf, its body in a ramp that thickens toward the midrib.
	const leaf = (x: number, y: number, a: number, length: number, width: number, tone: number) => {
		const id = g.groups++;
		const ca = Math.cos(a), sa = Math.sin(a);
		const span = Math.ceil(length / ASPECT) + 2;
		for (let cy = Math.floor(y - length - 1); cy <= Math.ceil(y + length + 1); cy++)
			for (let cx = Math.floor(x - span); cx <= Math.ceil(x + span); cx++) {
				const dx = (cx - x) * ASPECT, dy = cy - y;
				const u = dx * ca + dy * sa, v = -dx * sa + dy * ca;
				if (u < 0 || u > length) continue;
				const half = width * Math.sin((Math.PI * u) / length) ** 0.7;
				if (Math.abs(v) > half + 0.15) continue;
				// only the outer rim of the upper side is a stroke; the rest is filled
				const edge = (Math.abs(v) > half * 0.82 && v < 0) || u > length * 0.94;
				const depth = 1 - Math.abs(v) / (half + 0.15);
				const ch = edge ? stroke(a + (v < 0 ? -0.35 : 0.35)) : at(LEAF, depth * 0.9 + r() * 0.3);
				// the side facing up catches the light
				const shade = Math.max(0, Math.min(4, tone + (v * Math.sign(ca || 1) < 0 ? 1 : 0) - (edge ? 1 : 0)));
				put(cx, cy, ch, HUES.leaf + shade, edge ? 0.1 : 0.12 + depth * 0.22, id, u / length);
			}
	};

	// A flower: a round head of dense glyphs split into petals by darker strokes, lighter at the heart.
	const flower = (x: number, y: number, radius: number, hue: number) => {
		const id = g.groups++;
		const petals = 5 + Math.floor(r() * 3), turn = r() * 6;
		for (let cy = Math.floor(y - radius - 1); cy <= Math.ceil(y + radius + 1); cy++)
			for (let cx = Math.floor(x - radius / ASPECT - 1); cx <= Math.ceil(x + radius / ASPECT + 1); cx++) {
				const dx = (cx - x) * ASPECT, dy = cy - y;
				const d = Math.hypot(dx, dy) / radius, a = Math.atan2(dy, dx);
				const lobe = Math.cos(((a + turn) * petals) / 2);
				const edge = 0.78 + 0.22 * Math.abs(lobe);
				if (d > edge + (r() - 0.5) * 0.16) continue;
				const seam = Math.abs(lobe) < 0.16 && d > 0.3;
				const heart = d < 0.28;
				const ch = seam ? stroke(a) : heart ? pick(['@', '%', 'o']) : at(BLOOM, (1 - d / edge) * 0.95 + r() * 0.3);
				put(cx, cy, ch, hue + (seam ? 0 : heart ? 2 : d > 0.75 ? 0 : 1), seam ? 0.14 : 0.18 + (1 - d) * 0.26, id, Math.min(1, d + 0.4));
			}
	};

	// A bud: two or three glyphs at the tip of a sprig.
	const bud = (x: number, y: number, hue: number) => {
		const id = g.groups++;
		put(x, y, pick(['o', '@', '%']), hue + 1, 0.3, id, 1);
		put(x - 1, y, pick(['(', '*', '+']), hue, 0.18, id, 1);
		if (r() < 0.6) put(x + 1, y, pick([')', '*', '+']), hue, 0.18, id, 1);
	};

	// A thin stem in strokes, from (x, y) along `a`, wandering a little. Returns where it ends.
	const stem = (x: number, y: number, a: number, steps: number, wander = 0.3) => {
		for (let k = 0; k < steps; k++) {
			a += (r() - 0.5) * wander;
			x += (Math.cos(a) * 0.5) / ASPECT;
			y += Math.sin(a) * 0.5;
			if (k % 2 === 0) put(x, y, stroke(a), HUES.twig + 1, 0.07);
		}
		return { x, y, a };
	};

	// A bouquet: leaves fanning out from a center, one to three big flower heads over them, a
	// sprig or two reaching up with a bud, a tendril hanging down.
	const bouquet = (cx: number, cy: number, size: number) => {
		const leaves = Math.round(7 + size * 1.2);
		for (let k = 0; k < leaves; k++) {
			// all the way round, so the bouquet is a round mass; the ones pointing up are shorter
			const a = (k / leaves) * Math.PI * 2 + between(-0.3, 0.3);
			const reach = Math.sin(a) < -0.4 ? 0.65 : 1;
			const at = between(0, size * 0.2);
			leaf(cx + (Math.cos(a) * at) / ASPECT, cy + Math.sin(a) * at, a, between(size * 0.55, size * 0.9) * reach, between(1.3, 2.1), 1 + Math.floor(r() * 3));
		}
		for (let k = 0; k < 1 + Math.floor(r() * 2.4); k++) {
			const up = stem(cx + between(-2, 2), cy, -Math.PI / 2 + between(-0.7, 0.7), Math.floor(between(size * 0.6, size * 1.3)));
			if (r() < 0.4) flower(up.x, up.y - 1, between(1.4, 2), pick(BLOOMS));
			else bud(up.x, up.y, pick(BLOOMS));
			if (r() < 0.6) leaf(up.x, up.y + 2, up.a + (r() < 0.5 ? 1 : -1) * 1.2 + Math.PI, between(2.2, 3), 0.9, 2);
		}
		if (r() < 0.7) {
			const down = stem(cx + between(-4, 4), cy + 1, Math.PI / 2 + between(-0.5, 0.5), Math.floor(between(4, 10)));
			leaf(down.x, down.y, down.a + between(-0.8, 0.8), between(2, 3), 0.9, 1);
		}
		// heads sit apart, one a little higher than the other, so they read as two flowers
		const heads = r() < 0.3 ? 2 : 1;
		for (let k = 0; k < heads; k++)
			flower(cx + (heads === 1 ? between(-3, 3) : (k ? 1 : -1) * between(5, 7)), cy - between(0, 2) - k * between(1, 3), between(size * 0.34, size * 0.44) * (heads === 1 ? 1 : 0.85), pick(BLOOMS));
	};

	// bouquets across the width, joined by light tendrils
	const spots: number[] = [];
	for (let x = between(4, 9); x < COLS - 4; x += between(15, 22)) spots.push(x);
	for (let k = 0; k < spots.length - 1; k++) {
		const end = stem(spots[k], between(15, 21), between(-0.2, 0.2), Math.floor((spots[k + 1] - spots[k]) * ASPECT * 2), 0.25);
		if (r() < 0.6) leaf(end.x, end.y, end.a + 1, 2.4, 0.9, 1);
	}
	for (const x of spots) bouquet(x, between(10, 19), between(6.5, 10));

	// the canvas is cropped to what grew, so there's no empty band above the flowers
	const used = (y: number) => g.ch.slice(y * COLS, (y + 1) * COLS).some((c) => c !== ' ');
	while (g.top < g.bottom && !used(g.top)) g.top++;
	while (g.bottom > g.top && !used(g.bottom)) g.bottom--;
	return g;
}

/** The garden is the same on every visit, so it's grown once; the layout reads its height. */
export const garden = grow();
/** How many rows the canvas shows, and the smallest a cell may get on a phone. */
export const GARDEN_ROWS = garden.bottom - garden.top + 1;
export const MIN_CELL = 3.75;

/* ---------- drawing ---------- */

export function mountGarden(canvas: HTMLCanvasElement) {
	const ctx = canvas.getContext('2d')!;
	// the tweaks pane can grow a different garden; it takes over from here
	let g = garden, grown = DEFAULT_SEED;
	let bend = new Float32Array(0), speed = new Float32Array(0), phase = new Float32Array(0), anchor = new Float32Array(0);
	function plant(next: Garden, seed: number) {
		g = next;
		grown = seed;
		bend = new Float32Array(g.groups);
		speed = new Float32Array(g.groups);
		phase = Float32Array.from({ length: g.groups }, (_, i) => i * 2.39);
		anchor = new Float32Array(g.groups);
		for (let i = 0; i < g.ch.length; i++) if (g.group[i] >= 0) anchor[g.group[i]] = i % COLS;
		// a different garden can be taller or shorter than the one the page reserved room for
		const rows = g.bottom - g.top + 1;
		canvas.style.aspectRatio = `${COLS * ASPECT} / ${rows}`;
		canvas.style.minHeight = `${(rows * MIN_CELL) / ASPECT}px`;
	}
	plant(tweaks.seed === DEFAULT_SEED ? garden : grow(tweaks.seed), tweaks.seed);
	const still = matchMedia('(prefers-reduced-motion: reduce)');

	let W = 0, H = 0, cw = 0, ch = 0, x0 = 0, tileAlpha = 1, raf = 0, last = 0, time = 0, visible = false;
	let colors: string[] = [], tiles: RGB[] = [];
	const pointer = { x: -1e9, vx: 0 };

	function resize() {
		const dpr = Math.min(devicePixelRatio || 1, 2);
		W = canvas.clientWidth;
		// sized from the width: every column fits, until the glyphs would get too small to read on
		// a phone, then the sides are cropped instead
		cw = Math.max(W / COLS, MIN_CELL);
		ch = cw / ASPECT;
		H = canvas.clientHeight;
		canvas.width = Math.round(W * dpr);
		canvas.height = Math.round(H * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		// wider than the screen on phones: keep the middle
		x0 = (W - cw * COLS) / 2;
		ctx.font = `600 ${ch * 1.02}px ${getComputedStyle(canvas).fontFamily}`;
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'center';
		const dark = document.documentElement.classList.contains('dark');
		tiles = palette(dark);
		colors = tiles.map((c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`);
		tileAlpha = dark ? 1 : 0.75;
	}

	function draw() {
		if (tweaks.seed !== grown) {
			plant(grow(tweaks.seed), tweaks.seed);
			resize();
		}
		ctx.clearRect(0, 0, W, H);
		const { ch: glyphs, color, tile, group, reach } = g;
		const gap = Math.max(0.5, cw * 0.12);
		for (let pass = 0; pass < 2; pass++)
			for (let i = 0; i < glyphs.length; i++) {
				if (glyphs[i] === ' ') continue;
				const x = i % COLS, y = ((i / COLS) | 0) - g.top;
				const p = group[i];
				const dx = p < 0 ? 0 : bend[p] * reach[i];
				const left = x0 + (x + dx) * cw;
				if (pass === 0) {
					// the tile: the glyph's own color, faint, a hair smaller than its cell
					if (tile[i] === 0) continue;
					const c = tiles[color[i]];
					ctx.fillStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${(tile[i] * tileAlpha).toFixed(3)})`;
					ctx.fillRect(left + gap / 2, y * ch + gap / 2, cw - gap, ch - gap);
				} else {
					ctx.fillStyle = colors[color[i]];
					ctx.fillText(glyphs[i], left + cw / 2, (y + 0.54) * ch);
				}
			}
	}

	// Each leaf and flower is a spring that leans toward the wind and gets pushed by the pointer
	// passing over it. Sway is a fraction of a cell at the tips, so the glyphs stay on their grid.
	function step(dt: number) {
		time += dt;
		for (let p = 0; p < g.groups; p++) {
			const wind = tweaks.wind * (Math.sin(time * 0.9 + phase[p] + anchor[p] * 0.05) * 0.28 + Math.sin(time * 0.37 + phase[p] * 0.5) * 0.18);
			speed[p] += (wind - bend[p]) * 16 * dt - speed[p] * 3.4 * dt;
		}
		if (pointer.vx !== 0) {
			const col = (pointer.x - x0) / cw;
			for (let p = 0; p < g.groups; p++) {
				const d = Math.abs(anchor[p] - col);
				if (d < 8) speed[p] += (pointer.vx / cw) * 0.05 * (1 - d / 8);
			}
			pointer.vx = 0;
		}
		for (let p = 0; p < g.groups; p++) {
			speed[p] = Math.max(-30, Math.min(30, speed[p]));
			bend[p] = Math.max(-2.5, Math.min(2.5, bend[p] + speed[p] * dt));
		}
	}

	function frame(now: number) {
		const dt = Math.min(0.05, (now - last) / 1000 || 0);
		last = now;
		step(dt);
		draw();
		raf = requestAnimationFrame(frame);
	}

	function start() {
		cancelAnimationFrame(raf);
		if (still.matches || !visible) return draw();
		last = performance.now();
		raf = requestAnimationFrame(frame);
	}

	const onMove = (e: PointerEvent) => {
		const x = e.clientX - canvas.getBoundingClientRect().left;
		if (pointer.x > -1e8) pointer.vx += x - pointer.x;
		pointer.x = x;
	};
	const onLeave = () => (pointer.x = -1e9);
	const redraw = () => {
		resize();
		draw();
	};

	const sized = new ResizeObserver(redraw);
	const seen = new IntersectionObserver(([entry]) => {
		visible = entry.isIntersecting;
		start();
	});
	const themed = new MutationObserver(redraw);
	sized.observe(canvas);
	seen.observe(canvas);
	themed.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
	still.addEventListener('change', start);
	canvas.addEventListener('pointermove', onMove);
	canvas.addEventListener('pointerleave', onLeave);
	redraw();
	// the first frame may have drawn with a fallback mono; draw again once the font is in
	document.fonts?.ready.then(redraw);

	return () => {
		cancelAnimationFrame(raf);
		sized.disconnect();
		seen.disconnect();
		themed.disconnect();
		still.removeEventListener('change', start);
		canvas.removeEventListener('pointermove', onMove);
		canvas.removeEventListener('pointerleave', onLeave);
	};
}
