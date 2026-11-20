<script lang="ts">
	import { blur } from 'svelte/transition';
	import EmailCard from '@/components/site/EmailCard.svelte';
	import { hide, hold, preview } from '@/preview.svelte';

	// The one card every preview link shares. It sits beside a row or under a link, flips when
	// there's no room, and follows its trigger while the page scrolls. Moving between triggers,
	// it glides and resizes to the new content while that content fades in, a 2px blur hiding the
	// swap. Opened from the keyboard it does none of that, it's simply there.
	let w = $state(0);
	let h = $state(0);
	let x = $state(0);
	let y = $state(0);
	let origin = $state('left center');
	let card = $state<HTMLElement>();

	const PAD = 8;
	const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

	function place() {
		const a = preview.anchor, card = preview.card;
		if (!a || !card || !w) return;
		const r = a.getBoundingClientRect();
		const W = w + 2, H = h + 2; // the card's border sits outside the measured content
		if (card.side === 'right' && r.right + 12 + W <= innerWidth - PAD) {
			x = r.right + 12;
			y = r.top + r.height / 2 - H / 2;
			origin = 'left center';
		} else if (card.side === 'right' && r.left - 12 - W >= PAD) {
			x = r.left - 12 - W;
			y = r.top + r.height / 2 - H / 2;
			origin = 'right center';
		} else {
			x = clamp(r.left, PAD, innerWidth - W - PAD);
			const below = r.bottom + 8 + H <= innerHeight - PAD;
			y = below ? r.bottom + 8 : r.top - 8 - H;
			origin = below ? 'left top' : 'left bottom';
		}
		y = clamp(y, PAD, innerHeight - H - PAD);
	}

	$effect(() => {
		void [preview.anchor, preview.card, w, h];
		place();
	});

	$effect(() => {
		if (!preview.open) return;
		addEventListener('scroll', place, { passive: true, capture: true });
		addEventListener('resize', place);
		return () => {
			removeEventListener('scroll', place, { capture: true });
			removeEventListener('resize', place);
		};
	});
</script>

<svelte:window
	onkeydown={(e) => e.key === 'Escape' && hide(0)}
	onpointerdown={(e) => {
		// a tap anywhere else closes a card opened by a long press
		if (preview.open && e.pointerType === 'touch' && !card?.contains(e.target as Node) && !preview.anchor?.contains(e.target as Node)) hide(0);
	}}
/>

<div
	bind:this={card}
	class="card mielui-float-frame shadow-[var(--elevation-float)]"
	data-open={preview.open || undefined}
	data-glide={(preview.open && preview.glide) || undefined}
	data-instant={preview.instant || undefined}
	style:translate="{x}px {y}px"
	style:width="{w + 2}px"
	style:height="{h + 2}px"
	style:transform-origin={origin}
	inert={!preview.open}
	role="presentation"
	onpointerenter={hold}
	onpointerleave={(e) => e.pointerType === 'mouse' && hide()}
>
	{#if preview.card}
		{@const card = preview.card}
		{#key card.id}
			<div class="body" bind:clientWidth={w} bind:clientHeight={h} in:blur={{ duration: preview.glide && !preview.instant ? 160 : 0, amount: 2, opacity: 0 }}>
				{#if card.email}
					<EmailCard email={card.title} copy={card.email.copy} copied={card.email.copied} />
				{:else}
					<div class="flex w-72 flex-col gap-3 p-4">
						<div class="flex flex-col gap-1">
							<p class="text-[15px] leading-5 font-medium text-strong">{card.title}</p>
							{#if card.text}<p class="text-[14px] leading-5 text-pretty text-default">{card.text}</p>{/if}
						</div>
						{#if card.host || card.meta}
							<div class="flex items-baseline justify-between gap-4 text-[13px] leading-5 text-subtle">
								<span class="truncate">{card.host}</span>
								{#if card.meta}<span class="shrink-0 tabular-nums">{card.meta}</span>{/if}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/key}
	{/if}
</div>

<style>
	/* Pops in from its trigger's side like Mielui's tooltip: a fade and 96% to 100%, 180ms in,
	   120ms out. While open it glides to the next trigger and eases to the next size. Position
	   and size don't animate on the first open, so it never flies in from the last spot. */
	.card {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 130;
		overflow: hidden;
		pointer-events: none;
		opacity: 0;
		scale: 0.96;
		transition:
			opacity 120ms var(--ease-out),
			scale 120ms var(--ease-out);
	}

	.card[data-open] {
		pointer-events: auto;
		opacity: 1;
		scale: 1;
		transition-duration: 180ms;
	}

	/* moving between triggers is movement on screen, so it eases in and out */
	.card[data-glide] {
		transition:
			opacity 180ms var(--ease-out),
			scale 180ms var(--ease-out),
			translate 240ms var(--ease-in-out),
			width 240ms var(--ease-in-out),
			height 240ms var(--ease-in-out);
	}

	/* opened from the keyboard: no motion at all */
	.card[data-instant] {
		transition: none;
	}

	/* the content keeps its own size, so the card can measure it and ease toward it */
	.body {
		position: absolute;
		top: 0;
		left: 0;
		width: max-content;
	}

	@media (prefers-reduced-motion: reduce) {
		.card,
		.card[data-glide] {
			scale: 1;
			transition: opacity 120ms ease-out;
		}
	}
</style>
