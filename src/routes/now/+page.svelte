<script lang="ts">
	import * as EmptyState from '@mielui/svelte/components/empty-state';
	import Icon from '@/components/site/Icon.svelte';
	import Section from '@/components/site/Section.svelte';
	import { byName, commits, featured, glyphOf, syncedAt } from '@/data/projects';
	import { site } from '@/data/site';
	import { CommitIcon } from '@/icons';

	const day = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
	const days = [...new Set(commits.map((c) => c.date.slice(0, 10)))].map((d) => ({
		label: day.format(new Date(d)),
		commits: commits.filter((c) => c.date.startsWith(d))
	}));
	const synced = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(syncedAt));
	const repoUrl = (name: string) => byName(name)?.repo ?? `${site.github}/${name}`;

	const building = featured.filter((p) => p.kind === 'soon' || p.kind === 'work');
</script>

<svelte:head>
	<title>@{site.handle} | now</title>
	<meta name="description" content="What Mathis is working on right now, straight from recent commits." />
</svelte:head>

<main>
	<header class="stagger flex flex-col gap-5 px-4 py-14 sm:px-6 lg:py-20">
		<h1 class="display text-5xl sm:text-6xl">What's happening <span class="accent">now</span></h1>
		<p class="max-w-xl text-lg text-subtle">Currently {site.now}. The list below comes straight from my public commits.</p>
	</header>
	<hr class="rule" />

	<Section id="building" class="grid grid-cols-1 gap-3 md:grid-cols-2">
		{#snippet title()}Building{/snippet}
		{#each building as p (p.name)}
			<a href={p.url} target="_blank" rel="noreferrer" class="shell">
				<div class="sheet flex h-full items-center gap-4 p-5">
					<span class="chip size-11"><Icon icon={glyphOf(p)} size={20} /></span>
					<div class="flex min-w-0 flex-col gap-0.5">
						<span class="flex items-center gap-2 text-lg text-strong">
							{p.name}
							<span class="text-xs text-subtle">{p.kind === 'soon' ? 'In progress' : 'Day job'}</span>
						</span>
						<span class="text-sm text-subtle">{p.description}</span>
					</div>
				</div>
			</a>
		{/each}
	</Section>

	<Section id="commits">
		{#snippet title()}Recent commits{/snippet}
		{#snippet action()}<span class="text-sm text-subtle">Synced {synced}</span>{/snippet}
		{#if days.length === 0}
			<EmptyState.Root class="py-10">
				<EmptyState.Header>
					<EmptyState.Title>Nothing public lately</EmptyState.Title>
					<EmptyState.Description>The work is happening in private repos. Check back after the next sync.</EmptyState.Description>
				</EmptyState.Header>
			</EmptyState.Root>
		{:else}
			<div class="shell">
				<div class="sheet flex flex-col">
					{#each days as group (group.label)}
						<div class="grid grid-cols-[minmax(0,1fr)] gap-x-8 border-t border-border px-4 py-3 first:border-t-0 sm:px-5 lg:grid-cols-[12rem_minmax(0,1fr)]">
							<h3 class="py-2 text-sm font-medium text-strong">{group.label}</h3>
							<ul class="flex flex-col">
								{#each group.commits as commit (commit.sha)}
									<li>
										<a href={commit.url} target="_blank" rel="noreferrer" class="row -mx-2.5 gap-3 px-2.5 py-2" data-row>
											<Icon icon={CommitIcon} size={14} class="shrink-0 text-subtle" />
											<span class="min-w-0 flex-1 truncate text-sm text-strong">{commit.message}</span>
											<span class="hidden shrink-0 text-xs text-subtle sm:block">{commit.repo}</span>
											<code class="tag shrink-0">{commit.sha}</code>
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			</div>
			<p class="px-1 pt-4 text-sm text-subtle">
				Also as an <a class="link" href="/rss.xml">RSS feed</a>. Repos touched:
				{#each [...new Set(commits.map((c) => c.repo))] as name, i (name)}{i ? ', ' : ''}<a class="link" href={repoUrl(name)} target="_blank" rel="noreferrer">{name}</a>{/each}.
			</p>
		{/if}
	</Section>
</main>
