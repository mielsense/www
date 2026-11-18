<script lang="ts">
	import Actions from '@/components/site/Actions.svelte';
	import Hero from '@/components/site/Hero.svelte';
	import { site } from '@/data/site';

	type Key = 'work' | 'libraries' | 'projects';

	const libraries = ['evilcharts-sv', 'coss-sv', 'mielui'];
	const others = ['qali', 'kettle', 'zappy'];

	const cards: Record<Key, { title: string; text: string; color: string }> = {
		work: { title: site.work.name, text: 'AI voice agents for customer calls', color: 'var(--color-amber)' },
		libraries: { title: 'Svelte 5 libraries', text: `${libraries.join(', ')} and more`, color: 'var(--color-rose)' },
		projects: { title: 'Other projects', text: `${others.join(', ')} and more`, color: 'var(--color-periwinkle)' }
	};

	// One card for the three links. Like a tooltip, the first one waits 400ms so passing over a link
	// doesn't open it; once open, moving to the next link swaps its content at once.
	let active = $state<Key | null>(null);
	let shown = $state<Key>('work');
	let origin = $state(0);
	let timer: ReturnType<typeof setTimeout> | undefined;

	function enter(key: Key, event: PointerEvent | FocusEvent) {
		if (event instanceof PointerEvent && event.pointerType === 'touch') return;
		const link = event.currentTarget as HTMLElement;
		const box = link.closest('[data-intro]')!.getBoundingClientRect();
		const at = () => {
			origin = link.getBoundingClientRect().left + link.offsetWidth / 2 - box.left;
			shown = key;
			active = key;
		};
		clearTimeout(timer);
		if (active) at();
		else timer = setTimeout(at, 400);
	}

	function leave() {
		clearTimeout(timer);
		timer = setTimeout(() => (active = null), 120);
	}

	const card = $derived(cards[shown]);
</script>

<svelte:head>
	<title>Mathis, design engineer</title>
	<meta name="description" content={site.description} />
</svelte:head>

{#snippet link(key: Key, href: string, label: string)}
	<a
		{href}
		target={href.startsWith('http') ? '_blank' : undefined}
		rel={href.startsWith('http') ? 'noreferrer' : undefined}
		class="mark"
		style:--mark={cards[key].color}
		data-open={active === key || undefined}
		onpointerenter={(e) => enter(key, e)}
		onpointerleave={leave}
		onfocus={(e) => enter(key, e)}
		onblur={leave}>{label}</a
	>
{/snippet}

<Hero word="mathis">
	{#snippet text()}
		<div data-intro class="relative">
			<div
				class="card shell pointer-events-none absolute right-0 bottom-[calc(100%+20px)] w-[330px] max-w-full max-lg:hidden"
				style:--ox="{origin}px"
				data-open={active || undefined}
				aria-hidden="true"
			>
				<div class="sheet flex items-center gap-3 px-3.5 py-3">
					<span class="flex min-w-0 flex-1 flex-col">
						<span class="text-[14px] leading-5 font-medium text-strong">{card.title}</span>
						<span class="truncate text-[13px] leading-5 text-default">{card.text}</span>
					</span>
					<span class="text-[13px] text-subtle">↗</span>
				</div>
			</div>
			<p class="text-subtle">
				<span class="text-strong">Design engineer at {@render link('work', site.work.url, site.work.name)}.</span><br class="max-lg:hidden" />
				On the side I make {@render link('libraries', '/projects', 'Svelte 5 libraries')} and {@render link('projects', '/projects', 'other projects')}.
			</p>
		</div>
	{/snippet}
	{#snippet actions()}
		<Actions />
	{/snippet}
</Hero>

<style>
	/* rises 4px out of 96% from the link it belongs to, 180ms in, 120ms out; a transition, so
	   leaving mid-way reverses from where it is */
	.card {
		opacity: 0;
		transform: translateY(4px) scale(0.96);
		transform-origin: var(--ox) 100%;
		transition:
			opacity 120ms var(--ease-out),
			transform 120ms var(--ease-out);
	}

	.card[data-open] {
		opacity: 1;
		transform: none;
		transition-duration: 180ms;
	}

	@media (prefers-reduced-motion: reduce) {
		.card,
		.card[data-open] {
			transform: none;
		}
	}
</style>
