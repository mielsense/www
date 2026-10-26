// Draws the site's icons and writes them to `src/lib/icons.ts`. Run `node scripts/icons.mjs` after
// changing a drawing; `--preview <file>` also writes an HTML contact sheet.
// The shape helpers and the glyph rules come from @benky/icons, so both sets share one hand.
import { writeFileSync } from 'node:fs';
import { siGithub, siX } from 'simple-icons';

const n = (value) => +value.toFixed(2);

/* Shapes. Each returns a node: [tag, attributes, children?]. */

/**
 * A polygon with soft corners, as path data. Each point is [x, y, radius?]. Corners are cubic
 * curves that start a little before a circular arc would and lean into the corner, the
 * "continuous" squircle corner; concave corners get the same treatment, so a sparkle's waist is a
 * smooth curve. A radius is shrunk when the edges either side are too short for it.
 */
function shape(points, radius = 2) {
    const pts = points.map(([x, y, r = radius]) => ({ x, y, r }));
    const count = pts.length;
    const corners = pts.map((c, i) => {
        const a = pts[(i + count - 1) % count];
        const b = pts[(i + 1) % count];
        const la = Math.hypot(a.x - c.x, a.y - c.y);
        const lb = Math.hypot(b.x - c.x, b.y - c.y);
        const ua = { x: (a.x - c.x) / la, y: (a.y - c.y) / la };
        const ub = { x: (b.x - c.x) / lb, y: (b.y - c.y) / lb };
        const theta = Math.acos(Math.max(-1, Math.min(1, ua.x * ub.x + ua.y * ub.y)));
        const half = Math.tan(theta / 2) || 1e-6;
        // Distance from the corner to where the curve starts: 1.2 times a circular arc's.
        let t = Math.min((c.r / half) * 1.2, la / 2, lb / 2);
        if (!c.r) t = 0;
        // Handle length: a circle's, lengthened a little so the corner fills out.
        const phi = Math.PI - theta;
        const h = Math.min(t, (4 / 3) * Math.tan(phi / 4) * half * 1.16 * t);
        return {
            s: [c.x + ua.x * t, c.y + ua.y * t],
            k1: [c.x + ua.x * (t - h), c.y + ua.y * (t - h)],
            k2: [c.x + ub.x * (t - h), c.y + ub.y * (t - h)],
            e: [c.x + ub.x * t, c.y + ub.y * t],
            sharp: t === 0,
            c
        };
    });
    const p = ([x, y]) => `${n(x)} ${n(y)}`;
    let d = `M${p(corners[0].s)}`;
    corners.forEach((corner, i) => {
        if (i) d += `L${p(corner.s)}`;
        d += corner.sharp ? `L${p([corner.c.x, corner.c.y])}` : `C${p(corner.k1)} ${p(corner.k2)} ${p(corner.e)}`;
    });
    return d + 'Z';
}

/** A rounded rectangle as path data, so it can share a path with holes. */
const rr = (x, y, w, h, r) =>
    shape(
        [
            [x, y],
            [x + w, y],
            [x + w, y + h],
            [x, y + h]
        ],
        Math.min(r, w / 2.4, h / 2.4)
    );

const circle = (cx, cy, r, extra = {}) => ['circle', { cx, cy, r, ...extra }];
const path = (d, extra = {}) => ['path', { d, ...extra }];

/** A filled shape with holes (any subpath inside another becomes a hole). */
const fill = (...d) => path(d.join(''), { 'fill-rule': 'evenodd', 'clip-rule': 'evenodd' });

/** Cut-out marks, drawn in black inside a mask: lines 2px with round ends, the glyph's detail weight. */
const cutLine = (d, width = 2) =>
    path(d, {
        fill: 'none',
        stroke: '#000',
        'stroke-width': width,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
    });
const cutFill = (d) => path(d, { fill: '#000' });
const cutCircle = (cx, cy, r) => circle(cx, cy, r, { fill: '#000' });

let maskCount = 0;
/**
 * Shapes with marks cut out of them. The mask id is written as `@name`; the Icon component makes
 * it unique per rendered icon so two icons on one page never share a mask.
 */
