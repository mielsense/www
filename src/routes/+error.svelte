<script lang="ts">
	import { page } from '$app/state';
	import { copy, langOf } from '@/copy';

	const lang = $derived(langOf(page.url.pathname));
	const t = $derived(page.status === 404 ? copy[lang].missing : copy[lang].broken);
</script>

<svelte:head>
	<title>{page.status} · miel</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="copy reveal flex flex-col gap-5 text-[17px]" style:--delay="60ms" style:--rise="8px">
	<h1 class="text-[17px] leading-[1.35] text-strong">{page.status} <span class="text-subtle">{t.title}</span></h1>
	<p>{page.status === 404 ? t.text : (page.error?.message ?? t.text)}</p>
	<p><a href={lang === 'fr' ? '/fr' : '/'} class="prose-link">{t.home}</a></p>
</main>
