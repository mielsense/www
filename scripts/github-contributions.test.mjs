import assert from 'node:assert/strict';
import test from 'node:test';
import {
	parseContributions,
	fetchContributions
} from './github-contributions.mjs';

function calendar() {
	return Array.from({ length: 365 }, (_, index) => {
		const date = new Date(Date.UTC(2025, 0, index + 1))
			.toISOString()
			.slice(0, 10);
		const count =
			index === 0
				? 'No contributions'
				: index === 1
					? '1 contribution'
					: '1,234 contributions';
		return `<td data-level="${index % 5}" id="day-${index}" data-date="${date}"></td>
			<tool-tip for="day-${index}">${count} on a day.</tool-tip>`;
	})
		.reverse()
		.join('');
}

test('reads exact counts and levels, sorted by date independently of HTML order', () => {
	const days = parseContributions(calendar());
	assert.equal(days.length, 365);
	assert.deepEqual(days.slice(0, 3), [
		{ date: '2025-01-01', count: 0, level: 0 },
		{ date: '2025-01-02', count: 1, level: 1 },
		{ date: '2025-01-03', count: 1234, level: 2 }
	]);
});

test('rejects missing calendars and changed tooltip markup instead of inventing zero counts', () => {
	assert.throws(
		() => parseContributions('<html>Unavailable</html>'),
		/incomplete/
	);
	assert.throws(
		() =>
			parseContributions(
				calendar().replace('No contributions on', 'Unknown on')
			),
		/Unrecognized/
	);
});

test('rejects duplicate dates', () => {
	assert.throws(
		() => parseContributions(calendar().replace('2025-01-02', '2025-01-01')),
		/incomplete/
	);
});

test('rejects an unsuccessful GitHub response', async (t) => {
	t.mock.method(
		globalThis,
		'fetch',
		async () => new Response('Unavailable', { status: 503 })
	);
	await assert.rejects(fetchContributions('mielsense'), /503/);
});
