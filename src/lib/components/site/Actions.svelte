<script lang="ts">
	import { site } from '@/data/site';

	// The two calls to action under the name: book a call, copy the email.
	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		await navigator.clipboard.writeText(site.email);
		copied = true;
		// copying again restarts the confirmation instead of letting the old timer cut it short
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="flex gap-2.5 max-lg:[&>*]:h-[46px] max-lg:[&>*]:flex-1 max-lg:[&>*]:rounded-[14px] max-lg:[&>*]:text-[15px]">
	<a href={site.cal} target="_blank" rel="noreferrer" class="cal btn btn-primary press">
		<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
			<rect x="3" y="3.5" width="18" height="4.5" rx="2.25" fill="currentColor" />
			<rect x="3" y="9.5" width="18" height="11" rx="3.5" fill="currentColor" opacity="0.5" />
			<circle class="day" cx="8" cy="13.5" r="1.5" style:--d="0ms" />
			<circle class="day" cx="12" cy="13.5" r="1.5" style:--d="30ms" />
			<circle class="day" cx="16" cy="13.5" r="1.5" style:--d="60ms" />
			<circle class="day" cx="8" cy="17.2" r="1.4" style:--d="90ms" />
			<circle class="day" cx="12" cy="17.2" r="1.4" style:--d="120ms" />
		</svg>
		Book a call
	</a>
	<button type="button" class="btn btn-secondary press" onclick={copy} data-copied={copied || undefined}>
		<span class="swap size-4" aria-hidden="true">
			<svg class="mail" width="16" height="16" viewBox="0 0 24 24">
				<rect x="2.5" y="4.5" width="19" height="15" rx="4.5" fill="currentColor" opacity="0.45" />
				<path d="M6.5 9l5.5 4 5.5-4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
			</svg>
			<svg class="check" width="16" height="16" viewBox="0 0 24 24">
				<path d="M5 12.5l4.5 4.5L19 7.5" stroke="var(--color-mint)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
			</svg>
		</span>
		<span class="swap overflow-hidden">
			<span class="label">Copy email</span>
			<span class="label" aria-hidden="true">Copied</span>
		</span>
	</button>
	<p class="sr-only" aria-live="polite">{copied ? 'Email copied to clipboard' : ''}</p>
</div>

<style>
	/* the calendar's days light up amber one after another on hover, and go out together */
	.day {
		fill: currentColor;
		transition: fill 0ms;
	}

	.cal:hover .day {
		fill: #ffb21a;
		transition-delay: var(--d);
	}

	/* stacked in one cell so both states share a size; a transition, not keyframes, so a quick
	   second copy turns around mid-way instead of restarting */
	.swap {
		display: grid;
		place-items: center;
	}

	.swap > * {
		grid-area: 1 / 1;
		transition:
			transform 200ms var(--ease-out),
			opacity 200ms var(--ease-out);
	}

	.check,
	.label:last-child {
		opacity: 0;
		transform: translateY(70%);
	}

	.check {
		transform: scale(0.6);
	}

	[data-copied] .mail,
	[data-copied] .label:first-child {
		opacity: 0;
		transform: translateY(-70%);
	}

	[data-copied] .mail {
		transform: scale(0.6);
	}

	[data-copied] .check,
	[data-copied] .label:last-child {
		opacity: 1;
		transform: none;
	}

	.label {
		justify-self: start;
	}

	@media (prefers-reduced-motion: reduce) {
		.swap > *,
		.day {
			transition: none;
		}
	}
</style>
