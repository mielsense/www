import { browser } from '$app/environment';
import { definePatch, ensureReady, setMasterVolume } from '@web-kits/audio';
import soft from '@/data/sounds-soft.json';
import type { SoundPatch } from '@web-kits/audio';

const PRESSABLE = 'a[href], button, [role="button"], [role="tab"]';
const KEY = 'sound';

// "soft" from @web-kits/audio: warm triangle tones with no sharp attack. Created on the first
// press, because browsers refuse an AudioContext made before a user gesture.
let patch: ReturnType<typeof definePatch> | undefined;

/**
 * Interaction sounds. Every link and button plays `tap` on press; elements can ask for another
 * sound with data-sound="toggle-on" and friends. No hover sounds.
 */
class Sound {
	enabled = $state(true);

	constructor() {
		if (!browser) return;
		this.enabled = localStorage.getItem(KEY) !== 'off';
		document.addEventListener(
			'pointerdown',
			(event) => {
				const target = event.target instanceof Element ? event.target.closest<HTMLElement>(PRESSABLE) : null;
				if (target) this.play(target.dataset.sound ?? 'tap');
			},
			{ passive: true }
		);
	}

	async play(name: string) {
		if (!this.enabled || !browser) return;
		await ensureReady();
		if (!patch) setMasterVolume(0.5);
		patch ??= definePatch(soft as SoundPatch);
		patch.play(name);
	}

	toggle() {
		this.enabled = !this.enabled;
		if (this.enabled) this.play('toggle-on');
		try {
			localStorage.setItem(KEY, this.enabled ? 'on' : 'off');
		} catch {
			// no storage, the choice just won't persist
		}
	}
}

export const sound = new Sound();