function cut(shapes, cuts, on = []) {
    const id = `@m${maskCount++}`;
    return [
        [
            'mask',
            { id, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 24, height: 24 },
            [['rect', { width: 24, height: 24, fill: '#fff' }], ...cuts]
        ],
        ['g', { mask: `url(${id})` }, shapes],
        ...on
    ];
}

/** A front shape laid over back shapes, with a clear gap around it (the stacked cards, the files). */
const over = (back, front, gap = 1.6, frontNodes = [fill(front)]) => [
    ...cut(back, [cutFill(front), cutLine(front, gap * 2)]),
    ...frontNodes
];

/** The outline accent of a glyph: a heavy round stroke (the back of a folder, a stand). */
const outline = (d, width = 2.2) =>
    path(d, {
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': width,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
    });
/** A filled shape whose joins are rounded by a stroke of the same colour (for curves `shape` can't draw). */
const soft = (d, width = 1.2) =>
    path(d, {
        fill: 'currentColor',
        'fill-rule': 'evenodd',
        'clip-rule': 'evenodd',
        stroke: 'currentColor',
        'stroke-width': width,
        'stroke-linejoin': 'round'
    });

/** Points around a centre, at [angle in degrees from 12 o'clock, distance, corner radius]. */
const around = (cx, cy, list) =>
    list.map(([angle, distance, r]) => {
        const a = ((angle - 90) * Math.PI) / 180;
        return [cx + distance * Math.cos(a), cy + distance * Math.sin(a), r];
    });

/** A four-pointed sparkle with soft tips and a curved waist. */
const sparkle = (cx, cy, r) =>
    shape(
        around(
            cx,
            cy,
            [0, 1, 2, 3].flatMap((i) => [
                [i * 90, r, r * 0.16],
                [i * 90 + 45, r * 0.34, r * 0.6]
            ])
        )
    );

const star = (cx, cy, outer, inner) =>
    shape(
        around(
            cx,
            cy,
            Array.from({ length: 10 }, (_, i) => [i * 36, i % 2 ? inner : outer, i % 2 ? inner * 0.3 : outer * 0.2])
        )
    );

function gear(cx, cy) {
    const points = [];
    for (let tooth = 0; tooth < 8; tooth++) {
        const a = tooth * 45;
        points.push([a - 9.5, 10, 1.1], [a + 9.5, 10, 1.1], [a + 17, 7.5, 1], [a + 28, 7.5, 1]);
    }
    return shape(around(cx, cy, points));
}

/** Rotates [x, y, r] points about a centre. */
const turn = (points, cx, cy, degrees) => {
    const a = (degrees * Math.PI) / 180;
    return points.map(([x, y, r]) => [
        cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a),
        cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a),
        r
    ]);
};

/** A crescent: the circle (x1, y1, r1) with the circle (x2, y2, r2) taken out, tips rounded. */
function crescent(x1, y1, r1, x2, y2, r2) {
    const d = Math.hypot(x2 - x1, y2 - y1);
    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const h = Math.sqrt(r1 * r1 - a * a);
    const mx = x1 + (a * (x2 - x1)) / d;
    const my = y1 + (a * (y2 - y1)) / d;
    const p1 = [mx + (h * (y2 - y1)) / d, my - (h * (x2 - x1)) / d];
    const p2 = [mx - (h * (y2 - y1)) / d, my + (h * (x2 - x1)) / d];
    return `M${n(p1[0])} ${n(p1[1])}A${r1} ${r1} 0 1 0 ${n(p2[0])} ${n(p2[1])}A${r2} ${r2} 0 0 1 ${n(p1[0])} ${n(p1[1])}Z`;
}

/** A page with its top-right corner folded over: the page, and the fold as its own piece. */
const pageBody = (x, y, w, h, f = 6.4) =>
    shape([
        [x, y, 4.2],
        [x + w - f, y, 1],
        [x + w, y + f, 1],
        [x + w, y + h, 4.2],
        [x, y + h, 4.2]
    ]);
const pageFold = (x, y, w, f = 6.4) =>
    shape([
        [x + w - f, y, 0.8],
        [x + w, y + f, 0.8],
        [x + w - f, y + f, 2.2]
    ]);

const roundCheck = (d = 'M8.2 12.3l2.6 2.6 5-5.2') => cutLine(d, 2.1);

