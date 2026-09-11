<script lang="ts">
	type Day = { date: string; count: number; level: number };
	let { days, href }: { days: Day[]; href: string } = $props();
	const uid = $props.id();
	const dateFormat = new Intl.DateTimeFormat('en', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC'
	});
	const monthFormat = new Intl.DateTimeFormat('en', {
		month: 'short',
		timeZone: 'UTC'
	});
	const numberFormat = new Intl.NumberFormat('en');
	const asDate = (date: string) => new Date(`${date}T00:00:00Z`);
	const label = (day: Day) =>
		`${numberFormat.format(day.count)} contribution${day.count === 1 ? '' : 's'} on ${dateFormat.format(asDate(day.date))}`;
	// Keep complete Sunday-first weeks, including the current partial week.
	const visible = $derived.by(() => {
		if (!days.length) return [];
		const start = asDate(days[days.length - 1].date);
		start.setUTCDate(start.getUTCDate() - start.getUTCDay() - 25 * 7);
		return days.filter((day) => asDate(day.date) >= start);
	});
	const offset = $derived(
		visible.length ? asDate(visible[0].date).getUTCDay() : 0
	);
	const total = $derived(visible.reduce((sum, day) => sum + day.count, 0));
	const months = $derived.by(() => {
		const result: { label: string; column: number }[] = [];
		for (let index = 0; index < visible.length; index++) {
			const date = asDate(visible[index].date);
			const column = Math.floor((index + offset) / 7);
			if ((index === 0 || date.getUTCDate() === 1) && column < 25) {
				// Omit a short opening month so neighboring labels never collide.
				if (result.length && column - result[result.length - 1].column < 3) result.pop();
				result.push({ label: monthFormat.format(date), column });
			}
		}
		return result;
	});
	let hovered = $state<Day | null>(null);
	let focused = $state<Day | null>(null);
	let activeDate = $state<string | null>(null);
	const selected = $derived(hovered ?? focused);
	const active = $derived(activeDate ?? visible.at(-1)?.date);

	function navigate(event: KeyboardEvent, index: number) {
		const moves: Record<string, number> = {
			ArrowLeft: -7,
			ArrowRight: 7,
			ArrowUp: -1,
			ArrowDown: 1
		};
		let next = index;
		if (event.key in moves) next += moves[event.key];
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = visible.length - 1;
		else return;
		event.preventDefault();
		hovered = null;
		next = Math.max(0, Math.min(visible.length - 1, next));
		const button = event.currentTarget as HTMLButtonElement;
		button.parentElement
			?.querySelector<HTMLButtonElement>(`[data-date="${visible[next].date}"]`)
			?.focus();
	}
</script>

