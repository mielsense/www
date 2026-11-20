import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// Mielui's ui.css loads Inter Tight for its default font. This site sets its own font, so those
// files would only ship unused; the imports resolve to an empty sheet instead. Geist Mono stays: it's
// the mono fallback off macOS.
const noFont = decodeURIComponent(new URL('./src/lib/assets/no-font.css', import.meta.url).pathname);

export default defineConfig({
	resolve: {
		alias: ['300', '400', '500'].map((w) => ({ find: `@fontsource/inter-tight/latin-${w}.css`, replacement: noFont }))
	},
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			alias: { '@': 'src/lib' },
			adapter: adapter({ runtime: 'nodejs22.x' })
		})
	]
});
