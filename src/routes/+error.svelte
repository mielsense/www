<script lang="ts">
	import { page } from '$app/state';
	import Hero from '@/components/site/Hero.svelte';

	const missing = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{page.status} · Mathis</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<Hero word={String(page.status)}>
	{#snippet text()}
		<p class="text-subtle">
			<span class="text-strong">{missing ? "This page isn't here." : 'Something broke.'}</span><br class="max-lg:hidden" />
			{missing ? 'The address has a typo, or a cat knocked it off the table.' : (page.error?.message ?? 'It went wrong on the way here.')}
		</p>
	{/snippet}
	{#snippet actions()}
		<div class="flex gap-2.5 max-lg:[&>*]:h-[46px] max-lg:[&>*]:flex-1 max-lg:[&>*]:rounded-[14px] max-lg:[&>*]:text-[15px]">
			<a href="/" class="btn btn-primary press">
				<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
					<path d="M4 10.2c0-.8.4-1.5 1-2l5.6-4.3c.8-.6 2-.6 2.8 0L19 8.2c.6.5 1 1.2 1 2V18a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="currentColor" opacity="0.5" />
					<rect x="9.5" y="13.5" width="5" height="7.5" rx="2" fill="currentColor" />
				</svg>
				Go home
			</a>
			<a href="/projects" class="btn btn-secondary press">
				<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
					<rect x="3" y="3" width="8" height="8" rx="2.5" fill="currentColor" />
					<rect x="13" y="3" width="8" height="8" rx="2.5" fill="currentColor" opacity="0.45" />
					<rect x="3" y="13" width="8" height="8" rx="2.5" fill="currentColor" opacity="0.45" />
					<rect x="13" y="13" width="8" height="8" rx="2.5" fill="currentColor" />
				</svg>
				See projects
			</a>
		</div>
	{/snippet}
</Hero>
