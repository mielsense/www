<script lang="ts">
	import { Button, Folder, FpsGraph, List, Pane, Slider, ThemeUtils } from 'svelte-tweakpane-ui';
	import { copy, type Lang } from '@/copy';
	import { reset, tweaks, type Tweaks } from '@/tweaks.svelte';

	// The tweaks pane, opened from the header: a draggable Tweakpane in Tweakpane's own translucent
	// theme, which reads over both the light and the dark page. It remembers where it was put.
	// Type is open; the rest start folded so the pane stays small in its corner.
	let { lang }: { lang: Lang } = $props();
	const t = $derived(copy[lang].tweaks);
	const fonts = $derived((Object.keys(t.fonts) as Tweaks['font'][]).map((value) => ({ value, text: t.fonts[value] })));

	// Opens in the bottom right corner, out of the way of the text it changes. The draggable box
	// pads the pane by GAP on every side, which is also what keeps it GAP from the window's edges.
	const WIDTH = 320, HEIGHT = 408, GAP = 16;

	// Tweakpane's translucent theme, given more room: wider labels so none is cut, taller rows,
	// and more air inside and between the sections
	const theme = {
		...ThemeUtils.presets.translucent,
		baseBorderRadius: '10px',
		bladeBorderRadius: '4px',
		bladeHorizontalPadding: '6px',
		bladeValueWidth: '172px',
		containerHorizontalPadding: '8px',
		containerVerticalPadding: '8px',
		containerUnitSize: '22px',
		containerUnitSpacing: '6px'
	};

	const pct = (v: number) => `${Math.round(v * 100)}%`;
	const int = (v: number) => String(Math.round(v));
	// a new layout every time, never the one already showing
	const regrow = () => (tweaks.seed = (tweaks.seed + 1 + Math.floor(Math.random() * 9999)) % 10000);
</script>

<Pane
	position="draggable"
	title={t.title}
	x={Math.max(0, innerWidth - WIDTH - 2 * GAP)}
	y={Math.max(0, innerHeight - HEIGHT - 2 * GAP)}
	width={WIDTH + 2 * GAP}
	padding="{GAP}px"
	collapseChildrenToFit
	{theme}
	localStoreId="miel-tweaks-v4"
>
	<Folder title={t.type}>
		<List bind:value={tweaks.font} label={t.font} options={fonts} />
		<Slider bind:value={tweaks.size} label={t.size} min={0.85} max={1.3} step={0.01} format={pct} />
		<Slider bind:value={tweaks.weight} label={t.weight} min={300} max={700} step={10} format={int} />
		<Slider bind:value={tweaks.round} label={t.round} min={0} max={100} step={1} format={(v) => `${Math.round(v)}%`} disabled={tweaks.font !== 'allo'} />
		<!-- the left end hands the optical size back to the browser, which follows the font size -->
		<Slider bind:value={tweaks.opsz} label={t.opsz} min={8} max={32} step={1} format={(v) => (v < 9 ? t.auto : int(v))} disabled={tweaks.font !== 'allo'} />
		<Slider bind:value={tweaks.tracking} label={t.tracking} min={-0.04} max={0.08} step={0.001} format={(v) => `${(v * 100).toFixed(1)}%`} />
		<Slider bind:value={tweaks.leading} label={t.leading} min={1.2} max={2.2} step={0.05} format={(v) => v.toFixed(2)} />
	</Folder>
	<Folder title={t.layout} expanded={false}>
		<Slider bind:value={tweaks.width} label={t.width} min={34} max={60} step={1} format={(v) => `${Math.round(v)}rem`} />
		<Slider bind:value={tweaks.sea} label={t.height} min={200} max={720} step={10} format={(v) => `${Math.round(v)}px`} />
	</Folder>
	<Folder title={t.sea} expanded={false}>
		<Slider bind:value={tweaks.cats} label={t.cats} min={0} max={5} step={1} format={(v) => (v === 0 ? t.auto : int(v))} />
		<Slider bind:value={tweaks.fish} label={t.fish} min={0} max={2.5} step={0.05} format={pct} />
		<Slider bind:value={tweaks.speed} label={t.speed} min={0} max={2.5} step={0.05} format={(v) => `${v.toFixed(2)}×`} />
	</Folder>
	<Folder title={t.garden} expanded={false}>
		<Slider bind:value={tweaks.wind} label={t.wind} min={0} max={4} step={0.1} format={(v) => `${v.toFixed(1)}×`} />
		<Button title={t.regrow} on:click={regrow} />
	</Folder>
	<Folder title={t.perf} expanded={false}>
		<FpsGraph label={t.fps} rows={2} />
	</Folder>
	<Button title={t.reset} on:click={reset} />
</Pane>
