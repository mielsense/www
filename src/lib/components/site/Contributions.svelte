<script lang="ts">
	import { copy, type Lang } from '@/copy';

	type Day = { date: string; count: number; level: number };
	let { days, lang, delay }: { days: Day[]; lang: Lang; delay: number } = $props();
	const t = $derived(copy[lang].graph);

	/** Weeks show on a phone, counted back from today. The rest of the year joins from sm up. */
	const PHONE_WEEKS = 22;

	const asDate = (date: string) => new Date(`${date}T00:00:00Z`);
	const number = $derived(new Intl.NumberFormat(lang));
	const month = $derived(new Intl.DateTimeFormat(lang, { month: 'short', timeZone: 'UTC' }));
	const long = $derived(new Intl.DateTimeFormat(lang, { month: 'long', day: 'numeric', timeZone: 'UTC' }));
	const total = $derived(days.reduce((n, d) => n + d.count, 0));

	// Sunday-first columns, padded so the first day sits on its weekday; a month is named over the
	// week its 1st falls in, except a sliver of a month at the very start, which would collide.
	const pad = $derived(days.length ? asDate(days[0].date).getUTCDay() : 0);
	const weeks = $derived.by(() => {
		const slots: (Day | null)[] = [...Array(pad).fill(null), ...days];
		const out: { days: (Day | null)[]; label?: string }[] = [];
		for (let i = 0; i < slots.length; i += 7) {
			const week = slots.slice(i, i + 7);
			const first = week.find((d) => d && (out.length === 0 || asDate(d.date).getUTCDate() === 1));
			out.push({ days: week, label: first ? month.format(asDate(first.date)) : undefined });
		}
		const next = out.findIndex((w, i) => i > 0 && w.label);
		if (next > 0 && next < 3) out[0].label = undefined;
		return out;
	});

	let hovered = $state.raw<Day | null>(null);
	const over = (e: PointerEvent) => {
		if (e.pointerType !== 'mouse') return;
		const i = (e.target as HTMLElement).dataset.i;
		hovered = i === undefined ? null : days[+i];
	};
</script>

<section class="shell reveal mt-6 sm:mt-8" aria-labelledby="contributions" style:--delay="{delay}ms" style:--rise="6px">
	<div class="inner flex flex-col gap-4 p-5 pb-12 max-sm:p-4 max-sm:pb-10">
	<h2 id="contributions" class="text-[15px] leading-[1.4] font-normal text-subtle tabular-nums">
		{#if hovered}
			<span class="text-strong">{number.format(hovered.count)}</span> {t.day(hovered.count, long.format(asDate(hovered.date)))}
		{:else}
			<span class="text-strong">{number.format(total)}</span> {t.total}
		{/if}
	</h2>

	<div class="graph flex gap-[3px]" role="img" aria-label="{number.format(total)} {t.total}" onpointerover={over} onpointerleave={() => (hovered = null)}>
		{#each weeks as week, w (w)}
			<div class={['flex min-w-0 flex-1 flex-col gap-[3px]', w < weeks.length - PHONE_WEEKS && 'max-sm:hidden']}>
				<span class="h-5 text-[13px] leading-none whitespace-nowrap text-subtle" aria-hidden="true">{week.label ?? ''}</span>
				{#each week.days as day, d (d)}
					{#if day}
						<i class="cell" data-level={day.level} data-i={w * 7 + d - pad} class:on={hovered === day}></i>
					{:else}
						<i class="aspect-square"></i>
					{/if}
				{/each}
			</div>
		{/each}
	</div>

	<div class="flex items-center gap-1.5 text-[13px] leading-none text-subtle" aria-hidden="true">
		{t.less}
		{#each [0, 1, 2, 3, 4] as level (level)}<i class="cell size-2.5" data-level={level}></i>{/each}
		{t.more}
	</div>
	</div>
</section>

<style>
	/* a card set in a tray, the tray's corner the card's plus the gap so the two curves stay parallel */
	.shell {
		padding: 4px;
		border-radius: 20px;
		border: 1px solid var(--color-hairline);
		background: var(--color-fill);
	}
	.inner {
		border-radius: 16px;
		border: 1px solid var(--color-panel-edge);
		background: var(--color-panel);
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.04);
	}
	.cell {
		display: block;
		aspect-ratio: 1;
		border-radius: 3px;
		background: var(--color-fill);
	}
	.cell[data-level='1'] {
		background: color-mix(in oklab, var(--color-strong) 20%, transparent);
	}
	.cell[data-level='2'] {
		background: color-mix(in oklab, var(--color-strong) 38%, transparent);
	}
	.cell[data-level='3'] {
		background: color-mix(in oklab, var(--color-strong) 62%, transparent);
	}
	.cell[data-level='4'] {
		background: var(--color-strong);
	}
	.cell.on {
		outline: 1px solid var(--color-strong);
		outline-offset: 1px;
	}
	.graph {
		cursor: default;
	}
</style>
