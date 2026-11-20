import github from '@/data/github.json';

/** Recent commits across the most recently pushed repos, newest first, without the sync bot's own. */
export const commits = github.commits.filter((c) => !c.message.startsWith('chore: sync github data'));
