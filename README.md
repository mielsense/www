# miel.my

Personal site for [@mielsense](https://github.com/mielsense). SvelteKit on Vercel, Tailwind v4, every page prerendered.

```sh
pnpm install
pnpm dev       # http://localhost:5173
pnpm build     # Vercel output in .vercel/output
pnpm sync      # refresh src/lib/data/github.json from the GitHub API
```

## Pages

- `/` is the whole screen: an ASCII sea of cats and fish (`src/lib/cat-sea.ts`, one canvas), "mathis" in FK Raster bottom left with Book a call and Copy email under it, and the intro bottom right. Its three highlighted links open a hover card after 120ms.
- `/projects` lists every repo by year (this year, last year, earlier), pulled from GitHub.
- `/about` is the bio, work, stack and links.
- Contact in the nav opens a card (a native popover, `Contact.svelte`) to book a call or copy the email.
- `/rss.xml` is the recent-commit feed. `/now` redirects to `/about` (`vercel.json`).
- Any other path lands on the same full-screen layout as home with the status code.

The sea lives in the root layout and is never remounted: it fills the screen on home and the error page and is a 460px header band (300px on phones) elsewhere, shrinking between them in a view transition. Keyboard: `h`, `a` and `p` jump to home, about and projects; `j` and `k` move between project rows.

## Where things live

- `src/lib/cat-sea.ts` is the simulation and renderer: boid fish, cats with a 16-node spine sampled into a character grid, wake, paw prints, colored collars. It reads the theme from `.dark` on `<html>`, pauses off screen and draws one still frame for reduced motion.
- `src/lib/components/site/` holds `Hero` (home and error layout), `Actions` (the two buttons), `Scramble` (display words that assemble from sea characters), `Contact` and `Footer`.
- `src/lib/data/site.ts` is who and what: name, links, work. `src/lib/data/projects.ts` merges `github.json` with hand-written overrides: hidden repos, better descriptions, the entries that aren't repos.
- `src/lib/theme.svelte.ts` mirrors the theme class and runs the dithered theme switch (`src/lib/dither.ts`).

## Data

Nothing in the chart, the counts or the lists is typed by hand. `scripts/sync-github.mjs` pulls the public non-fork repos, the extra repos named at the top of the script, and the last commits of the six most recently pushed repos. `.github/workflows/sync-github.yml` runs it daily and commits when the JSON changed, which redeploys the site. A new repo appears on the next sync. Add a line to the overrides only when the GitHub description isn't good enough.

## Look

- Tokens sit at the top of `src/app.css`. Dark is `#f3f2f2` on `#0c0d0d`, light is the inverse. An inline script in `app.html` applies the stored choice before first paint, falling back to the system setting.
- Allo (OFL) for text, pinned to its rounded cut with only the weight axis kept, and FK Raster Roman Compact Smooth for the big words. Both are subset to Latin in `static/fonts` and preload. FK Raster is a commercial face: the site needs its web license.
- Color comes only from the cats' collars: coral, pink, lavender, mint and friends. Links in the intro carry them as marker highlights, and the nav icons take them on hover.
- Buttons, the double-bordered card (`shell` + `sheet`), the highlight (`mark`) and two-tone icons (`duo`) are utilities in `app.css`.

## Shipping

- Site URL is `https://miel.my`, set once in `data/site.ts` and used for canonical, Open Graph, JSON-LD, the sitemap and the feed.
- `static/og.png` is the share card. Run `python3 -m http.server 8765` from the repo root, open `http://localhost:8765/scripts/share-card.html`, and capture it at 1200 × 630 with the site fonts loaded. Regenerate it if the portrait or intro changes, and bump the image version in the page and layout.
- Vercel Web Analytics is wired in the root layout. Turn on Analytics for the project in the Vercel dashboard.
- Deploy through the Vercel Git integration so the sync workflow's commits redeploy. The adapter pins the Node 22 runtime.
