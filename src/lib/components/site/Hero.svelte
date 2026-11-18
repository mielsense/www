<script lang="ts">
	import type { Snippet } from 'svelte';
	import Scramble from '@/components/site/Scramble.svelte';

	// The full-screen layout over the sea: a big word bottom left with the actions under it, a few
	// lines of text bottom right. On phones it all stacks at the bottom over a fade.
	let { word, text, actions }: { word: string; text: Snippet; actions: Snippet } = $props();
</script>

<!-- clipped: the glow behind the text reaches past the screen edges and would make the page scroll -->
<main class="relative z-10 flex min-h-dvh flex-col overflow-clip justify-end px-5 pt-32 pb-[max(2.5rem,env(safe-area-inset-bottom))] lg:px-9 lg:pb-9">
	<div class="pointer-events-none absolute inset-x-0 bottom-0 h-[460px] bg-linear-to-b from-transparent via-page/80 via-45% to-page to-75% lg:hidden"></div>
	<div class="relative grid gap-5 lg:grid-cols-[1fr_minmax(0,480px)] lg:gap-x-12 lg:gap-y-7 lg:[grid-template-areas:'word_text''actions_text']">
		<h1 class="display text-[clamp(96px,14vw,200px)] lg:[grid-area:word]">
			<Scramble text={word} />
		</h1>
		<div class="reveal relative text-[18px] leading-[27px] lg:self-end lg:[grid-area:text] lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.012em]" style:--delay="160ms" style:--rise="10px">
			<!-- a soft pool of the page color behind the text, so it reads over the sea without a box -->
			<div class="pointer-events-none absolute -inset-16 hidden bg-[radial-gradient(closest-side,var(--color-page)_62%,transparent)] lg:block"></div>
			<div class="relative">{@render text()}</div>
		</div>
		<div class="reveal mt-3 lg:mt-0 lg:[grid-area:actions]" style:--delay="260ms" style:--rise="6px" style:--duration="460ms">{@render actions()}</div>
	</div>
</main>
