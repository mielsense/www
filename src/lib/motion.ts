import { cubicBezier } from '@humanspeak/svelte-motion';
import { prefersReducedMotion } from 'svelte/motion';

// One easing and two durations for every state swap on the site. Reduced motion collapses them to instant.
export const easeOut = cubicBezier(0.23, 1, 0.32, 1);

const seconds = (s: number) => (prefersReducedMotion.current ? 0 : s);
export const swap = () => ({ duration: seconds(0.26), ease: easeOut });
export const quick = () => ({ duration: seconds(0.18), ease: easeOut });

// A label crossfading with a small lift and blur reads as one thing changing, not two overlapping.
export const shown = { opacity: 1, y: 0, filter: 'blur(0px)' };
export const below = { opacity: 0, y: 5, filter: 'blur(3px)' };
export const above = { opacity: 0, y: -5, filter: 'blur(3px)' };
export const grown = { opacity: 1, scale: 1 };
export const shrunk = { opacity: 0, scale: 0.5 };
