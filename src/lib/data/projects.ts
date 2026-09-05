import github from './github.json';

export type Kind = 'library' | 'app' | 'toolkit' | 'game' | 'template' | 'work' | 'soon';

export type Project = {
	name: string;
	description: string;
	/** Where the title links. */
	url: string;
	/** GitHub page, when there is one. */
	repo?: string;
	year: number;
	lang?: string;
	kind?: Kind;
	stars?: number;
	/** Live site, when the repo has one. */
	homepage?: string;
	/** Last push, ISO date. */
	updated?: string;
};



/* ---- what the sync script can't know ---- */

/** Repos that should not show up anywhere. */
const hidden = new Set([
	'mielsense', // the profile README
	'poc-benky-front',
	'poc-benky-back',
	'poc-liferay-angular',
	'betterstack-demo',
	'flamme',
	'project_template',
	'install-script'
]);

/** Nicer copy and badges for the repos worth it. Anything else keeps its GitHub description. */
const overrides: Record<string, Partial<Project>> = {
	'evilcharts-sv': { description: 'Animated Svelte 5 charts on LayerChart or ECharts', kind: 'library' },
	'coss-sv': { description: 'Svelte 5 port of COSS UI, built on Shards UI', kind: 'library' },
	'sileo-svelte': { description: 'An opinionated, physics-based toast', kind: 'library' },
	sensel: { description: 'Utils, CLI and motion wrapper for Svelte 5', kind: 'toolkit' },
	qali: { description: 'Local-first Google Calendar for macOS', kind: 'app' },
	trovesv: { description: 'Svelte port of trove/cn', kind: 'library' },
	'csgo-analyser': { description: 'Counter-Strike demo analysis', kind: 'app' },
	sveltebase: { description: 'PocketBase port of svelte-firebase-state', kind: 'library' },
	'sensel-template': { description: 'Base Svelte 5 template', kind: 'template' },
	portfolio: { description: 'Just me & my things, the previous version of this site', kind: 'app' },
	kettle: { description: 'A glamorous boilerplate manager, written in Rust', kind: 'toolkit' },
	zappy: { description: 'Auto-playing multiplayer game with AI agents', kind: 'game' },
	rtype: { description: 'Online retro shooter, no engine', kind: 'game' },
	artly: { description: 'Multimedia art sharing for artists', kind: 'app' },
	mathis: { description: 'A portfolio shaped like a TV', kind: 'app' },
	catshell: { description: 'My very own shell', kind: 'toolkit' },
	battleship: { description: 'Battleship over Unix signals', kind: 'game' },
	mini_lib: { description: 'The important C functions, rewritten', kind: 'library' }
};

/** Things that aren't a repo of mine. */
const manual: Project[] = [
	{
		name: 'benky',
		description: 'A learning platform for students, in progress',
		url: 'https://github.com/getbenky',
		year: 2026,
		lang: 'Svelte',
		kind: 'soon'
	},
	{
		name: 'reecall dashboard',
		description: 'Customer dashboard for real-time voice AI, my day job',
		url: 'https://reecall.com/',
		year: 2026,
		lang: 'TypeScript',
		kind: 'work'
	}
];

/* ---- merged ---- */

const synced: Project[] = github.repos
	.filter((r) => !hidden.has(r.name))
	.map((r) => ({
		name: r.name,
		description: r.description,
		url: r.homepage ?? r.url,
		repo: r.url,
		homepage: r.homepage ?? undefined,
		updated: r.pushedAt,
		year: r.year,
		lang: r.language ?? undefined,
		stars: r.stars,
		...overrides[r.name]
	}));

/** Everything worth listing, newest first. Manual entries lead their year. */
export const projects: Project[] = [...manual, ...synced].sort((a, b) => b.year - a.year);

export const byName = (name: string) => projects.find((p) => p.name === name);

/** The front page picks. */
export const featured = ['benky', 'reecall dashboard', 'qali', 'sensel', 'rtype', 'zappy']
	.map(byName)
	.filter((p): p is Project => p !== undefined);

/** Star counts come from the sync. */
export const openSource = ['evilcharts-sv', 'sileo-svelte', 'kettle', 'coss-sv']
	.map(byName)
	.filter((p): p is Project => p !== undefined)
	.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));

/** Primary language of each listed repo. */
export const languages = Object.entries(
	synced.reduce<Record<string, number>>((acc, p) => {
		if (p.lang) acc[p.lang] = (acc[p.lang] ?? 0) + 1;
		return acc;
	}, {})
)
	.map(([language, repos]) => ({ language, repos }))
	.sort((a, b) => b.repos - a.repos);

export const repoCount = languages.reduce((n, l) => n + l.repos, 0);
export const syncedAt = github.syncedAt;

export type Commit = { repo: string; message: string; sha: string; url: string; date: string };
export const commits: Commit[] = github.commits ?? [];
