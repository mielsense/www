<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import Editor from '@/components/site/Editor.svelte';
	import { accent } from '@/data/palette';
	import { projects, syncedAt } from '@/data/projects';
	import { site } from '@/data/site';

	type Row = { group: number } & ({ kind: 'year'; year: number } | { kind: 'project'; project: (typeof projects)[number] });

	// ?lang=Svelte narrows the list; the prerendered page carries everything and filters on the client
	const lang = $derived(browser ? page.url.searchParams.get('lang') : null);
	const shown = $derived(lang ? projects.filter((p) => p.lang === lang) : projects);
	const rows = $derived.by((): Row[] => {
		const years = [...new Set(shown.map((p) => p.year))].sort((a, b) => b - a);
		return years.flatMap((year, group) => [
			{ kind: 'year', year, group },
			...shown.filter((p) => p.year === year).map((project) => ({ kind: 'project' as const, project, group }))
		]);
	});

	const delay = (index: number) => `${200 + index * 40}ms`;
</script>

<svelte:head>
	<title>@{site.handle} | projects</title>
	<meta name="description" content="Everything Mathis has built and shipped, from C at Epitech to Svelte 5 libraries." />
</svelte:head>

<Editor label="All projects">
	<div class="code-line comment" style:--enter-delay="120ms">
		<h1># software - all projects</h1>
	</div>
	<div class="code-line comment" style:--enter-delay="160ms">
		<p>{shown.length} projects · newest first · forks not included · synced {syncedAt.slice(0, 10)}</p>
	</div>
	{#if lang}
		<div class="code-line comment" style:--enter-delay="180ms">
			<p># written in {lang} · <a class="link-rule" href="/projects">show all</a></p>
		</div>
	{/if}

	{#each rows as row, i (row.kind === 'year' ? row.year : row.project.name)}
		{#if row.kind === 'year'}
			<div class="code-line" aria-hidden="true"></div>
			<div class="code-line comment" style:--enter-delay={delay(i)} style:--cell-accent={accent(row.group)}>
				<h2>## {row.year}</h2>
			</div>
		{:else}
			<a class="code-line project" href={row.project.url} target="_blank" rel="noreferrer" style:--enter-delay={delay(i)} style:--cell-accent={accent(row.group)}>
				<span>{row.project.name}</span>
				<span class="desc-line text-muted-foreground">{row.project.description}</span>
				{#if row.project.lang}<span class="lang">{row.project.lang.toLowerCase()}</span>{/if}
			</a>
		{/if}
	{/each}
</Editor>
