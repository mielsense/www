<script lang="ts">
	import '../app.css';
	import { dev } from '$app/environment';
	import { beforeNavigate, goto, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import * as Avatar from '@mielui/svelte/components/avatar';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import favicon from '@/assets/favicon.svg';
	import SoundToggle from '@/components/site/SoundToggle.svelte';
	import ThemeToggle from '@/components/site/ThemeToggle.svelte';
	import { site } from '@/data/site';
	import { theme } from '@/theme.svelte';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let { children } = $props();

	const path = $derived(page.url.pathname.replace(/\/$/, '') || '/');
	const canonical = $derived(site.url + (path === '/' ? '' : path));
	const pages = [
		{ href: '/', label: 'Home' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/now', label: 'Now' }
	];

	const person = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: site.name,
		alternateName: site.handle,
		url: site.url,
		image: `${site.url}/avatar.webp?v=20261001`,
		email: site.email,
		jobTitle: 'Software developer',
		worksFor: { '@type': 'Organization', name: site.work.name, url: site.work.url },
		sameAs: [site.github, site.x]
	});

	// n and p jump between pages from anywhere; j and k walk the rows of a list
	const routes: Record<string, string> = { n: '/now', p: '/projects', h: '/' };
	function onKey(event: KeyboardEvent) {
		if (event.metaKey || event.ctrlKey || event.altKey) return;
		if (event.target instanceof HTMLElement && event.target.closest('input, textarea, [contenteditable], [role="dialog"]')) return;
		const href = routes[event.key];
		if (href && path !== href) {
			event.preventDefault();
			goto(href);
			return;
		}
		if (event.key !== 'j' && event.key !== 'k') return;
		const rows = [...document.querySelectorAll<HTMLAnchorElement>('main a[data-row]')];
		if (rows.length === 0) return;
		event.preventDefault();
		const at = rows.indexOf(document.activeElement as HTMLAnchorElement);
		const next = event.key === 'j' ? Math.min(rows.length - 1, at + 1) : Math.max(0, at === -1 ? 0 : at - 1);
		rows[next].focus({ preventScroll: true });
		rows[next].scrollIntoView({ block: 'center', behavior: 'smooth' });
	}

	// The browser's own chrome follows the theme the visitor picked, not only their system setting.
	$effect(() => {
		const color = theme.dark ? '#0e0e0e' : '#f5f5f5';
		for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) meta.content = color;
	});

	// Smooth page scrolling. The home rail runs its own sideways instance on wide screens, so this one leaves it alone.
	$effect(() => {
		// touch scrolling is native either way, so phones skip loading it
		if (matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches) return;
		const wide = matchMedia('(min-width: 64rem)');
		let lenis: import('lenis').default | undefined;
		let gone = false;
		import('lenis').then(({ default: Lenis }) => {
			if (!gone) lenis = new Lenis({ autoRaf: true, allowNestedScroll: true, prevent: (node) => wide.matches && node.hasAttribute('data-rail') });
		});
		return () => {
			gone = true;
			lenis?.destroy();
		};
	});

	// The reveal animations belong to the first page load only. Once the visitor moves around the
	// site, pages they come back to should just be there.
	beforeNavigate(() => document.documentElement.classList.add('revealed'));

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
	<link rel="icon" href={favicon} type="image/svg+xml" />
	<link rel="canonical" href={canonical} />
	<link rel="alternate" type="application/rss+xml" title="@{site.handle} · now" href="{site.url}/rss.xml" />
	<meta name="author" content={site.name} />
	<meta name="color-scheme" content="light dark" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="@{site.handle}" />
	<meta property="og:title" content="@{site.handle} | portfolio" />
	<meta property="og:description" content={site.description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content="{site.url}/og.png?v=20261001" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="mielsense, Mathis. Computer science student in the final years of my master's degree in France." />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="{site.url}/og.png?v=20261001" />
	<meta name="twitter:image:alt" content="mielsense, Mathis. Computer science student in the final years of my master's degree in France." />
	<meta name="twitter:site" content="@mielsense" />
	<meta name="twitter:creator" content="@mielsense" />
	{@html `<script type="application/ld+json">${person}</script>`}
</svelte:head>

<svelte:window onkeydown={onKey} />

<!-- edge to edge, no frame; the nav floats at the bottom, so pages leave room under their last line -->
<div class="flex min-h-dvh flex-col">
	<header class="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none" style:view-transition-name="dock">
		<div class="shell pointer-events-auto rounded-full p-1 backdrop-blur-xl">
			<nav aria-label="Site" class="sheet flex h-10 items-center gap-1 rounded-full ps-1.5 pe-1">
				<a href="/" class="press flex shrink-0 items-center rounded-full focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none" aria-label="{site.handle}, home" aria-current={path === '/' ? 'page' : undefined}>
					<Avatar.Root size="sm">
						<Avatar.Image src="/avatar-288.webp?v=20261001" alt="" />
						<Avatar.Fallback>M</Avatar.Fallback>
					</Avatar.Root>
				</a>
				<span class="mx-1 h-4 w-px bg-border" aria-hidden="true"></span>
				{#each pages.slice(1) as item (item.href)}
					<a
						href={item.href}
						aria-current={path === item.href ? 'page' : undefined}
						class="press flex h-8 items-center rounded-full px-3 text-sm text-default hover:bg-selected hover:text-strong focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none aria-[current=page]:bg-selected aria-[current=page]:text-strong"
					>
						{item.label}
					</a>
				{/each}
				<span class="mx-1 h-4 w-px bg-border" aria-hidden="true"></span>
				<span class="flex items-center"><SoundToggle /><ThemeToggle /></span>
			</nav>
		</div>
	</header>

	<div class="flex flex-1 flex-col pb-24 lg:has-[[data-rail]]:pb-0">
		{@render children()}
	</div>
</div>

