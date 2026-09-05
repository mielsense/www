<script lang="ts">
	/** Renders the registered `<Tooltip />` slot: the floating box, as a sibling of `<Svg>`. */
	import { getChartContext } from 'layerchart';
	import {
		ChartTooltip,
		ChartTooltipContent,
		type TooltipPayloadItem
	} from '@/components/evilcharts/ui/layerchart-tooltip/index.js';
	import { useBarChart } from './bar-chart-context.svelte.js';

	const chart = useBarChart();
	/** LayerChart's own context, to tell a hovered row from the `defaultIndex` one. */
	const layer = getChartContext();

	const slot = $derived(chart.slots.tooltip);

	/**
	 * Row shown when nothing is hovered — the reference's `defaultIndex`.
	 *
	 * LayerChart resolves its tooltip data as `dataProp ?? ctx.tooltip.data`, so passing `data`
	 * unconditionally pins the tooltip to that row forever: with `defaultIndex` set, hovering any
	 * other category still reported the default one. The hovered row therefore takes precedence
	 * here and `defaultRow` only fills in when nothing is hovered.
	 */
	const defaultRow = $derived(
		slot?.defaultIndex === undefined ? undefined : chart.data[slot.defaultIndex]
	);

	/** With a single series whose label is the category itself, the header would just repeat the row. */
	function repeatsLabel(row: Record<string, unknown>): boolean {
		const items = toPayload(row);
		const key = items[0]?.dataKey;
		if (items.length !== 1 || !key || !chart.xKey) return false;
		const label = chart.config[key]?.label;
		return typeof label === 'string' && label === row[chart.xKey];
	}

	function toPayload(row: Record<string, unknown>): TooltipPayloadItem[] {
		return chart.seriesKeys
			.filter((key) => row[key] != null)
			.map((key) => ({
				dataKey: key,
				name: key,
				value: row[key] as number | string,
				payload: row
			}));
	}
</script>

{#if slot && !chart.isLoading}
	<ChartTooltip data={layer.tooltip.data ?? defaultRow}>
		{#snippet children({ data })}
			<!-- Read inline rather than through a `{const}`: a declaration tag in a snippet body does
			     not re-derive when the snippet's argument changes, which froze the tooltip on the
			     first row it was shown for. -->
			<ChartTooltipContent
				active
				payload={toPayload(data as Record<string, unknown>)}
				label={chart.xKey ? ((data as Record<string, unknown>)[chart.xKey] as string) : undefined}
				hideLabel={repeatsLabel(data as Record<string, unknown>)}
				selected={chart.selectedDataKey}
				roundness={slot.roundness}
				variant={slot.variant}
			/>
		{/snippet}
	</ChartTooltip>
{/if}
