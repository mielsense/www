/** The chart palette, [light, dark] pairs. Sections and groups borrow it for their accent. */
export const palette: [light: string, dark: string][] = [
	['#ff2d55', '#ff375f'],
	['#ff6b1a', '#ff7a1f'],
	['#f5b800', '#ffd60a'],
	['#ff3fa4', '#ff5cb8'],
	['#a63cff', '#bf5af2'],
	['#0a84ff', '#409cff']
];

/** CSS value that follows the color scheme, for `--cell-accent`. */
export const accent = (index: number) => {
	const [light, dark] = palette[index % palette.length];
	return `light-dark(${light}, ${dark})`;
};
