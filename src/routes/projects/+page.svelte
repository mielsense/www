<script lang="ts">
	import Footer from '@/components/site/Footer.svelte';
	import Scramble from '@/components/site/Scramble.svelte';
	import { projects, type Project } from '@/data/projects';
	import { site } from '@/data/site';

	// This year, last year, then everything older in one group. The page is prerendered, so
	// "this year" is the newest year in the data rather than the build date.
	const newest = projects[0].year;
	const groups = [
		{ label: 'This year', items: projects.filter((p) => p.year === newest) },
		{ label: String(newest - 1), items: projects.filter((p) => p.year === newest - 1) },
		{ label: 'Earlier', items: projects.filter((p) => p.year < newest - 1) }
	].filter((g) => g.items.length);

	// sections enter one block each, with gaps that close up down the page: 120, 190, 250, 300ms
	const delays = [120, 190, 250, 300];
	const delay = (i: number) => `${delays[Math.min(i, delays.length - 1)]}ms`;

	const live = (p: Project) => !p.repo || p.url !== p.repo;
	const note: Partial<Record<NonNullable<Project['kind']>, string>> = { soon: 'In progress', work: 'Day job' };
</script>

<svelte:head>
	<title>Projects · Mathis</title>
	<meta name="description" content="Everything Mathis has built and published on GitHub: Svelte 5 libraries, apps, tools and games." />
</svelte:head>

<main class="relative z-10">
	<header class="flex h-[300px] items-end px-4 pb-2 lg:h-[460px] lg:px-11 lg:pb-4">
		<h1 class="display text-[80px] lg:text-[160px]"><Scramble text="projects" /></h1>
	</header>

	<div class="flex max-w-[728px] flex-col gap-12 px-5 pt-8 pb-16 lg:gap-16 lg:px-12 lg:pt-16 lg:pb-28">
		{#each groups as group, i (group.label)}
			<section class="reveal flex flex-col gap-3" aria-label={group.label} style:--delay={delay(i)} style:--rise={i === 0 ? '10px' : '6px'}>
				<h2 class="pb-3 text-[13px] font-normal text-subtle">{group.label}</h2>
				<ul class="-mx-3 flex flex-col gap-1">
					{#each group.items as project (project.name)}
						<li>
							<a
								href={project.url}
								target="_blank"
								rel="noreferrer"
								data-row
								class="group flex items-start justify-between gap-6 rounded-xl px-3 py-2.5 hover:bg-fill focus-visible:bg-fill"
							>
								<span class="flex min-w-0 flex-col gap-1">
									<span class="flex items-baseline gap-2.5">
										<span class="text-[16px] leading-5 font-medium tracking-[-0.01em] text-strong">{project.name}</span>
										{#if project.kind && note[project.kind]}<span class="text-[13px] text-subtle">{note[project.kind]}</span>{/if}
									</span>
									<span class="text-[15px] leading-[23px] text-default">{project.description}</span>
								</span>
								<span class="shrink-0 text-[13px] leading-5 whitespace-nowrap text-subtle group-hover:text-strong">
									<span class="max-sm:sr-only">{live(project) ? 'Visit' : 'Source'}</span>
									<span class="arrow inline-block" aria-hidden="true">↗</span>
								</span>
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
		<a href={site.github} target="_blank" rel="noreferrer" class="reveal text-[13px] text-subtle hover:text-strong" style:--delay={delay(groups.length)} style:--rise="0px">All of it on GitHub ↗</a>
	</div>

	<Footer />
</main>

<style>
	/* the arrow leans 2px toward where the link goes; the fill behind the row is instant */
	.arrow {
		transition: transform 150ms var(--ease-out);
	}

	.group:hover .arrow {
		transform: translate(2px, -2px);
	}

	@media (prefers-reduced-motion: reduce) {
		.arrow {
			transition: none;
		}
	}
</style>
