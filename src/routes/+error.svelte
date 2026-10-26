<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '@mielui/svelte/components/button';
	import * as EmptyState from '@mielui/svelte/components/empty-state';
	import { site } from '@/data/site';

	const status = $derived(page.status);
	const title = $derived(status === 404 ? 'Page not found' : 'Something broke');
	const line = $derived(
		status === 404 ? 'The address has a typo or the page moved.' : (page.error?.message ?? 'Something went wrong on the way here.')
	);
</script>

<svelte:head>
	<title>@{site.handle} | {status}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="flex flex-1 items-center justify-center px-6 py-24">
	<div class="shell w-full max-w-md"><div class="sheet p-8">
	<EmptyState.Root>
		<EmptyState.Header>
			<span class="font-mono text-xs text-subtle">{status}</span>
			<EmptyState.Title>{title}</EmptyState.Title>
			<EmptyState.Description>{line}</EmptyState.Description>
		</EmptyState.Header>
		<EmptyState.Actions>
			<Button href="/" size="sm">Go home</Button>
			<Button href="/projects" variant="outline" size="sm">See projects</Button>
		</EmptyState.Actions>
	</EmptyState.Root>
	</div></div>
</main>
