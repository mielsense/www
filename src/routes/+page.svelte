<script lang="ts">
	import { Badge } from '@mielui/svelte/components/badge';
	import { Button } from '@mielui/svelte/components/button';
	import * as Heatmap from '@mielui/svelte/components/heatmap';
	import { numberShuffle } from '@mielui/svelte/actions/number-shuffle';
	import { browser } from '$app/environment';
	import type Lenis from 'lenis';
	import Cat from '@/components/site/Cat.svelte';
	import Clock from '@/components/site/Clock.svelte';
	import Icon from '@/components/site/Icon.svelte';
	import SwapIcon from '@/components/site/SwapIcon.svelte';
	import { commits, featured, glyphOf, languages, openSource, projects, repoCount, syncedAt, type Project } from '@/data/projects';
	import github from '@/data/github.json';
	import { site } from '@/data/site';
	import { code, tools, type Tech } from '@/data/stack';
	import {
		ArrowUpRightIcon,
		CalendarIcon,
		CheckIcon,
		ChevronRightIcon,
		CommitIcon,
		CopyIcon,
		GithubIcon,
		MailIcon,
		RssIcon,
		StarIcon,
		XIcon,
		ArrowLeftIcon,
		ClockIcon,
		TerminalIcon,
		BriefcaseIcon,
		BookIcon,
		WrenchIcon,
		GlobeIcon,
		FolderIcon,
		SparkleIcon,
		ChatIcon,
		type IconData
	} from '@/icons';

	const thousands = new Intl.NumberFormat('en');
	const total = github.contributions.reduce((n, d) => n + d.count, 0);
	const synced = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(syncedAt));
	const flag = (p: Project) => (p.kind === 'soon' ? 'In progress' : p.kind === 'work' ? 'Day job' : undefined);

	// a soft mesh behind each library's glyph
	const aura: Record<string, string> = {
		mielui: 'radial-gradient(circle at 20% 25%, #e0f2fe 0, transparent 55%), radial-gradient(circle at 85% 80%, #0ea5e9 0, transparent 55%), #7dd3fc',
		'evilcharts-sv': 'radial-gradient(circle at 15% 30%, #f9731a 0, transparent 55%), radial-gradient(circle at 90% 10%, #fff3e0 0, transparent 50%), #f8b46b',
		'coss-sv': 'radial-gradient(ellipse at 10% 100%, #ffe1ec 0, transparent 45%), radial-gradient(ellipse at 80% 70%, #6f7dff 0, transparent 55%), #a9b6ff',
		'sileo-svelte': 'radial-gradient(circle at 85% 15%, #e450c8 0, transparent 50%), radial-gradient(circle at 15% 85%, #ffc2d6 0, transparent 55%), #f08fc0',
		kettle: 'radial-gradient(circle at 20% 20%, #d9f99d 0, transparent 55%), radial-gradient(circle at 85% 80%, #22b07d 0, transparent 55%), #7bd6a3'
	};

	// extra hues for the section stickers, so no two share a color
	const violet = 'radial-gradient(circle at 20% 15%, #e9d5ff 0, transparent 55%), radial-gradient(circle at 85% 85%, #7c3aed 0, transparent 60%), #a78bfa';
	const teal = 'radial-gradient(circle at 20% 15%, #ccfbf1 0, transparent 55%), radial-gradient(circle at 85% 85%, #0891b2 0, transparent 60%), #2dd4bf';
	const coral = 'radial-gradient(circle at 20% 15%, #ffe4e1 0, transparent 55%), radial-gradient(circle at 85% 85%, #e11d48 0, transparent 60%), #fb7185';
	const sun = 'radial-gradient(circle at 20% 15%, #fef9c3 0, transparent 55%), radial-gradient(circle at 85% 85%, #eab308 0, transparent 60%), #fde047';
	const graphite = 'radial-gradient(circle at 20% 15%, #e5e5e5 0, transparent 55%), radial-gradient(circle at 85% 85%, #262626 0, transparent 60%), #737373';
	const indigo = 'radial-gradient(circle at 20% 15%, #e0e7ff 0, transparent 55%), radial-gradient(circle at 85% 85%, #3730a3 0, transparent 60%), #6366f1';

	const experience = [
		{ place: site.work.name, url: site.work.url, role: 'Full-stack engineer', when: 'Since 2023', icon: BriefcaseIcon },
		{ place: 'Freelance', role: 'Web developer for clients', when: '3 years', icon: GlobeIcon },
		{ place: 'Epitech', url: 'https://www.epitech.eu/', role: "Computer science, master's", when: 'Final years', icon: BookIcon }
	];

	// everything older: not a current pick and not one of the libraries
	const archive = projects.filter((p) => !featured.includes(p) && !openSource.includes(p)).slice(0, 8);
	const topLanguage = Math.max(...languages.map((l) => l.repos));

	// The rail scrolls sideways on wide screens. People don't expect that, so a button says so,
	// and the edge with more content behind it fades.
	let rail: HTMLElement | undefined;
	let scrolled = $state(0);
	let scrollMax = $state(0);
	const measure = () => {
		if (!rail) return;
		scrolled = rail.scrollLeft;
		scrollMax = rail.scrollWidth - rail.clientWidth;
	};
	const atEnd = $derived(scrolled >= scrollMax - 4);
	const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

	// Lenis glides the rail on sideways gestures only; up and down always stay inside the column.
	let lenis: Lenis | undefined;
	const slideTo = (left: number) => (lenis ? lenis.scrollTo(left) : rail?.scrollTo({ left, behavior: calm() ? 'auto' : 'smooth' }));
	const slide = (direction: 1 | -1) => rail && slideTo(rail.scrollLeft + direction * rail.clientWidth * 0.75);

	function railed(el: HTMLElement) {
		rail = el;
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		const wide = matchMedia('(min-width: 64rem)');
		let gone = false;
		const start = () => {
			lenis?.destroy();
			lenis = undefined;
			if (!wide.matches || calm()) return;
			import('lenis').then(({ default: Lenis }) => {
				if (gone || !wide.matches || lenis) return;
				lenis = new Lenis({ wrapper: el, content: el, orientation: 'horizontal', gestureOrientation: 'horizontal', allowNestedScroll: true, autoRaf: true });
			});
		};
		start();
		wide.addEventListener('change', start);
		return () => {
			gone = true;
			observer.disconnect();
			wide.removeEventListener('change', start);
			lenis?.destroy();
		};
	}

	// arrow keys move the rail too, unless something else on the page has focus
	function onKey(event: KeyboardEvent) {
		if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
		if (event.target !== document.body || event.metaKey || event.ctrlKey || event.altKey || !scrollMax) return;
		event.preventDefault();
		slide(event.key === 'ArrowRight' ? 1 : -1);
	}

	// a language links to the projects written in it
	const known = new Set(languages.map((l) => l.language));
	const stackHref = (t: Tech) => (t.lang && known.has(t.lang) ? `/projects?lang=${encodeURIComponent(t.lang)}` : undefined);

	// copying again restarts the confirmation instead of letting the old timer cut it short
	let copied = $state(false);
	let copiedTimer: ReturnType<typeof setTimeout> | undefined;
	async function copyEmail() {
		await navigator.clipboard.writeText(site.email);
		copied = true;
		clearTimeout(copiedTimer);
		copiedTimer = setTimeout(() => (copied = false), 1600);
	}

	// Entrances belong to the first page load. Coming back from another page, everything is just there.
	const firstLoad = !browser || !document.documentElement.classList.contains('revealed');
	const roll = (node: HTMLElement, options: Parameters<typeof numberShuffle>[1]) => (firstLoad ? numberShuffle(node, options) : undefined);

	// the portrait waves when clicked
	let waving = $state(false);

	const elsewhere = [
		{ href: site.github, label: 'GitHub', hint: `@${site.handle}`, icon: GithubIcon },
		{ href: site.x, label: 'X', hint: `@${site.handle}`, icon: XIcon },
		{ href: '/rss.xml', label: 'RSS', hint: 'Commits behind /now', icon: RssIcon }
	];

	// On wide screens the page reads left to right: fixed columns that each scroll on their own,
	// fading their bottom edge while there is more below.
	const col = (min = 'lg:min-w-[26rem]') =>
		`flex flex-col ${min} lg:flex-1 lg:shrink-0 lg:overflow-y-auto lg:scroll-fade-y lg:border-s lg:border-dashed lg:border-frame lg:[scrollbar-width:none] lg:[--gutter:0px] lg:first:border-s-0`;
	// sections reveal line by line on load
	const block = 'stagger group/section flex flex-col gap-4 px-4 py-6 sm:px-6';
	// small arrows lean toward where they go when their row is hovered
	const lean = 'transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none';
	const leanOut = 'transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none';
