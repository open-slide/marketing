import { h } from '#lib/dom.js';

// Vercel-style monochrome with one warm gradient, on pure white.
export const P = {
  bg: '#ffffff',
  fg: '#0a0a0a',
  fg2: '#171717',
  gray: '#666666',
  gray2: '#8f8f8f',
  line: '#eaeaea',
  wash: '#fafafa',
  blue: '#0070f3',
  red: '#e5484d',
};

export const GRADIENT = 'linear-gradient(100deg, #ff4d4d 0%, #f9661f 45%, #f5a524 100%)';

// The blueprint frame every chapter sits on.
export const FRAME = { x0: 120, x1: 1800, y0: 180, y1: 900 };
export const COLS = [120, 660, 1260, 1800];
export const MID = 540;

export const hline = (y, x0 = 0, x1 = 1920, origin = '50% 50%') =>
  h('div', {
    style: `position:absolute;left:${x0}px;top:${y}px;width:${x1 - x0}px;height:1px;background:${P.line};transform-origin:${origin}`,
  });
export const vline = (x, y0 = 0, y1 = 1080, origin = '50% 50%') =>
  h('div', {
    style: `position:absolute;left:${x}px;top:${y0}px;width:1px;height:${y1 - y0}px;background:${P.line};transform-origin:${origin}`,
  });

// The "+" mark Vercel puts on grid intersections.
export function cross(x, y, size = 22) {
  const s = `position:absolute;background:${P.gray2}`;
  return h(
    'div',
    {
      style: `position:absolute;left:${x - size / 2 + 0.5}px;top:${y - size / 2 + 0.5}px;width:${size}px;height:${size}px`,
    },
    h('div', { style: `${s};left:0;top:${size / 2 - 0.5}px;width:${size}px;height:1px` }),
    h('div', { style: `${s};left:${size / 2 - 0.5}px;top:0;width:1px;height:${size}px` }),
  );
}

export function frameLines() {
  const lines = [hline(FRAME.y0), hline(FRAME.y1), vline(FRAME.x0), vline(FRAME.x1)];
  const crosses = [
    [FRAME.x0, FRAME.y0],
    [FRAME.x1, FRAME.y0],
    [FRAME.x0, FRAME.y1],
    [FRAME.x1, FRAME.y1],
  ].map(([x, y]) => cross(x, y));
  return { lines, crosses };
}
