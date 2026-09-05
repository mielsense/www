<script lang="ts">
	import '../app.css';
	import { dev } from '$app/environment';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { Calendar03Icon } from '@hugeicons/core-free-icons';
	import monoFont from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url';
	import favicon from '@/assets/favicon.svg';
	import pixelFont from '@/assets/fonts/GeistPixel-Square.woff2?url';
	import Clock from '@/components/site/Clock.svelte';
	import Orb from '@/components/site/Orb.svelte';
	import ThemeToggle from '@/components/site/ThemeToggle.svelte';
	import { Button } from '@/components/ui/button/index.js';
	import { site } from '@/data/site';
	import HugeiconsIcon from '@/hugeicons-icon.svelte';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let { children } = $props();

	const path = $derived(page.url.pathname.replace(/\/$/, '') || '/');
	const current = (href: string) => (path === href ? 'page' : undefined);
	const canonical = $derived(site.url + (path === '/' ? '' : path));

	const person = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: site.name,
		alternateName: site.handle,
		url: site.url,
		image: `${site.url}/avatar.webp`,
		email: site.email,
		jobTitle: 'Software developer',
		worksFor: { '@type': 'Organization', name: site.work.name, url: site.work.url },
		sameAs: [site.github, site.x]
	});

	// cross-fade page content between routes; the top bar and footer are pinned out of it
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} type="image/svg+xml" />
	<link rel="canonical" href={canonical} />
	<link rel="alternate" type="application/rss+xml" title="@{site.handle} · now" href="{site.url}/rss.xml" />
	<link rel="preload" href={monoFont} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={pixelFont} as="font" type="font/woff2" crossorigin="anonymous" />
	<meta name="author" content={site.name} />
	<meta name="color-scheme" content="dark light" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="@{site.handle}" />
	<meta property="og:title" content="@{site.handle} | portfolio" />
	<meta property="og:description" content={site.description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content="{site.url}/og.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="mielsense, Mathis. Computer science student at Epitech, in France." />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@mielsense" />
	<meta name="twitter:creator" content="@mielsense" />
	{@html `<script type="application/ld+json">${person}</script>`}
</svelte:head>

<div class="page">
	<header class="bar" style:view-transition-name="topbar">
		<a href="/" class="nav-link inline-flex items-center gap-[1.2ch]" aria-current={current('/')}>
			<Orb />
			{site.handle}
		</a>
		<nav class="flex items-center gap-[2ch]" aria-label="Primary">
			<a href="/now" class="nav-link" aria-current={current('/now')}>now</a>
			<a href="/projects" class="nav-link" aria-current={current('/projects')}>projects</a>
			<ThemeToggle />
		</nav>
	</header>

	{@render children()}

	<footer class="bar" style:view-transition-name="footer">
		<div class="flex items-center gap-4">
			<Button href={site.cal} target="_blank" rel="noreferrer" variant="outline" size="sm" class="press h-[1.9rem] gap-[0.8ch] px-3.5 text-[0.8rem] sm:h-[1.9rem] sm:text-[0.8rem]">
				<HugeiconsIcon icon={Calendar03Icon} size={13} strokeWidth={1.75} aria-hidden="true" />
				book a call
			</Button>
			<Clock />
		</div>
		<span class="comment"># eof</span>
	</footer>
</div>
