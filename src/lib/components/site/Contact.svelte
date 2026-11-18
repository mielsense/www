<script lang="ts">
	import { site } from '@/data/site';

	// The card the nav's Contact button opens: book a call or copy the email. A native popover, so
	// Esc, clicking outside and the top layer come from the browser. It opens under its trigger.
	let { open = $bindable(false) }: { open?: boolean } = $props();

	let card: HTMLElement;
	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	function place(event: ToggleEvent) {
		if (event.newState !== 'open') return;
		const trigger = document.querySelector<HTMLElement>('[popovertarget="contact"]');
		if (!trigger) return;
		const r = trigger.getBoundingClientRect();
		const right = Math.max(12, innerWidth - r.right);
		card.style.top = `${r.bottom + 8}px`;
		card.style.right = `${right}px`;
		// grows out of the button that opened it
		card.style.setProperty('--origin-x', `calc(100% - ${innerWidth - right - (r.left + r.width / 2)}px)`);
	}

	async function copy() {
		await navigator.clipboard.writeText(site.email);
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 2000);
	}

	// a fixed card would float away from the nav it belongs to, so scrolling closes it
	$effect(() => {
		if (!open) return;
		const close = () => card.hidePopover();
		addEventListener('scroll', close, { passive: true, once: true });
		return () => removeEventListener('scroll', close);
	});
</script>

<div
	bind:this={card}
	id="contact"
	popover
	role="dialog"
	class="contact-card shell m-0 w-[min(300px,calc(100vw-24px))] p-[5px]"
	aria-label="Contact"
	onbeforetoggle={place}
	ontoggle={(e) => (open = e.newState === 'open')}
>
	<div class="sheet flex flex-col p-1.5">
		<!-- svelte-ignore a11y_autofocus -->
		<a href={site.cal} target="_blank" rel="noreferrer" class="row cal press" autofocus onclick={() => card.hidePopover()}>
			<span class="tile">
				<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
					<rect x="3" y="3.5" width="18" height="4.5" rx="2.25" fill="var(--color-subtle)" />
					<rect x="3" y="9.5" width="18" height="11" rx="3.5" fill="var(--color-faint)" />
					<circle class="day" cx="8" cy="13.5" r="1.5" style:--d="0ms" />
					<circle class="day" cx="12" cy="13.5" r="1.5" style:--d="30ms" />
					<circle class="day" cx="16" cy="13.5" r="1.5" style:--d="60ms" />
					<circle class="day" cx="8" cy="17.2" r="1.4" style:--d="90ms" />
					<circle class="day" cx="12" cy="17.2" r="1.4" style:--d="120ms" />
				</svg>
			</span>
			<span class="flex min-w-0 flex-1 flex-col">
				<span class="text-[14px] leading-5 font-medium text-strong">Book a call</span>
				<span class="text-[13px] leading-5 text-default">15 minutes</span>
			</span>
			<span class="text-[13px] text-subtle" aria-hidden="true">↗</span>
		</a>
		<button type="button" class="row press" onclick={copy} data-copied={copied || undefined}>
			<span class="tile swap">
				<svg class="mail" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
					<rect x="2.5" y="4.5" width="19" height="15" rx="4.5" fill="var(--color-faint)" />
					<path d="M6.5 9l5.5 4 5.5-4" stroke="var(--color-strong)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
				</svg>
				<svg class="check" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
					<path d="M5 12.5l4.5 4.5L19 7.5" stroke="var(--color-mint)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
				</svg>
			</span>
			<span class="flex min-w-0 flex-1 flex-col text-start">
				<span class="swap justify-items-start overflow-hidden text-[14px] leading-5 font-medium text-strong">
					<span class="label">Copy email</span>
					<span class="label" aria-hidden="true">Copied</span>
				</span>
				<span class="truncate text-[13px] leading-5 text-default">{site.email}</span>
			</span>
		</button>
		<p class="sr-only" aria-live="polite">{copied ? 'Email copied to clipboard' : ''}</p>
	</div>
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 8px;
		/* concentric with the sheet: 13 radius - 6 padding */
		border-radius: 7px;
		cursor: pointer;
		--press: 0.985;
	}

	/* fill is instant on hover: this is reached for, not watched */
	.row:hover,
	.row:focus-visible {
		background-color: var(--color-fill);
	}

	.row:focus-visible {
		outline: none;
	}

	/* the icon is the action's glyph, not a decoration, so it sits bare in a fixed slot */
	.tile {
		display: grid;
		place-items: center;
		width: 20px;
		flex-shrink: 0;
	}

	.day {
		fill: var(--color-strong);
		transition: fill 0ms;
	}

	.cal:hover .day,
	.cal:focus-visible .day {
		fill: var(--color-amber);
		transition-delay: var(--d);
	}

	.swap {
		display: grid;
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

	@media (prefers-reduced-motion: reduce) {
		.swap > *,
		.day {
			transition: none;
		}
	}
</style>
