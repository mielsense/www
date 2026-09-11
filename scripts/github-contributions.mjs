// GitHub's public calendar includes both intensity levels and exact daily counts.
export function parseContributions(html) {
	const labels = new Map(
		[...html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)].map(
			([, attributes, text]) => [
				attributes.match(/\bfor="([^"]+)"/)?.[1],
				text.replace(/<[^>]*>/g, '').trim()
			]
		)
	);
	const days = [...html.matchAll(/<td\b([^>]*\bdata-date="[^"]+"[^>]*)>/g)]
		.map(([, attributes]) => {
			const date = attributes.match(/\bdata-date="([^"]+)"/)?.[1];
			const id = attributes.match(/\bid="([^"]+)"/)?.[1];
			const level = Number(attributes.match(/\bdata-level="([0-4])"/)?.[1]);
			const label = labels.get(id) ?? '';
			const match = label.match(/^(No|[\d,]+) contributions? on /);
			if (!date || !match || !Number.isInteger(level))
				throw new Error('Unrecognized GitHub contribution day');
			return {
				date,
				count: match[1] === 'No' ? 0 : Number(match[1].replaceAll(',', '')),
				level
			};
		})
		.sort((a, b) => a.date.localeCompare(b.date));
	if (
		days.length < 365 ||
		new Set(days.map((day) => day.date)).size !== days.length
	) {
		throw new Error('GitHub returned an incomplete contribution calendar');
	}
	return days;
}

export async function fetchContributions(user) {
	const response = await fetch(
		`https://github.com/users/${encodeURIComponent(user)}/contributions`,
		{
			headers: { 'User-Agent': `${user}-site-sync`, 'Accept-Language': 'en' },
			signal: AbortSignal.timeout(20_000)
		}
	);
	if (!response.ok)
		throw new Error(`GitHub contribution calendar: ${response.status}`);
	return parseContributions(await response.text());
}
