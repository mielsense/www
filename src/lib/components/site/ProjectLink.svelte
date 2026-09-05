<script lang="ts">
	import { StarIcon } from '@hugeicons/core-free-icons';
	import { Badge } from '@/components/ui/badge/index.js';
	import * as PreviewCard from '@/components/ui/preview-card/index.js';
	import HugeiconsIcon from '@/hugeicons-icon.svelte';
	import type { Project } from '@/data/projects';

	// A link to a project that previews it on hover, from data the sync already holds.
	let { project, class: className = '' }: { project: Project; class?: string } = $props();

	const updated = $derived(
		project.updated
			? new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(new Date(project.updated))
			: null
	);
	const host = $derived(project.homepage ? new URL(project.homepage).host : null);
</script>

<PreviewCard.Root>
	<PreviewCard.Trigger href={project.url} target="_blank" rel="noreferrer" class={className} delay={350} closeDelay={120}
		>{project.name}</PreviewCard.Trigger
	><PreviewCard.Popup align="start" sideOffset={8} class="w-72 flex-col gap-2.5 p-3.5">
		<div class="flex items-center gap-2">
			<span class="font-semibold">{project.name}</span>
			{#if project.kind}
				<Badge variant="secondary" size="sm" class="text-[0.6rem] tracking-[0.08em] uppercase">{project.kind}</Badge>
			{/if}
		</div>
		<p class="text-[0.85rem] leading-snug text-muted-foreground">{project.description}</p>
		<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem] text-muted-foreground tabular-nums">
			{#if project.lang}<span>{project.lang}</span>{/if}
			{#if project.stars}
				<span class="inline-flex items-center gap-[0.4ch]">
					<HugeiconsIcon icon={StarIcon} size={11} strokeWidth={2} aria-hidden="true" />
					{project.stars}
				</span>
			{/if}
			{#if updated}<span>updated {updated}</span>{/if}
			{#if host}<span class="ms-auto">{host}</span>{/if}
		</div>
	</PreviewCard.Popup>
</PreviewCard.Root>
