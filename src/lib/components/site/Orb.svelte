<script lang="ts">
	import LiveOrb from '@/components/ui/live-orb.svelte';
	import { theme } from '@/theme.svelte';
	import { onMount } from 'svelte';

	let { size = 18 }: { size?: number } = $props();

	// WebGL only exists in the browser, so the orb mounts after hydration
	let ready = $state(false);
	onMount(() => (ready = true));
</script>

{#if ready}
	<LiveOrb {size} variant={theme.dark ? 'white' : 'black'} />
{:else}
	<span
		class="inline-block rounded-full bg-muted-foreground opacity-40"
		style:inline-size="{size}px"
		style:block-size="{size}px"
		aria-hidden="true"
	></span>
{/if}
