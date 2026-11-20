<script lang="ts">
	import '../app.css';
	import { dev } from '$app/environment';
	import { beforeNavigate, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import favicon from '@/assets/favicon.png';
	import { mountCatSea } from '@/cat-sea';
	import { COLS, GARDEN_ROWS, MIN_CELL, mountGarden } from '@/garden';
	import Preview from '@/components/site/Preview.svelte';
	import PreviewCard from '@/components/site/PreviewCard.svelte';
	import { commits } from '@/data/activity';
	import { copy, langOf } from '@/copy';
	import { applyTweaks } from '@/tweaks.svelte';
	import { site } from '@/data/site';
	import { theme } from '@/theme.svelte';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let { children } = $props();

	const path = $derived(page.url.pathname.replace(/\/$/, '') || '/');
	const canonical = $derived(site.url + (path === '/' ? '' : path));
	const lang = $derived(langOf(path));
	const t = $derived(copy[lang]);
	// the theme button names the theme it switches to
	const next = $derived(theme.dark ? t.theme.light : t.theme.dark);
	const home = $derived(lang === 'fr' ? '/fr' : '/');

	let tweaking = $state(false);
	// The pane and Tweakpane are most of the page's script and most visitors never open them, so
	// they load on demand. Hovering or focusing the button starts the download, so it opens at once.
	let tweaksModule: Promise<typeof import('@/components/site/Tweaks.svelte')> | undefined;
	const loadTweaks = () => (tweaksModule ??= import('@/components/site/Tweaks.svelte'));

	// The latest commit, from the daily GitHub sync. How long ago is worked out in the visitor's
	// browser: the prerendered page shows the date, so it's never stale.
	const latest = commits[0];
	let now = $state<number | null>(null);
	$effect(() => {
		now = Date.now();
	});
	const ago = $derived.by(() => {
		if (!latest) return '';
		const date = new Date(latest.date);
		if (now === null) return new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric' }).format(date);
		const rel = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
		const minutes = Math.round((date.getTime() - now) / 60000);
		if (Math.abs(minutes) < 60) return rel.format(minutes, 'minute');
		const hours = Math.round(minutes / 60);
		if (Math.abs(hours) < 24) return rel.format(hours, 'hour');
		const days = Math.round(hours / 24);
		return Math.abs(days) < 30 ? rel.format(days, 'day') : rel.format(Math.round(days / 30), 'month');
	});
	applyTweaks();

	const person = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: site.name,
		alternateName: site.handle,
		url: site.url,
		image: `${site.url}/avatar.webp?v=20261001`,
		email: site.email,
		jobTitle: 'Design engineer',
		worksFor: { '@type': 'Organization', name: site.work.name, url: site.work.url },
		sameAs: [site.github, site.x]
	});

	// j and k walk the rows of the lists
	function onKey(event: KeyboardEvent) {
		if (event.metaKey || event.ctrlKey || event.altKey) return;
		if (event.target instanceof HTMLElement && event.target.closest('input, textarea, [contenteditable]')) return;
		if (event.key !== 'j' && event.key !== 'k') return;
		const rows = [...document.querySelectorAll<HTMLAnchorElement>('main a[data-row]')];
		if (rows.length === 0) return;
		event.preventDefault();
		const at = rows.indexOf(document.activeElement as HTMLAnchorElement);
		const next = event.key === 'j' ? Math.min(rows.length - 1, at + 1) : Math.max(0, at === -1 ? 0 : at - 1);
		rows[next].focus({ preventScroll: true });
		// keyboard navigation never waits on motion: the row is simply there
		rows[next].scrollIntoView({ block: 'nearest' });
	}

	// for whoever opens the console
	$effect(() => console.log('%cmrrp. type "meow" anywhere on the page.', 'color: #8f8f8f'));

	// <html lang> is set on the server; switching language in the browser has to keep it in step
	$effect(() => {
		document.documentElement.lang = lang;
	});

	// The browser's own chrome follows the theme the visitor picked, not only their system setting.
	$effect(() => {
		const color = theme.dark ? '#1c1c1c' : '#faf9f6';
		for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) meta.content = color;
	});

	// Entrances belong to the first page of the visit. From the first navigation on, pages just appear.
	beforeNavigate(() => document.documentElement.classList.add('revealed'));

	// Switching language cross-fades the text; the sea and the garden keep going under it.
	onNavigate((navigation) => {
		if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

</script>

<svelte:head>
	<link rel="icon" href={favicon} type="image/png" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<link rel="canonical" href={canonical} />
	<link rel="alternate" hreflang="en" href={site.url} />
	<link rel="alternate" hreflang="fr" href="{site.url}/fr" />
	<link rel="alternate" hreflang="x-default" href={site.url} />
	<link rel="alternate" type="application/rss+xml" title="@{site.handle} · commits" href="{site.url}/rss.xml" />
	<meta name="author" content={site.name} />
	<meta name="color-scheme" content="light dark" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="miel" />
	<meta property="og:title" content="@miel | portfolio" />
	<meta name="twitter:title" content="@miel | portfolio" />
	<meta property="og:description" content={t.description} />
	<meta property="og:locale" content={lang === 'fr' ? 'fr_FR' : 'en_US'} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content="{site.url}/og.png?v=20261120" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="ASCII cats swimming over the words miel and Mathis, design engineer, with the start of his intro." />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="{site.url}/og.png?v=20261120" />
	<meta name="twitter:image:alt" content="ASCII cats swimming over the words miel and Mathis, design engineer, with the start of his intro." />
	<meta name="twitter:site" content="@mielsense" />
	<meta name="twitter:creator" content="@mielsense" />
	{@html `<script type="application/ld+json">${person}</script>`}
</svelte:head>

<svelte:window onkeydown={onKey} />

<!-- outside the zoomed column, so the card's fixed position matches the links it points at -->
<PreviewCard />
{#if tweaking}
	{#await loadTweaks() then { default: Tweaks }}<Tweaks {lang} />{/await}
{/if}

<!-- mounted once for the whole visit, so the cats keep swimming when the language changes -->
<div class="band vt pointer-events-none absolute inset-x-0 top-0 overflow-hidden" style:view-transition-name="sea">
	<canvas {@attach mountCatSea} class="absolute inset-0 size-full font-mono" aria-hidden="true"></canvas>
</div>

<div class="relative z-10 mx-auto below-sea flex min-h-dvh max-w-(--column) flex-col px-5">
	<header class="tweak-zoom reveal flex items-center justify-between pb-8" style:--rise="0px" style:--duration="400ms">
		<a href={home} class="vt -my-2 py-2 text-[17px] font-medium text-strong hover:text-default" style:view-transition-name="wordmark" aria-current={path === home ? 'page' : undefined}>miel</a>
		<!-- The language link is last: "fr" and "en" are the same width, so the group's right edge stays
		     on the column's edge in both languages. The theme word, the one that changes length when
		     toggled, is first, so toggling it moves nothing else. No space is reserved anywhere, so
		     the gaps are always the same. -->
		<div class="flex items-center gap-5 text-[15px]">
			<button type="button" class="press flex min-h-11 cursor-pointer items-center text-subtle hover:text-strong" aria-label={t.theme.aria(next)} onclick={(event) => theme.toggle({ x: event.clientX, y: event.clientY })}
				><!-- CSS picks the word, so the prerendered page is right before the script runs --><span class="dark:hidden">{t.theme.dark}</span><span class="hidden dark:inline">{t.theme.light}</span></button
			>
			<button type="button" class="press flex min-h-11 cursor-pointer items-center text-subtle hover:text-strong aria-expanded:text-strong" aria-label={t.tweaks.aria} aria-expanded={tweaking} onpointerenter={loadTweaks} onfocus={loadTweaks} onclick={() => (tweaking = !tweaking)}>{t.tweaks.open}</button>
			<a href={t.other.href} hreflang={t.other.lang} lang={t.other.lang} aria-label={t.other.aria} data-sveltekit-noscroll class="press flex min-h-11 items-center text-subtle hover:text-strong">{t.other.label}</a>
		</div>
	</header>

	<!-- the tweaks pane's size slider zooms the header and the page text, not the sea or the garden -->
	<div class="tweak-zoom">{@render children()}</div>

	<footer class="reveal mt-auto" style:--delay="300ms" style:--rise="0px" style:--blur="0px">
		<!-- wider than the column: it bleeds out to either side, and is cropped to its middle on phones -->
		<!-- pulled up so the tallest flowers grow over the bottom of the page; the page still takes the pointer -->
		<div class="vt pointer-events-none relative z-10 left-1/2 -mt-8 w-screen max-w-[1040px] -translate-x-1/2 sm:-mt-10" style:view-transition-name="garden">
			<!-- as tall as the garden's rows at the width's cell size, so nothing shifts when it draws -->
			<canvas
				{@attach mountGarden}
				class="block w-full font-mono"
				style:aspect-ratio="{COLS * 0.6} / {GARDEN_ROWS}"
				style:min-height="{(GARDEN_ROWS * MIN_CELL) / 0.6}px"
				aria-hidden="true"
			></canvas>
		</div>
		<div class="flex items-baseline justify-between gap-6 pt-6 pb-10 text-[15px] text-subtle">
			<p>© {new Date().getFullYear()} {site.name}</p>
			{#if latest}
				<Preview href={latest.url} card={{ title: latest.repo, text: latest.message, side: 'bottom' }} class="hover:text-strong">{t.lastCommit(ago)}</Preview>
			{/if}
		</div>
	</footer>
</div>

<style>
	/* the sea fades into the page at its bottom edge */
	.band::after {
		content: '';
		position: absolute;
		inset: auto 0 0;
		height: 55%;
		background: linear-gradient(to bottom, transparent, var(--color-page));
	}
</style>
