<script lang="ts">
	import { page } from '$app/state';
	import Editor from '@/components/site/Editor.svelte';
	import { site } from '@/data/site';

	const status = $derived(page.status);
	const line = $derived(
		status === 404 ? 'nothing here, the path is a typo or the page moved.' : (page.error?.message ?? 'something broke on the way here.')
	);
</script>

<svelte:head>
	<title>@{site.handle} | {status}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<Editor label="Error">
	<div class="code-line comment" style:--enter-delay="120ms">
		<h1># {status}</h1>
	</div>
	<div class="code-line" style:--enter-delay="160ms">
		<p>{line}</p>
	</div>
	<div class="code-line comment" style:--enter-delay="200ms">
		<p># press b or pick a way out below</p>
	</div>
	<div class="code-line" aria-hidden="true"></div>
	<a class="code-line project" href="/projects" style:--enter-delay="240ms">
		<span>projects</span>
		<span class="desc-line text-muted-foreground">everything shipped, by year</span>
	</a>
	<a class="code-line project" href="/now" style:--enter-delay="280ms">
		<span>now</span>
		<span class="desc-line text-muted-foreground">what's being worked on this week</span>
	</a>
</Editor>
