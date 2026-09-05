import { commits } from '@/data/projects';
import { site } from '@/data/site';

export const prerender = true;

const escape = (text: string) =>
	text.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] ?? c);

export function GET() {
	const items = commits
		.map(
			(c) => `
		<item>
			<title>${escape(`${c.repo}: ${c.message}`)}</title>
			<link>${c.url}</link>
			<guid isPermaLink="true">${c.url}</guid>
			<pubDate>${new Date(c.date).toUTCString()}</pubDate>
		</item>`
		)
		.join('');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>${escape(`@${site.handle} · now`)}</title>
		<link>${site.url}/now</link>
		<description>${escape(`Recent commits by ${site.name}, straight from GitHub.`)}</description>
		<language>en</language>
		<atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml" />${items}
	</channel>
</rss>`;

	return new Response(xml, {
		headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
	});
}
