import { impulse, prog } from '#lib/anim.js';
import { attr, h, set } from '#lib/dom.js';
import { inOutCubic, inOutQuart, outCubic, outExpo, swift } from '#lib/ease.js';
import { defineScene } from '#lib/scene.js';
import { FONT } from '#theme';
import { EYEBROW, REPO, UNIT } from '../copy.js';
import { goldStar, P, paper, SERIF } from '../style.js';
import { COUNT as CUE, ORN, SPANS } from '../timeline.js';

const FS = 380;
const LH = Math.round(FS * 1.2);
const WIN = 340;
const NUM_Y = 452;
const GAP = 46;
const LINE = 440;

// The trailing zeros each roll one full turn (0 → 9 → 0), landing together on
// the hit, and the thousands digit turns 8 → 9 at the very end: an odometer
// passing 8,999.
const ROLLS = [
  { from: CUE.roll + 0.5, to: CUE.hit }, // hundreds
  { from: CUE.roll + 0.25, to: CUE.hit - 0.02 }, // tens
  { from: CUE.roll, to: CUE.hit - 0.04 }, // units
];
const THOUSANDS = { from: CUE.hit - 0.62, to: CUE.hit };
const rollPos = (T, r) => 10 * inOutQuart(prog(T, r.from, r.to - r.from));

// A soft watch-like tick each time a digit passes the window, found by
// sampling the same curve the visuals use.
const TICKS = [];
for (const [k, r] of ROLLS.entries()) {
  let last = 0;
  for (let T = r.from; T <= r.to + 1e-6; T += 1 / 240) {
    const n = Math.floor(rollPos(T, r) + 0.5);
    if (n > last) {
      if (n < 10) TICKS.push([Math.round(T * 1000) / 1000, 'tick', 0.12 + k * 0.03]);
      last = n;
    }
  }
}

