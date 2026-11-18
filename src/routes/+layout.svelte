<script lang="ts">
	import '../app.css';
	import { dev } from '$app/environment';
	import { beforeNavigate, goto, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import favicon from '@/assets/favicon.svg';
	import { mountCatSea } from '@/cat-sea';
	import Contact from '@/components/site/Contact.svelte';
	import { site } from '@/data/site';
	import { theme } from '@/theme.svelte';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let { children } = $props();

	const path = $derived(page.url.pathname.replace(/\/$/, '') || '/');
	const canonical = $derived(site.url + (path === '/' ? '' : path));
	// the sea fills the screen on the home and error pages, and is a header band everywhere else
	const full = $derived(path === '/' || page.error !== null);

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

	// h, a and p jump between pages from anywhere; j and k walk the rows of a list
	const routes: Record<string, string> = { h: '/', a: '/about', p: '/projects' };
	function onKey(event: KeyboardEvent) {
		if (event.metaKey || event.ctrlKey || event.altKey) return;
		if (event.target instanceof HTMLElement && event.target.closest('input, textarea, [contenteditable]')) return;
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
		const color = theme.dark ? '#1c1c1c' : '#f3f2f2';
		for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) meta.content = color;
	});

	// Entrances belong to the first page of the visit. From the first navigation on, pages just
	// appear and display words only do a quick scramble.
	beforeNavigate(() => document.documentElement.classList.add('revealed'));

	// Pages cross-fade and the nav carries over. The sea shrinks into the header band on its own (see below).
	onNavigate((navigation) => {
		if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	const links = [
		{ href: '/about', label: 'About', collar: 'var(--color-amber)', icon: 'about' },
		{ href: '/projects', label: 'Projects', collar: 'var(--color-rose)', icon: 'projects' },
		// no page of its own: it opens the contact card
		{ href: null, label: 'Contact', collar: 'var(--color-periwinkle)', icon: 'contact' }
	] as const;

	let contactOpen = $state(false);
</script>

<svelte:head>
	<link rel="icon" href={favicon} type="image/svg+xml" />
	<link rel="canonical" href={canonical} />
	<link rel="alternate" type="application/rss+xml" title="@{site.handle} · commits" href="{site.url}/rss.xml" />
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
	<meta property="og:image:alt" content="mielsense, Mathis. Design engineer at Reecall." />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="{site.url}/og.png?v=20261001" />
	<meta name="twitter:image:alt" content="mielsense, Mathis. Design engineer at Reecall." />
	<meta name="twitter:site" content="@mielsense" />
	<meta name="twitter:creator" content="@mielsense" />
	{@html `<script type="application/ld+json">${person}</script>`}
</svelte:head>

<svelte:window onkeydown={onKey} />

<!-- one canvas for the whole visit: it is never remounted, so the cats keep swimming across pages -->
<!-- not a view-transition layer of its own: those paint above the page and the sea is opaque, so it
     would cover the text mid-transition. It shrinks with a height transition under the cross-fade. -->
<div class={['sea pointer-events-none absolute inset-x-0 top-0 overflow-hidden transition-[height] duration-400 ease-(--ease-out) motion-reduce:transition-none', full ? 'h-dvh min-h-[560px]' : 'band h-[300px] lg:h-[460px]']}>
	<canvas {@attach mountCatSea} class="absolute top-0 left-0 h-lvh min-h-[560px] w-full font-mono" aria-hidden="true"></canvas>
</div>

<header class="nav reveal absolute inset-x-0 top-0 z-20 flex items-center justify-between ps-5 pe-3 pt-[max(1rem,env(safe-area-inset-top))] lg:ps-9 lg:pe-6 lg:pt-6" style:view-transition-name="nav" style:--rise="0px" style:--duration="400ms">
	<a href="/" class="press flex items-center gap-2.5 rounded-full text-[16px] font-medium text-strong" aria-current={path === '/' ? 'page' : undefined}>
		<img src="/avatar-288.webp?v=20261001" alt="" width="28" height="28" class="size-7 rounded-full" />
		miel
	</a>
	<nav aria-label="Site" class="flex items-center gap-0.5">
		{#each links as link (link.label)}
			<svelte:element
				this={link.href ? 'a' : 'button'}
				href={link.href ?? undefined}
				type={link.href ? undefined : 'button'}
				popovertarget={link.href ? undefined : 'contact'}
				aria-haspopup={link.href ? undefined : 'dialog'}
				aria-expanded={link.href ? undefined : contactOpen}
				aria-current={link.href && path === link.href ? 'page' : undefined}
				class="nav-link press flex h-11 items-center gap-2 rounded-xl ps-2.5 pe-3 text-[15px] text-default hover:text-strong aria-[current=page]:text-strong aria-expanded:text-strong max-sm:w-11 max-sm:justify-center max-sm:px-0 max-sm:aria-[current=page]:bg-fill max-sm:aria-expanded:bg-fill"
				style:--collar={link.collar}
			>
				<svg class="duo shrink-0 max-sm:size-5" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
					{#if link.icon === 'projects'}
						<rect class="a tile" x="3" y="3" width="8" height="8" rx="2.5" />
						<rect class="b" x="13" y="3" width="8" height="8" rx="2.5" />
						<rect class="b" x="3" y="13" width="8" height="8" rx="2.5" />
						<rect class="a" x="13" y="13" width="8" height="8" rx="2.5" />
					{:else if link.icon === 'about'}
						<circle class="a head" cx="12" cy="7.5" r="4" />
						<path class="b" d="M4.5 19.5c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6c0 .8-.6 1.5-1.5 1.5H6c-.9 0-1.5-.7-1.5-1.5z" />
					{:else}
						<path class="b" d="M3.5 7A3.5 3.5 0 0 1 7 3.5h10A3.5 3.5 0 0 1 20.5 7v6.5A3.5 3.5 0 0 1 17 17h-5.6l-4.1 3.2c-.7.5-1.6 0-1.6-.8V17A3 3 0 0 1 3.5 14z" />
						<circle class="a" cx="8.5" cy="10.3" r="1.4" style:transition-delay="0ms" />
						<circle class="a" cx="12" cy="10.3" r="1.4" style:transition-delay="40ms" />
						<circle class="a" cx="15.5" cy="10.3" r="1.4" style:transition-delay="80ms" />
					{/if}
				</svg>
				<span class="max-sm:sr-only">{link.label}</span>
			</svelte:element>
		{/each}
		<button
			type="button"
			class="nav-link press flex size-11 items-center justify-center rounded-xl"
			style:--collar="var(--color-lavender)"
			aria-label="Switch between light and dark"
			onclick={(event) => theme.toggle({ x: event.clientX, y: event.clientY })}
		>
			<!-- both glyphs are rendered and CSS picks one, so the prerendered page never shows the wrong one -->
			<svg class="duo dark:hidden" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
				<path class="a" d="M11.97 3.41A9 9 0 1 0 20.6 12.34A6.4 6.4 0 0 1 11.97 3.41Z" />
				<circle class="b" cx="18" cy="5" r="1.6" />
			</svg>
			<svg class="duo hidden dark:block" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
				<circle class="a" cx="12" cy="12" r="4.6" />
				<path class="b" d="M12 1.8a1.3 1.3 0 0 1 1.3 1.3v1.2a1.3 1.3 0 0 1-2.6 0V3.1A1.3 1.3 0 0 1 12 1.8zm0 16.6a1.3 1.3 0 0 1 1.3 1.3v1.2a1.3 1.3 0 0 1-2.6 0v-1.2a1.3 1.3 0 0 1 1.3-1.3zM1.8 12a1.3 1.3 0 0 1 1.3-1.3h1.2a1.3 1.3 0 0 1 0 2.6H3.1A1.3 1.3 0 0 1 1.8 12zm16.6 0a1.3 1.3 0 0 1 1.3-1.3h1.2a1.3 1.3 0 0 1 0 2.6h-1.2a1.3 1.3 0 0 1-1.3-1.3zM4.8 4.8a1.3 1.3 0 0 1 1.8 0l.9.9a1.3 1.3 0 0 1-1.8 1.8l-.9-.9a1.3 1.3 0 0 1 0-1.8zm11.7 11.7a1.3 1.3 0 0 1 1.8 0l.9.9a1.3 1.3 0 0 1-1.8 1.8l-.9-.9a1.3 1.3 0 0 1 0-1.8zM4.8 19.2a1.3 1.3 0 0 1 0-1.8l.9-.9a1.3 1.3 0 0 1 1.8 1.8l-.9.9a1.3 1.3 0 0 1-1.8 0zM16.5 7.5a1.3 1.3 0 0 1 0-1.8l.9-.9a1.3 1.3 0 0 1 1.8 1.8l-.9.9a1.3 1.3 0 0 1-1.8 0z" />
			</svg>
		</button>
	</nav>
</header>

<Contact bind:open={contactOpen} />

{@render children()}

<style>
	/* the band fades into the page at its bottom edge */
	.band::after {
		content: '';
		position: absolute;
		inset: auto 0 0;
		height: 50%;
		background: linear-gradient(to bottom, transparent, var(--color-page));
	}

	/* Nav icons wake up on hover and on the current page: the accent takes the link's collar color
	   and the icon makes one small move. Color is instant on the label, 150ms on the icon. */
	.nav-link:is(:hover, [aria-current='page'], [aria-expanded='true']) :global(.duo) {
		--duo-a: var(--collar);
		--duo-b: #a3a3a3;
	}

	:global(.dark) .nav-link:is(:hover, [aria-current='page'], [aria-expanded='true']) :global(.duo) {
		--duo-b: #6e6e6e;
	}

	/* the color is instant (hover fires constantly); only the one small move eases */
	.tile,
	.head {
		transition: transform 150ms var(--ease-out);
	}

	.nav-link:hover .tile {
		transform: translateY(-1px);
	}

	.nav-link:hover .head {
		transform: translateY(-0.8px);
	}

	@media (prefers-reduced-motion: reduce) {
		.tile,
		.head {
			transition: none;
		}
	}
</style>
