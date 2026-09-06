<script lang="ts">
	import {
		Calendar03Icon,
		Clock01Icon,
		Folder01Icon,
		GithubIcon,
		Home01Icon,
		Mail01Icon,
		Moon02Icon,
		MusicNote01Icon,
		NewTwitterIcon,
		RssIcon,
		Sun03Icon,
		VolumeHighIcon,
		VolumeOffIcon
	} from '@hugeicons/core-free-icons';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { HugeiconData } from '@/hugeicons-icon.svelte';
	import BarShader from '@/components/site/BarShader.svelte';
	import * as Command from '@/components/ui/command/index.js';
	import * as Kbd from '@/components/ui/kbd/index.js';
	import { featured, openSource } from '@/data/projects';
	import { site } from '@/data/site';
	import HugeiconsIcon from '@/hugeicons-icon.svelte';
	import { palette } from '@/palette.svelte';
	import { player } from '@/player.svelte';
	import { sound } from '@/sound.svelte';
	import { theme } from '@/theme.svelte';

	// Raycast style: opens as a bare input, the list unfolds on ↓ or once you type.
	type Item = {
		label: string;
		hint?: string;
		keys?: string[];
		icon: HugeiconData;
		keywords?: string;
		run: () => void;
	};
	type Group = { label: string; items: Item[] };

	const open = (href: string) => window.open(href, '_blank', 'noopener,noreferrer');

	const groups = $derived<Group[]>([
		{
			label: 'pages',
			items: [
				{ label: 'home', icon: Home01Icon, keys: ['b'], run: () => goto('/') },
				{ label: 'now', hint: 'recent commits', icon: Clock01Icon, keys: ['n'], run: () => goto('/now') },
				{ label: 'projects', hint: 'everything, by year', icon: Folder01Icon, keys: ['p'], run: () => goto('/projects') }
			]
		},
		{
			label: 'actions',
			items: [
				{
					label: theme.dark ? 'switch to light' : 'switch to dark',
					keywords: 'theme dark light mode',
					icon: theme.dark ? Sun03Icon : Moon02Icon,
					run: () => theme.toggle()
				},
				{
					label: sound.enabled ? 'mute sounds' : 'unmute sounds',
					keywords: 'sound volume audio',
					icon: sound.enabled ? VolumeOffIcon : VolumeHighIcon,
					run: () => sound.toggle()
				},
				{
					label: player.playing ? 'pause the music' : 'play the music',
					hint: `${site.track.title}, ${site.track.artist}`,
					keywords: 'music song track spotify',
					icon: MusicNote01Icon,
					run: () => player.toggle()
				},
				{ label: 'book a call', hint: '15 minutes on cal.com', icon: Calendar03Icon, run: () => open(site.cal) },
				{
					label: 'copy email',
					hint: site.email,
					keywords: 'mail contact',
					icon: Mail01Icon,
					run: () => navigator.clipboard.writeText(site.email)
				}
			]
		},
		{
			label: 'links',
			items: [
				{ label: 'github', hint: `@${site.handle}`, icon: GithubIcon, run: () => open(site.github) },
				{ label: 'x', hint: `@${site.handle}`, keywords: 'twitter', icon: NewTwitterIcon, run: () => open(site.x) },
				{ label: 'rss feed', hint: 'the commits behind /now', icon: RssIcon, run: () => open(`${site.url}/rss.xml`) }
			]
		},
		{
			label: 'projects',
			items: [...featured, ...openSource.filter((p) => !featured.includes(p))].map((p) => ({
				label: p.name,
				hint: p.description,
				keywords: p.lang ?? '',
				icon: Folder01Icon,
				run: () => open(p.url)
			}))
		}
	]);

	let query = $state('');
	let armed = $state(false);
	let highlighted = $state<Item | undefined>();
	const expanded = $derived(armed || query.length > 0);

	const haystack = (item: Item) => `${item.label} ${item.hint ?? ''} ${item.keywords ?? ''}`.toLowerCase();
	const visible = $derived.by((): Group[] => {
		const q = query.trim().toLowerCase();
		return groups.map((g) => ({ ...g, items: g.items.filter((i) => haystack(i).includes(q)) })).filter((g) => g.items.length);
	});

	function run(item: Item) {
		palette.open = false;
		item.run();
	}

	function onInputKey(event: KeyboardEvent) {
		if (!expanded && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
			event.preventDefault();
			event.stopPropagation();
			armed = true;
			return;
		}
		if (event.key === 'Enter' && expanded && highlighted) {
			event.preventDefault();
			event.stopPropagation();
			run(highlighted);
			return;
		}
		// first Escape folds the list back, a second one closes the dialog
		if (event.key === 'Escape' && expanded) {
			event.preventDefault();
			event.stopPropagation();
			query = '';
			armed = false;
		}
	}

	function onWindowKey(event: KeyboardEvent) {
		if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			palette.open = !palette.open;
		}
	}

	$effect(() => {
		if (!palette.open) {
			query = '';
			armed = false;
			highlighted = undefined;
		}
	});

	// the footer hint follows the page so the palette never offers where you already are
	const here = $derived(page.url.pathname);
