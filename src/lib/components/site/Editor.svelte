<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
	import { goto } from '$app/navigation';
	import { Button } from '@/components/ui/button/index.js';
	import HugeiconsIcon from '@/hugeicons-icon.svelte';

	// The scrolling, line-numbered sheet used by /projects and /now. j/k walk the rows, b goes back.
	let { label, children }: { label: string; children: Snippet } = $props();

	const lines = Array.from({ length: 120 }, (_, i) => i + 1);
	let sheet: HTMLElement | undefined = $state();

	function onKey(event: KeyboardEvent) {
		if (event.metaKey || event.ctrlKey || event.altKey) return;
		if (event.target instanceof HTMLElement && event.target.closest('input, textarea, [contenteditable]')) return;

		if (event.key === 'b') {
			event.preventDefault();
			goto('/');
			return;
		}
		if (event.key !== 'j' && event.key !== 'k') return;

		const rows = [...(sheet?.querySelectorAll<HTMLAnchorElement>('a.project') ?? [])];
		if (rows.length === 0) return;
		event.preventDefault();
		const at = rows.indexOf(document.activeElement as HTMLAnchorElement);
		const next = event.key === 'j' ? Math.min(rows.length - 1, at + 1) : Math.max(0, at === -1 ? 0 : at - 1);
		rows[next].focus({ preventScroll: true });
		rows[next].scrollIntoView({ block: 'center', behavior: 'smooth' });
	}
</script>

<svelte:window onkeydown={onKey} />

<main class="editor">
	<div class="sheet" bind:this={sheet}>
		<aside class="line-rail" aria-hidden="true">
			{#each lines as n (n)}<span>{n}</span>{/each}
		</aside>

		<section aria-label={label}>
			<div class="code-line back" style:--enter-delay="80ms">
				<Button href="/" variant="ghost" size="sm" class="press -ms-3 text-muted-foreground hover:text-foreground">
					<HugeiconsIcon icon={ArrowLeft01Icon} size={15} strokeWidth={1.75} aria-hidden="true" />
					back
				</Button>
				<span class="comment ms-auto hidden text-[0.8rem] sm:inline">j / k to move · b to go back · n now · p projects</span>
			</div>
			<div class="code-line" aria-hidden="true"></div>
			{@render children()}
			<div class="code-line" aria-hidden="true"></div>
			<a class="code-line project" href="/" style:--enter-delay="600ms">
				<span>Back home</span>
			</a>
		</section>
	</div>
</main>
