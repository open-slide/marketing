import { impulse, prog } from '#lib/anim.js';
import { attr, h, set } from '#lib/dom.js';
import { clamp, glide, inOutCubic, inOutSine, lerp, outCubic, outExpo, swift } from '#lib/ease.js';
import { withCommas } from '#lib/fx.js';
import { defineScene } from '#lib/scene.js';
import { EACH, MILESTONE } from '../copy.js';
import { goldStar, P, paper, SERIF } from '../style.js';
import { FIELD as CUE, ORN, SPANS } from '../timeline.js';

// One dot per star, 150 × 60, in the order they arrived: #1 top-left,
// #9,000 bottom-right, where the gold star sits.
const COLS = 150;
const ROWS = MILESTONE / COLS;
const PITCH = 10;
const R = 2.25;
const CENTER = { x: 960, y: 520 };
const WORLD = { w: (COLS - 1) * PITCH, h: (ROWS - 1) * PITCH };
const LAST = { x: WORLD.w, y: WORLD.h };
const END = { x: CENTER.x + WORLD.w / 2, y: CENTER.y + WORLD.h / 2 };
const Z0 = 9;
const BAND = 3.5;
const INK = [29, 27, 24];
const GOLD = [176, 132, 58];

const mix = (a, b, k) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(' ')})`;

function rowPath(r) {
  let d = '';
  const y = r * PITCH;
  for (let c = 0; c < COLS; c++) {
    if (r === ROWS - 1 && c === COLS - 1) continue;
    const x = c * PITCH;
    d += `M${x + R} ${y}a${R} ${R} 0 1 0 ${-2 * R} 0a${R} ${R} 0 1 0 ${2 * R} 0`;
  }
  return d;
}

// Where the camera is: the zoom, and where on screen star #9,000 sits.
function camera(T) {
  const p = glide(prog(T, CUE.zoom, CUE.zoomEnd - CUE.zoom));
  const z = Z0 ** (1 - p);
  const m = inOutCubic(p);
  return { p, z, sx: lerp(ORN.x, END.x, m), sy: lerp(ORN.y, END.y, m) };
}

export default defineScene({
  name: 'field',
  span: SPANS.field,
  sfx: [
    [CUE.zoom + 0.6, 'whoosh', 0.25, { dur: 2.4 }],
    [CUE.labels + 0.1, 'pop', 0.2],
    [CUE.sweep, 'swell', 0.25],
    [CUE.hit, 'shimmer', 0.75],
  ],
  build(root) {
    const bg = paper();
    const rows = Array.from({ length: ROWS }, (_, r) =>
      h('path', { d: rowPath(r), fill: mix(INK, GOLD, 0), 'fill-opacity': 0.2 }),
    );
    const world = h('g', {}, ...rows);
    const svg = h(
      'svg',
      { width: 1920, height: 1080, class: 'abs', style: 'overflow:visible' },
      world,
    );

    const star = goldStar(ORN.size);
    const starBox = h(
      'div',
      { class: 'abs', style: `width:${ORN.size}px;height:${ORN.size}px` },
      star.el,
    );

    const label = (txt, style) =>
      h('div', {
        text: txt,
        style: `position:absolute;font-family:${SERIF};font-style:italic;font-size:34px;color:${P.muted};white-space:nowrap;opacity:0;${style}`,
      });
    const first = label(
      'No. 1',
      `left:${CENTER.x - WORLD.w / 2 - 4}px;top:${CENTER.y - WORLD.h / 2 - 58}px`,
    );
    const last = label(
      `No. ${withCommas(MILESTONE)}`,
      `right:${1920 - END.x - 6}px;top:${END.y + 22}px;color:${P.gold}`,
    );

    const caption = h('div', {
      text: EACH,
      style: `position:absolute;left:0;right:0;top:902px;text-align:center;font-family:${SERIF};font-style:italic;font-size:60px;color:${P.ink2};white-space:nowrap;opacity:0`,
    });

    const content = h('div', { class: 'fill' }, svg, first, last, starBox, caption);
    root.append(bg, content);
    return { content, world, rows, star, starBox, first, last, caption };
  },
  update(s, _t, T) {
    const { p, z, sx, sy } = camera(T);
    attr(
      s.world,
      'transform',
      `translate(${sx.toFixed(3)} ${sy.toFixed(3)}) scale(${z.toFixed(5)}) translate(${-LAST.x} ${-LAST.y})`,
    );

    // Dots fade up around the star on the cut, then fill in, star by star,
    // in the order they arrived, landing on #9,000 on the bar.
    const appear = prog(T, CUE.zoom, 0.7, outCubic);
    const front = (ROWS + BAND) * inOutSine(prog(T, CUE.sweep, CUE.hit - CUE.sweep));
    s.rows.forEach((el, r) => {
      const d = clamp((front - r) / BAND);
      const lit = d * d * (3 - 2 * d);
      const glow = d > 0 && d < 1 ? Math.sin(d * Math.PI) : 0;
      attr(el, 'fill', mix(INK, GOLD, glow * 0.85));
      attr(el, 'fill-opacity', (appear * (0.2 + 0.46 * lit + glow * 0.14)).toFixed(3));
    });

    const hit = impulse(T, CUE.hit, 0.4);
    const size = lerp(ORN.size, 20, p) * (1 + hit * 0.25);
    set(s.starBox, {
      width: size,
      height: size,
      transform: `translate(${sx - size / 2}px, ${sy - size / 2}px)`,
    });
    attr(s.star.el, 'width', size.toFixed(2));
    attr(s.star.el, 'height', size.toFixed(2));
    attr(s.star.outline, 'stroke-dashoffset', 0);
    attr(s.star.fill, 'opacity', 1);
    const rp = prog(T, CUE.hit, 1.6, outExpo);
    attr(s.star.ring, 'r', (48 + rp * 150).toFixed(2));
    attr(s.star.ring, 'opacity', (T < CUE.hit ? 0 : 0.8 * (1 - rp)).toFixed(3));
    attr(s.star.halo, 'opacity', (0.45 * (1 - p) + hit * 0.9).toFixed(3));

    const lp = prog(T, CUE.labels, 1, swift);
    set(s.first, { opacity: lp, transform: `translateY(${(1 - lp) * 10}px)` });
    const lq = prog(T, CUE.hit - 0.2, 1, swift);
    set(s.last, { opacity: lq, transform: `translateY(${(1 - lq) * 10}px)` });

    const cp = prog(T, CUE.hit + 0.35, 1.3, swift);
    set(s.caption, { opacity: cp, transform: `translateY(${(1 - cp) * 18}px)` });

    const out = prog(T, CUE.out, 0.65, inOutCubic);
    set(s.content, { opacity: 1 - out, transform: `scale(${1 + out * 0.02})` });
  },
});
