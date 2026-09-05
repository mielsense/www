import {
	siDrizzle,
	siFigma,
	siGit,
	siGithub,
	siGo,
	siJavascript,
	siLinear,
	siPocketbase,
	siPrisma,
	siRailway,
	siReact,
	siRust,
	siSupabase,
	siSvelte,
	siTailwindcss,
	siTypescript,
	siVercel,
	siVite
} from 'simple-icons';

export type Tech = {
	name: string;
	path: string;
	viewBox?: string;
	/** Brand color. Omit to draw in the text color. */
	color?: string;
	/** GitHub language name, when the badge should link to the projects filtered by it. */
	lang?: string;
};

/** Near-black marks (Rust, GitHub, Vercel...) would vanish on the dark theme, so they follow the text color. */
const isDark = (hex: string) => {
	const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.2;
};

const brand = (icon: { title: string; path: string; hex: string }, name = icon.title): Tech => ({
	name,
	path: icon.path,
	color: isDark(icon.hex) ? undefined : `#${icon.hex}`
});

const withLang = (tech: Tech, lang = tech.name): Tech => ({ ...tech, lang });

export const code: Tech[] = [
	withLang(brand(siSvelte)),
	withLang(brand(siTypescript)),
	withLang(brand(siJavascript)),
	brand(siReact),
	withLang(brand(siRust)),
	withLang(brand(siGo)),
	brand(siTailwindcss, 'Tailwind'),
	{
		name: 'Motion',
		viewBox: '0 0 25.364 9',
		color: '#FFF312',
		path: 'M 9.587 0 L 4.57 9 L 0 9 L 3.917 1.972 C 4.524 0.883 6.039 0 7.301 0 Z M 20.794 2.25 C 20.794 1.007 21.817 0 23.079 0 C 24.341 0 25.364 1.007 25.364 2.25 C 25.364 3.493 24.341 4.5 23.079 4.5 C 21.817 4.5 20.794 3.493 20.794 2.25 Z M 10.443 0 L 15.013 0 L 9.997 9 L 5.427 9 Z M 15.841 0 L 20.411 0 L 16.494 7.028 C 15.887 8.117 14.372 9 13.11 9 L 10.825 9 Z'
	}
];

export const tools: Tech[] = [
	brand(siGit),
	brand(siGithub),
	brand(siVercel),
	brand(siRailway),
	brand(siSupabase),
	brand(siPocketbase),
	brand(siPrisma),
	brand(siDrizzle),
	brand(siVite),
	brand(siLinear),
	brand(siFigma),
	{
		name: 'Paper',
		viewBox: '0 0 21 21',
		path: 'M3 0H21V13H13V3H3ZM0 3H3V13H13V21H0Z'
	}
];
