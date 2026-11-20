/**
 * One preview card for the whole page, shared by every link and row that has one, the way
 * Mielui's tooltip shares one bubble. The first card waits a moment so passing over a link
 * doesn't open it; while one is open, the next trigger takes it over at once and the card glides
 * there, resizing and swapping its content. Right after it closes, the next one still opens at
 * once, so crossing a little text between two links doesn't restart the wait.
 */

export type Card = {
	id: string;
	title: string;
	text?: string;
	/** Small print at the foot, left: where the link goes. */
	host?: string;
	/** Small print at the foot, right: stars or "In progress". */
	meta?: string;
	/** The email card: the address and a copy button, in one row. */
	email?: { copy: string; copied: string };
	/** Rows put the card beside them; links in a sentence put it under. */
	side: 'right' | 'bottom';
};

export const preview = $state({
	card: null as Card | null,
	anchor: null as HTMLElement | null,
	open: false,
	/** The card was already open when this trigger took it over, so it moves instead of popping in. */
	glide: false,
	/** Opened from the keyboard: it appears and moves without animating, keyboard actions never wait on motion. */
	instant: false
});

const OPEN_DELAY = 200;
const CLOSE_DELAY = 140;
const WARM = 300;

let openTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;
let warmUntil = 0;

export function show(anchor: HTMLElement, card: Card, delay = OPEN_DELAY, instant = false) {
	clearTimeout(openTimer);
	clearTimeout(closeTimer);
	const go = () => {
		preview.glide = preview.open;
		preview.instant = instant;
		preview.anchor = anchor;
		preview.card = card;
		preview.open = true;
	};
	if (preview.open || delay === 0 || performance.now() < warmUntil) go();
	else openTimer = setTimeout(go, delay);
}

export function hide(delay = CLOSE_DELAY) {
	clearTimeout(openTimer);
	clearTimeout(closeTimer);
	if (!preview.open) return;
	const close = () => {
		preview.open = false;
		warmUntil = performance.now() + WARM;
	};
	// no delay closes now: a timer could be cancelled by the card sliding under the pointer
	if (delay === 0) close();
	else closeTimer = setTimeout(close, delay);
}

/** The pointer reached the card itself: keep it open. */
export function hold() {
	clearTimeout(closeTimer);
}
