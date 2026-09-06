<script lang="ts">
	import { Calendar03Icon } from '@hugeicons/core-free-icons';
	import { motion } from '@humanspeak/svelte-motion';
	import BarShader from '@/components/site/BarShader.svelte';
	import { site } from '@/data/site';
	import HugeiconsIcon from '@/hugeicons-icon.svelte';
	import { above, below, grown, shown, shrunk, swap } from '@/motion';

	// Reads as a status until you reach for it, then becomes the call to action and shrinks,
	// letting the marquee stretch. The outer span sizes with CSS because it must have its width
	// before the first pointer arrives. While hot, the pointer is judged against the pill's original
	// footprint rather than its shrinking box, otherwise it would fall off and flip back forever.
	const status = site.available ? 'currently free to work' : 'booked for now';
	const action = 'book a call';

	let hot = $state(false);
	let statusWidth = $state(0);
	let actionWidth = $state(0);
	let wrapper: HTMLElement | undefined = $state();
	const transition = $derived(swap());

	function track(event: PointerEvent) {
		if (!wrapper) return;
		const { left, top, bottom } = wrapper.getBoundingClientRect();
		const inside =
			event.clientX >= left && event.clientX <= left + statusWidth && event.clientY >= top && event.clientY <= bottom;
		if (!inside) hot = false;
	}

	const pill = 'pill inline-flex h-[1.9rem] items-center gap-[0.9ch] whitespace-nowrap border px-3.5 text-[0.8rem] font-medium';
</script>

<svelte:window onpointermove={hot ? track : undefined} />

<!-- the outer span owns the hit area and the layout width; motion animates the pill and its layers -->
<span
	class="relative flex h-[1.9rem] shrink-0 transition-[inline-size] duration-[260ms] ease-(--ease-out) motion-reduce:transition-none"
	role="presentation"
	style:inline-size={statusWidth ? `${hot ? actionWidth : statusWidth}px` : undefined}
	onpointerenter={() => (hot = true)}
	onfocusin={() => (hot = true)}
	onfocusout={() => (hot = false)}
>
	<motion.a
		bind:ref={wrapper}
		href={site.cal}
		target="_blank"
		rel="noreferrer"
		class="{pill} absolute inset-y-0 start-0 isolate overflow-hidden"
		initial={false}
		animate={{ width: hot ? actionWidth : statusWidth }}
		whileTap={{ scale: 0.96 }}
		{transition}
	>
		<BarShader />
		<span class="relative size-3.5 shrink-0" aria-hidden="true">
			<motion.span
				class="dot absolute inset-0 m-auto size-1.5 rounded-full {site.available ? 'bg-lime-500 dark:bg-lime-400' : 'bg-muted-foreground'}"
				initial={false}
				animate={hot ? shrunk : grown}
				{transition}
			/>
			<motion.span class="absolute inset-0" initial={false} animate={hot ? grown : shrunk} {transition}>
				<HugeiconsIcon icon={Calendar03Icon} size={14} strokeWidth={1.75} />
			</motion.span>
		</span>
		<span class="relative">
			<motion.span class="block" initial={false} animate={hot ? above : shown} {transition}>{status}</motion.span>
			<motion.span class="absolute inset-0" initial={false} animate={hot ? shown : below} {transition} aria-hidden="true">
				{action}
			</motion.span>
		</span>
	</motion.a>

	<!-- the two states, measured off-screen so the width can animate between them -->
	<span class="{pill} invisible absolute start-0 top-0" aria-hidden="true" bind:clientWidth={statusWidth}>
		<span class="size-3.5 shrink-0"></span>{status}
	</span>
	<span class="{pill} invisible absolute start-0 top-0" aria-hidden="true" bind:clientWidth={actionWidth}>
		<span class="size-3.5 shrink-0"></span>{action}
	</span>
</span>

<style>
	/* the dot breathes while it is a status */
	:global(.dot::after) {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: inherit;
		animation: breathe 2.4s var(--ease-out) infinite;
	}

	@keyframes breathe {
		0% {
			transform: scale(1);
			opacity: 0.7;
		}
		70%,
		100% {
			transform: scale(3.2);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.dot::after) {
			animation: none;
		}
	}
</style>
