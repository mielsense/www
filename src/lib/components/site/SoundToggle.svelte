<script lang="ts">
	import { VolumeHighIcon, VolumeOffIcon } from '@hugeicons/core-free-icons';
	import { motion } from '@humanspeak/svelte-motion';
	import { Button } from '@/components/ui/button/index.js';
	import HugeiconsIcon from '@/hugeicons-icon.svelte';
	import { grown, quick, shrunk } from '@/motion';
	import { sound } from '@/sound.svelte';

	const transition = $derived(quick());
</script>

<Button
	variant="ghost"
	size="icon-xs"
	class="press text-muted-foreground hover:text-foreground focus-visible:text-foreground"
	aria-label={sound.enabled ? 'Turn interaction sounds off' : 'Turn interaction sounds on'}
	aria-pressed={sound.enabled}
	onclick={() => sound.toggle()}
>
	<span class="relative flex size-4 items-center justify-center" aria-hidden="true">
		<motion.span class="absolute inset-0 flex items-center justify-center" initial={false} animate={sound.enabled ? grown : shrunk} {transition}>
			<HugeiconsIcon icon={VolumeHighIcon} size={15} strokeWidth={1.75} />
		</motion.span>
		<motion.span class="absolute inset-0 flex items-center justify-center" initial={false} animate={sound.enabled ? shrunk : grown} {transition}>
			<HugeiconsIcon icon={VolumeOffIcon} size={15} strokeWidth={1.75} />
		</motion.span>
	</span>
</Button>