<div class="contributions chart">
	<div class="summary">
		<p>
			<strong>{numberFormat.format(total)}</strong> <span>contributions</span>
		</p>
		<a
			{href}
			class="link-rule"
			aria-label="View contribution activity on GitHub"
			>github <span aria-hidden="true">↗</span></a
		>
	</div>
	{#if visible.length}
		<div class="calendar">
			<div class="months" aria-hidden="true">
				{#each months as month (month.column)}
					<span
						style:grid-column="{month.column + 1} / span {Math.min(
							3,
							26 - month.column
						)}">{month.label}</span
					>
				{/each}
			</div>
			<div class="weekdays" aria-hidden="true">
				<span>mon</span><span>wed</span><span>fri</span>
			</div>
			<div
				class="squares"
				role="group"
				aria-label="Daily GitHub contributions, last 26 weeks"
				aria-describedby="{uid}-help"
			>
				{#each Array(offset) as _, index (index)}<span></span>{/each}
				{#each visible as day, index (day.date)}
					<button
						type="button"
						class="square"
						data-date={day.date}
						data-level={day.level}
						style:--reveal-delay="{Math.floor((index + offset) / 7) * 18 + ((index + offset) % 7) * 10}ms"
						class:selected={selected?.date === day.date}
						tabindex={day.date === active ? 0 : -1}
						aria-label={label(day)}
						onpointerenter={(event) => {
							if (event.pointerType !== 'touch') hovered = day;
						}}
						onpointerleave={() => (hovered = null)}
						onfocus={() => {
							focused = day;
							activeDate = day.date;
						}}
						onblur={() => (focused = null)}
						onclick={() => {
							focused = day;
							activeDate = day.date;
						}}
						onkeydown={(event) => navigate(event, index)}
					></button>
				{/each}
			</div>
		</div>
		<div class="detail" aria-live="polite" aria-atomic="true">
			{#if selected}<span>{label(selected)}</span>{:else}<span
					>last 26 weeks</span
				>{/if}
		</div>
		<div class="foot">
			<span
				>through {dateFormat.format(
					asDate(visible[visible.length - 1].date)
				)}</span
			>
			<span
				class="legend"
				aria-label="Color intensity indicates fewer to more contributions"
			>
				<span>less</span>
				{#each [0, 1, 2, 3, 4] as level (level)}<i
						class="square"
						data-level={level}
					></i>{/each}
				<span>more</span>
			</span>
		</div>
		<p class="sr-only" id="{uid}-help">
			Use the arrow keys to explore days, or Home and End to jump to the first
			and last day.
		</p>
	{:else}
		<p class="comment">Contribution activity is unavailable.</p>
	{/if}
</div>

<style>
	.contributions {
		--heat: var(--cell-accent, light-dark(#ff3fa4, #ff5cb8));
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-inline-size: 0;
		container-type: inline-size;
	}
	.summary,
	.foot {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1ch;
	}
	.summary {
		font-size: 0.8rem;
	}
	.summary strong {
		color: var(--fg);
		font-size: 1.2rem;
		font-weight: 550;
		letter-spacing: -0.04em;
		font-variant-numeric: tabular-nums;
	}
	.summary p span,
	.summary a,
	.foot,
	.detail {
		color: var(--muted-foreground);
	}
	.summary p span {
		margin-inline-start: 0.5ch;
	}
	.summary a:hover,
	.summary a:focus-visible {
		color: var(--fg);
	}
	.calendar {
		display: grid;
		grid-template-columns: 3ch minmax(0, 1fr);
		grid-template-rows: auto auto;
		gap: 0.5rem 0.65rem;
		font-size: 0.65rem;
		color: var(--muted-foreground);
	}
	.months {
		grid-column: 2;
		display: grid;
		grid-template-columns: repeat(26, minmax(0, 1fr));
		gap: 3px;
	}
	.weekdays {
		display: grid;
		grid-template-rows: repeat(7, minmax(0, 1fr));
		align-items: center;
		line-height: 1;
	}
	.weekdays span:nth-child(1) {
		grid-row: 2;
	}
	.weekdays span:nth-child(2) {
		grid-row: 4;
	}
	.weekdays span:nth-child(3) {
		grid-row: 6;
	}
	.squares {
		display: grid;
		grid-template-columns: repeat(26, minmax(0, 1fr));
		grid-template-rows: repeat(7, minmax(0, 1fr));
		grid-auto-flow: column;
		gap: 3px;
	}
	.square {
		display: block;
		aspect-ratio: 1;
		min-inline-size: 0;
		padding: 0;
		border: 1px solid color-mix(in srgb, var(--fg) 5%, transparent);
		border-radius: 2px;
		background: color-mix(in srgb, var(--fg) 6%, var(--bg));
	}
	.square[data-level='1'] {
		background: color-mix(in srgb, var(--heat) 23%, var(--bg));
	}
	.square[data-level='2'] {
		background: color-mix(in srgb, var(--heat) 44%, var(--bg));
	}
	.square[data-level='3'] {
		background: color-mix(in srgb, var(--heat) 70%, var(--bg));
	}
	.square[data-level='4'] {
		background: var(--heat);
	}
	button.square {
		cursor: crosshair;
		position: relative;
	}
	button.square.selected,
	button.square:focus-visible {
		outline: 1px solid var(--fg);
		outline-offset: 2px;
		z-index: 1;
	}
	@media (prefers-reduced-motion: no-preference) {
		button.square {
			animation: square-enter 360ms var(--ease-out) backwards;
			animation-delay: calc(var(--cell-delay, 0ms) + 90ms + var(--reveal-delay));
		}
		button.square:focus-visible {
			/* Reveal keyboard focus immediately without restarting the entrance on blur. */
			opacity: 1 !important;
			transform: none !important;
		}
	}
	@keyframes square-enter {
		from {
			opacity: 0;
			transform: translateY(4px) scale(0.85);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
	.detail {
		font-size: 0.7rem;
		min-block-size: 1.6em;
		font-variant-numeric: tabular-nums;
	}
	.foot {
		border-block-start: 1px solid var(--border);
		padding-block-start: 0.65rem;
		font-size: 0.6rem;
		flex-wrap: wrap;
		row-gap: 0.5rem;
	}
	.legend {
		display: inline-flex;
		align-items: center;
		gap: 3px;
	}
	.legend span:first-child {
		margin-inline-end: 3px;
	}
	.legend span:last-child {
		margin-inline-start: 3px;
	}
	.legend .square {
		inline-size: 7px;
	}
	@container (inline-size < 300px) {
		.calendar {
			gap: 0.5rem;
		}
		.squares,
		.months {
			gap: 2px;
		}
		.square {
			border-radius: 1px;
		}
		.summary {
			font-size: 0.7rem;
		}
	}
</style>
