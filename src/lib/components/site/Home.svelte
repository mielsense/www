<script lang="ts">
	import Contributions from '@/components/site/Contributions.svelte';
	import Preview from '@/components/site/Preview.svelte';
	import { copy, type Lang, type Row } from '@/copy';
	import github from '@/data/github.json';
	import { site } from '@/data/site';

	let { lang }: { lang: Lang } = $props();
	const t = $derived(copy[lang]);

	// real numbers from the daily GitHub sync, never typed by hand
	const stars = new Map(github.repos.map((r) => [r.name, r.stars]));
	const contributions = github.contributions.reduce((n, day) => n + day.count, 0);

	const meta = (row: Row) => {
		if (row.card?.soon) return t.cards.soon;
		const n = stars.get(row.name);
		return n ? t.cards.stars(n) : undefined;
	};

	// blocks enter one after another on the first load, gaps closing up down the page
	const delays = [60, 110, 150, 190, 220, 250, 270, 290];
	const line = 'row -mx-2 flex min-w-0 flex-col gap-0.5 px-2 py-1.5 text-[17px] leading-[1.6] sm:flex-row sm:items-center sm:gap-4';
</script>

<svelte:head>
	<title>{t.title}</title>
	<meta name="description" content={t.description} />
</svelte:head>

{#snippet link(href: string, label: string, title: string, text?: string)}
	<Preview {href} card={{ title, text, side: 'bottom' }} class="prose-link">{label}</Preview>
{/snippet}

{#snippet email(label: string)}
	<Preview href="mailto:{site.email}" card={{ title: site.email, email: { copy: t.cards.copy, copied: t.cards.copied }, side: 'bottom' }} class="prose-link"
		>{label}</Preview
	>
{/snippet}

{#snippet reecall()}
	<span class="whitespace-nowrap"
		><svg class="glyph" viewBox="32 56 196 140" aria-hidden="true">
			<g fill="#b251ff">
				<ellipse cx="45" cy="125" rx="12" ry="32" />
				<ellipse cx="90" cy="125" rx="18" ry="48" />
				<ellipse cx="133" cy="125" rx="28" ry="67" />
				<ellipse cx="176" cy="125" rx="17" ry="45" />
				<ellipse cx="216" cy="125" rx="11" ry="25" />
			</g></svg
		>{@render link(site.work.url, site.work.name, site.work.name, t.work.rows[0].card?.text)}</span
	>
{/snippet}

{#snippet svelte()}
	<span class="whitespace-nowrap"
		><svg class="glyph" viewBox="0 0 24 24" aria-hidden="true"
			><path
				fill="#ff3e00"
				d="M10.354 21.125a4.44 4.44 0 0 1-4.765-1.767 4.109 4.109 0 0 1-.703-3.107 3.898 3.898 0 0 1 .134-.522l.105-.321.287.21a7.21 7.21 0 0 0 2.186 1.092l.208.063-.02.208a1.253 1.253 0 0 0 .226.83 1.337 1.337 0 0 0 1.435.533 1.231 1.231 0 0 0 .343-.15l5.59-3.562a1.164 1.164 0 0 0 .524-.778 1.242 1.242 0 0 0-.211-.937 1.338 1.338 0 0 0-1.435-.533 1.23 1.23 0 0 0-.343.15l-2.133 1.36a4.078 4.078 0 0 1-1.135.499 4.44 4.44 0 0 1-4.765-1.766 4.108 4.108 0 0 1-.702-3.108 3.855 3.855 0 0 1 1.742-2.582l5.589-3.563a4.072 4.072 0 0 1 1.135-.499 4.44 4.44 0 0 1 4.765 1.767 4.109 4.109 0 0 1 .703 3.107 3.943 3.943 0 0 1-.134.522l-.105.321-.286-.21a7.204 7.204 0 0 0-2.187-1.093l-.208-.063.02-.207a1.255 1.255 0 0 0-.226-.831 1.337 1.337 0 0 0-1.435-.532 1.231 1.231 0 0 0-.343.15L8.62 9.368a1.162 1.162 0 0 0-.524.778 1.24 1.24 0 0 0 .211.937 1.338 1.338 0 0 0 1.435.533 1.235 1.235 0 0 0 .344-.151l2.132-1.36a4.067 4.067 0 0 1 1.135-.498 4.44 4.44 0 0 1 4.765 1.766 4.108 4.108 0 0 1 .702 3.108 3.857 3.857 0 0 1-1.742 2.583l-5.589 3.562a4.072 4.072 0 0 1-1.135.499m10.358-17.95C18.484-.015 14.082-.96 10.9 1.068L5.31 4.63a6.412 6.412 0 0 0-2.896 4.295 6.753 6.753 0 0 0 .666 4.336 6.43 6.43 0 0 0-.96 2.396 6.833 6.833 0 0 0 1.168 5.167c2.229 3.19 6.63 4.135 9.812 2.108l5.59-3.562a6.41 6.41 0 0 0 2.896-4.295 6.756 6.756 0 0 0-.665-4.336 6.429 6.429 0 0 0 .958-2.396 6.831 6.831 0 0 0-1.167-5.168Z"
			/></svg
		>Svelte&nbsp;5</span
	>
{/snippet}

{#snippet cells(row: Row)}
	<!-- names are the same in both languages, so they hold still when the language changes -->
	<span class="vt text-strong" style:view-transition-name="name-{row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}">{row.name}</span>
	<span class="leader hidden min-w-6 flex-1 sm:block" aria-hidden="true"></span>
	<span class="note truncate text-subtle tabular-nums sm:max-w-[62%] sm:text-right">{row.note}</span>
{/snippet}

{#snippet list(id: string, label: string, rows: Row[], delay: number)}
	<section class="flex flex-col gap-2" aria-labelledby={id}>
		<h2 {id} class="reveal text-[15px] leading-[1.6] font-normal text-subtle" style:--delay="{delay}ms" style:--rise="6px">{label}</h2>
		<ul class="flex flex-col">
			{#each rows as row, i (row.name)}
				<!-- each row a beat after the one above it -->
				<li class="reveal" style:--delay="{delay + (i + 1) * 40}ms" style:--rise="6px">
					{#if row.href}
						<Preview href={row.href} card={{ title: row.name, text: row.card?.text, meta: meta(row), side: 'right' }} row class={line}>
							{@render cells(row)}
						</Preview>
					{:else}
						<div class={line}>{@render cells(row)}</div>
					{/if}
				</li>
			{/each}
		</ul>
	</section>
{/snippet}

<main class="flex flex-col gap-14">
	<div class="flex flex-col gap-7">
		<div class="reveal flex items-center gap-3" style:--delay="{delays[0]}ms" style:--rise="8px">
			<img src="/avatar-288.webp?v=20261001" alt="" width="48" height="48" class="vt size-[48px] rounded-full" style:view-transition-name="avatar" />
			<div class="flex min-w-0 flex-col">
				<h1 class="vt text-[17px] leading-[1.35] text-strong" style:view-transition-name="me">{site.name}</h1>
				<p class="text-[15px] leading-[1.4] text-subtle">{t.role}</p>
			</div>
		</div>

		<div class="copy flex flex-col gap-5 text-[17px]">
			{#if lang === 'fr'}
				<p class="reveal" style:--delay="{delays[1]}ms" style:--rise="8px">
					Je suis design engineer, en France. Je construis le tableau de bord client de {@render reecall()}, où des agents vocaux IA décrochent et passent
					des appels. À côté, je suis freelance et je porte vers {@render svelte()} les bibliothèques d’interface que j’aime.
				</p>
				<p class="reveal" style:--delay="{delays[1] + 60}ms" style:--rise="8px">
					Vous pouvez me joindre sur {@render link(site.github, 'GitHub', `@${site.handle}`, t.links.github(new Intl.NumberFormat('fr').format(contributions)))}, {@render link(site.x, 'X', `@${site.handle}`)} ou {@render email('par e-mail')},
					ou {@render link(site.cal, 'réserver un appel', 'Réserver un appel', t.links.cal)}.
				</p>
			{:else}
				<p class="reveal" style:--delay="{delays[1]}ms" style:--rise="8px">
					I’m a design engineer in France. I build the customer dashboard at {@render reecall()}, where AI voice agents answer and place calls. On the side I
					freelance and port the interface libraries I like to {@render svelte()}.
				</p>
				<p class="reveal" style:--delay="{delays[1] + 60}ms" style:--rise="8px">
					You can reach me on {@render link(site.github, 'GitHub', `@${site.handle}`, t.links.github(new Intl.NumberFormat('en').format(contributions)))}, {@render link(site.x, 'X', `@${site.handle}`)} or {@render email('by email')}, or
					{@render link(site.cal, 'book a call', 'Book a call', t.links.cal)}.
				</p>
			{/if}
		</div>
	</div>

	{@render list('work', t.work.label, t.work.rows, delays[2])}
	{@render list('open-source', t.openSource.label, t.openSource.rows, delays[3])}
	{@render list('projects', t.projects.label, t.projects.rows, delays[4])}
	{#if t.events.rows.length}{@render list('events', t.events.label, t.events.rows, delays[5])}{/if}
	{@render list('stack', t.stack.label, t.stack.rows, delays[6])}
	<Contributions days={github.contributions} {lang} delay={delays[7]} />
</main>


<style>
	/* a brand mark sitting on the text's cap height, like a letter */
	.glyph {
		display: inline-block;
		height: 0.875em;
		width: auto;
		margin-inline-end: 0.3em;
		vertical-align: -0.1em;
	}
</style>
