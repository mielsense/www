<script lang="ts">
	import { PauseIcon, PlayIcon, SpotifyIcon } from '@hugeicons/core-free-icons';
	import { motion } from '@humanspeak/svelte-motion';
	import { Button } from '@/components/ui/button/index.js';
	import HugeiconsIcon from '@/hugeicons-icon.svelte';
	import { site } from '@/data/site';
	import { grown, quick, shrunk } from '@/motion';
	import { player } from '@/player.svelte';

	const { track } = site;

	let audio: HTMLAudioElement | undefined = $state();
	let progress = $state(0);
	const transition = $derived(quick());
	const playing = $derived(player.playing);

	$effect(() => {
		player.attach(audio);
		return () => player.attach(undefined);
	});
</script>

<div class="player relative flex items-center gap-[0.9rem] py-[0.85rem]" style:--progress={progress}>
	<img class="size-12 shrink-0 rounded object-cover" src={track.cover} alt="" width="48" height="48" />
	<div class="flex min-w-0 flex-col leading-[1.35]">
		<span class="truncate font-semibold">{track.title}</span>
		<span class="text-[0.9rem] text-muted-foreground">{track.artist}</span>
	</div>
	<div class="ms-auto flex items-center gap-0.5 *:text-muted-foreground *:hover:text-foreground *:focus-visible:text-foreground">
		<Button
			class="press"
			variant="ghost"
			size="icon-xs"
			aria-label={playing ? `Pause ${track.title}` : `Play a preview of ${track.title}`}
			aria-pressed={playing}
			onclick={() => player.toggle()}
			data-cuelume-toggle
		>
			<span class="relative flex size-4 items-center justify-center" aria-hidden="true">
				<motion.span class="absolute inset-0 flex items-center justify-center" initial={false} animate={playing ? shrunk : grown} {transition}>
					<HugeiconsIcon icon={PlayIcon} size={15} strokeWidth={2} />
				</motion.span>
				<motion.span class="absolute inset-0 flex items-center justify-center" initial={false} animate={playing ? grown : shrunk} {transition}>
					<HugeiconsIcon icon={PauseIcon} size={15} strokeWidth={2} />
				</motion.span>
			</span>
		</Button>
		<Button
			href={track.spotify}
			target="_blank"
			rel="noreferrer"
			class="press"
			variant="ghost"
			size="icon-xs"
			aria-label="Open on Spotify"
		>
			<HugeiconsIcon icon={SpotifyIcon} size={15} strokeWidth={1.75} aria-hidden="true" />
		</Button>
	</div>
	<audio
		bind:this={audio}
		src={track.preview}
		preload="none"
		onplay={() => (player.playing = true)}
		onpause={() => (player.playing = false)}
		ontimeupdate={() => (progress = audio?.duration ? audio.currentTime / audio.duration : 0)}
		onended={() => (progress = 0)}
	></audio>
</div>

<style>
	/* playback progress as a hairline along the bottom edge */
	.player::after {
		content: '';
		position: absolute;
		inset: auto 0 0 0;
		block-size: 1px;
		background: var(--fg);
		opacity: 0.7;
		transform: scaleX(var(--progress));
		transform-origin: left;
	}

	@media (prefers-reduced-motion: no-preference) {
		.player::after {
			transition: transform 0.25s linear;
		}
	}
</style>