/*
 * Glyphs, after the Benky rules: solid soft shapes filling about 19 of the 24 units, corners of
 * 4.2 to 5.6 on containers, details cut out as 2px round lines or 1.3 dots, a 1.6 gap between
 * overlapping parts, and heavy round outlines (2.2 to 2.4) only as an accent.
 */
const folder = shape([
    [2.4, 3.4, 3.4],
    [9.2, 3.4, 1.4],
    [11.4, 5.8, 1.4],
    [21.6, 5.8, 3.8],
    [21.6, 20.6, 4.6],
    [2.4, 20.6, 4.6]
]);
const speaker = soft(
    'M2.6 9.8c0-1 .8-1.8 1.8-1.8h2.2l4.6-3.7c.8-.6 1.9-.1 1.9.9v13.6c0 1-1.1 1.5-1.9.9L6.6 16H4.4c-1 0-1.8-.8-1.8-1.8z',
    1.2
);

const glyphs = {
    Home: cut(
        [
            fill(
                shape([
                    [12, 2.2, 1.6],
                    [22, 10.8, 1.5],
                    [20.2, 10.8, 0.6],
                    [20.2, 21.4, 4],
                    [3.8, 21.4, 4],
                    [3.8, 10.8, 0.6],
                    [2, 10.8, 1.5]
                ])
            )
        ],
        [cutLine('M9.9 17h4.2', 2.2)]
    ),
    Folder: cut([fill(folder)], [cutLine('M1 9.8h22', 1.6)]),
    Clock: cut([circle(12, 12, 9.6)], [cutLine('M12 7.2V12l3.2 2.1', 2.2)]),
    Calendar: cut(
        [fill(rr(2.4, 4, 19.2, 17.6, 5.2)), outline('M7.6 2.2v3.4M16.4 2.2v3.4', 2.6)],
        [
            cutLine('M1 9.6h22', 1.6),
            ...[7.6, 12, 16.4].map((x) => cutCircle(x, 13.5, 1.35)),
            ...[7.6, 12].map((x) => cutCircle(x, 17.3, 1.35))
        ]
    ),
    Mail: cut([fill(rr(2.2, 4.2, 19.6, 15.6, 5))], [cutLine('M6.6 9.4l4.3 3.2c.7.5 1.5.5 2.2 0l4.3-3.2', 2.1)]),
    Search: [...cut([circle(10.6, 10.6, 8.2)], [cutCircle(10.6, 10.6, 5.4)]), outline('M16.6 16.6l4.4 4.4', 3.2)],
    Sun: [
        circle(12, 12, 4.8),
        outline(
            'M12 2.4v1.6M12 20v1.6M2.4 12H4M20 12h1.6M5.2 5.2l1.1 1.1M17.7 17.7l1.1 1.1M5.2 18.8l1.1-1.1M17.7 6.3l1.1-1.1',
            2.4
        )
    ],
    Moon: [soft(crescent(11.6, 12.4, 9, 17.4, 6.8, 6.4), 1.4)],
    SoundOn: [speaker, outline('M16.4 9a4.4 4.4 0 0 1 0 6M19.2 6.2a8.4 8.4 0 0 1 0 11.6', 2.2)],
    SoundOff: [speaker, outline('M16.4 9.6l4.8 4.8M21.2 9.6l-4.8 4.8', 2.2)],
    Play: [
        fill(
            shape([
                [5.4, 2.6, 2.2],
                [21.4, 12, 2],
                [5.4, 21.4, 2.2]
            ])
        )
    ],
    Pause: [fill(rr(5, 3.4, 5.2, 17.2, 2.4)), fill(rr(13.8, 3.4, 5.2, 17.2, 2.4))],
    Music: [
        circle(6.6, 17.8, 3.6),
        circle(17, 15.8, 3.6),
        soft('M7.8 17.8V6.4c0-.8.5-1.5 1.3-1.7l9.6-2.5c1-.3 2 .5 2 1.5v12.1h-2.4V8.2l-8.1 2.1v7.5z', 0.8)
    ],
    Star: [
        fill(
            shape(
                around(
                    12,
                    12.8,
                    Array.from({ length: 10 }, (_, i) => [i * 36, i % 2 ? 5 : 10.2, i % 2 ? 1.5 : 2])
                )
            )
        )
    ],
    Briefcase: [
        outline('M8.6 6.6V5.6a2.2 2.2 0 0 1 2.2-2.2h2.4a2.2 2.2 0 0 1 2.2 2.2v1', 2.2),
        ...cut([fill(rr(2.2, 7, 19.6, 14, 4.8))], [cutLine('M1 12.8h22', 1.6)])
    ],
    Copy: over([fill(rr(8.2, 2.2, 13.6, 13.6, 4.4))], rr(2.2, 7.8, 13.8, 14, 4.4), 1.6),
    Rss: cut(
        [fill(rr(2.6, 2.6, 18.8, 18.8, 5.4))],
        [cutCircle(8.3, 15.7, 1.5), cutLine('M7.4 11.4a5.2 5.2 0 0 1 5.2 5.2M7.4 7a9.6 9.6 0 0 1 9.6 9.6', 2)]
    ),
    Commit: [...cut([circle(12, 12, 5.6)], [cutCircle(12, 12, 2.2)]), outline('M2.2 12h2.6M19.2 12h2.6', 2.4)],
    Globe: cut(
        [circle(12, 12, 9.6)],
        [
            cutLine(
                'M2 12h20M12 2.4c-2.4 2.5-3.6 5.7-3.6 9.6s1.2 7.1 3.6 9.6M12 2.4c2.4 2.5 3.6 5.7 3.6 9.6s-1.2 7.1-3.6 9.6',
                1.7
            )
        ]
    ),
    Sparkle: [fill(sparkle(10.4, 13.2, 8.6)), fill(sparkle(19, 5, 3.4))],
    Chart: [fill(rr(2.8, 11.6, 5, 9.6, 2)), fill(rr(9.5, 2.8, 5, 18.4, 2)), fill(rr(16.2, 7.6, 5, 13.6, 2))],
    Layers: [
        fill(
            shape([
                [12, 2.2, 2],
                [21.8, 7.8, 1.8],
                [12, 13.4, 2],
                [2.2, 7.8, 1.8]
            ])
        ),
        outline('M3.2 12.6l7.8 4.4c.6.4 1.4.4 2 0l7.8-4.4M3.2 16.8l7.8 4.4c.6.4 1.4.4 2 0l7.8-4.4', 2.3)
    ],
    Book: [
        fill('M11 6.3C9.3 4.9 7 4.2 4.6 4.2a2.2 2.2 0 0 0-2.2 2.2v10.4c0 1.2 1 2.2 2.2 2.2 2.3 0 4.5.7 6.4 2.1z'),
        fill('M13 6.3c1.7-1.4 4-2.1 6.4-2.1a2.2 2.2 0 0 1 2.2 2.2v10.4c0 1.2-1 2.2-2.2 2.2-2.3 0-4.5.7-6.4 2.1z')
    ],
    Wrench: [
        soft(
            'M14.8 2.6a5.6 5.6 0 0 0-5 7.5l-6.3 6.3a2.5 2.5 0 0 0 3.5 3.5l6.3-6.3a5.6 5.6 0 0 0 7.5-5c0-.7-.8-1-1.2-.5l-2.2 2.2a2 2 0 0 1-2.9-2.9l2.2-2.2c.5-.5.2-1.2-.4-1.2z',
            1.2
        )
    ],
    Chat: cut(
        [
            soft(
                'M12 3.4c5.3 0 9.6 3.6 9.6 8s-4.3 8-9.6 8c-1.2 0-2.3-.2-3.3-.5l-3.8 1.9c-.8.4-1.6-.3-1.4-1.1l.7-2.8C2.9 15.4 2.4 13.6 2.4 11.4c0-4.4 4.3-8 9.6-8z'
            )
        ],
        [cutCircle(7.9, 11.4, 1.4), cutCircle(12, 11.4, 1.4), cutCircle(16.1, 11.4, 1.4)]
    ),
    Gamepad: cut(
        [fill(rr(1.8, 5.8, 20.4, 12.8, 6))],
        [cutLine('M5.6 12.2h4.2M7.7 10.1v4.2', 2), cutCircle(15.4, 10.9, 1.3), cutCircle(17.9, 13.5, 1.3)]
    ),
    Terminal: cut([fill(rr(2.2, 3.4, 19.6, 17.2, 5))], [cutLine('M6.8 9.2l3 2.8-3 2.8', 2.1), cutLine('M12.6 15.4h4.4', 2.1)]),
    // Brand marks are drawn by their owners; they go through the same component.
    Github: [['g', { transform: 'translate(2.4 2.4) scale(.8)' }, [path(siGithub.path)]]],
    X: [['g', { transform: 'translate(3 3) scale(.75)' }, [path(siX.path)]]]
};

