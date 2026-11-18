/**
 * ASCII cats hunting ASCII fish on a character grid, drawn on one canvas.
 * `mountCatSea(canvas)` starts it and returns a function that stops it. It reads the theme from
 * the `.dark` class on <html>, pauses off screen, and draws a still frame for reduced motion.
 * The canvas parent is the visible area: clicks outside it don't splash.
 */

type Species = {
	g: [string, string];
	cruise: number;
	max: number;
	min: number;
	sep: number;
	align: number;
	coh: number;
	jitter: number;
	drag: number;
	school: [number, number];
	weight: number;
};
type Fish = { x: number; y: number; vx: number; vy: number; sp: number; alarm: number; alive: boolean; respawnAt: number; depth: number };
type Target = { x: number; y: number; vx: number; vy: number; alive: boolean };
type Kind = 'tabby' | 'void' | 'snow' | 'tuxedo';
type State = 'wander' | 'stalk' | 'pounce' | 'rest' | 'play';
type Cat = {
	id: number;
	kind: Kind;
	coat: Coat;
	accent: RGB;
	L: number;
	nodes: Float32Array;
	rs: Float32Array;
	arc: Float32Array;
	heading: number;
	speed: number;
	turn: number;
	wander: number;
	gait: number;
	tail: number;
	state: State;
	until: number;
	retarget: number;
	target: Target | null;
	hunger: number;
	blink: number;
	playCool: number;
	paws: Float32Array;
	lastPaw: Float32Array;
};
type RGB = readonly [number, number, number];
type Look = { light: boolean; bg: string; ink: string; edge: number; shadow: string; accents: readonly RGB[] };

