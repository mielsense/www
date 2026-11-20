import { site } from '@/data/site';

export type Lang = 'en' | 'fr';

/** What a hover card says about a link: a sentence, and whether the thing is still being built. */
export type Card = { text: string; soon?: boolean };

/** A line in one of the lists: a name, a dotted leader, a short note on the right. */
export type Row = { name: string; note: string; href?: string; card?: Card };

const projects = {
	evilcharts: { name: 'evilcharts-sv', href: 'https://charts.miel.my' },
	coss: { name: 'coss-sv', href: 'https://coss.miel.my' },
	mielui: { name: 'mielui', href: 'https://ui.miel.my' },
	sileo: { name: 'sileo-svelte', href: 'https://sileo.miel.my' },
	mielwm: { name: 'mielwm', href: 'https://wm.miel.my' },
	onpar: { name: 'onpar', href: 'https://onpar.design' },
	benky: { name: 'benky', href: 'https://benky.space' },
	qali: { name: 'qali', href: 'https://github.com/mielsense/qali' }
};

export const copy = {
	en: {
		title: 'miel',
		description: site.description,
		role: 'Design engineer',
		other: { lang: 'fr' as Lang, href: '/fr', label: 'fr', aria: 'Voir la version française' },
		theme: { light: 'light', dark: 'dark', aria: (to: string) => `Switch to ${to} theme` },
		tweaks: { open: 'tweak', aria: 'Tweak the type and layout', title: 'Tweaks', type: 'Type', layout: 'Layout', font: 'Font', fonts: { allo: 'Allo', system: 'System', serif: 'Serif', mono: 'Mono' }, size: 'Size', weight: 'Weight', round: 'Roundness', opsz: 'Optical size', tracking: 'Tracking', leading: 'Leading', width: 'Width', sea: 'Sea', height: 'Height', cats: 'Cats', fish: 'Fish', speed: 'Speed', garden: 'Garden', wind: 'Wind', regrow: 'Grow another', perf: 'Performance', fps: 'FPS', auto: 'auto', reset: 'Reset' },
		work: {
			label: 'Work',
			rows: [
				{ name: site.work.name, note: 'Design engineer, since 2023', href: site.work.url, card: { text: 'AI voice agents that answer and place customer calls. I build the customer dashboard.' } },
				{ name: 'Freelance', note: 'Web apps, since 2023' },
				{ name: 'Epitech', note: "Master's in computer science", href: 'https://www.epitech.eu/', card: { text: 'Computer science school in France.' } }
			]
		},
		projects: {
			label: 'Projects',
			rows: [
				{ ...projects.evilcharts, note: 'Animated charts for Svelte 5', card: { text: 'Animated Svelte 5 chart components on LayerChart or Apache ECharts, installed through shadcn-svelte.' } },
				{ ...projects.coss, note: 'COSS UI, ported to Svelte 5', card: { text: 'An unofficial Svelte 5 port of COSS UI, built on Shards UI.' } },
				{ ...projects.mielui, note: 'Svelte 5 component library', card: { text: 'My Svelte 5 component library. The cards on this page come from it.' } },
				{ ...projects.sileo, note: 'A physics-based toast', card: { text: 'An opinionated toast component for Svelte, animated with springs.' } },
				{ ...projects.mielwm, note: 'Tiling window manager for macOS', card: { text: 'A tiling window manager for macOS that keeps every window on one endless canvas.' } },
				{ ...projects.onpar, note: 'Design review for pull requests, in progress', card: { text: 'Checks the rendered UI of every pull request against your design rules and Paper files.', soon: true } },
				{ ...projects.benky, note: 'Learning platform, in progress', card: { text: 'A learning platform for students.', soon: true } },
				{ ...projects.qali, note: 'Local-first calendar for macOS', card: { text: 'A local-first Google Calendar app for macOS.' } }
			]
		},
		links: {
			github: (n: string) => `${n} contributions in the last year.`,
			cal: 'A 15 minute call, booked on Cal.com.'
		},
		cards: { soon: 'In progress', stars: (n: number) => `${n} ${n === 1 ? 'star' : 'stars'}`, copy: 'Copy', copied: 'Copied' },
		stack: {
			label: 'Stack',
			rows: [
				{ name: 'Languages', note: 'Svelte, TypeScript, React, Rust, Go' },
				{ name: 'Interface', note: 'Tailwind, Motion, Vite' },
				{ name: 'Data', note: 'Supabase, PocketBase, Drizzle, Prisma' },
				{ name: 'Design', note: 'Figma, Paper' }
			]
		},
		lastCommit: (when: string) => `Last commit ${when}`,
		missing: { title: 'Not found', text: "This page isn't here. The address has a typo, or a cat knocked it off the table.", home: 'Go home' },
		broken: { title: 'Error', text: 'Something broke on the way here.', home: 'Go home' }
	},
	fr: {
		title: 'miel',
		description: 'Mathis, design engineer chez Reecall. À côté, il fait des bibliothèques Svelte 5 et d’autres projets.',
		role: 'Design engineer',
		other: { lang: 'en' as Lang, href: '/', label: 'en', aria: 'View the English version' },
		theme: { light: 'clair', dark: 'sombre', aria: (to: string) => `Passer au thème ${to}` },
		tweaks: { open: 'réglages', aria: 'Régler la typographie et la mise en page', title: 'Réglages', type: 'Typographie', layout: 'Mise en page', font: 'Police', fonts: { allo: 'Allo', system: 'Système', serif: 'Serif', mono: 'Mono' }, size: 'Taille', weight: 'Graisse', round: 'Arrondi', opsz: 'Taille optique', tracking: 'Approche', leading: 'Interligne', width: 'Largeur', sea: 'Mer', height: 'Hauteur', cats: 'Chats', fish: 'Poissons', speed: 'Vitesse', garden: 'Jardin', wind: 'Vent', regrow: 'En faire pousser un autre', perf: 'Performances', fps: 'IPS', auto: 'auto', reset: 'Réinitialiser' },
		work: {
			label: 'Expérience',
			rows: [
				{ name: site.work.name, note: 'Design engineer, depuis 2023', href: site.work.url, card: { text: 'Des agents vocaux IA qui décrochent et passent les appels des clients. J’y construis le tableau de bord client.' } },
				{ name: 'Freelance', note: 'Applications web, depuis 2023' },
				{ name: 'Epitech', note: 'Master en informatique', href: 'https://www.epitech.eu/', card: { text: 'École d’informatique en France.' } }
			]
		},
		projects: {
			label: 'Projets',
			rows: [
				{ ...projects.evilcharts, note: 'Graphiques animés pour Svelte 5', card: { text: 'Des composants de graphiques animés pour Svelte 5, sur LayerChart ou Apache ECharts, installés via shadcn-svelte.' } },
				{ ...projects.coss, note: 'COSS UI, porté vers Svelte 5', card: { text: 'Un portage non officiel de COSS UI vers Svelte 5, construit sur Shards UI.' } },
				{ ...projects.mielui, note: 'Bibliothèque de composants Svelte 5', card: { text: 'Ma bibliothèque de composants Svelte 5. Les cartes de cette page en viennent.' } },
				{ ...projects.sileo, note: 'Des toasts animés par la physique', card: { text: 'Un composant de toast pour Svelte, animé par des ressorts.' } },
				{ ...projects.mielwm, note: 'Gestionnaire de fenêtres pour macOS', card: { text: 'Un gestionnaire de fenêtres en mosaïque pour macOS, qui garde chaque fenêtre sur un canevas sans fin.' } },
				{ ...projects.onpar, note: 'Revue de design des pull requests, en cours', card: { text: 'Vérifie l’interface rendue de chaque pull request avec vos règles de design et vos fichiers Paper.', soon: true } },
				{ ...projects.benky, note: 'Plateforme d’apprentissage, en cours', card: { text: 'Une plateforme d’apprentissage pour les étudiants.', soon: true } },
				{ ...projects.qali, note: 'Calendrier local-first pour macOS', card: { text: 'Une app Google Calendar local-first pour macOS.' } }
			]
		},
		links: {
			github: (n: string) => `${n} contributions sur l’année écoulée.`,
			cal: 'Un appel de 15 minutes, réservé sur Cal.com.'
		},
		cards: { soon: 'En cours', stars: (n: number) => `${n} ${n === 1 ? 'étoile' : 'étoiles'}`, copy: 'Copier', copied: 'Copié' },
		stack: {
			label: 'Stack',
			rows: [
				{ name: 'Langages', note: 'Svelte, TypeScript, React, Rust, Go' },
				{ name: 'Interface', note: 'Tailwind, Motion, Vite' },
				{ name: 'Données', note: 'Supabase, PocketBase, Drizzle, Prisma' },
				{ name: 'Design', note: 'Figma, Paper' }
			]
		},
		lastCommit: (when: string) => `Dernier commit ${when}`,
		missing: { title: 'Introuvable', text: 'Cette page n’existe pas. L’adresse a une faute, ou un chat l’a fait tomber de la table.', home: 'Retour à l’accueil' },
		broken: { title: 'Erreur', text: 'Quelque chose a cassé en chemin.', home: 'Retour à l’accueil' }
	}
} satisfies Record<Lang, unknown>;

export const langOf = (path: string): Lang => (path === '/fr' || path.startsWith('/fr/') ? 'fr' : 'en');