</script>

<svelte:window onkeydown={onWindowKey} />

<Command.DialogRoot bind:open={palette.open}>
	<Command.DialogPopup
		aria-label="Command palette"
		class="isolate max-w-3xl overflow-hidden border-white/10 bg-popover/75 shadow-2xl/20 ring-1 ring-white/5 backdrop-blur-[28px] backdrop-saturate-150 ring-inset before:hidden dark:border-white/10 dark:bg-popover/60"
	>
		<BarShader class="inset-x-0 top-0 h-16 [mask-image:linear-gradient(#000,transparent)]" />
		<Command.Root
			items={visible}
			value={query}
			onValueChange={(next) => (query = next)}
			itemToStringValue={(item: Item) => item.label}
			filter={null}
			onItemHighlighted={(item: Item | undefined) => (highlighted = item)}
		>
			<Command.Input placeholder="what do you need?" onkeydowncapture={onInputKey} />

			<!-- unfolds by animating a max-height cap, which needs no measuring and no grid tracks -->
			<div
				class={[
					'overflow-hidden transition-[max-height,opacity] duration-200 ease-(--ease-out) motion-reduce:transition-none',
					expanded ? 'max-h-[min(38dvh,17rem)] opacity-100' : 'max-h-0 opacity-0'
				]}
			>
				<div inert={!expanded}>
					<Command.List class="max-h-[min(38dvh,17rem)] border-t">
						<Command.Empty class="py-8 text-center text-sm text-muted-foreground empty:hidden">nothing for "{query}"</Command.Empty>
						<Command.Collection>
							{#snippet children(group: Group)}
								<Command.Group items={group.items}>
									<Command.GroupLabel class="font-pixel text-[0.75rem] tracking-[0.04em] text-muted-foreground">
									# {group.label}
									</Command.GroupLabel>
									<Command.Collection>
										{#snippet children(item: Item)}
											<Command.Item
												value={item}
												class="group gap-2.5 rounded-md py-1.5 data-highlighted:bg-foreground/[0.06]"
												onclick={() => run(item)}
											>
												<span class="flex size-6 shrink-0 items-center justify-center text-muted-foreground group-data-highlighted:text-foreground">
													<HugeiconsIcon icon={item.icon} size={15} strokeWidth={1.75} aria-hidden="true" />
												</span>
												<span class="min-w-0 flex-1 truncate">{item.label}</span>
												{#if item.hint}
													<span class="min-w-0 max-w-[45%] truncate text-xs text-muted-foreground">{item.hint}</span>
												{/if}
												{#if item.keys && !here.endsWith(item.label === 'home' ? '' : item.label)}
													<Kbd.Group class="shrink-0" aria-hidden="true">
														{#each item.keys as key (key)}<Kbd.Root>{key}</Kbd.Root>{/each}
													</Kbd.Group>
												{/if}
											</Command.Item>
										{/snippet}
									</Command.Collection>
								</Command.Group>
							{/snippet}
						</Command.Collection>
					</Command.List>
				</div>
			</div>

			<Command.Footer class="flex items-center gap-4 text-xs text-muted-foreground">
				{#if expanded}
					<span class="inline-flex items-center gap-1.5"><Kbd.Group><Kbd.Root>↑</Kbd.Root><Kbd.Root>↓</Kbd.Root></Kbd.Group> move</span>
					<span class="inline-flex items-center gap-1.5"><Kbd.Root>↵</Kbd.Root> run</span>
				{:else}
					<span class="inline-flex items-center gap-1.5"><Kbd.Root>↓</Kbd.Root> browse</span>
					<span class="inline-flex items-center gap-1.5">type to search</span>
				{/if}
				<span class="ms-auto inline-flex items-center gap-1.5"><Kbd.Root>esc</Kbd.Root> close</span>
			</Command.Footer>
		</Command.Root>
	</Command.DialogPopup>
</Command.DialogRoot>
