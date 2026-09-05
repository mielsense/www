<script lang="ts">
	import Editor from '@/components/site/Editor.svelte';
	import { accent } from '@/data/palette';
	import { byName, commits, featured, syncedAt } from '@/data/projects';
	import { site } from '@/data/site';

	type Row = { group: number } & ({ kind: 'day'; day: string; repos: string[] } | { kind: 'commit'; commit: (typeof commits)[number] });

	const format = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
	const days = [...new Set(commits.map((c) => c.date.slice(0, 10)))];
	const rows: Row[] = days.flatMap((d, group) => {
		const today = commits.filter((c) => c.date.startsWith(d));
		return [
			{ kind: 'day', day: format.format(new Date(d)), repos: [...new Set(today.map((c) => c.repo))], group },
			...today.map((commit) => ({ kind: 'commit' as const, commit, group }))
		];
	});
	const repoUrl = (name: string) => byName(name)?.repo ?? `${site.github}/${name}`;

	const building = featured.filter((p) => p.kind === 'soon' || p.kind === 'work');
	const delay = (index: number) => `${260 + index * 35}ms`;
</script>

<svelte:head>
	<title>@{site.handle} | now</title>
	<meta name="description" content="What Mathis is working on right now, straight from recent commits." />
</svelte:head>

<Editor label="Now">
	<div class="code-line comment" style:--enter-delay="120ms">
		<h1># now</h1>
	</div>
	<div class="code-line" style:--enter-delay="160ms">
		<p>Currently {site.now}.</p>
	</div>
	{#each building as p (p.name)}
		<a class="code-line project" href={p.url} target="_blank" rel="noreferrer" style:--enter-delay="200ms">
			<span>{p.name}</span>
			<span class="desc-line text-muted-foreground">{p.description}</span>
		</a>
	{/each}

	<div class="code-line" aria-hidden="true"></div>
	<div class="code-line comment" style:--enter-delay="240ms">
		<h2>## recent commits · synced {syncedAt.slice(0, 10)}</h2>
	</div>

	{#if rows.length === 0}
		<div class="code-line comment" style:--enter-delay="280ms">
			<p># nothing public lately, the work is happening elsewhere</p>
		</div>
	{/if}

	{#each rows as row, i (row.kind === 'day' ? row.day : row.commit.sha)}
		{#if row.kind === 'day'}
			<div class="code-line" aria-hidden="true"></div>
			<div class="code-line comment flex flex-wrap gap-x-[2ch]" style:--enter-delay={delay(i)} style:--cell-accent={accent(row.group)}>
				<h3>### {row.day}</h3>
				<span class="ms-auto flex gap-[1.5ch] text-[0.85rem]">
					{#each row.repos as name (name)}
						<a class="link-rule" href={repoUrl(name)} target="_blank" rel="noreferrer">{name} ↗</a>
					{/each}
				</span>
			</div>
		{:else}
			<a class="code-line project" href={row.commit.url} target="_blank" rel="noreferrer" style:--enter-delay={delay(i)} style:--cell-accent={accent(row.group)}>
				<span>{row.commit.repo}</span>
				<span class="desc-line text-muted-foreground">{row.commit.message}</span>
				<span class="lang">{row.commit.sha}</span>
			</a>
		{/if}
	{/each}
</Editor>
