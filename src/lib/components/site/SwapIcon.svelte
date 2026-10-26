<script lang="ts">
	import Icon from '@/components/site/Icon.svelte';
	import type { IconData } from '@/icons';

	// Two glyphs stacked in one slot, cross-faded with a transition rather than keyframes,
	// so flipping it mid-way turns around instead of restarting.
	let { from, to, swapped, size = 14, class: className }: { from: IconData; to: IconData; swapped: boolean; size?: number; class?: string } =
		$props();

	const glyph = 'col-start-1 row-start-1 transition-[opacity,scale,filter] duration-200 ease-out motion-reduce:transition-none';
</script>

<span class={['grid shrink-0 place-items-center', className]} aria-hidden="true">
	<Icon icon={from} {size} class="{glyph} {swapped ? 'scale-50 opacity-0 blur-[2px]' : ''}" />
	<Icon icon={to} {size} class="{glyph} {swapped ? '' : 'scale-50 opacity-0 blur-[2px]'}" />
</span>
