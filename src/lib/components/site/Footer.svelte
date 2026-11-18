<script lang="ts">
	import { site } from '@/data/site';
</script>

<footer class="flex flex-col gap-2 px-5 pt-4 pb-10 text-[13px] sm:flex-row-reverse sm:justify-between lg:px-12">
	<span class="text-subtle">
		<a href={site.github} target="_blank" rel="noreferrer" class="hover:text-strong">GitHub</a> ·
		<a href={site.x} target="_blank" rel="noreferrer" class="hover:text-strong">X</a> ·
		<a href="mailto:{site.email}" class="hover:text-strong">Email</a>
	</span>
	<span class="text-faint">© {new Date().getFullYear()} {site.name}, design engineer</span>
</footer>
