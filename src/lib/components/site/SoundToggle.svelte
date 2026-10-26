<script lang="ts">
	import { Button } from '@mielui/svelte/components/button';
	import Icon from '@/components/site/Icon.svelte';
	import { SoundOffIcon, SoundOnIcon } from '@/icons';
	import { sound } from '@/sound.svelte';
</script>

<Button
	variant="ghost"
	size="icon"
	class="size-7 text-subtle hover:text-strong"
	aria-label={sound.enabled ? 'Mute interface sounds' : 'Turn interface sounds on'}
	aria-pressed={sound.enabled}
	data-sound="toggle-off"
	onclick={() => sound.toggle()}
>
	<Icon icon={sound.enabled ? SoundOnIcon : SoundOffIcon} size={15} />
</Button>
