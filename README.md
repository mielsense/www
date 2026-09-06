# miel.my

Personal site for [@mielsense](https://github.com/mielsense). SvelteKit on Vercel, Tailwind v4, every page prerendered.

```sh
pnpm install
pnpm dev       # http://localhost:5173
pnpm build     # Vercel output in .vercel/output
pnpm sync      # refresh src/lib/data/github.json from the GitHub API
```

## Pages

- `/` is one edge-to-edge grid locked to the viewport on desktop. Portrait and intro, links and the sleeping cat, featured projects, a dithered language chart, stack and tools badges, open source with stars.
- `/projects` lists every repo by year in an editor layout with line numbers. `?lang=Svelte` narrows it; the stack badges link there.
- `/now` shows what is being built and the last forty commits, grouped by day with a link to each repo touched.
- `/rss.xml` is the commit feed behind `/now`.
- Any other path lands on the same editor layout with the status code.

Keyboard: `⌘K` opens the command palette anywhere (pages, actions, links, projects; ↓ or typing unfolds it, Enter runs), `n` and `p` jump to now and projects. On `/projects`, `/now` and the error page, `j` and `k` move between rows and `b` goes home.

## Where things live

- `src/lib/components/site/` is the site's own components. `Editor.svelte` is the shell shared by the list pages and the error page.
- `src/lib/components/ui/` and `src/lib/components/evilcharts/` are registry-installed sources from [COSS for Svelte](https://coss-sv.vercel.app) and [EvilCharts for Svelte](https://evilcharts-sv.vercel.app). Two lines in the bar chart's tooltip renderer are local edits. Everything else is stock.
- `src/lib/data/site.ts` is who and what: name, links, the track in the player, the availability flag, the "lately" lines.
- `src/lib/data/projects.ts` merges `github.json` with hand-written overrides: hidden repos, better descriptions, badges, the entries that aren't repos, and which names are featured or listed as open source.
- `src/lib/data/stack.ts` lists the badges. `src/lib/data/palette.ts` is the six chart colors that every section and group borrows for its accent.
- `src/lib/motion.ts` is the one easing and two durations behind every state swap (`@humanspeak/svelte-motion`). `theme.svelte.ts` mirrors the theme class, `sound.svelte.ts` owns the cuelume press and toggle cues and the mute preference, `palette.svelte.ts` the ⌘K open state, `player.svelte.ts` the shared audio element.

## Data

Nothing in the chart, the counts or the lists is typed by hand. `scripts/sync-github.mjs` pulls the public non-fork repos, the extra repos named at the top of the script, and the last commits of the six most recently pushed repos. `.github/workflows/sync-github.yml` runs it daily and commits when the JSON changed, which redeploys the site. A new repo appears on the next sync. Add a line to the overrides only when the GitHub description isn't good enough.

## Look

- Tokens sit at the top of `src/app.css`. Dark is `#0c0d0d` on `#f3f2f2`, light is the inverse. An inline script in `app.html` applies the stored choice before first paint.
- JetBrains Mono for text, Geist Pixel for section headings and the marquee. Both preload.
- A faint dither shader (`BarShader.svelte`, `@devmischief/shaders-svelte`) sits behind the footer, the music strip, the availability pill, the top-left of the header and the palette's input row. Nowhere page-wide.
- Tailwind utilities where they fit; custom CSS for the grid, the viewport lock, the editor rail and the keyframes. A `short` variant covers screens under 950px tall. Layout class names avoid Tailwind utility names because installed components use them.
- Imports use `@/` for `src/lib`, set in `vite.config.ts` and `components.json`.

## Shipping

- Site URL is `https://miel.my`, set once in `data/site.ts` and used for canonical, Open Graph, JSON-LD, the sitemap and the feed.
- `static/og.png` is the share card, rendered once from an HTML template with the site fonts. Regenerate it if the intro changes.
- Vercel Web Analytics is wired in the root layout. Turn on Analytics for the project in the Vercel dashboard.
- Deploy through the Vercel Git integration so the sync workflow's commits redeploy. The adapter pins the Node 22 runtime.
