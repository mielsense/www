import { browser } from '$app/environment';
import { bind, play as cue, setEnabled, setVolume } from 'cuelume';

const PRESSABLE = 'a[href], button, [role="button"]';

const KEY = 'sound';

/** Interaction sounds from cuelume. The preference lives here; cuelume only applies it. */
class Sound {
	enabled = $state(true);

	constructor() {
		if (!browser) return;
		this.enabled = localStorage.getItem(KEY) !== 'off';
		setVolume(0.3);
		setEnabled(this.enabled);
		bind();
		// every link and button presses; toggles announce themselves through data-cuelume-toggle instead
		document.addEventListener(
			'pointerdown',
			(event) => {
				const target = event.target instanceof Element ? event.target.closest(PRESSABLE) : null;
				if (target && !target.hasAttribute('data-cuelume-toggle') && this.enabled) cue('press');
			},
			{ passive: true }
		);
	}

	toggle() {
		this.enabled = !this.enabled;
		setEnabled(this.enabled);
		if (this.enabled) cue('toggle');
		try {
			localStorage.setItem(KEY, this.enabled ? 'on' : 'off');
		} catch {
			// no storage, the choice just won't persist
		}
	}

}

export const sound = new Sound();
