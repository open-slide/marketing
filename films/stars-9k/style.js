import { h } from '#lib/dom.js';

let uid = 0;

export const SERIF = "'Instrument Serif', 'Times New Roman', serif";
export const FONTS = [
  { family: 'Instrument Serif', weight: 400 },
  { family: 'Instrument Serif', weight: 400, italic: true },
];

// Warm paper, soft ink, one champagne-gold accent.
export const P = {
  paper: '#f7f4ee',
  ink: '#1d1b18',
  ink2: '#4b4740',
  muted: '#8c867b',
  hair: 'rgb(29 27 24 / 0.18)',
  gold: '#b0843a',
  goldSoft: 'rgb(176 132 58 / 0.16)',
};

export const PAPER_BG =
  'radial-gradient(120% 100% at 50% 38%, #fcfaf6 0%, #f5f1e9 62%, #ebe5d9 100%)';

export const paper = () => h('div', { class: 'fill', style: `background:${PAPER_BG}` });

// A five-point star centred on (0, 0), outer radius `R`.
export function starPoints(R, inner = 0.42) {
  const pts = [];
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    const r = k % 2 ? R * inner : R;
    pts.push(`${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`);
  }
  return pts.join(' ');
}

// The gold star ornament: an outline that can draw on, a fill that can fade
// in, and a ring that can bloom outward. `size` is the box in px.
export function goldStar(size) {
  const R = 46;
  const id = `gs${uid++}`;
  const outline = h('polygon', {
    points: starPoints(R),
    fill: 'none',
    stroke: P.gold,
    'stroke-width': 2.2,
    'stroke-linejoin': 'round',
    pathLength: 1,
    'stroke-dasharray': '1 1',
    'vector-effect': 'non-scaling-stroke',
  });
  const fill = h('polygon', {
    points: starPoints(R),
    fill: P.gold,
    'stroke-linejoin': 'round',
    stroke: P.gold,
    'stroke-width': 2,
    opacity: 0,
  });
  const ring = h('circle', {
    r: 60,
    fill: 'none',
    stroke: P.gold,
    'stroke-width': 1.4,
    opacity: 0,
    'vector-effect': 'non-scaling-stroke',
  });
  const halo = h('circle', { r: 90, fill: `url(#${id})`, opacity: 0 });
  const el = h(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '-50 -50 100 100',
      style: 'display:block;overflow:visible',
    },
    h(
      'defs',
      h(
        'radialGradient',
        { id },
        h('stop', { offset: '0', 'stop-color': '#e9cf95', 'stop-opacity': '0.55' }),
        h('stop', { offset: '1', 'stop-color': '#e9cf95', 'stop-opacity': '0' }),
      ),
    ),
    halo,
    ring,
    fill,
    outline,
  );
  return { el, outline, fill, ring, halo };
}