/* Line icons: 1.75px round strokes, for small controls inside other controls. */
const lines = {
    Check: 'M5 12.6l4.4 4.4L19 7.4',
    Close: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
    ArrowUpRight: 'M7 17 17 7M8.5 7H17v8.5',
    ArrowLeft: 'M19 12H5.5M11 6l-6 6 6 6',
    ChevronRight: 'M9.5 6.5 15 12l-5.5 5.5',
    Sidebar: [rr(3, 4.5, 18, 15, 3.6), 'M9.5 4.5v15'],
    Command: 'M9 9V6.5A2.5 2.5 0 1 0 6.5 9h11A2.5 2.5 0 1 0 15 6.5v11a2.5 2.5 0 1 0 2.5-2.5h-11A2.5 2.5 0 1 0 9 17.5z'
};

const lineAttributes = {
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 1.75,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
};
const lineIcon = (source) => [
    ['g', lineAttributes, (Array.isArray(source) ? source : [source]).map((part) => (typeof part === 'string' ? path(part) : part))]
];

const icons = {};
for (const [name, nodes] of Object.entries(glyphs)) icons[`${name}Icon`] = nodes;
for (const [name, source] of Object.entries(lines)) icons[`${name}Icon`] = lineIcon(source);

const literal = (value) => JSON.stringify(value).replace(/"([a-zA-Z_]\w*)":/g, '$1:');
writeFileSync(
    new URL('../src/lib/icons.ts', import.meta.url),
    [
        '// Generated by scripts/icons.mjs. Edit the drawings there, then run `node scripts/icons.mjs`.',
        '',
        '/** One SVG element on a 24px grid: tag, attributes and, for masks and groups, children. */',
        'export type IconNode = readonly [tag: string, attributes: Readonly<Record<string, string | number>>, children?: readonly IconNode[]];',
        'export type IconData = readonly IconNode[];',
        '',
        ...Object.entries(icons).map(([name, nodes]) => `export const ${name}: IconData = ${literal(nodes)};`),
        ''
    ].join('\n')
);
console.log(`${Object.keys(icons).length} icons`);

