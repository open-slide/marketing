import { h } from '#lib/dom.js';
import { clamp } from '#lib/ease.js';

export const PIX = "'Press Start 2P', monospace";
export const PIXS = "'Pixelify Sans', sans-serif";
export const FONTS = [
  { family: 'Press Start 2P', weight: 400 },
  { family: 'Pixelify Sans', weight: 500 },
  { family: 'Pixelify Sans', weight: 700 },
];

export const P = {
  night: '#0d0221',
  deep: '#1a0b3d',
  grid: '#ff2e88',
  yellow: '#ffd23f',
  cyan: '#3ef0ff',
  cream: '#fff4e0',
  brand: 'oklch(0.6 0.2 25)',
  ink: '#07010f',
};

export const CONFETTI = [P.yellow, P.cyan, P.grid, P.brand, P.cream, '#7cff6b'];

// Hard pixel shadow, stepped so it reads as blocks instead of a blur.
export const pixelShadow = (color, depth = 8, step = 4) =>
  Array.from(
    { length: depth / step },
    (_, i) => `${(i + 1) * step}px ${(i + 1) * step}px 0 ${color}`,
  ).join(', ');

export const blink = (T, hz = 2.5) => Math.floor(T * hz * 2) % 2 === 0;

// Old-TV power cycle. `on` is when the picture starts to open, `off` when it
// starts to collapse; both take ~0.3 s. Returns styles for the screen layer.
export function crt(T, on, off) {
  const DUR = 0.32;
  if (on != null && T < on + DUR) {
    const p = clamp((T - on) / DUR);
    const sx = clamp(p / 0.35);
    const sy = p < 0.35 ? 0.006 : 0.006 + 0.994 * ((p - 0.35) / 0.65) ** 0.6;
    return {
      transform: `scale(${sx}, ${sy})`,
      filter: `brightness(${1 + (1 - p) * 4}) saturate(${0.4 + p * 0.6})`,
      opacity: p > 0 ? 1 : 0,
    };
  }
  if (off != null && T >= off) {
    const q = clamp((T - off) / DUR);
    const sy = q < 0.55 ? 1 - 0.994 * (q / 0.55) ** 0.7 : 0.006;
    const sx = q < 0.55 ? 1 : 1 - clamp((q - 0.55) / 0.35);
    return {
      transform: `scale(${Math.max(0.002, sx)}, ${sy})`,
      filter: `brightness(${1 + q * 4}) saturate(${1 - q * 0.6})`,
      opacity: q >= 1 ? 0 : 1,
    };
  }
  return { transform: 'none', filter: 'none', opacity: 1 };
}

const STAR = [
  '.....#.....',
  '....###....',
  '....###....',
  '###########',
  '.#########.',
  '..#######..',
  '...#####...',
  '...##.##...',
  '..##...##..',
  '..#.....#..',
  '.#.......#.',
];

export function pixelStar(size, color) {
  const rects = [];
  STAR.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === '#') rects.push(h('rect', { x, y, width: 1.02, height: 1.02 }));
    });
  });
  return h(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 11 11',
      fill: color,
      'shape-rendering': 'crispEdges',
      style: 'display:block',
    },
    ...rects,
  );
}
