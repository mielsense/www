<script lang="ts">
	import type { Snippet } from 'svelte';
	import { hide, show, type Card } from '@/preview.svelte';

	// A link that opens the shared preview card (PreviewCard.svelte) on hover or keyboard focus, or
	// on a long press on a touch screen, where there's no hover. A tap still just follows the link.
	type Props = {
		href: string;
		card: Omit<Card, 'id' | 'host'>;
		class?: string;
		row?: boolean;
		children: Snippet;
	};
	let { href, card, class: className, row, children }: Props = $props();

	const external = $derived(/^https?:/.test(href));
	const LONG_PRESS = 400;
	let press: ReturnType<typeof setTimeout> | undefined;
	let pressed = false;

	function down(e: PointerEvent) {
		if (e.pointerType !== 'touch') return;
		const el = e.currentTarget as HTMLElement;
		pressed = false;
		clearTimeout(press);
		press = setTimeout(() => {
			pressed = true;
			show(el, full, 0);
		}, LONG_PRESS);
	}
	// lifting the finger, or scrolling instead, before the press is long enough leaves it a tap
	const lift = () => clearTimeout(press);

	const full = $derived<Card>({ id: href, host: external ? href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : undefined, ...card });
</script>

<a
	{href}
	target={external ? '_blank' : undefined}
	rel={external ? 'noreferrer' : undefined}
	data-row={row ? '' : undefined}
	class={[className, 'preview-link']}
	onpointerenter={(e) => e.pointerType === 'mouse' && show(e.currentTarget, full)}
	onpointerleave={(e) => e.pointerType === 'mouse' && hide()}
	onfocus={(e) => e.currentTarget.matches(':focus-visible') && show(e.currentTarget, full, 0, true)}
	onblur={() => hide(0)}
	onpointerdown={down}
	onpointerup={lift}
	onpointercancel={lift}
	onclick={(e) => {
		// the long press opened the card; the tap that ends it doesn't also navigate
		if (pressed) {
			e.preventDefault();
			pressed = false;
		}
	}}
	oncontextmenu={(e) => pressed && e.preventDefault()}>{@render children()}</a
>

<style>
	/* the long press is ours: no system link preview or text selection on top of the card */
	.preview-link {
		-webkit-touch-callout: none;
	}

	@media (pointer: coarse) {
		.preview-link {
			-webkit-user-select: none;
			user-select: none;
		}
	}
</style>
