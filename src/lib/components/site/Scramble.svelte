<script lang="ts">
	import { browser } from '$app/environment';

	// A word in the display face that assembles out of the sea's own characters, then lifts in a
	// wave when hovered. Each real letter keeps its place from the first paint and only its ink is
	// hidden, so the word never changes width while it resolves. Screen readers get the plain word.
	let { text }: { text: string } = $props();

	const RAMP = ':;=+cxoX%8#@';
	const glyphAt = (i: number, frame: number) => RAMP[(frame * 7 + i * 5) % RAMP.length];

	// the prerendered page already shows the scrambled state, so there is no blank before the script
	let frame = $state(0);
	let resolved = $state(0);

	$effect(() => {
		const n = text.length;
		const root = document.documentElement;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			resolved = n;
			return;
		}
		// the first load is a moment, a page change is a quick swap
		const total = root.classList.contains('revealed') ? 280 : 640;
		// letters resolve on an ease-out curve: early gaps are long, later ones close up, so it
		// reads as a wave rather than a metronome
		const at = Array.from({ length: n }, (_, i) => total * (1 - (1 - (i + 1) / n) ** 2));
		resolved = 0;
		const start = performance.now();
		let raf = 0;
		const tick = (now: number) => {
			const t = now - start;
			frame = Math.floor(t / 45);
			resolved = at.filter((ms) => t >= ms).length;
			if (resolved < n) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});
</script>

<span class="sr-only">{text}</span><span class="scramble" aria-hidden="true">
	{#each text as letter, i (i)}
		<span class="letter" data-on={(browser && i < resolved) || undefined} style:--i={i}
			>{letter}<span class="glyph">{glyphAt(i, frame)}</span></span
		>
	{/each}
</span>

<style>
	.scramble {
		display: inline-flex;
		align-items: baseline;
	}

	.letter {
		position: relative;
		display: inline-block;
	}

	.glyph {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-family: var(--font-mono);
		font-size: 0.42em;
		color: var(--color-faint);
		visibility: hidden;
	}

	/* only scramble when the script is there to resolve it; and if it never arrives, the letters
	   settle on their own after a beat */
	:global(html.js) .letter:not([data-on]) {
		color: transparent;
		animation: settle 0s 1.4s forwards;
	}

	:global(html.js) .letter:not([data-on]) .glyph {
		visibility: visible;
		animation: settle-glyph 0s 1.4s forwards;
	}

	@keyframes settle {
		to {
			color: var(--color-strong);
		}
	}

	@keyframes settle-glyph {
		to {
			visibility: hidden;
		}
	}

	.scramble:hover .letter[data-on] {
		animation: lift 420ms var(--ease-out) calc(var(--i) * 40ms);
	}

	@keyframes lift {
		40% {
			transform: translateY(-0.03em);
		}
	}

	/* no scramble at all: the word is simply there from the first paint */
	@media (prefers-reduced-motion: reduce) {
		:global(html.js) .letter:not([data-on]) {
			color: inherit;
			animation: none;
		}

		:global(html.js) .letter:not([data-on]) .glyph,
		.glyph {
			visibility: hidden;
			animation: none;
		}

		.scramble:hover .letter[data-on] {
			animation: none;
		}
	}
</style>
