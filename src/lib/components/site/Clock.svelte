<script lang="ts">
	import { onMount } from 'svelte';

	let { timeZone = 'Europe/Paris', label = 'Paris' }: { timeZone?: string; label?: string } = $props();

	let now = $state<string | null>(null);

	onMount(() => {
		const format = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone });
		const update = () => (now = format.format(new Date()));
		update();
		const id = setInterval(update, 10_000);
		return () => clearInterval(id);
	});
</script>

<!-- the colon breathes once a second, so the clock reads as live -->
<span class="tabular-nums">{label} <time datetime={now ?? undefined}>{(now ?? '--:--').slice(0, 2)}<span class="motion-safe:animate-[tick_2s_steps(1,end)_infinite]">:</span>{(now ?? '--:--').slice(3)}</time></span>
