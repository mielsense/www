<script lang="ts">
	import { Mail01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
	import { motion } from '@humanspeak/svelte-motion';
	import HugeiconsIcon from '@/hugeicons-icon.svelte';
	import { above, below, grown, shown, shrunk, swap } from '@/motion';

	// Copies the address on click instead of launching a mail app, and says so for a moment.
	// Modifier-clicks and middle clicks still open mailto.
	let { email }: { email: string } = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;
	const transition = $derived(swap());

	async function copy(event: MouseEvent) {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
		event.preventDefault();
		try {
			await navigator.clipboard.writeText(email);
		} catch {
			location.href = `mailto:${email}`;
			return;
		}
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 1600);
	}
</script>

<a href="mailto:{email}" class="link-rule inline-flex items-center gap-[1.2ch]" onclick={copy}>
	<span class="relative size-4 shrink-0 text-muted-foreground" aria-hidden="true">
		<motion.span class="absolute inset-0" initial={false} animate={copied ? shrunk : grown} {transition}>
			<HugeiconsIcon icon={Mail01Icon} size={16} strokeWidth={1.75} />
		</motion.span>
		<motion.span class="absolute inset-0 text-lime-500 dark:text-lime-400" initial={false} animate={copied ? grown : shrunk} {transition}>
			<HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2} />
		</motion.span>
	</span>
	<span class="relative">
		<motion.span class="block" initial={false} animate={copied ? above : shown} {transition}>{email}</motion.span>
		<motion.span class="absolute inset-0 text-muted-foreground" initial={false} animate={copied ? shown : below} {transition} aria-hidden="true">
			copied
		</motion.span>
	</span>
	<span class="sr-only" role="status">{copied ? 'Email address copied' : ''}</span>
</a>