export default defineScene({
  name: 'count',
  span: SPANS.count,
  sfx: [
    [CUE.line - 0.05, 'swish', 0.25],
    ...TICKS,
    [THOUSANDS.to - 0.3, 'tick', 0.35],
    [CUE.hit, 'shimmer', 0.7],
    [CUE.out + 0.2, 'swish', 0.2],
  ],
  build(root) {
    const bg = paper();

    const eyebrow = h(
      'div',
      {
        style: `position:absolute;left:0;right:0;top:214px;display:flex;justify-content:center;align-items:center;gap:22px;white-space:nowrap;opacity:0`,
      },
      h('span', {
        text: REPO,
        style: `font-family:${FONT.mono};font-size:25px;letter-spacing:0.02em;color:${P.ink2}`,
      }),
      h('span', { style: `width:6px;height:6px;border-radius:50%;background:${P.gold}` }),
      h('span', {
        text: EYEBROW.toUpperCase(),
        style: `font-family:${FONT.sans};font-size:22px;font-weight:500;letter-spacing:0.32em;color:${P.muted}`,
      }),
    );

    const fade = 'linear-gradient(to bottom, transparent 0%, #000 9%, #000 91%, transparent 100%)';
    const probe = h('span', {
      text: '0',
      style: `font-family:${SERIF};font-size:${FS}px;line-height:1`,
    });
    root.append(probe);
    const DW = Math.ceil(probe.offsetWidth) + 4;
    probe.remove();

    // A window one glyph tall onto a strip with wider spacing, so only one
    // digit shows at rest and its neighbours stay hidden.
    const column = (digits, w = DW, mask = true) => {
      const strip = h(
        'div',
        { style: `position:absolute;left:0;top:${-(LH - WIN) / 2}px;width:100%` },
        ...digits.map((d) =>
          h('div', {
            text: String(d),
            style: `height:${LH}px;line-height:${LH}px;text-align:center`,
          }),
        ),
      );
      const el = h(
        'div',
        {
          style: `position:relative;width:${w}px;height:${WIN}px;overflow:hidden;${mask ? `-webkit-mask-image:${fade};mask-image:${fade}` : 'overflow:visible'}`,
        },
        strip,
      );
      return { el, strip };
    };
    const thou = column([8, 9]);
    const zeros = ROLLS.map(() => column([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]));
    const comma = column([','], 66, false);
    const cols = [thou.el, comma.el, ...zeros.map((z) => z.el)];
    const num = h(
      'div',
      {
        style: `position:absolute;left:0;right:0;top:${NUM_Y - WIN / 2}px;display:flex;justify-content:center;font-family:${SERIF};font-size:${FS}px;color:${P.ink};letter-spacing:-0.01em`,
      },
      ...cols,
    );

    const left = h('div', {
      style: `position:absolute;right:${1920 - ORN.x + GAP}px;top:${ORN.y}px;height:1.5px;width:${LINE}px;background:linear-gradient(to left, ${P.hair}, transparent);transform-origin:100% 50%`,
    });
    const right = h('div', {
      style: `position:absolute;left:${ORN.x + GAP}px;top:${ORN.y}px;height:1.5px;width:${LINE}px;background:linear-gradient(to right, ${P.hair}, transparent);transform-origin:0 50%`,
    });

    const star = goldStar(ORN.size);
    const starBox = h(
      'div',
      {
        style: `position:absolute;left:${ORN.x - ORN.size / 2}px;top:${ORN.y - ORN.size / 2}px;width:${ORN.size}px;height:${ORN.size}px`,
      },
      star.el,
    );

    const unit = h('div', {
      text: UNIT,
      style: `position:absolute;left:0;right:0;top:770px;text-align:center;font-family:${SERIF};font-style:italic;font-size:64px;color:${P.ink2};white-space:nowrap;opacity:0`,
    });

    root.append(bg, eyebrow, num, left, right, starBox, unit);
    return { eyebrow, num, cols, thou, zeros, left, right, star, unit };
  },
  update(s, _t, T) {
    const out = prog(T, CUE.out, 0.8, inOutCubic);

    const lp = prog(T, CUE.line, 1.6, outExpo);
    const retract = prog(T, CUE.out + 0.1, 0.8, inOutCubic);
    const sx = lp * (1 - retract);
    set(s.left, { transform: `scaleX(${sx})` });
    set(s.right, { transform: `scaleX(${sx})` });

    const ep = prog(T, CUE.eyebrow, 1.2, swift);
    set(s.eyebrow, {
      opacity: ep * (1 - out),
      transform: `translateY(${(1 - ep) * 14 - out * 10}px)`,
    });

    s.cols.forEach((el, i) => {
      const p = prog(T, CUE.number + i * 0.07, 1.4, outExpo);
      const o = prog(T, CUE.out + i * 0.04, 0.7, inOutCubic);
      set(el, {
        opacity: p * (1 - o),
        transform: `translateY(${(1 - p) * 40 - o * 18}px)`,
        filter: p < 1 || o > 0 ? `blur(${((1 - p) * 10 + o * 8).toFixed(2)}px)` : 'none',
      });
    });
    set(s.thou.strip, {
      transform: `translateY(${-inOutCubic(prog(T, THOUSANDS.from, THOUSANDS.to - THOUSANDS.from)) * LH}px)`,
    });
    s.zeros.forEach((z, i) => {
      set(z.strip, { transform: `translateY(${-rollPos(T, ROLLS[i]) * LH}px)` });
    });
    const settle = impulse(T, CUE.hit, 0.35);
    set(s.num, { transform: `scale(${1 + settle * 0.012})` });

    const st = s.star;
    attr(st.outline, 'stroke-dashoffset', (1 - prog(T, CUE.draw, 1.5, inOutCubic)).toFixed(4));
    const fp = prog(T, CUE.hit, 0.35, outCubic);
    attr(st.fill, 'opacity', fp.toFixed(3));
    const rp = prog(T, CUE.hit, 1.4, outExpo);
    attr(st.ring, 'r', (48 + rp * 90).toFixed(2));
    attr(st.ring, 'opacity', (T < CUE.hit ? 0 : 0.7 * (1 - rp)).toFixed(3));
    attr(st.halo, 'opacity', (fp * (0.45 + settle * 0.55)).toFixed(3));

    const up = prog(T, CUE.unit, 1.3, swift);
    set(s.unit, {
      opacity: up * (1 - out),
      transform: `translateY(${(1 - up) * 18 - out * 10}px)`,
    });
  },
});