</script>

<svelte:window onkeydown={onKey} />

<svelte:head>
	<title>@{site.handle} | portfolio</title>
	<meta name="description" content={site.description} />
</svelte:head>

<!-- a section label: underlined, with a small tilted sticker that springs upright when its section is hovered -->
{#snippet heading(id: string, text: string, icon: IconData, bg: string)}
	<h2 {id} class="flex items-center gap-2 text-sm font-medium">
		<span
			class="grain grid size-6 -rotate-6 place-items-center rounded-[7px] text-white shadow-[0_2px_6px_rgb(0_0_0/0.12)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/section:rotate-3 group-hover/section:scale-110 motion-reduce:transition-none"
			style:background={bg}
			aria-hidden="true"
		>
			<Icon {icon} size={12} />
		</span>
		<span class="text-strong underline decoration-border-strong decoration-1 underline-offset-4">{text}</span>
	</h2>
{/snippet}

{#snippet stack(items: Tech[])}
	{#each items as tech (tech.name)}
		<li>
			<svelte:element this={stackHref(tech) ? 'a' : 'span'} href={stackHref(tech)} class="flex items-center gap-1.5 text-sm text-default {stackHref(tech) ? 'press hover:text-strong' : ''}">
				<svg viewBox={tech.viewBox ?? '0 0 24 24'} width="14" height="14" fill="currentColor" aria-hidden="true"><path d={tech.path} /></svg>
				{tech.name}
			</svelte:element>
		</li>
	{/each}
{/snippet}

<div class="relative">
<main
	class="flex flex-col lg:h-[calc(100dvh-2*var(--gutter)-2px)] lg:flex-row lg:overflow-x-auto lg:[scrollbar-width:thin]"
	data-rail
	onscroll={measure}
	{@attach railed}
>
	<!-- profile -->
	<div class={col()} style:--col={0}>
		<section class={block}>
			<div>
				<div class="shell"><div class="grain dusk h-40 rounded-[13px]"></div></div>
				<!-- the avatar overlaps the banner by a third; the name sits beside it, bottoms aligned, clear of the banner -->
				<div class="relative -mt-9 flex items-end gap-3 ps-4">
					<button type="button" class="shrink-0 rounded-full" aria-label="Wave hello" data-sound="pop" onclick={() => (waving = true)} onanimationend={() => (waving = false)}>
						<img
							src="/avatar.webp?v=20261001"
							alt=""
							width="96"
							height="96"
							class="size-24 rounded-full object-cover ring-4 ring-page {waving ? 'motion-safe:animate-[wave_700ms_var(--ease-out)]' : ''}"
						/>
					</button>
					<div class="flex min-w-0 flex-col pb-1">
						<h1 class="text-xl font-medium tracking-[-0.015em]">{site.name}</h1>
						<span class="text-sm text-subtle">@{site.handle} · <Clock /></span>
					</div>
				</div>
			</div>
			<p class="display mt-2 text-4xl">Building <span class="accent">tasteful</span> things for the web</p>
			<p class="text-base leading-relaxed text-subtle">
				Computer science student in France. Three years at
				<a class="link" href={site.work.url} target="_blank" rel="noreferrer">Reecall</a> on real-time voice AI, three years of freelance web work, and a
				few Svelte libraries people use.
			</p>
			<span class="flex items-center gap-2 text-sm text-default">
				<span class="relative flex size-1.5" aria-hidden="true">
					<span class="absolute inset-0 animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden"></span>
					<span class="relative size-1.5 rounded-full {site.available ? 'bg-success' : 'bg-subtle'}"></span>
				</span>
				{site.available ? 'Open to work' : 'Booked for now'}
			</span>
			<div class="flex flex-wrap gap-2">
				<Button href={site.cal} target="_blank" rel="noreferrer" class="ps-3.5">
					<Icon icon={CalendarIcon} size={14} />
					Book a call
				</Button>
				<Button variant="glow" onclick={copyEmail} data-sound="copy" class="ps-3.5 glow-plain">
					<SwapIcon from={MailIcon} to={CheckIcon} swapped={copied} />
					{copied ? 'Email copied' : 'Copy email'}
				</Button>
			</div>
			<p class="sr-only" aria-live="polite">{copied ? 'Email copied to clipboard' : ''}</p>
		</section>
		<hr class="rule" />
		<section class={block} aria-labelledby="stack">
			{@render heading('stack', 'Stack', WrenchIcon, violet)}
			<ul class="flex flex-wrap gap-x-4 gap-y-2.5" aria-label="Languages">{@render stack(code)}</ul>
			<ul class="flex flex-wrap gap-x-4 gap-y-2.5" aria-label="Tools">{@render stack(tools)}</ul>
		</section>
		<hr class="rule" />
		<section class={block} aria-labelledby="links">
			{@render heading('links', 'Elsewhere', GlobeIcon, teal)}
			<ul class="flex flex-col">
				<li class="border-b border-border">
					<button type="button" class="group press-soft flex w-full items-center gap-3 py-3 text-start" data-sound="copy" onclick={copyEmail}>
						<Icon icon={MailIcon} size={16} class="text-strong" />
						<span class="text-base text-strong">{copied ? 'Copied' : 'Email'}</span>
						<span class="truncate text-sm text-subtle group-hover:text-default">{site.email}</span>
						<SwapIcon from={CopyIcon} to={CheckIcon} swapped={copied} class="ms-auto text-subtle group-hover:text-strong" />
					</button>
				</li>
				{#each elsewhere as link (link.href)}
					<li class="border-b border-border last:border-b-0">
						<a href={link.href} target="_blank" rel="me noreferrer" class="group press-soft flex items-center gap-3 py-3">
							<Icon icon={link.icon} size={16} class="text-strong" />
							<span class="text-base text-strong">{link.label}</span>
							<span class="truncate text-sm text-subtle group-hover:text-default">{link.hint}</span>
							<Icon icon={ArrowUpRightIcon} size={14} class="ms-auto shrink-0 text-subtle group-hover:text-strong {leanOut}" />
						</a>
					</li>
				{/each}
			</ul>
		</section>
	</div>
	<hr class="rule lg:hidden" />

	<!-- work: wide, so the contribution calendar reads as a short strip -->
	<div class={col('lg:min-w-[50rem]')} style:--col={1}>
		<section class={block} aria-labelledby="projects">
			<div class="flex items-center justify-between">
				{@render heading('projects', 'Current projects', FolderIcon, aura['sileo-svelte'])}
				<a href="/projects" class="group inline-flex items-center gap-1 text-sm text-subtle hover:text-strong">
					All
					<Icon icon={ChevronRightIcon} size={13} class={lean} />
				</a>
			</div>
			<div class="shell">
				<ul class="sheet flex flex-col">
					{#each featured as project (project.name)}
						<!-- clipped to the sheet's corners, so the hover fill on the first and last rows stays inside the curve -->
						<li class="overflow-hidden border-t border-border first:rounded-t-[13px] first:border-t-0 last:rounded-b-[13px]">
							<a
								href={project.url}
								target="_blank"
								rel="noreferrer"
								class="group press-soft flex items-center gap-3 px-3.5 py-3 outline-offset-[-2px] hover:bg-selected/60"
								data-row
							>
								<span class="chip size-9"><Icon icon={glyphOf(project)} size={16} /></span>
								<span class="flex min-w-0 flex-1 flex-col">
									<span class="flex items-center gap-2 text-base text-strong">
										{project.name}
										{#if flag(project)}<Badge variant="secondary">{flag(project)}</Badge>{/if}
										<Icon icon={ArrowUpRightIcon} size={12} class="text-subtle opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" />
									</span>
									<span class="truncate text-sm text-subtle">{project.description}</span>
								</span>
								<span class="hidden shrink-0 text-xs text-subtle tabular-nums sm:block">{[project.lang, project.year].filter(Boolean).join(' · ')}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</section>
		<hr class="rule" />
		<section class={block} aria-labelledby="experience">
			{@render heading('experience', 'Experience', BriefcaseIcon, sun)}
			<div class="shell">
				<ul class="sheet flex flex-col">
					{#each experience as job (job.place)}
						<li class="flex items-center gap-3 border-t border-border px-3.5 py-3 first:border-t-0">
							<span class="chip size-9"><Icon icon={job.icon} size={16} /></span>
							<span class="flex min-w-0 flex-1 flex-col">
								{#if job.url}
									<a href={job.url} target="_blank" rel="noreferrer" class="self-start text-base text-strong hover:underline">{job.place}</a>
								{:else}
									<span class="text-base text-strong">{job.place}</span>
								{/if}
								<span class="truncate text-sm text-subtle">{job.role}</span>
							</span>
							<span class="shrink-0 text-xs text-subtle tabular-nums">{job.when}</span>
						</li>
					{/each}
				</ul>
			</div>
		</section>
		<hr class="rule" />
		<section class={block} aria-labelledby="activity">
			{@render heading('activity', 'Activity', CommitIcon, aura.kettle)}
			<div class="shell min-w-0">
				<div class="sheet flex flex-col gap-4 p-5">
					<p class="text-lg text-strong">
						<!-- rolls up from zero on load -->
						<span class="tabular-nums" use:roll={{ value: total, format: (n) => thousands.format(Math.round(n)) }}>{thousands.format(total)}</span>
						contributions <span class="text-subtle">this year</span>
					</p>
					<Heatmap.Root days={github.contributions} weeks={48} weekStartsOn={1} animation={firstLoad ? 'rows' : 'none'} labels={{ unit: (n) => (n === 1 ? 'contribution' : 'contributions') }}>
						{#snippet children()}
							<!-- scrolls sideways when narrow, fading only the side with more to see; opens on the newest week -->
							<Heatmap.Calendar class="scroll-fade-x" {@attach (el) => void (el.scrollLeft = el.scrollWidth)}>
								<Heatmap.MonthLabels />
								<Heatmap.Grid />
							</Heatmap.Calendar>
							<Heatmap.Tooltip />
							<Heatmap.Footer>
								<Heatmap.Legend />
							</Heatmap.Footer>
						{/snippet}
					</Heatmap.Root>
				</div>
			</div>
		</section>
	</div>
	<hr class="rule lg:hidden" />

	<!-- say hello and now: third, so booking a call is in the first view on a laptop-wide window -->
	<div class={col()} style:--col={2}>
		<section class={block} aria-labelledby="hello">
			{@render heading('hello', 'Say hello', ChatIcon, coral)}
			<div class="shell">
				<div class="grain sunrise flex min-h-96 flex-col justify-end gap-6 rounded-[13px] p-6 text-white">
					<p class="text-4xl leading-[1.05] font-medium tracking-[-0.03em] text-balance">Book a 15&#8209;min intro call</p>
					<!-- a lit white button; see glow-white in app.css for why white needs its own glow -->
					<Button
						variant="glow"
						href={site.cal}
						target="_blank"
						rel="noreferrer"
						class="group glow-white h-12 w-full justify-between rounded-[12px] ps-4 pe-3.5 text-base"
					>
						<span class="flex items-center gap-2"><Icon icon={CalendarIcon} size={15} />Book a call</span>
						<span class="flex items-center gap-1 text-sm text-[#1a1a1a]/50 tabular-nums">15 min <Icon icon={ArrowUpRightIcon} size={13} class={leanOut} /></span>
					</Button>
					<button type="button" class="group press-soft flex items-center gap-3 rounded-[10px] text-start text-sm" data-sound="copy" onclick={copyEmail}>
						<Icon icon={MailIcon} size={18} />
						<span class="flex flex-col leading-tight">
							<span class="font-medium">Prefer email?</span>
							<span class="text-white/80">{copied ? 'Copied to clipboard' : site.email}</span>
						</span>
						<span class="mielui-glow glow-white ms-auto grid size-8 place-items-center rounded-full text-[#1a1a1a] shadow-[var(--mielui-glow-shadow)]">
							<SwapIcon from={CopyIcon} to={CheckIcon} swapped={copied} size={13} />
						</span>
					</button>
				</div>
			</div>
		</section>
		<hr class="rule" />
		<!-- fills the rest of the column so its button sits at the bottom -->
		<section class="{block} lg:flex-1" aria-labelledby="now">
			<div class="flex items-center justify-between">
				{@render heading('now', 'Now', SparkleIcon, aura['coss-sv'])}
				<span class="text-sm text-subtle tabular-nums">Synced {synced}</span>
			</div>
			<p class="text-lg text-strong">Currently {site.now}.</p>
			<ul class="flex flex-col">
				{#each commits.filter((c) => !c.message.startsWith('chore: sync github data')).slice(0, 7) as commit (commit.sha)}
					<li>
						<a href={commit.url} target="_blank" rel="noreferrer" class="row press-soft -mx-2.5 gap-3 px-2.5 py-2" data-row>
							<Icon icon={CommitIcon} size={14} class="shrink-0 text-subtle" />
							<span class="min-w-0 flex-1 truncate text-sm text-strong">{commit.message}</span>
							<span class="shrink-0 text-xs text-subtle">{commit.repo}</span>
						</a>
					</li>
				{/each}
			</ul>
			<Button href="/now" variant="ghost" class="group -ms-3 self-start pe-3 lg:mt-auto">
				See what's new
				<Icon icon={ChevronRightIcon} size={13} class={lean} />
			</Button>
		</section>
		<hr class="rule" />
		<!-- the README cat from the old site, asleep -->
		<section class={block}>
			<Cat />
		</section>
	</div>
	<hr class="rule lg:hidden" />

	<!-- open source -->
	<div class={col()} style:--col={3}>
		<section class={block} aria-labelledby="oss">
			<div class="flex items-center justify-between">
				{@render heading('oss', 'Open source', StarIcon, aura['evilcharts-sv'])}
				<span class="text-sm text-subtle">Mielui and Svelte 5 ports</span>
			</div>
			{#each openSource as repo (repo.name)}
				<article class="shell group">
					<div class="sheet overflow-hidden">
						<!-- the color fades into the card instead of stopping at a hard edge, and reaches a little further on hover -->
						<div
							class="grain h-32 origin-top [mask-image:linear-gradient(to_bottom,black_35%,transparent)] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-y-110 motion-reduce:transition-none"
							style:background={aura[repo.name] ?? aura['coss-sv']}
						></div>
						<div class="flex flex-col gap-1 p-4">
							<span class="flex items-center justify-between gap-2">
								<h3 class="text-lg">{repo.name}</h3>
								<span class="flex items-center gap-1 text-xs text-subtle tabular-nums" aria-label="{repo.stars} stars">
									<Icon icon={StarIcon} size={11} /><span use:roll={{ value: repo.stars ?? 0 }}>{repo.stars}</span>
								</span>
							</span>
							<p class="text-sm text-subtle">{repo.description}</p>
							<div class="mt-3 flex flex-wrap gap-2">
								<Button variant="outline" size="sm" href={repo.repo ?? repo.url} target="_blank" rel="noreferrer" class="group/link pe-2.5">
									View on GitHub
									<Icon icon={ArrowUpRightIcon} size={12} class="transition-transform duration-150 ease-out group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 motion-reduce:transition-none" />
								</Button>
								{#if repo.homepage}
									<Button variant="outline" size="sm" href={repo.homepage} target="_blank" rel="noreferrer" class="group/docs pe-2.5">
										Docs
										<Icon icon={ArrowUpRightIcon} size={12} class="transition-transform duration-150 ease-out group-hover/docs:translate-x-0.5 group-hover/docs:-translate-y-0.5 motion-reduce:transition-none" />
									</Button>
								{/if}
							</div>
						</div>
					</div>
				</article>
			{/each}
		</section>
	</div>
	<hr class="rule lg:hidden" />

	<!-- archive: older work and the languages behind it -->
	<div class={col()} style:--col={4}>
		<section class={block} aria-labelledby="archive">
			<div class="flex items-center justify-between">
				{@render heading('archive', 'Archive', ClockIcon, graphite)}
				<a href="/projects" class="group inline-flex items-center gap-1 text-sm text-subtle hover:text-strong">
					All
					<Icon icon={ChevronRightIcon} size={13} class={lean} />
				</a>
			</div>
			<ul class="flex flex-col">
				{#each archive as project (project.name)}
					<li class="border-t border-border first:border-t-0">
						<a href={project.url} target="_blank" rel="noreferrer" class="group press-soft flex items-center gap-3 py-2.5" data-row>
							<span class="shrink-0 text-base text-strong">{project.name}</span>
							<span class="min-w-0 flex-1 truncate text-sm text-subtle group-hover:text-default">{project.description}</span>
							<span class="shrink-0 text-xs text-subtle tabular-nums">{project.year}</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
		<hr class="rule" />
		<section class={block} aria-labelledby="languages">
			<div class="flex items-center justify-between">
				{@render heading('languages', 'Languages', TerminalIcon, indigo)}
				<span class="text-sm text-subtle tabular-nums"><span use:roll={{ value: repoCount }}>{repoCount}</span> repos</span>
			</div>
			<ul class="flex flex-col gap-3">
				{#each languages as { language, repos }, i (language)}
					<li class="flex flex-col gap-1.5">
						<span class="flex items-center justify-between text-sm">
							<a href="/projects?lang={encodeURIComponent(language)}" class="text-strong hover:underline">{language}</a>
							<span class="text-xs text-subtle tabular-nums">{repos}</span>
						</span>
						<!-- bars grow in one after another -->
						<span class="h-1.5 overflow-hidden rounded-full bg-selected">
							<span
								class="reveal-once block h-full origin-left rounded-full bg-strong/70 motion-safe:animate-[grow_900ms_var(--ease-out)_backwards]"
								style:width="{(repos / topLanguage) * 100}%"
								style:animation-delay="{500 + i * 80}ms"
							></span>
						</span>
					</li>
				{/each}
			</ul>
		</section>
	</div>
</main>
	<!-- the sideways hint: fades on the edges that hide content, and a button that moves one screen along -->
	{#if scrollMax > 0}
		<div class="pointer-events-none absolute inset-y-0 start-0 hidden w-16 bg-linear-to-r from-page transition-opacity duration-300 lg:block" class:opacity-0={scrolled <= 4} aria-hidden="true"></div>
		<div class="pointer-events-none absolute inset-y-0 end-0 hidden w-24 bg-linear-to-l from-page transition-opacity duration-300 lg:block" class:opacity-0={atEnd} aria-hidden="true"></div>
		<div class="absolute end-5 bottom-5 z-10 hidden items-center gap-2 lg:flex">
			{#if scrolled > 4 && !atEnd}
				<Button size="icon" onclick={() => slide(-1)} data-sound="swoosh" class="size-10 rounded-full shadow-[var(--mielui-glow-shadow),0_6px_20px_rgb(0_0_0/0.18)]" aria-label="Scroll back">
					<Icon icon={ArrowLeftIcon} size={14} />
				</Button>
			{/if}
			<!-- the same lit dark button as Book a call; padding is shaved on whichever side holds the icon -->
			<Button
				onclick={() => (atEnd ? slideTo(0) : slide(1))}
				data-sound="swoosh"
				class="h-10 rounded-full shadow-[var(--mielui-glow-shadow),0_6px_20px_rgb(0_0_0/0.18)] {atEnd ? 'ps-3.5 pe-4' : 'ps-4 pe-3.5'}"
			>
				{#if atEnd}
					<Icon icon={ArrowLeftIcon} size={14} />
					Back to start
				{:else}
					Scroll sideways
					<Icon icon={ChevronRightIcon} size={14} class="motion-safe:animate-[nudge_1.6s_ease-in-out_infinite]" />
				{/if}
			</Button>
		</div>
	{/if}
</div>
<hr class="rule" />
