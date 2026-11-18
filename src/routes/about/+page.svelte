<script lang="ts">
	import Footer from '@/components/site/Footer.svelte';
	import Scramble from '@/components/site/Scramble.svelte';
	import { site } from '@/data/site';

	const work = [
		{ name: site.work.name, href: site.work.url, text: 'Full-stack on the customer dashboard for real-time voice AI.', when: '2023 – now' },
		{ name: 'Freelance', text: 'Web apps for clients, mostly in Svelte.', when: '2023 – now' },
		{ name: 'Epitech', text: "Master's in computer science.", when: 'Student' }
	];
</script>

<svelte:head>
	<title>About · Mathis</title>
	<meta name="description" content="Mathis is a design engineer in France, at Reecall since 2023, who ports the interface libraries he likes to Svelte 5." />
</svelte:head>

<main class="relative z-10">
	<header class="flex h-[300px] items-end px-4 pb-2 lg:h-[460px] lg:px-11 lg:pb-4">
		<h1 class="display text-[80px] lg:text-[160px]"><Scramble text="about" /></h1>
	</header>

	<div class="flex max-w-[728px] flex-col gap-12 px-5 pt-8 pb-16 lg:gap-16 lg:px-12 lg:pt-16 lg:pb-28">
		<div class="reveal flex flex-col gap-4 text-[18px] leading-[27px] tracking-[-0.012em] text-default lg:text-[20px] lg:leading-[30px]" style:--delay="120ms" style:--rise="10px">
			<p>
				<span class="text-strong">I'm Mathis, a design engineer in France.</span> I study computer science at Epitech, and since 2023 I've built the
				customer dashboard at Reecall, where AI voice agents answer and place calls.
			</p>
			<p>On the side I freelance, and I port the interface libraries I like to Svelte 5.</p>
		</div>

		<section class="reveal flex flex-col gap-6" aria-labelledby="work" style:--delay="190ms" style:--rise="6px">
			<h2 id="work" class="text-[13px] font-normal text-subtle">Work</h2>
			{#each work as item (item.name)}
				<div class="flex flex-col gap-1">
					<div class="flex items-baseline justify-between gap-6">
						{#if item.href}
							<a href={item.href} target="_blank" rel="noreferrer" class="text-[16px] leading-5 font-medium text-strong hover:underline">{item.name}</a>
						{:else}
							<span class="text-[16px] leading-5 font-medium text-strong">{item.name}</span>
						{/if}
						<span class="shrink-0 text-[13px] text-subtle tabular-nums">{item.when}</span>
					</div>
					<p class="text-[15px] leading-[23px] text-default">{item.text}</p>
				</div>
			{/each}
		</section>

		<section class="reveal flex flex-col gap-4" aria-labelledby="stack" style:--delay="250ms" style:--rise="6px">
			<h2 id="stack" class="text-[13px] font-normal text-subtle">Stack</h2>
			<p class="text-[16px] leading-[26px] text-strong">Svelte, TypeScript, JavaScript, React, Rust and Go.</p>
			<p class="text-[15px] leading-6 text-default">With Tailwind, Motion, Vite, Supabase, PocketBase, Drizzle, Prisma, Vercel, Railway, Linear, Figma and Paper.</p>
		</section>

		<section class="reveal flex flex-col gap-4" aria-labelledby="elsewhere" style:--delay="300ms" style:--rise="6px">
			<h2 id="elsewhere" class="text-[13px] font-normal text-subtle">Elsewhere</h2>
			<div class="flex flex-wrap gap-x-7 gap-y-3 text-[16px] font-medium text-strong">
				<a href={site.github} target="_blank" rel="noreferrer" class="hover:underline">GitHub ↗</a>
				<a href={site.x} target="_blank" rel="noreferrer" class="hover:underline">X ↗</a>
				<a href="mailto:{site.email}" class="hover:underline">{site.email}</a>
			</div>
		</section>
	</div>

	<Footer />
</main>
