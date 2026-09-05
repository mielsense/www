<script lang="ts">
	import { Badge } from '@/components/ui/badge/index.js';
	import { languages } from '@/data/projects';
	import type { Tech } from '@/data/stack';

	let { items }: { items: Tech[] } = $props();

	// a badge links to the projects list when at least one repo is written in that language
	const known = new Set(languages.map((l) => l.language));
	const href = (tech: Tech) => (tech.lang && known.has(tech.lang) ? `/projects?lang=${encodeURIComponent(tech.lang)}` : undefined);
</script>

<ul class="flex flex-wrap gap-2">
	{#each items as tech (tech.name)}
		<li>
			<Badge
				as={href(tech) ? 'a' : 'span'}
				href={href(tech)}
				variant="outline"
				class="pill h-auto px-2 py-px text-[0.8rem] transition-colors duration-150 hover:border-border hover:bg-input/50 sm:h-auto sm:text-[0.8rem]"
			>
				<svg
					viewBox={tech.viewBox ?? '0 0 24 24'}
					width="13"
					height="13"
					fill={tech.color ?? 'currentColor'}
					class="shrink-0"
					aria-hidden="true"
				>
					<path d={tech.path} />
				</svg>
				{tech.name}
			</Badge>
		</li>
	{/each}
	<li>
		<Badge variant="outline" class="pill h-auto px-2 py-px text-[0.8rem] text-muted-foreground sm:h-auto sm:text-[0.8rem]" aria-label="and more">…</Badge>
	</li>
</ul>
