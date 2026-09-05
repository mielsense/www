<script lang="ts">
	import {
		EvilBarChart,
		type ChartConfig
	} from '@/components/evilcharts/charts/layerchart-bar-chart/index.js';
	import { palette } from '@/data/palette';
	import { languages, repoCount } from '@/data/projects';

	// one series per language: a multi-color single series would render as a gradient inside each bar
	const key = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '_');


	const data = languages.map((l) => ({ language: l.language, [key(l.language)]: l.repos }));

	const config = Object.fromEntries(
		languages.map((l, i) => {
			const [light, dark] = palette[i % palette.length];
			return [key(l.language), { label: l.language, colors: { light: [light], dark: [dark] } }];
		})
	) satisfies ChartConfig;

	const top = Math.ceil(Math.max(...languages.map((l) => l.repos)) / 2) * 2;
	const ticks = Array.from({ length: top / 2 + 1 }, (_, i) => i * 2);

	const short: Record<string, string> = { TypeScript: 'TS', JavaScript: 'JS' };
</script>

<div class="chart -mx-2">
	<EvilBarChart
		{data}
		{config}
		stackType="stacked"
		renderStyle="dither"
		ditherVariant="gradient"
		bloom="low"
		barRadius={0}
		barCategoryGap={14}
		accessibility={{
			label: 'Primary language of each public repository',
			description: `Number of repositories by language across ${repoCount} public, non-fork repositories.`
		}}
		class="h-full w-full"
	>
		<EvilBarChart.XAxis dataKey="language" tickMargin={10} tickFormatter={(v) => short[String(v)] ?? String(v)} />
		<EvilBarChart.YAxis tickMargin={8} {ticks} tickFormatter={(v) => String(v)} />
		<EvilBarChart.Tooltip />
		{#each Object.keys(config) as k (k)}
			<EvilBarChart.Bar dataKey={k} />
		{/each}
	</EvilBarChart>
</div>

<style>
	.chart {
		block-size: clamp(11rem, 26dvh, 15rem);
	}

	@media (width > 700px) and (height <= 950px) {
		.chart {
			block-size: 11rem;
		}
	}
</style>
