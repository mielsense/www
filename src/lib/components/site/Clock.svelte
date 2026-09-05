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

<span class="tabular-nums">local time <time>{now ?? '--:--'}</time> · {label}</span>
