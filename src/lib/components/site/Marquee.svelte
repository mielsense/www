<script lang="ts">
	import { site } from '@/data/site';
</script>

<div class="marquee min-w-0 flex-1 font-pixel text-[0.95rem] tracking-[0.04em]" aria-label="Currently {site.now}">
	<div class="track inline-flex items-center ps-[3ch]" aria-hidden="true">
		{#each [0, 1] as copy (copy)}
			<span class="pe-[4ch]">
				<em class="text-muted-foreground italic">currently:</em>
				<span>{site.now}</span>
			</span>
		{/each}
	</div>
</div>

<style>
	.marquee {
		display: flex;
		align-items: center;
		block-size: 1.9rem;
		overflow: hidden;
		white-space: nowrap;
		mask: linear-gradient(90deg, transparent, #000 14%, #000 90%, transparent);
	}

	.track {
		animation: slide 26s linear infinite;
		will-change: transform;
	}

	.marquee:hover .track {
		animation-play-state: paused;
	}

	@keyframes slide {
		to {
			transform: translateX(-50%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.track {
			animation: none;
		}

		.marquee {
			mask: none;
		}
	}
</style>
