<script lang="ts">
	import type { Snippet } from 'svelte';

	// A titled band of the page: the title row, a rule, the content, and a closing rule.
	let { id, title, action, children, class: className }: { id: string; title: Snippet; action?: Snippet; children: Snippet; class?: string } = $props();
</script>

<section aria-labelledby={id}>
	<div class="flex min-h-14 items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
		<h2 {id} class="text-xl font-medium tracking-[-0.015em] text-strong">{@render title()}</h2>
		{@render action?.()}
	</div>
	<hr class="rule" />
	<div class={['px-5 py-6 sm:px-8 lg:px-12', className]}>{@render children()}</div>
	<hr class="rule" />
</section>
