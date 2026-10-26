<script lang="ts">
	import '../app.css';
	import { dev } from '$app/environment';
	import { beforeNavigate, goto, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import * as Avatar from '@mielui/svelte/components/avatar';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import favicon from '@/assets/favicon.svg';
	import Icon from '@/components/site/Icon.svelte';
	import Clock from '@/components/site/Clock.svelte';
	import SoundToggle from '@/components/site/SoundToggle.svelte';
	import ThemeToggle from '@/components/site/ThemeToggle.svelte';
	import { site } from '@/data/site';
	import { theme } from '@/theme.svelte';
	import { GithubIcon, RssIcon, XIcon } from '@/icons';

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

<!-- the page sits in a double frame: a solid outer line, and a dashed one a gutter inside it -->
<div class="min-h-dvh w-full sm:border-x sm:border-frame sm:[--gutter:3rem]">
	<div class="flex min-h-dvh flex-col sm:mx-[var(--gutter)] sm:border-x sm:border-dashed sm:border-frame">
		<!-- top and bottom bands are as tall as the side gutters are wide -->
		<header class="flex h-14 sm:h-(--gutter) items-center gap-2 px-4 sm:px-6" style:view-transition-name="topbar">
			<a href="/" class="me-auto flex shrink-0 items-center gap-2.5 rounded-full" aria-label="{site.handle}, home">
				<Avatar.Root size="sm">
					<Avatar.Image src="/avatar-288.webp?v=20261001" alt="" />
					<Avatar.Fallback>M</Avatar.Fallback>
				</Avatar.Root>
				<span class="hidden text-base font-medium tracking-[-0.01em] text-strong sm:inline">{site.handle}</span>
			</a>
			<nav aria-label="Site" class="flex items-center gap-1.5">
				{#each pages.slice(1) as item (item.href)}
					<a
						href={item.href}
						aria-current={path === item.href ? 'page' : undefined}
						class="press flex h-8 items-center rounded-[9px] px-3 text-sm text-default hover:bg-selected hover:text-strong focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none aria-[current=page]:bg-selected aria-[current=page]:text-strong"
					>
						{item.label}
					</a>
				{/each}
				<span class="ms-1 flex items-center"><SoundToggle /><ThemeToggle /></span>
			</nav>
		</header>
		<hr class="rule" />

		<div class="flex flex-1 flex-col">
			{@render children()}
		</div>

		<footer style:view-transition-name="footer">
			<div class="flex h-14 items-center justify-between gap-6 px-4 sm:h-(--gutter) sm:px-6">
				<span class="flex items-center gap-2 text-xs text-subtle">
					<span class="size-1.5 rounded-full {site.available ? 'bg-success' : 'bg-subtle'}" aria-hidden="true"></span>
					<span class="text-default">{site.available ? 'Open to work' : 'Booked for now'}</span>
					<span aria-hidden="true">·</span>
					<Clock />
				</span>
				<nav aria-label="Elsewhere" class="flex items-center gap-1">
					<a href={site.github} target="_blank" rel="me noreferrer" class="chip press size-7 hover:text-default" aria-label="GitHub"><Icon icon={GithubIcon} size={13} /></a>
					<a href={site.x} target="_blank" rel="me noreferrer" class="chip press size-7 hover:text-default" aria-label="X"><Icon icon={XIcon} size={13} /></a>
					<a href="/rss.xml" class="chip press size-7 hover:text-default" aria-label="RSS feed"><Icon icon={RssIcon} size={13} /></a>
				</nav>
			</div>
		</footer>
	</div>
</div>

