# miel.my

Personal site for [@mielsense](https://github.com/mielsense). SvelteKit on Vercel, Tailwind v4, every page prerendered.

```sh
pnpm install
pnpm dev       # http://localhost:5173
pnpm build     # Vercel output in .vercel/output
pnpm sync      # refresh src/lib/data/github.json from the GitHub API
```

## Pages

- One page, in English at `/` and French at `/fr`. An ASCII sea of cats and fish fills a band at the top (`src/lib/cat-sea.ts`), then the intro, then three lists (work, projects, stack) with dotted leaders, then a garden at the foot of the page (`src/lib/garden.ts`).
- The header switches language (keeping your scroll position) and theme. `/about`, `/projects` and `/now` redirect to `/` (`vercel.json`).
- `/rss.xml` is the recent-commit feed. Any other path shows the status code in the same layout.
- The sea and the garden live in the root layout and are never remounted, so the cats keep swimming when the language changes. Keyboard: `j` and `k` move between list rows. Typing `meow` (or `miaou`) anywhere makes every cat answer over its head; the console says so.

## Where things live

- Links and project rows share one preview card, the way Mielui's tooltip shares one bubble: the first waits 200ms, the next opens at once and the card glides there (`src/lib/preview.svelte.ts`, `Preview.svelte` for triggers, `PreviewCard.svelte` for the card). Star counts and the contribution total come from `github.json`. Mielui's tokens are re-inked onto the site's grays at the top of `src/app.css`.
- `src/lib/copy.ts` holds every string in both languages and the curated lists. The two intro paragraphs, which carry links and brand marks, are written per language in `src/lib/components/site/Home.svelte`.
- `src/lib/cat-sea.ts` is the simulation and renderer: boid fish, cats with a 16-node spine sampled into a character grid, wake, paw prints, colored collars. It reads the theme from `.dark` on `<html>`, pauses off screen and draws one still frame for reduced motion.
- `src/lib/garden.ts` lays out flowers, bushes, grass and a sleeping cat from a fixed seed, then draws them on a canvas: plants sway in the wind and lean away from the pointer. It pauses off screen and holds still for reduced motion.
- `tweak` in the header opens a Tweakpane (`svelte-tweakpane-ui`, `Tweaks.svelte`). Type: font, size, weight, roundness, optical size, tracking, leading. Layout: column width, sea height. Sea: cats, fish, speed. Garden: wind, grow another. Plus an FPS graph. Type and layout are CSS variables on `<html>` (`cssVars` in `src/lib/tweaks.svelte.ts`, the end of `app.css`), saved in localStorage and written before paint by `app.html`; the sea and the garden read `tweaks` every frame. Roundness and optical size need every axis of Allo, so `static/fonts/allo-full.woff2` (237KB, OFL, see `allo-OFL.txt`) only downloads when one of them moves.
- The footer links the latest commit (`src/lib/data/activity.ts`, the sync bot's own commits left out), its age worked out in the visitor's browser.
- `src/hooks.server.ts` sets `<html lang>` from the path, prerendered pages included.
- `src/lib/data/site.ts` is who and what: name, links, work.
- `src/lib/theme.svelte.ts` mirrors the theme class and runs the dithered theme switch (`src/lib/dither.ts`).

## Data

`scripts/sync-github.mjs` pulls the public repos and the last commits of the most recently pushed ones into `src/lib/data/github.json`; `.github/workflows/sync-github.yml` runs it daily. The page lists are curated by hand in `copy.ts`; the feed reads the commits.

## Look

- Tokens sit at the top of `src/app.css`. Dark is `#f3f2f2` on `#1c1c1c`, light is `#0c0d0d` on `#faf9f6`. An inline script in `app.html` applies the stored choice before first paint, falling back to the system setting.
- Allo (OFL) for text, pinned to its rounded cut with only the weight axis kept, subset to Latin in `static/fonts` and preloaded.
- Color comes only from the sea, the garden and the small brand marks in the intro. Everything else is four grays.
- `prose-link` (links in sentences) and `row` (list lines with a dotted leader) are utilities in `app.css`.

## Shipping

- Site URL is `https://miel.my`, set once in `data/site.ts` and used for canonical, Open Graph, JSON-LD, the sitemap and the feed.
- `static/og.png` is the share card: the home page itself, dark, at 1200 × 630, with the header links and everything below the intro hidden and `:root { --sea-height: 290px; --tweak-size: 1.55; --column: 66rem }` forced, captured on a frame where the cats are in view. Regenerate it if the portrait or intro changes, and bump the image version in the layout.
- Vercel Web Analytics is wired in the root layout. Turn on Analytics for the project in the Vercel dashboard.
- Deploy through the Vercel Git integration so the sync workflow's commits redeploy. The adapter pins the Node 22 runtime.
