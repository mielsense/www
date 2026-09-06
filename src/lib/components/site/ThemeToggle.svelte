<script lang="ts">
	import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons';
	import { Button } from '@/components/ui/button/index.js';
	import HugeiconsIcon from '@/hugeicons-icon.svelte';
	import { theme } from '@/theme.svelte';
</script>

<!-- both icons are always rendered; CSS picks one so the prerendered HTML never guesses wrong,
     and the swap rotates through rather than blinking -->
<Button
	variant="ghost"
	size="icon-xs"
	class="press relative text-muted-foreground hover:text-foreground focus-visible:text-foreground"
	aria-label="Toggle dark and light theme"
	onclick={() => theme.toggle()}
	data-cuelume-toggle
>
	<HugeiconsIcon icon={Sun03Icon} size={15} strokeWidth={1.75} class="icon sun absolute" aria-hidden="true" />
	<HugeiconsIcon icon={Moon02Icon} size={15} strokeWidth={1.75} class="icon moon absolute" aria-hidden="true" />
</Button>

<style>
	:global(.icon.sun),
	:global(.icon.moon) {
		transition:
			opacity 220ms var(--ease-out),
			transform 220ms var(--ease-out);
	}

	:global(.icon.sun) {
		opacity: 0;
		transform: rotate(-90deg) scale(0.6);
	}

	:global(.dark .icon.sun) {
		opacity: 1;
		transform: none;
	}

	:global(.dark .icon.moon) {
		opacity: 0;
		transform: rotate(90deg) scale(0.6);
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.icon.sun),
		:global(.icon.moon) {
			transition: none;
		}
	}
</style>
