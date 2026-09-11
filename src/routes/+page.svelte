<script lang="ts">
	import { ArrowUpRight01Icon, GithubIcon, NewTwitterIcon, StarIcon } from '@hugeicons/core-free-icons';
	import Availability from '@/components/site/Availability.svelte';
	import BarShader from '@/components/site/BarShader.svelte';
	import Cat from '@/components/site/Cat.svelte';
	import CopyLink from '@/components/site/CopyLink.svelte';
	import LanguagesChart from '@/components/site/LanguagesChart.svelte';
	import Marquee from '@/components/site/Marquee.svelte';
	import NowPlaying from '@/components/site/NowPlaying.svelte';
	import ProjectLink from '@/components/site/ProjectLink.svelte';
	import Stack from '@/components/site/Stack.svelte';
	import { Badge } from '@/components/ui/badge/index.js';
	import { accent } from '@/data/palette';
	import { byName, featured, openSource, projects, repoCount } from '@/data/projects';
	import { site } from '@/data/site';
	import { code, tools } from '@/data/stack';
	import HugeiconsIcon from '@/hugeicons-icon.svelte';

	const coss = byName('coss-sv')!;
	const evilcharts = byName('evilcharts-sv')!;
	const reecall = { ...site.work, year: 2026, kind: 'work' as const };

	const links = [
		{ href: site.github, icon: GithubIcon, label: `@${site.handle}` },
		{ href: site.x, icon: NewTwitterIcon, label: `@${site.handle}` }
	];
</script>

<svelte:head>
	<title>@{site.handle} | portfolio</title>
	<meta name="description" content={site.description} />
	<link rel="preload" as="image" href="/avatar.webp?v=20260911" fetchpriority="high" />
</svelte:head>

<main class="board">
	<div class="column">
		<section class="cell" style:--i="0" style:--cell-accent={accent(0)} aria-labelledby="intro-title">
			<div class="flex items-stretch gap-3">
				<Availability />
				<Marquee />
			</div>
			<img class="portrait" src="/avatar.webp?v=20260911" alt="Illustrated portrait of Mathis" width="460" height="460" fetchpriority="high" />
			<h2 class="comment" id="intro-title"># intro</h2>
			<div class="flex flex-col gap-3 short:gap-2.5 [&_a]:link-rule [&_a]:font-semibold [&_strong]:font-semibold">
				<p><strong>{site.name}</strong>. Computer science student at Epitech, in France.</p>
				<p>
					Three years at <ProjectLink project={reecall} /> building real-time voice AI, and three years of
					freelance web work alongside.
				</p>
				<p>Svelte, TypeScript, Rust and Go, and a bit of design. Mostly Svelte these days.</p>
				<p>
					Currently working on benky, <ProjectLink project={coss} /> and <ProjectLink project={evilcharts} />.
				</p>
			</div>
			<div class="dock relative isolate"><BarShader /><NowPlaying /></div>
		</section>
	</div>

	<div class="column">
		<section class="cell" style:--i="1" style:--cell-accent={accent(1)} aria-labelledby="links-title">
			<h2 class="comment" id="links-title"># links</h2>
			<ul class="flex flex-col gap-[0.65rem]">
				{#each links as link (link.href)}
					<li>
						<a href={link.href} rel="me noreferrer" class="link-rule group inline-flex items-center gap-[1.2ch]">
							<HugeiconsIcon
								icon={link.icon}
								size={16}
								strokeWidth={1.75}
								class="text-muted-foreground transition-colors duration-150 group-hover:text-foreground"
								aria-hidden="true"
							/>
							{link.label}
							<HugeiconsIcon
								icon={ArrowUpRight01Icon}
								size={13}
								strokeWidth={2}
								class="-ms-[0.6ch] -translate-x-1 translate-y-1 text-muted-foreground opacity-0 transition-[opacity,transform] duration-200 ease-(--ease-out) group-hover:translate-0 group-hover:opacity-100 group-focus-visible:translate-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
								aria-hidden="true"
							/>
						</a>
					</li>
				{/each}
				<li><CopyLink email={site.email} /></li>
			</ul>
			<Cat />
		</section>

		<section class="cell" style:--i="3" style:--cell-accent={accent(2)} aria-labelledby="projects-title">
			<h2 class="comment" id="projects-title"># software - projects</h2>
			<ul class="list">
				{#each featured as project (project.name)}
					<li class="item">
						<ProjectLink {project} class="title" />
						{#if project.kind}
							<Badge variant="secondary" size="sm" class="text-[0.65rem] tracking-[0.08em] uppercase">{project.kind}</Badge>
						{/if}
						<span class="desc">{project.description}</span>
					</li>
				{/each}
			</ul>
			<div class="flex flex-col gap-0.5 border-t pt-4">
				<a class="title" href="/projects">See all projects</a>
				<span class="comment text-[0.9rem] short:hidden"># {projects.length} of them, from C to Svelte</span>
			</div>
		</section>
	</div>

	<div class="column">
		<section class="cell" style:--i="2" style:--cell-accent={accent(3)} aria-labelledby="languages-title">
			<h2 class="comment" id="languages-title"># languages · {repoCount} repos</h2>
			<LanguagesChart />
		</section>

		<section class="cell" style:--i="3" style:--cell-accent={accent(4)} aria-labelledby="stack-title">
			<h2 class="comment" id="stack-title"># stack</h2>
			<Stack items={code} />
			<p class="comment -mt-1 text-[0.85rem]"># tools</p>
			<Stack items={tools} />
		</section>

		<section class="cell" style:--i="5" style:--cell-accent={accent(5)} aria-labelledby="oss-title">
			<h2 class="comment" id="oss-title"># open source</h2>
			<ul class="list short:gap-2.5">
				{#each openSource as repo (repo.name)}
					<li class="item">
						<ProjectLink project={repo} class="title" />
						<span class="inline-flex items-center gap-[0.5ch] text-[0.8rem] text-muted-foreground tabular-nums">
							<HugeiconsIcon icon={StarIcon} size={12} strokeWidth={2} aria-hidden="true" />
							{repo.stars}
						</span>
						<span class="desc short:hidden">{repo.description}</span>
					</li>
				{/each}
			</ul>
		</section>
	</div>
</main>
