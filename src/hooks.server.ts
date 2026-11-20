import type { Handle } from '@sveltejs/kit';
import { langOf } from '@/copy';

// the page's language goes on <html>, prerendered pages included
export const handle: Handle = ({ event, resolve }) =>
	resolve(event, { transformPageChunk: ({ html }) => html.replace('%lang%', langOf(event.url.pathname)) });
