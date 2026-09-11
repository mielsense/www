<script lang="ts">
	import '../app.css';
	import { dev } from '$app/environment';
	import { goto, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { Calendar03Icon } from '@hugeicons/core-free-icons';
	import monoFont from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url';
	import favicon from '@/assets/favicon.svg';
	import pixelFont from '@/assets/fonts/GeistPixel-Square.woff2?url';
	import Clock from '@/components/site/Clock.svelte';
	import CommandPalette from '@/components/site/CommandPalette.svelte';
	import BarShader from '@/components/site/BarShader.svelte';
	import Orb from '@/components/site/Orb.svelte';
	import SoundToggle from '@/components/site/SoundToggle.svelte';
	import ThemeToggle from '@/components/site/ThemeToggle.svelte';
	import { Button } from '@/components/ui/button/index.js';
	import * as Kbd from '@/components/ui/kbd/index.js';
	import { site } from '@/data/site';
	import { palette } from '@/palette.svelte';
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
		image: `${site.url}/avatar.webp?v=20260911`,
		email: site.email,
		jobTitle: 'Software developer',
		worksFor: { '@type': 'Organization', name: site.work.name, url: site.work.url },
		sameAs: [site.github, site.x]
	});

	// n and p jump between pages from anywhere; the editor pages add j, k and b
	const routes: Record<string, string> = { n: '/now', p: '/projects' };
	function onKey(event: KeyboardEvent) {
		if (event.metaKey || event.ctrlKey || event.altKey) return;
		if (event.target instanceof HTMLElement && event.target.closest('input, textarea, [contenteditable]')) return;
		const href = routes[event.key];
		if (!href || path === href) return;
		event.preventDefault();
		goto(href);
	}

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
	<meta property="og:image" content="{site.url}/og.png?v=20260911" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="mielsense, Mathis. Computer science student at Epitech, in France." />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="{site.url}/og.png?v=20260911" />
	<meta name="twitter:image:alt" content="mielsense, Mathis. Computer science student at Epitech, in France." />
	<meta name="twitter:site" content="@mielsense" />
	<meta name="twitter:creator" content="@mielsense" />
	{@html `<script type="application/ld+json">${person}</script>`}
</svelte:head>

<svelte:window onkeydown={onKey} />

<div class="page">
	<header class="bar" style:view-transition-name="topbar">
		<BarShader class="inset-y-0 start-0 w-72 [mask-image:linear-gradient(90deg,#000_45%,transparent)]" />
		<a href="/" class="nav-link inline-flex items-center gap-[1.2ch]" aria-current={current('/')}>
			<Orb />
			{site.handle}
		</a>
		<nav class="flex items-center gap-[2ch]" aria-label="Primary">
			<a href="/now" class="nav-link" aria-current={current('/now')}>now</a>
			<a href="/projects" class="nav-link" aria-current={current('/projects')}>projects</a>
			<button
				type="button"
				class="nav-link press inline-flex items-center gap-1.5"
				aria-label="Open the command palette"
				onclick={() => (palette.open = true)}
			>
				<Kbd.Group aria-hidden="true"><Kbd.Root>⌘</Kbd.Root><Kbd.Root>K</Kbd.Root></Kbd.Group>
			</button>
			<span class="h-4 w-px bg-border" aria-hidden="true"></span>
			<span class="-me-1.5 flex items-center gap-0.5">
				<SoundToggle />
				<ThemeToggle />
			</span>
		</nav>
	</header>

	{@render children()}
	<CommandPalette />

	<footer class="bar" style:view-transition-name="footer">
		<BarShader />
		<div class="flex items-center gap-4">
			<Button
				href={site.cal}
				target="_blank"
				rel="noreferrer"
				variant="outline"
				size="sm"
				class="press h-[1.9rem] gap-[1.2ch] px-3.5 text-[0.8rem] sm:h-[1.9rem] sm:text-[0.8rem]"
			>
				<HugeiconsIcon icon={Calendar03Icon} size={13} strokeWidth={1.75} class="-mt-px shrink-0" aria-hidden="true" />
				<span class="leading-none">book a call</span>
			</Button>
			<Clock />
		</div>
		<span class="comment"># eof</span>
	</footer>
</div>