const TAU = Math.PI * 2;
const clamp = (x: number, a: number, b: number) => (x < a ? a : x > b ? b : x);
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const hash = (x: number, y: number, z: number) => {
	let h = Math.imul(x | 0, 0x165667b1) ^ Math.imul(y | 0, 0x27d4eb2f) ^ Math.imul(z | 0, 0x55fdc781);
	h = Math.imul(h ^ (h >>> 13), 0x4bf19f61);
	return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const angDiff = (a: number, b: number) => {
	let d = (b - a) % TAU;
	if (d > Math.PI) d -= TAU;
	if (d < -Math.PI) d += TAU;
	return d;
};
const smooth = (a: number, b: number, x: number) => {
	const t = clamp((x - a) / (b - a), 0, 1);
	return t * t * (3 - 2 * t);
};

const N = 16; // spine nodes, head first
const KINDS: Kind[] = ['tabby', 'void', 'snow', 'tuxedo'];
// each cat is close to one flat warm color, shifting a little from head to tail; the collar contrasts
type Coat = { a: RGB; b: RGB; collar: RGB };
const COATS: Coat[] = [
	{ a: [255, 204, 72], b: [255, 176, 52], collar: [107, 107, 255] },
	{ a: [255, 128, 84], b: [255, 104, 104], collar: [255, 214, 92] },
	{ a: [168, 170, 255], b: [184, 172, 250], collar: [255, 140, 60] },
	{ a: [255, 186, 206], b: [255, 166, 190], collar: [143, 162, 255] }
];
// shade toward plum and light toward white, never toward black, so warm coats don't go brown
const PLUM: RGB = [112, 46, 132];
const INK: RGB = [58, 18, 62];
const WHITE: RGB = [255, 255, 255];
const mix = (p: RGB, q: RGB, t: number): RGB => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
const SPECIES: Species[] = [
	{ g: ['>', '<'], cruise: 34, max: 62, min: 14, sep: 1.8, align: 1.6, coh: 1.3, jitter: 36, drag: 0.6, school: [14, 24], weight: 3 },
	{ g: ['»', '«'], cruise: 44, max: 76, min: 20, sep: 1.5, align: 3, coh: 0.5, jitter: 28, drag: 1.4, school: [16, 28], weight: 3 },
	{ g: ['·', '·'], cruise: 26, max: 54, min: 10, sep: 1.4, align: 0.4, coh: 1.4, jitter: 90, drag: 0.3, school: [8, 12], weight: 1 }
];
// loose colored glyphs in the water: the coats' family, deeper on the light page so they still read
const ACCENTS: readonly RGB[] = [[255, 204, 72], [255, 176, 52], [255, 128, 84], [255, 104, 104], [255, 186, 206], [168, 170, 255], [143, 162, 255]];
const ACCENTS_ON_LIGHT: readonly RGB[] = [[214, 150, 0], [224, 120, 20], [226, 90, 50], [220, 70, 90], [210, 100, 140], [110, 110, 230], [90, 110, 230]];
const rgb = (c: RGB, a = 1) => (a >= 1 ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`);
const grey = (g: number, a = 1) => (a >= 1 ? `rgb(${g | 0},${g | 0},${g | 0})` : `rgba(${g | 0},${g | 0},${g | 0},${a})`);
const RAMP = ':;=+cxoX%8#@';
const FUR = ['-', '\\', '|', '/'];
const SUB = [0.25, 0.3, 0.75, 0.3, 0.25, 0.72, 0.75, 0.72];
const STEP = 1 / 60;

function readLook(): Look {
	const light = !document.documentElement.classList.contains('dark');
	return light
		? { light, bg: '#f3f2f2', ink: '12,13,13', edge: 128, shadow: 'rgba(12,13,13,0.10)', accents: ACCENTS_ON_LIGHT }
		: { light, bg: '#0c0d0d', ink: '236,236,236', edge: 118, shadow: 'rgba(0,0,0,0.45)', accents: ACCENTS };
}

export function mountCatSea(canvas: HTMLCanvasElement, opts: { cats?: number; fish?: number } = {}) {
	const ctx = canvas.getContext('2d', { alpha: false })!;
	const box = canvas.parentElement ?? canvas;

	let W = 0, H = 0, dpr = 1, cw = 10, ch = 14, cols = 0, rows = 0, seededShort = 0, font = '';
	let energy = new Float32Array(0), energyTmp = new Float32Array(0);
	let twinkle = new Float32Array(0), heat = new Float32Array(0);
	let cS = new Float32Array(0), cFlag = new Uint8Array(0), cShade = new Float32Array(0), cCat = new Uint8Array(0), cAng = new Float32Array(0), cKey = new Uint32Array(0), cShadow = new Uint8Array(0);
	let fishStamp = new Uint32Array(0), frameId = 0;
	let fish: Fish[] = [], cats: Cat[] = [], time = 0;
	const prints: { x: number; y: number; t: number }[] = [];
	const events: { kind: 'eat' | 'splash'; x: number; y: number }[] = [];
	let perception = 60, gCols = 0, gRows = 0, gHead = new Int32Array(0), gNext = new Int32Array(0);
	const pointer = { x: 0, y: 0, active: false, movedAt: -99 };
	const S = { flag: 0, shade: 0, s: 0, u: 0, v: 0, t: 0, head: false, ang: 0, dist: 0 };
	let look = readLook();

	/* ---------- world ---------- */

	function pickSpecies() {
		const total = SPECIES.reduce((a, s) => a + s.weight, 0);
		let r = Math.random() * total;
		for (let i = 0; i < SPECIES.length; i++) if ((r -= SPECIES[i].weight) <= 0) return i;
		return 0;
	}

	function seed() {
		const short = Math.min(W, H);
		const catN = opts.cats ?? clamp(Math.round(W / 460), 2, 4);
		const sizes = [1, 0.84, 0.92, 0.78];
		cats = [];
		for (let i = 0; i < catN; i++) {
			const L = clamp(short * 0.52, 160, 470) * sizes[i % sizes.length];
			const x = ((i + rand(0.25, 0.75)) / catN) * W, y = rand(0.2, 0.8) * H, heading = rand(0, TAU);
			const nodes = new Float32Array(N * 2);
			const seg = L / (N - 1);
			for (let k = 0; k < N; k++) {
				nodes[2 * k] = x - Math.cos(heading) * seg * k;
				nodes[2 * k + 1] = y - Math.sin(heading) * seg * k;
			}
			cats.push({
				id: i + 1, kind: KINDS[i % KINDS.length], coat: COATS[i % COATS.length], accent: COATS[i % COATS.length].collar, L, nodes, rs: new Float32Array(N * 2), arc: new Float32Array(N),
				heading, speed: 20, turn: 0, wander: 0, gait: rand(0, TAU), tail: rand(0, TAU),
				state: 'wander', until: 0, retarget: 0, target: null, hunger: rand(0.2, 0.7), blink: rand(1, 5), playCool: 0,
				paws: new Float32Array(8), lastPaw: new Float32Array(4)
			});
		}
		cats.sort((a, b) => a.L - b.L); // big cats draw on top
		const count = opts.fish ?? clamp(Math.round((W * H) / 5200), 60, 280);
		fish = [];
		while (fish.length < count) {
			const sp = pickSpecies(), spec = SPECIES[sp];
			const n = Math.min(Math.floor(rand(spec.school[0], spec.school[1] + 1)), count - fish.length);
			const x = rand(0.08, 0.92) * W, y = rand(0.1, 0.9) * H;
			const dir = (Math.random() < 0.5 ? 0 : Math.PI) + rand(-0.5, 0.5);
			for (let k = 0; k < n; k++) {
				fish.push({
					x: x + rand(-1, 1) * cw * Math.sqrt(n) * 1.5, y: y + rand(-1, 1) * ch * Math.sqrt(n) * 0.6,
					vx: Math.cos(dir) * spec.cruise, vy: Math.sin(dir) * spec.cruise,
					sp, alarm: 0, alive: true, respawnAt: 0, depth: rand(0.5, 1)
				});
			}
		}
		gNext = new Int32Array(fish.length);
	}

	function buildGrid() {
		gCols = Math.ceil(W / perception) + 2;
		gRows = Math.ceil(H / perception) + 2;
		if (gHead.length !== gCols * gRows) gHead = new Int32Array(gCols * gRows);
		gHead.fill(-1);
		for (let i = 0; i < fish.length; i++) {
			const f = fish[i];
			if (!f.alive) continue;
			const b = clamp(Math.floor(f.y / perception) + 1, 0, gRows - 1) * gCols + clamp(Math.floor(f.x / perception) + 1, 0, gCols - 1);
			gNext[i] = gHead[b];
			gHead[b] = i;
		}
	}

	function stepFish(dt: number) {
		buildGrid();
		const P2 = perception * perception;
		const keep = Math.exp(-0.7 * dt);
		for (let i = 0; i < fish.length; i++) {
			const f = fish[i];
			if (!f.alive) continue;
			const sp = SPECIES[f.sp];
			const spd = Math.hypot(f.vx, f.vy) || 1, hx = f.vx / spd, hy = f.vy / spd;
			let ax = 0, ay = 0, avx = 0, avy = 0, cx = 0, cy = 0, n = 0, alarmN = 0;
			const sepR = sp.sep * cw * (1 + f.alarm);
			const gx = clamp(Math.floor(f.x / perception) + 1, 0, gCols - 1), gy = clamp(Math.floor(f.y / perception) + 1, 0, gRows - 1);
			for (let yy = Math.max(0, gy - 1); yy <= Math.min(gRows - 1, gy + 1); yy++)
				for (let xx = Math.max(0, gx - 1); xx <= Math.min(gCols - 1, gx + 1); xx++)
					for (let j = gHead[yy * gCols + xx]; j !== -1; j = gNext[j]) {
						if (j === i) continue;
						const o = fish[j], dx = o.x - f.x, dy = o.y - f.y, d2 = dx * dx + dy * dy;
						if (d2 > P2 || d2 < 1e-6) continue;
						const d = Math.sqrt(d2);
						if ((dx * hx + dy * hy) / d < -0.6) continue; // blind spot behind
						if (d < sepR) {
							const k = ((sepR - d) / d) * 22;
							ax -= dx * k;
							ay -= dy * k * 1.6;
						}
						if (o.sp === f.sp) {
							avx += o.vx;
							avy += o.vy;
							cx += dx;
							cy += dy;
							n++;
						}
						if (o.alarm > alarmN) alarmN = o.alarm;
					}
			if (n) {
				const coh = sp.coh * (1 - 0.8 * f.alarm);
				ax += (avx / n - f.vx) * sp.align + (cx / n) * coh;
				ay += (avy / n - f.vy) * sp.align + (cy / n) * coh;
			}
			let threat = 0;
			for (const c of cats) {
				const R = 0.45 * c.L + 50;
				let best = Infinity, bx = 0, by = 0;
				for (let k = 0; k <= 9; k += 3) {
					const nx = c.nodes[2 * k], ny = c.nodes[2 * k + 1], d2 = (f.x - nx) ** 2 + (f.y - ny) ** 2;
					if (d2 < best) {
						best = d2;
						bx = nx;
						by = ny;
					}
				}
				const d = Math.sqrt(best);
				if (d >= R || d < 1e-3) continue;
				let w = 1 - d / R;
				w *= w;
				ax += ((f.x - bx) / d) * 1000 * w;
				ay += ((f.y - by) / d) * 1000 * w;
				threat = Math.max(threat, Math.sqrt(w));
			}
			if (pointer.active) {
				const dx = f.x - pointer.x, dy = f.y - pointer.y, d = Math.hypot(dx, dy);
				if (d < 120 && d > 1e-3) {
					const w = (1 - d / 120) ** 2;
					ax += (dx / d) * 1000 * w;
					ay += (dy / d) * 1000 * w;
					threat = Math.max(threat, 0.8 * Math.sqrt(w));
				}
			}
			f.alarm = Math.max(f.alarm * keep, threat, alarmN * 0.8 * keep);
			const m = 32;
			if (f.x < m) ax += (m - f.x) * 7;
			else if (f.x > W - m) ax -= (f.x - (W - m)) * 7;
			if (f.y < m) ay += (m - f.y) * 7;
			else if (f.y > H - m) ay -= (f.y - (H - m)) * 7;
			// slow drifting current so schools wander instead of circling
			ax += Math.sin(f.y * 0.006 + time * 0.07) * 16 + Math.cos((f.x + f.y) * 0.004 - time * 0.05) * 9 + (Math.random() - 0.5) * sp.jitter;
			ay += Math.cos(f.x * 0.005 - time * 0.06) * 10 + (Math.random() - 0.5) * sp.jitter;
			ay -= f.vy * sp.drag * (1 - 0.7 * f.alarm);
			const cruise = sp.cruise * (1 + 1.3 * f.alarm);
			ax += (cruise - spd) * hx * 1.6;
			ay += (cruise - spd) * hy * 1.6;
			f.vx += ax * dt;
			f.vy += ay * dt;
			const max = sp.max * (1 + 1.8 * f.alarm), v = Math.hypot(f.vx, f.vy);
			if (v > max) {
				f.vx *= max / v;
				f.vy *= max / v;
			} else if (v < sp.min && v > 1e-3) {
				f.vx *= sp.min / v;
				f.vy *= sp.min / v;
			}
			f.x = clamp(f.x + f.vx * dt, -40, W + 40);
			f.y = clamp(f.y + f.vy * dt, -40, H + 40);
		}
	}

	function findPrey(c: Cat) {
		const range = 0.9 * c.L + 180, hx = c.nodes[0], hy = c.nodes[1];
		const fx = Math.cos(c.heading), fy = Math.sin(c.heading);
		let best: Fish | null = null, score = Infinity;
		for (const f of fish) {
			if (!f.alive) continue;
			const dx = f.x - hx, dy = f.y - hy, d = Math.hypot(dx, dy);
			if (d > range || d < 1e-3) continue;
			const facing = (dx * fx + dy * fy) / d;
			if (facing < 0) continue;
			const s = d * (1 + (1 - facing));
			if (s < score) {
				score = s;
				best = f;
			}
		}
		return best;
	}

	function pawSpot(c: Cat, s: number, side: number, fwd: number, out: Float32Array, o: number) {
		const x = s * (N - 1), k = Math.min(N - 2, Math.floor(x)), t = x - k;
		const ax = c.nodes[2 * k], ay = c.nodes[2 * k + 1], bx = c.nodes[2 * k + 2], by = c.nodes[2 * k + 3];
		let dx = ax - bx, dy = ay - by;
		const len = Math.hypot(dx, dy) || 1;
		dx /= len;
		dy /= len;
		const px = ax + (bx - ax) * t, py = ay + (by - ay) * t, lat = (halfWidth(s) + 0.004) * c.L;
		out[o] = px + dx * fwd - dy * lat * side;
		out[o + 1] = py + dy * fwd + dx * lat * side;
	}

	function stepCats(dt: number) {
		for (const c of cats) {
			c.hunger = Math.min(1, c.hunger + 0.035 * dt);
			c.blink -= dt;
			if (c.blink < -0.14) c.blink = rand(2, 6);
			const nodes = c.nodes, hx = nodes[0], hy = nodes[1];
			let gx = Math.cos(c.heading), gy = Math.sin(c.heading), goal = 0, turnMax = 1.2;
			const teased = pointer.active && time - pointer.movedAt < 1.5;
			const pd = teased ? Math.hypot(pointer.x - hx, pointer.y - hy) : Infinity;
			if ((c.state === 'wander' || c.state === 'stalk' || c.state === 'rest') && pd < 300 && time > c.playCool) c.state = 'play';

			if (c.state === 'rest') {
				if (time > c.until) c.state = 'wander';
			} else if (c.state === 'wander') {
				c.wander = clamp(c.wander + (Math.random() - 0.5) * dt * 3, -1, 1);
				gx += 0.5 * Math.cos(c.heading + c.wander);
				gy += 0.5 * Math.sin(c.heading + c.wander);
				goal = 24 + 0.06 * c.L;
				if (time >= c.retarget) {
					c.retarget = time + 0.5;
					const prey = c.hunger > 0.35 ? findPrey(c) : null;
					if (prey) {
						c.target = prey;
						c.state = 'stalk';
						c.until = time + 7;
					} else if (Math.random() < 0.05) {
						c.state = 'rest';
						c.until = time + rand(2, 5);
					}
				}
			} else if (c.state === 'stalk') {
				const t = c.target;
				if (!t || !t.alive || time > c.until) c.state = 'wander';
				else {
					const dx = t.x + 0.3 * t.vx - hx, dy = t.y + 0.3 * t.vy - hy, d = Math.hypot(dx, dy) || 1;
					gx += (dx / d) * 3;
					gy += (dy / d) * 3;
					goal = 14;
					turnMax = 1.8;
					if (d < 0.5 * c.L) {
						c.state = 'pounce';
						c.until = time + 0.42;
					} else if (d > 1.8 * c.L + 220) c.state = 'wander';
				}
			} else if (c.state === 'play') {
				if (pd > 380) c.state = 'wander';
				else {
					const dx = pointer.x - hx, dy = pointer.y - hy, d = pd || 1;
					gx += (dx / d) * 3;
					gy += (dy / d) * 3;
					turnMax = 2.4;
					goal = d < 0.6 * c.L ? 10 : 64; // crouch when close, trot when far
					if (d < 0.45 * c.L && Math.random() < dt * 1.5) {
						c.state = 'pounce';
						c.target = { x: pointer.x, y: pointer.y, vx: 0, vy: 0, alive: true };
						c.until = time + 0.38;
					}
				}
			} else if (c.state === 'pounce') {
				const t = c.target;
				if (t) {
					const dx = t.x - hx, dy = t.y - hy, d = Math.hypot(dx, dy) || 1;
					gx += (dx / d) * 4;
					gy += (dy / d) * 4;
				}
				goal = c.L * 1.25;
				turnMax = 3;
				if (time > c.until) {
					c.state = 'rest';
					c.until = time + rand(1.2, 2.6);
					c.playCool = time + 1.5;
				}
			}

			for (const o of cats) {
				if (o === c) continue;
				for (let k = 0; k < N; k += 3) {
					const dx = hx - o.nodes[2 * k], dy = hy - o.nodes[2 * k + 1], d = Math.hypot(dx, dy), r = (c.L + o.L) * 0.32;
					if (d < r && d > 1e-3) {
						const w = (1 - d / r) * 3;
						gx += (dx / d) * w;
						gy += (dy / d) * w;
					}
				}
			}
			const margin = 0.1 * Math.min(W, H) + 0.15 * c.L;
			const ex = Math.max(margin - hx, hx - (W - margin), 0), ey = Math.max(margin - hy, hy - (H - margin), 0);
			if (ex > 0 || ey > 0) {
				const k = clamp(Math.hypot(ex, ey) / (0.5 * c.L), 0, 1) * 3, dx = W / 2 - hx, dy = H / 2 - hy, d = Math.hypot(dx, dy) || 1;
				gx += (dx / d) * k;
				gy += (dy / d) * k;
			}

			const want = Math.atan2(gy, gx);
			const maxTurn = turnMax * dt * clamp(c.speed / 30, 0.35, 1.5);
			const turn = clamp(angDiff(c.heading, want), -maxTurn, maxTurn);
			c.heading += turn;
			c.turn += (turn / dt - c.turn) * Math.min(1, 4 * dt);
			const accel = c.state === 'pounce' ? 9 : c.state === 'rest' ? 3 : 1.6;
			c.speed += (goal - c.speed) * Math.min(1, accel * dt);
			c.gait += ((dt * c.speed) / (0.34 * c.L)) * TAU;
			c.tail += dt * (c.state === 'stalk' || c.state === 'play' ? 9 : c.state === 'rest' ? 2.2 : 3.2);

			nodes[0] += Math.cos(c.heading) * c.speed * dt;
			nodes[1] += Math.sin(c.heading) * c.speed * dt;
			const seg = c.L / (N - 1);
			let back = c.heading + Math.PI;
			for (let k = 1; k < N; k++) {
				const px = nodes[2 * k - 2], py = nodes[2 * k - 1];
				const lim = k / N < 0.6 ? 0.1 : 0.3; // stiff body, loose tail
				const a = back + clamp(angDiff(back, Math.atan2(nodes[2 * k + 1] - py, nodes[2 * k] - px)), -lim, lim);
				nodes[2 * k] = px + Math.cos(a) * seg;
				nodes[2 * k + 1] = py + Math.sin(a) * seg;
				back = a;
			}

			if (c.hunger > 0.1 && c.speed > 8) {
				const r = 0.09 * c.L + 8;
				for (const f of fish) {
					if (f.alive && (f.x - nodes[0]) ** 2 + (f.y - nodes[1]) ** 2 < r * r) {
						f.alive = false;
						f.respawnAt = time + rand(3, 8);
						c.hunger = Math.max(0, c.hunger - 0.3);
						events.push({ kind: 'eat', x: f.x, y: f.y });
					}
				}
			}

			// diagonal gait: FL+BR, FR+BL; a paw leaves a print when it lands
			const stride = 0.045 * c.L;
			const legs = [[0.26, -1, 0], [0.26, 1, Math.PI], [0.52, -1, Math.PI], [0.52, 1, 0]];
			for (let p = 0; p < 4; p++) {
				const [s, side, ph] = legs[p];
				const swing = Math.sin(c.gait + ph);
				pawSpot(c, s, side, c.speed > 3 ? stride * swing : 0, c.paws, 2 * p);
				if (c.lastPaw[p] > 0 && swing <= 0 && c.speed > 8) prints.push({ x: c.paws[2 * p], y: c.paws[2 * p + 1], t: time });
				c.lastPaw[p] = swing;
			}
		}
		if (prints.length > 260) prints.splice(0, prints.length - 260);
	}

	function respawn() {
		const dead = fish.filter((f) => !f.alive && f.respawnAt <= time);
		if (dead.length < 6) return;
		const sp = pickSpecies(), spec = SPECIES[sp], side = Math.floor(rand(0, 4)), h = rand(0.15, 0.85);
		const x = side === 0 ? -20 : side === 1 ? W + 20 : h * W, y = side === 2 ? -20 : side === 3 ? H + 20 : h * H;
		const dir = Math.atan2(H / 2 - y, W / 2 - x) + rand(-0.5, 0.5);
		for (const f of dead.slice(0, spec.school[1])) {
			Object.assign(f, {
				alive: true, sp, alarm: 0,
				x: x + rand(-1, 1) * perception, y: y + rand(-1, 1) * perception,
				vx: Math.cos(dir) * spec.cruise * 1.4, vy: Math.sin(dir) * spec.cruise * 1.4
			});
		}
	}

	function step(dt: number) {
		time += dt;
		stepFish(dt);
		stepCats(dt);
		respawn();
	}

	/* ---------- cat shape (top-down) ---------- */

	function halfWidth(s: number) {
		if (s < 0.14) return 0.06;
		if (s < 0.22) return 0.06 + 0.035 * smooth(0.14, 0.22, s);
		if (s < 0.58) return 0.095 + 0.02 * Math.sin((Math.PI * (s - 0.22)) / 0.36);
		if (s < 0.64) return 0.095 - 0.067 * smooth(0.58, 0.64, s);
		return 0.028 - (0.012 * (s - 0.64)) / 0.36;
	}

	function inTri(x: number, y: number, ax: number, ay: number, bx: number, by: number, cx: number, cy: number) {
		const d1 = (x - bx) * (ay - by) - (ax - bx) * (y - by);
		const d2 = (x - cx) * (by - cy) - (bx - cx) * (y - cy);
		const d3 = (x - ax) * (cy - ay) - (cx - ax) * (y - ay);
		return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
	}

	function buildSpine(c: Cat) {
		const { nodes, rs, arc, L } = c;
		const moving = c.speed > 5 ? 1 : 0;
		const amp = L * (c.state === 'rest' ? 0.09 : c.state === 'stalk' || c.state === 'play' ? 0.05 : 0.07);
		for (let k = 0; k < N; k++) {
			const s = k / (N - 1), a = Math.max(0, k - 1), b = Math.min(N - 1, k + 1);
			let nx = nodes[2 * a] - nodes[2 * b], ny = nodes[2 * a + 1] - nodes[2 * b + 1];
			const len = Math.hypot(nx, ny) || 1;
			nx /= len;
			ny /= len;
			let off;
			if (s > 0.6) {
				const q = (s - 0.6) / 0.4;
				off = amp * Math.pow(q, 1.4) * Math.sin(c.tail - q * 3.2);
			} else off = 0.01 * L * moving * Math.sin(c.gait * 0.5) * Math.sin(s * Math.PI);
			rs[2 * k] = nodes[2 * k] - ny * off;
			rs[2 * k + 1] = nodes[2 * k + 1] + nx * off;
		}
		arc[0] = 0;
		for (let k = 1; k < N; k++) arc[k] = arc[k - 1] + Math.hypot(rs[2 * k] - rs[2 * k - 2], rs[2 * k + 1] - rs[2 * k - 1]);
	}

	function sampleCat(c: Cat, px: number, py: number) {
		const L = c.L, rs = c.rs;
		S.head = false;
		S.flag = 0;
		let fx = rs[0] - rs[2], fy = rs[1] - rs[3];
		const fl = Math.hypot(fx, fy) || 1;
		fx /= fl;
		fy /= fl;
		const qx = px - rs[0], qy = py - rs[1];
		const u = -(qx * fx + qy * fy), v = -qx * fy + qy * fx, av = Math.abs(v);
		const R = 0.1 * L, hc = 0.085 * L, dh = Math.hypot(u - hc, v);
		S.u = u;
		S.v = v;
		S.ang = Math.atan2(fy, fx);
		if (dh < R) {
			S.flag = 1;
			S.head = true;
			S.s = 0;
			S.t = dh / R;
			S.shade = 0.8 - 0.38 * S.t * S.t;
			return true;
		}
		if (inTri(u, av, 0.04 * L, 0.035 * L, 0.11 * L, 0.095 * L, -0.04 * L, 0.105 * L)) {
			S.flag = 2;
			S.shade = 0.55;
			S.s = 0;
			S.t = 1;
			return true;
		}
		if (u > -0.03 * L && u < 0.08 * L && av > R * 0.9 && av < 0.2 * L) {
			const w1 = Math.abs(u - (0.045 * L - (av - R) * 0.2));
			const w2 = Math.abs(u - (0.065 * L + (av - R) * 0.25));
			if (Math.min(w1, w2) < 0.3 * ch) {
				S.flag = 7;
				S.shade = 0;
				S.dist = Infinity;
				return false;
			}
		}
		let best = Infinity, sBest = 0, side = 1, ang = 0;
		for (let k = 0; k < N - 1; k++) {
			const ax = rs[2 * k], ay = rs[2 * k + 1], dx = rs[2 * k + 2] - ax, dy = rs[2 * k + 3] - ay;
			const m = dx * dx + dy * dy || 1;
			const g = clamp(((px - ax) * dx + (py - ay) * dy) / m, 0, 1);
			const d2 = (px - (ax + dx * g)) ** 2 + (py - (ay + dy * g)) ** 2;
			if (d2 < best) {
				best = d2;
				sBest = (c.arc[k] + g * Math.sqrt(m)) / (c.arc[N - 1] || 1);
				side = dx * (py - ay) - dy * (px - ax) >= 0 ? 1 : -1;
				ang = Math.atan2(dy, dx);
			}
		}
		const d = Math.sqrt(best), hw = halfWidth(sBest) * L;
		S.s = sBest;
		S.ang = ang;
		S.v = d * side;
		if (d <= hw) {
			S.flag = 1;
			S.t = d / (hw || 1);
			S.shade = 0.74 - 0.42 * S.t * S.t;
			return true;
		}
		for (let p = 0; p < 4; p++) {
			if (Math.hypot(px - c.paws[2 * p], py - c.paws[2 * p + 1]) < 0.04 * L) {
				S.flag = 5;
				S.shade = 0.7;
				return true;
			}
		}
		S.dist = d - hw;
		return false;
	}

	// 0 coat, 6 dark marking, 8 light marking, 10 collar
	function marking(kind: Kind, L: number) {
		const s = S.s, t = S.t;
		if (S.flag === 1 && !S.head && s > 0.19 && s < 0.235) return 10; // collar, just behind the head
		if (S.flag === 5) return kind === 'tuxedo' ? 8 : kind === 'snow' ? 6 : 0;
		if (S.flag === 2) return kind === 'snow' ? 6 : 0;
		if (kind === 'tabby') {
			if (S.head) return S.u > 0.02 * L && S.u < 0.09 * L && Math.abs(S.v) < 0.022 * L ? 6 : 0;
			if (s > 0.2 && s < 0.58) return t < 0.16 || Math.sin((s - 0.2) * TAU * 10 + t * 2.2) > 0.55 ? 6 : 0;
			if (s > 0.64) return Math.sin(s * TAU * 12) > 0.35 ? 6 : 0;
		}
		if (kind === 'snow') {
			if (S.head) return S.u < 0.065 * L ? 6 : 0;
			if (s > 0.72) return 6;
		}
		if (kind === 'tuxedo') {
			if (S.head) return S.u < 0.06 * L && Math.abs(S.v) < 0.055 * L ? 8 : 0;
			if (s > 0.93) return 8;
		}
		return 0;
	}

	function rasterizeCats() {
		cFlag.fill(0);
		cShadow.fill(0);
		for (let ci = 0; ci < cats.length; ci++) {
			const c = cats[ci], L = c.L, rs = c.rs;
			buildSpine(c);
			let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
			for (let k = 0; k < N; k++) {
				x0 = Math.min(x0, rs[2 * k]);
				x1 = Math.max(x1, rs[2 * k]);
				y0 = Math.min(y0, rs[2 * k + 1]);
				y1 = Math.max(y1, rs[2 * k + 1]);
			}
			const pad = 0.2 * L;
			const c0 = Math.max(0, Math.floor((x0 - pad) / cw)), c1 = Math.min(cols - 1, Math.floor((x1 + pad) / cw));
			const r0 = Math.max(0, Math.floor((y0 - pad) / ch)), r1 = Math.min(rows - 1, Math.floor((y1 + pad) / ch));
			const reach = Math.hypot(cw, ch);
			for (let r = r0; r <= r1; r++)
				for (let col = c0; col <= c1; col++) {
					const X = col * cw, Y = r * ch, i = r * cols + col;
					const hit = sampleCat(c, X + cw / 2, Y + ch / 2);
					if (S.flag === 7 && !hit) {
						if (!cFlag[i]) {
							cFlag[i] = 7;
							cCat[i] = ci;
						}
						continue;
					}
					if (!hit && S.dist > reach) continue;
					const flag = S.flag, shade = S.shade, ang = S.ang, mark = hit ? marking(c.kind, L) : 0;
					const key = (Math.floor(S.s * 40) * 131 + Math.round(S.v / cw) * 7 + c.id * 977) >>> 0;
					let cover = hit ? 1 : 0;
					for (let k = 0; k < SUB.length; k += 2) if (sampleCat(c, X + SUB[k] * cw, Y + SUB[k + 1] * ch)) cover++;
					if (!cover) continue;
					cCat[i] = ci;
					cAng[i] = ang;
					cS[i] = S.s;
					cKey[i] = key;
					if (hit && cover >= 3) {
						cFlag[i] = mark || flag;
						cShade[i] = shade;
						if (col + 1 < cols && r + 1 < rows) cShadow[(r + 1) * cols + col + 1] = 1;
					} else {
						cFlag[i] = 9; // soft edge, glyph only
						cShade[i] = cover / 5;
					}
				}
			// eyes and nose are smaller than a cell, so stamp them where they land
			const hx = rs[0], hy = rs[1];
			let fx = rs[0] - rs[2], fy = rs[1] - rs[3];
			const fl = Math.hypot(fx, fy) || 1;
			fx /= fl;
			fy /= fl;
			const at = (u: number, v: number) => {
				const x = hx - fx * u - fy * v, y = hy - fy * u + fx * v;
				const col = Math.floor(x / cw), r = Math.floor(y / ch);
				return col < 0 || r < 0 || col >= cols || r >= rows ? -1 : r * cols + col;
			};
			for (const sgn of [-1, 1]) {
				const e = at(0.06 * L, sgn * 0.045 * L);
				if (e >= 0) {
					cFlag[e] = 3;
					cCat[e] = ci;
				}
			}
			const nose = at(0.008 * L, 0);
			if (nose >= 0 && cFlag[nose] !== 3) {
				cFlag[nose] = 4;
				cCat[nose] = ci;
			}
		}
	}

	/* ---------- drawing ---------- */

	function resize() {
		const rect = canvas.getBoundingClientRect();
		if (rect.width < 1 || rect.height < 1) return;
		const first = W === 0;
		W = rect.width;
		H = rect.height;
		dpr = Math.min(devicePixelRatio || 1, 2);
		cw = clamp(Math.round(W / 124), 8, 13);
		ch = Math.round(cw * 1.45);
		cols = Math.ceil(W / cw);
		rows = Math.ceil(H / ch);
		canvas.width = Math.round(W * dpr);
		canvas.height = Math.round(H * dpr);
		// read once per resize, not per frame: getComputedStyle forces style work
		font = `600 ${Math.round(0.74 * ch)}px ${getComputedStyle(canvas).fontFamily}`;
		perception = Math.max(3 * ch, 5.5 * cw);
		const n = cols * rows;
		energy = new Float32Array(n);
		energyTmp = new Float32Array(n);
		twinkle = new Float32Array(n);
		heat = new Float32Array(n);
		cFlag = new Uint8Array(n);
		cShade = new Float32Array(n);
		cCat = new Uint8Array(n);
		cAng = new Float32Array(n);
		cKey = new Uint32Array(n);
		cS = new Float32Array(n);
		cShadow = new Uint8Array(n);
		fishStamp = new Uint32Array(n);
		for (let i = 0; i < n; i++) {
			const x = i % cols, y = (i / cols) | 0;
			twinkle[i] = hash(x, y, 11) < 0.035 ? 0.3 + 1.1 * hash(x, y, 37) : 0;
		}
		// cats are sized from the short side, so a big change (phone rotation aside) starts a fresh sea
		const short = Math.min(W, H);
		if (first || !fish.length || Math.abs(short - seededShort) > 0.4 * seededShort) {
			seededShort = short;
			seed();
		} else {
			for (const f of fish) {
				f.x = clamp(f.x, 0, W);
				f.y = clamp(f.y, 0, H);
			}
			for (const c of cats) {
				c.nodes[0] = clamp(c.nodes[0], 0, W);
				c.nodes[1] = clamp(c.nodes[1], 0, H);
			}
		}
	}

	function stamp(field: Float32Array, x: number, y: number, radius: number, amount: number) {
		const cx = Math.floor(x / cw), cy = Math.floor(y / ch);
		for (let r = cy - radius; r <= cy + radius; r++)
			for (let c = cx - radius; c <= cx + radius; c++) {
				if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
				const d = Math.hypot(c - cx, (r - cy) * 1.4);
				if (d > radius + 0.5) continue;
				const i = r * cols + c;
				field[i] = Math.min(1.6, field[i] + amount * (1 - d / (radius + 1)));
			}
	}

	function updateWake(dt: number) {
		for (const e of events) {
			stamp(energy, e.x, e.y, e.kind === 'eat' ? 3 : 6, e.kind === 'eat' ? 0.9 : 1.4);
			if (e.kind === 'eat') stamp(heat, e.x, e.y, 2, 1);
		}
		const cool = Math.exp(-2.2 * dt);
		for (let i = 0; i < heat.length; i++) heat[i] *= cool;
		events.length = 0;
		for (const f of fish) {
			if (!f.alive) continue;
			const c = Math.floor(f.x / cw), r = Math.floor(f.y / ch);
			if (c >= 0 && r >= 0 && c < cols && r < rows) energy[r * cols + c] = Math.min(1.6, energy[r * cols + c] + 0.012 + 0.03 * f.alarm);
		}
		const keep = Math.exp(-1.5 * dt);
		for (let r = 0; r < rows; r++)
			for (let c = 0; c < cols; c++) {
				const i = r * cols + c, e = energy[i];
				energyTmp[i] =
					(4 * e + (c > 0 ? energy[i - 1] : e) + (c < cols - 1 ? energy[i + 1] : e) + (r > 0 ? energy[i - cols] : e) + (r < rows - 1 ? energy[i + cols] : e)) *
					0.125 *
					keep;
			}
		[energy, energyTmp] = [energyTmp, energy];
	}

	function render(dt: number) {
		if (!W) return;
		rasterizeCats();
		updateWake(dt);
		const accents = look.accents;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.fillStyle = look.bg;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.font = font;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		const n = cols * rows;

		// water: wake and a few twinkling cells
		for (let i = 0; i < n; i++) {
			if (cFlag[i]) continue;
			const e = energy[i];
			let a = 0, g = '.';
			if (e > 0.04) {
				a = Math.min(0.5, e * 0.6);
				g = e > 0.6 ? '*' : e > 0.3 ? ':' : e > 0.12 ? '·' : '.';
			} else if (twinkle[i]) a = 0.07 + 0.06 * Math.sin(time * twinkle[i] + i);
			if (heat[i] > 0.05) {
				ctx.fillStyle = rgb(accents[i % 2], Math.min(1, heat[i]));
				ctx.fillText(heat[i] > 0.5 ? '*' : '+', (i % cols) * cw + cw / 2, ((i / cols) | 0) * ch + ch / 2 + 1);
				continue;
			}
			if (a < 0.02) continue;
			// half the twinkles carry a color
			const tint = twinkle[i] && e <= 0.04 && hash(i, 3, 53) < 0.5 ? accents[(hash(i, 5, 71) * accents.length) | 0] : null;
			ctx.fillStyle = tint ? rgb(tint, Math.min(1, 0.3 + a * 3)) : `rgba(${look.ink},${a.toFixed(3)})`;
			ctx.fillText(g, (i % cols) * cw + cw / 2, ((i / cols) | 0) * ch + ch / 2 + 1);
		}

		// paw prints fade out over four seconds
		for (const p of prints) {
			const age = time - p.t;
			if (age > 4) continue;
			const c = Math.floor(p.x / cw), r = Math.floor(p.y / ch);
			if (c < 0 || r < 0 || c >= cols || r >= rows || cFlag[r * cols + c]) continue;
			ctx.fillStyle = `rgba(${look.ink},${(0.3 * (1 - age / 4)).toFixed(3)})`;
			ctx.fillText('•', c * cw + cw / 2, r * ch + ch / 2 + 1);
		}

		// fish, one per cell, hidden under cats
		frameId++;
		for (const f of fish) {
			if (!f.alive) continue;
			const c = Math.floor(f.x / cw), r = Math.floor(f.y / ch);
			if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
			const i = r * cols + c;
			if (cFlag[i] || fishStamp[i] === frameId) continue;
			fishStamp[i] = frameId;
			const sp = SPECIES[f.sp];
			ctx.fillStyle = `rgba(${look.ink},${Math.min(1, 0.3 + 0.5 * f.depth + 0.25 * f.alarm).toFixed(3)})`;
			ctx.fillText(f.vx >= 0 ? sp.g[0] : sp.g[1], c * cw + cw / 2, r * ch + ch / 2 + 1);
		}

		ctx.fillStyle = look.shadow;
		for (let i = 0; i < n; i++) if (cShadow[i] && !cFlag[i]) ctx.fillRect((i % cols) * cw, ((i / cols) | 0) * ch, cw, ch);

		const flick = Math.floor(time * 2.2);
		for (let i = 0; i < n; i++) {
			const flag = cFlag[i];
			if (!flag) continue;
			const c = cats[cCat[i]], X = (i % cols) * cw, Y = ((i / cols) | 0) * ch, cx = X + cw / 2, cy = Y + ch / 2 + 1;
			const key = cKey[i], jitter = hash(key, flick + (key % 7), 5);
			if (flag === 7) {
				ctx.fillStyle = grey(look.edge, 0.55);
				ctx.fillText('-', cx, cy);
				continue;
			}
			const t = clamp(cS[i] * 1.15, 0, 1);
			const base = mix(c.coat.a, c.coat.b, t * t * (3 - 2 * t));
			if (flag === 9) {
				ctx.fillStyle = jitter < 0.12 ? rgb(c.accent) : rgb(base, 0.35 + 0.5 * cShade[i]);
				ctx.fillText(cShade[i] >= 0.4 ? ':' : '.', cx, cy);
				continue;
			}
			if (flag === 10) {
				ctx.fillStyle = rgb(c.accent);
				ctx.fillRect(X + 1, Y + 1, cw - 1, ch - 1);
				ctx.fillStyle = 'rgba(40,12,44,0.6)';
				ctx.fillText(jitter < 0.2 ? 'o' : '=', cx, cy);
				continue;
			}
			const sh = cShade[i];
			let tile = sh > 0.55 ? mix(base, WHITE, (sh - 0.55) * 0.5) : mix(base, PLUM, (0.55 - sh) * 0.32);
			if (flag === 6) tile = mix(base, PLUM, 0.2);
			else if (flag === 8) tile = mix(base, WHITE, 0.6);
			else if (flag === 2) tile = mix(base, PLUM, 0.18);
			else if (flag === 3) tile = [30, 14, 34];
			ctx.fillStyle = rgb(tile);
			ctx.fillRect(X + 1, Y + 1, cw - 1, ch - 1);
			let g: string, col: string;
			if (flag === 3) {
				g = c.blink < 0 || c.state === 'rest' ? '-' : 'o';
				col = rgb(c.accent);
			} else if (flag === 4) {
				g = 'v';
				col = 'rgba(40,12,24,0.8)';
			} else {
				col = jitter < 0.13 ? '#ffffff' : jitter < 0.17 ? rgb(c.accent) : rgb(mix(tile, INK, 0.62));
				if (flag === 2) g = '^';
				else if (flag === 5) g = 'm';
				else if (jitter < 0.22 && cShade[i] < 0.75) {
					const a = ((cAng[i] % Math.PI) + Math.PI) % Math.PI; // fur runs along the spine
					g = FUR[Math.round(a / (Math.PI / 4)) % 4];
				} else g = RAMP[clamp(Math.floor(cShade[i] * RAMP.length + (jitter - 0.5) * 2), 0, RAMP.length - 1)];
			}
			ctx.fillStyle = col;
			ctx.fillText(g, cx, cy);
		}
	}

	/* ---------- loop and lifecycle ---------- */

	const reduced = matchMedia('(prefers-reduced-motion: reduce)');
	// phones run the simulation at 30 fps to save battery
	const frameMs = matchMedia('(pointer: coarse)').matches ? 1000 / 30 : 0;
	let raf = 0, last = 0, acc = 0, visible = true, disposed = false;

	function frame(now: number) {
		if (frameMs && now - last < frameMs - 2) {
			raf = requestAnimationFrame(frame);
			return;
		}
		const dt = Math.min(0.1, (now - last) / 1000);
		last = now;
		acc += dt;
		let steps = 0;
		while (acc >= STEP && steps < 4) {
			step(STEP);
			acc -= STEP;
			steps++;
		}
		if (steps === 4) acc = 0;
		render(dt);
		raf = requestAnimationFrame(frame);
	}
	function drawStill() {
		if (time < 4) for (let i = 0; i < 240; i++) step(STEP);
		render(STEP);
	}
	function schedule() {
		cancelAnimationFrame(raf);
		if (disposed || !visible || document.hidden || reduced.matches) return;
		last = performance.now();
		raf = requestAnimationFrame(frame);
	}
	function local(e: PointerEvent) {
		const c = canvas.getBoundingClientRect(), b = box.getBoundingClientRect();
		const inside = e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom;
		return { x: e.clientX - c.left, y: e.clientY - c.top, inside };
	}
	const onMove = (e: PointerEvent) => {
		const p = local(e);
		pointer.x = p.x;
		pointer.y = p.y;
		pointer.active = p.inside && e.pointerType !== 'touch';
		pointer.movedAt = time;
	};
	const onDown = (e: PointerEvent) => {
		const p = local(e);
		if (!p.inside || reduced.matches) return;
		events.push({ kind: 'splash', x: p.x, y: p.y });
		for (const f of fish) {
			if (!f.alive) continue;
			const dx = f.x - p.x, dy = f.y - p.y, d = Math.hypot(dx, dy);
			if (d > 240 || d < 1e-3) continue;
			const k = (1 - d / 240) * 260;
			f.vx += (dx / d) * k;
			f.vy += (dy / d) * k;
			f.alarm = 1;
		}
		let near: Cat | null = null, nd = 520;
		for (const c of cats) {
			const d = Math.hypot(c.nodes[0] - p.x, c.nodes[1] - p.y);
			if (d < nd && c.state !== 'pounce') {
				nd = d;
				near = c;
			}
		}
		if (near) {
			near.state = 'pounce';
			near.target = { x: p.x, y: p.y, vx: 0, vy: 0, alive: true };
			near.until = time + 0.45;
		}
	};
	const onLeave = () => (pointer.active = false);
	// redraw right away, so a view transition snapshot of the theme switch already has the new colors;
	// <html> gets other classes too (js, revealed, theming), which leave the sea alone
	const onTheme = () => {
		const next = readLook();
		if (next.light === look.light) return;
		look = next;
		render(0);
	};
	const onMotion = () => (reduced.matches ? (cancelAnimationFrame(raf), drawStill()) : schedule());

	const ro = new ResizeObserver(() => {
		resize();
		if (reduced.matches) drawStill();
	});
	ro.observe(canvas);
	const io = new IntersectionObserver(([e]) => {
		visible = e.isIntersecting;
		schedule();
	});
	io.observe(box);
	const mo = new MutationObserver(onTheme);
	mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
	reduced.addEventListener('change', onMotion);
	document.addEventListener('visibilitychange', schedule);
	addEventListener('pointermove', onMove, { passive: true });
	addEventListener('pointerdown', onDown, { passive: true });
	document.documentElement.addEventListener('pointerleave', onLeave);
	addEventListener('blur', onLeave);
	resize();
	// a second of life before the first frame, so the page opens on a sea already moving
	for (let i = 0; i < 60; i++) step(STEP);
	if (reduced.matches) drawStill();
	else render(0);
	schedule();

	return () => {
		disposed = true;
		cancelAnimationFrame(raf);
		ro.disconnect();
		io.disconnect();
		mo.disconnect();
		reduced.removeEventListener('change', onMotion);
		document.removeEventListener('visibilitychange', schedule);
		removeEventListener('pointermove', onMove);
		removeEventListener('pointerdown', onDown);
		document.documentElement.removeEventListener('pointerleave', onLeave);
		removeEventListener('blur', onLeave);
	};
}