const previewAt = process.argv.indexOf('--preview');
if (previewAt > 0) {
    let id = 0;
    const render = (nodes) =>
        nodes
            .map(([tag, attrs, children]) => {
                const attr = Object.entries(attrs)
                    .map(([key, value]) => {
                        let text = String(value);
                        if (key === 'id') text = text.replace('@', `p${id}-`);
                        else text = text.replace(/url\(@(\w+)\)/, `url(#p${id}-$1)`);
                        return `${key}="${text}"`;
                    })
                    .join(' ');
                return `<${tag} ${attr}>${children ? render(children) : ''}</${tag}>`;
            })
            .join('');
    const sheet = (size) =>
        Object.entries(icons)
            .map(([name, nodes]) => {
                id++;
                return `<figure><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor">${render(nodes)}</svg><figcaption>${name.replace(/Icon$/, '')}</figcaption></figure>`;
            })
            .join('');
    writeFileSync(
        process.argv[previewAt + 1],
        `<!doctype html><meta charset="utf-8"><style>
body{font:12px -apple-system,system-ui;margin:16px;background:#fff;color:#5d5d5d}
section{display:grid;grid-template-columns:repeat(13,1fr);gap:6px;padding:10px;margin-bottom:12px}
figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 2px}
figcaption{color:#7f7f7f;font-size:10px}
.dark{background:#161616;color:#b4b4b4;border-radius:12px}
</style><section>${sheet(44)}</section><section>${sheet(16)}</section><section class="dark">${sheet(16)}</section>`
    );
}
