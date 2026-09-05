// Pulls public repo data from GitHub and writes src/lib/data/github.json.
// Run by .github/workflows/sync-github.yml on a schedule, or by hand with `pnpm sync`.

import { writeFileSync } from 'node:fs';

const USER = 'mielsense';
// repos that live outside the user account but belong on the site
const EXTRA = ['villeurbanne/kettle'];
const OUT = new URL('../src/lib/data/github.json', import.meta.url);

const headers = {
	Accept: 'application/vnd.github+json',
	'User-Agent': `${USER}-site-sync`,
	...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {})
};

async function get(path) {
	const res = await fetch(`https://api.github.com${path}`, { headers });
	if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
	return res.json();
}

// GitHub descriptions often end in an emoji; drop it and start with a capital
function clean(text) {
	if (!text) return '';
	return text
		.replace(/[\p{Extended_Pictographic}️]/gu, '')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/^./, (c) => c.toUpperCase());
}

function shape(r) {
	return {
		name: r.name,
		description: clean(r.description),
		url: r.html_url,
		homepage: r.homepage || null,
		language: r.language,
		stars: r.stargazers_count,
		year: new Date(r.pushed_at).getFullYear(),
		pushedAt: r.pushed_at
	};
}

const own = await get(`/users/${USER}/repos?per_page=100&type=owner&sort=pushed`);
const extra = await Promise.all(EXTRA.map((full) => get(`/repos/${full}`)));

const repos = [...own, ...extra]
	.filter((r) => !r.fork && !r.archived)
	.map(shape)
	.sort((a, b) => b.pushedAt.localeCompare(a.pushedAt));

// recent commits for the /now page: the six most recently pushed repos, ten commits each
const recent = repos.filter((r) => r.name !== USER).slice(0, 6);
const commits = (
	await Promise.all(
		recent.map(async (r) => {
			const full = r.url.replace('https://github.com/', '');
			// an empty repo answers 409
			const list = await get(`/repos/${full}/commits?per_page=10`).catch(() => []);
			return list.map((c) => ({
				repo: r.name,
				message: c.commit.message.split('\n')[0].slice(0, 120),
				sha: c.sha.slice(0, 7),
				url: c.html_url,
				date: c.commit.author?.date ?? c.commit.committer.date
			}));
		})
	)
)
	.flat()
	.filter((c) => !/^merge /i.test(c.message))
	.sort((a, b) => b.date.localeCompare(a.date))
	.slice(0, 40);

const data = { syncedAt: new Date().toISOString(), repos, commits };
writeFileSync(OUT, JSON.stringify(data, null, '\t') + '\n');
console.log(`wrote ${repos.length} repos and ${commits.length} commits to src/lib/data/github.json`);
