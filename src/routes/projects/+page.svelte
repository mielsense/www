<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Badge } from '@mielui/svelte/components/badge';
	import { Button } from '@mielui/svelte/components/button';
	import * as EmptyState from '@mielui/svelte/components/empty-state';
	import * as Tabs from '@mielui/svelte/components/tabs';
	import Icon from '@/components/site/Icon.svelte';
	import Section from '@/components/site/Section.svelte';
	import { glyphOf, languages, projects, syncedAt } from '@/data/projects';
	import { site } from '@/data/site';
	import { GithubIcon, StarIcon } from '@/icons';

	// ?lang=Svelte narrows the list. The page is prerendered with everything and filters in the browser.
	const lang = $derived((browser && page.url.searchParams.get('lang')) || 'all');
	const top = languages.slice(0, 5).map((l) => l.language);
	const tabs = $derived(lang === 'all' || top.includes(lang) ? top : [...top, lang]);

	const shown = $derived(lang === 'all' ? projects : projects.filter((p) => p.lang === lang));
	const years = $derived([...new Set(shown.map((p) => p.year))].sort((a, b) => b - a));
	const synced = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(syncedAt));

	function filter(value: string) {
		goto(value === 'all' ? '/projects' : `/projects?lang=${encodeURIComponent(value)}`, { replaceState: true, noScroll: true, keepFocus: true });
	}
</script>

<svelte:head>
	<title>@{site.handle} | projects</title>
	<meta name="description" content="Everything Mathis has built and shipped, from C projects to Svelte 5 libraries." />
</svelte:head>

<main>
	<header class="stagger flex flex-col gap-8 px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
		<div class="flex flex-col gap-5">
			<h1 class="display text-5xl sm:text-6xl">Everything I've <span class="accent">shipped</span></h1>
			<p class="max-w-xl text-lg text-subtle">{projects.length} projects, newest first, from C to Svelte. Synced from GitHub on {synced}.</p>
		</div>
		<Tabs.Root value={lang} onValueChange={filter} variant="segmented">
			<div role="group" aria-label="Language" class="max-w-full overflow-x-auto">
				<Tabs.List>
					<Tabs.Trigger value="all">All</Tabs.Trigger>
					{#each tabs as language (language)}
						<Tabs.Trigger value={language}>{language}</Tabs.Trigger>
					{/each}
				</Tabs.List>
			</div>
		</Tabs.Root>
	</header>
	<hr class="rule" />

	{#if shown.length === 0}
		<EmptyState.Root class="py-16">
			<EmptyState.Header>
				<EmptyState.Title>Nothing written in {lang}</EmptyState.Title>
				<EmptyState.Description>No public project uses it as its main language yet.</EmptyState.Description>
			</EmptyState.Header>
			<EmptyState.Actions>
				<Button variant="outline" size="sm" onclick={() => filter('all')}>Show every project</Button>
			</EmptyState.Actions>
		</EmptyState.Root>
		<hr class="rule" />
	{/if}

	{#each years as year (year)}
		<Section id="y{year}">
			{#snippet title()}<span class="tabular-nums">{year}</span>{/snippet}
			{#snippet action()}<span class="text-sm text-subtle tabular-nums">{shown.filter((p) => p.year === year).length} projects</span>{/snippet}
			<div class="shell">
				<ul class="sheet flex flex-col">
					{#each shown.filter((p) => p.year === year) as project (project.name)}
						<li class="relative flex items-center gap-3 border-t border-border px-4 py-3.5 first:border-t-0">
							<span class="chip size-9"><Icon icon={glyphOf(project)} size={16} /></span>
							<div class="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
								<span class="flex shrink-0 items-center gap-2">
									<a href={project.url} target="_blank" rel="noreferrer" class="text-base text-strong after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:shadow-[inset_0_0_0_2px_var(--color-ring)]" data-row>
										{project.name}
									</a>
									{#if project.kind === 'soon'}<Badge variant="secondary">In progress</Badge>{/if}
									{#if project.kind === 'work'}<Badge variant="secondary">Day job</Badge>{/if}
								</span>
								<span class="truncate text-sm text-subtle">{project.description}</span>
							</div>
							<span class="hidden shrink-0 text-xs text-subtle sm:block">{project.lang ?? ''}</span>
							{#if project.stars}
								<span class="flex shrink-0 items-center gap-1 text-xs text-subtle tabular-nums" aria-label="{project.stars} stars">
									<Icon icon={StarIcon} size={11} />{project.stars}
								</span>
							{/if}
							{#if project.repo}
								<a href={project.repo} target="_blank" rel="noreferrer" class="chip relative z-10 size-7 hover:text-default" aria-label="{project.name} on GitHub">
									<Icon icon={GithubIcon} size={13} />
								</a>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		</Section>
	{/each}
</main>
