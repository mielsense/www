<script lang="ts">
	import { Dithering } from '@devmischief/shaders-svelte';
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { theme } from '@/theme.svelte';

	// Faint ordered-dither texture behind a bar. WebGL, so browser only.
	// `class` positions it; the default fills the parent.
	let { class: className = 'inset-0' }: { class?: string } = $props();
	let ready = $state(false);
	onMount(() => (ready = true));

	const back = $derived(theme.dark ? '#0c0d0d' : '#f3f2f2');
	const front = $derived(theme.dark ? '#1a1b1b' : '#e3e2e2');
	const speed = $derived(prefersReducedMotion.current ? 0 : 0.3);
</script>

{#if ready}
	<div class="pointer-events-none absolute -z-10 overflow-hidden {className}" aria-hidden="true">
		<Dithering width="100%" height="100%" colorBack={back} colorFront={front} shape="warp" type="4x4" size={2} {speed} scale={1.4} />
	</div>
{/if}
