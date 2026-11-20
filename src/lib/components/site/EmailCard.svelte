<script lang="ts">
	import { Button } from '@mielui/svelte/components/button';

	// The email card is one row: the address, then a button that copies it. "Copy" turns into
	// "Copied" in place, and the label's width slides between the two words.
	let { email, copy, copied: done }: { email: string; copy: string; copied: string } = $props();

	let copied = $state(false);
	let rest = $state(0);
	let done_ = $state(0);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function write() {
		await navigator.clipboard.writeText(email);
		copied = true;
		// copying again restarts the confirmation instead of letting the old timer cut it short
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 1800);
	}
</script>

<!-- the button sits 6px in from the card's edge, so its corners nest in the card's -->
<div class="flex items-center gap-3 p-1.5 ps-4" data-copied={copied || undefined}>
	<span class="text-[14px] leading-5 whitespace-nowrap text-strong select-all">{email}</span>
	<Button variant="ghost" size="sm" class="shrink-0 gap-1.5 text-subtle hover:text-strong" onclick={write}>
		<span class="swap size-3.5" aria-hidden="true">
			<svg class="icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
				<rect x="5.25" y="5.25" width="8" height="8" rx="2" />
				<path d="M10.5 3.25A2 2 0 0 0 8.75 2.25h-4.5a2 2 0 0 0-2 2v4.5a2 2 0 0 0 1 1.73" stroke-linecap="round" />
			</svg>
			<svg class="icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
				<path d="M3.5 8.5l3 3 6-7" />
			</svg>
		</span>
		<span class="label swap text-[13px]" style:width={rest ? `${copied ? done_ : rest}px` : undefined}>
			<span class="word" bind:clientWidth={rest}>{copy}</span>
			<span class="word" aria-hidden="true" bind:clientWidth={done_}>{done}</span>
		</span>
	</Button>
	<p class="sr-only" aria-live="polite">{copied ? done : ''}</p>
</div>

<style>
	/* both states stacked in one cell; transitions, not keyframes, so a quick second copy turns
	   around mid-way instead of restarting */
	.swap {
		display: grid;
		place-items: center start;
	}

	.swap > * {
		grid-area: 1 / 1;
		transition:
			opacity 160ms var(--ease-out),
			transform 160ms var(--ease-out),
			filter 160ms var(--ease-out);
	}

	.icon {
		width: 100%;
		height: 100%;
	}

	.swap > :last-child {
		opacity: 0;
		transform: scale(0.6);
		filter: blur(2px);
	}

	[data-copied] .swap > :first-child {
		opacity: 0;
		transform: scale(0.6);
		filter: blur(2px);
	}

	[data-copied] .swap > :last-child {
		opacity: 1;
		transform: none;
		filter: none;
	}

	.label {
		overflow: hidden;
		transition: width 200ms var(--ease-out);
	}

	.word {
		transform-origin: left center;
		white-space: nowrap;
		width: max-content;
	}

	@media (prefers-reduced-motion: reduce) {
		.swap > * {
			transition: opacity 120ms ease-out;
		}

		.label {
			transition: none;
			transform: none !important;
			filter: none !important;
		}
	}
</style>
