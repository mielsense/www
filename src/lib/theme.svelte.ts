import { browser } from '$app/environment';

const KEY = 'theme';

/** Mirrors the `.dark` class on `<html>`, which the inline script in app.html sets before paint. */
class Theme {
	dark = $state(false);

	constructor() {
		if (!browser) return;
		const root = document.documentElement;
		const sync = () => (this.dark = root.classList.contains('dark'));
		sync();
		new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class'] });
	}

	toggle() {
		const dark = !this.dark;
		document.documentElement.classList.toggle('dark', dark);
		try {
			localStorage.setItem(KEY, dark ? 'dark' : 'light');
		} catch {
			// no storage, the choice just won't persist
		}
	}
}

export const theme = new Theme();
