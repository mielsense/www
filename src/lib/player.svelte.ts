/** The one audio element on the site. The player registers it; the palette can toggle it. */
class Player {
	playing = $state(false);
	#audio: HTMLAudioElement | undefined;

	attach(audio: HTMLAudioElement | undefined) {
		this.#audio = audio;
	}

	toggle() {
		if (!this.#audio) return;
		if (this.#audio.paused) this.#audio.play();
		else this.#audio.pause();
	}
}

export const player = new Player();
