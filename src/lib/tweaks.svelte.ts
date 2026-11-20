import { browser } from '$app/environment';

/**
 * Knobs for the visitor, set from the tweaks pane (Tweaks.svelte). Type and layout become CSS
 * variables on <html> (`cssVars`), so a change is a style change and never a re-render; the sea and
 * the garden read their knobs straight from `tweaks` every frame. Everything is kept in
 * localStorage, and app.html writes the saved CSS variables before first paint.
 */
export const DEFAULTS = {
	font: 'allo' as 'allo' | 'system' | 'serif' | 'mono',
	size: 1,
	weight: 400,
	round: 100,
	/** Below the font's range (9 to 32) the browser picks the optical size from the font size. */
	opsz: 8,
	tracking: -0.005,
	leading: 1.65,
	width: 50,
	/** Height of the sea band in px; the default leaves it to the breakpoints. */
	sea: 440,
	/** 0 picks the number of cats from the screen width. */
	cats: 0,
	fish: 1,
	speed: 1,
	wind: 1,
	/** The garden's layout. Each one is the same on every visit. */
	seed: 23
};
export type Tweaks = typeof DEFAULTS;

const KEY = 'tweaks';
export const SEA_DEFAULT = DEFAULTS.sea;

const FONTS: Record<Tweaks['font'], string> = {
	allo: 'var(--font-sans)',
	system: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
	serif: "ui-serif, 'New York', 'Iowan Old Style', Georgia, serif",
	mono: 'var(--font-mono)'
};

/** The CSS variables for a set of tweaks. Only what differs from the design is set. */
export function cssVars(t: Tweaks): Record<string, string> {
	const vars: Record<string, string> = {
		'--tweak-size': String(t.size),
		'--tweak-weight': String(t.weight),
		'--tweak-tracking': `${t.tracking}em`,
		'--tweak-leading': String(t.leading),
		'--column': `${t.width}rem`
	};
	// The shipped Allo is pinned to its roundest cut with only the weight axis left; any other
	// roundness or a fixed optical size needs the full variable font, which only downloads then.
	const full = t.font === 'allo' && (t.round !== DEFAULTS.round || t.opsz !== DEFAULTS.opsz);
	if (full) {
		vars['--tweak-font'] = `'Allo Full', ${FONTS.allo}`;
		vars['--tweak-fvs'] = [`'ROND' ${t.round}`, t.opsz >= 9 ? `'opsz' ${t.opsz}` : ''].filter(Boolean).join(', ');
	} else if (t.font !== 'allo') vars['--tweak-font'] = FONTS[t.font];
	if (t.sea !== SEA_DEFAULT) vars['--sea-height'] = `${t.sea}px`;
	return vars;
}

function load(): Tweaks {
	if (!browser) return { ...DEFAULTS };
	try {
		return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}').values };
	} catch {
		return { ...DEFAULTS };
	}
}

export const tweaks = $state(load());

export function reset() {
	Object.assign(tweaks, DEFAULTS);
}

/** Writes the tweaks to <html> and storage. Call once from the root layout. */
export function applyTweaks() {
	let set: string[] = [];
	$effect(() => {
		const root = document.documentElement.style;
		const vars = cssVars(tweaks);
		for (const name of set) if (!(name in vars)) root.removeProperty(name);
		for (const [name, value] of Object.entries(vars)) root.setProperty(name, value);
		set = Object.keys(vars);
		try {
			const changed = (Object.keys(DEFAULTS) as (keyof Tweaks)[]).some((k) => tweaks[k] !== DEFAULTS[k]);
			if (changed) localStorage.setItem(KEY, JSON.stringify({ values: tweaks, vars }));
			else localStorage.removeItem(KEY);
		} catch {
			// no storage, the tweaks just won't persist
		}
	});
}
