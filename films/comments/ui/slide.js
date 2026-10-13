import { h, set, text } from '#lib/dom.js';
import { clamp, lerp } from '#lib/ease.js';
import { C, FONT } from '#theme';

const PAPER = '#f3f0e8';
const INKS = '#0c0c0c';
const GREY = 'oklch(0.52 0.01 80)';

export const BEFORE = 'Q3 was honestly a pretty great quarter for us, all things considered.';
export const AFTER = ['Best quarter.', 'Ever.'];

const BARS = [
  { q: "Q4 '25", before: 2.1, after: 2.1 },
  { q: 'Q1', before: 2.4, after: 2.4 },
  { q: 'Q2', before: 2.9, after: 2.9 },
  { q: 'Q3', before: 3.1, after: 4.2, est: true },
];
const MAX = 4.6;
const CHART = { x: 1080, y: 180, w: 700, h: 720 };
const PLOT = { x: 60, y: 150, w: 580, h: 470 };

// The page the film comments on: a board-review slide whose kicker,
// headline, and chart each get a comment, then get rewritten by the agent.
export function q3Slide() {
  const kicker = h('div', {
    text: 'NORTHFOLD — Q3 REVIEW',
    style: `position:absolute;left:140px;top:128px;font-family:${FONT.mono};font-size:30px;font-weight:500;letter-spacing:0.14em;white-space:nowrap;color:${GREY}`,
  });
  const before = h('div', {
    text: BEFORE,
    style: `position:absolute;left:0;top:0;width:820px;font-size:78px;font-weight:600;letter-spacing:-0.03em;line-height:1.06`,
  });
  const after = h(
    'div',
    {
      style: `position:absolute;left:0;top:0;font-size:140px;font-weight:800;letter-spacing:-0.055em;line-height:0.92;white-space:nowrap;opacity:0`,
    },
    AFTER[0],
    h('br'),
    h('span', { text: AFTER[1], style: `color:${C.brand}` }),
  );
  const head = h(
    'div',
    {
      style: `position:absolute;left:140px;top:300px;width:880px;height:340px;color:${INKS};font-family:${FONT.sans}`,
    },
    before,
    after,
  );
  const sub = h('div', {
    text: 'Revenue up 45% QoQ on the new self-serve tier.',
    style: `position:absolute;left:140px;top:720px;width:760px;font-size:34px;line-height:1.35;color:${GREY};font-family:${FONT.sans}`,
  });

  const bars = BARS.map((b, i) => {
    const slot = PLOT.w / BARS.length;
    const fill = h('div', {
      style: `position:absolute;left:0;right:0;bottom:0;border-radius:10px 10px 4px 4px;background:${INKS}`,
    });
    const hatch = h('div', {
      style: `position:absolute;left:0;right:0;bottom:0;border-radius:10px 10px 4px 4px;background:repeating-linear-gradient(135deg, oklch(0.8 0.01 80) 0 10px, oklch(0.88 0.008 80) 10px 20px);opacity:${b.est ? 1 : 0}`,
    });
    const value = h('div', {
      style: `position:absolute;left:0;right:0;text-align:center;font-family:${FONT.mono};font-size:28px;font-weight:600;color:${INKS};white-space:nowrap`,
    });
    const col = h(
      'div',
      {
        style: `position:absolute;left:${PLOT.x + slot * i + slot * 0.18}px;top:${PLOT.y}px;width:${slot * 0.64}px;height:${PLOT.h}px`,
      },
      fill,
      hatch,
      value,
    );
    const label = h('div', {
      text: b.q,
      style: `position:absolute;left:${PLOT.x + slot * i}px;top:${PLOT.y + PLOT.h + 22}px;width:${slot}px;text-align:center;font-family:${FONT.mono};font-size:24px;color:${GREY}`,
    });
    return { ...b, fill, hatch, value, col, label };
  });
  const chart = h(
    'div',
    {
      style: `position:absolute;left:${CHART.x}px;top:${CHART.y}px;width:${CHART.w}px;height:${CHART.h}px;border-radius:28px;background:#fffdf8;box-shadow:0 0 0 1px oklch(0 0 0 / 0.06), 0 30px 60px -30px oklch(0 0 0 / 0.25)`,
    },
    h('div', {
      text: 'Revenue',
      style: `position:absolute;left:60px;top:54px;font-family:${FONT.sans};font-size:40px;font-weight:700;letter-spacing:-0.02em;color:${INKS}`,
    }),
    h('div', {
      text: '$M, by quarter',
      style: `position:absolute;left:60px;top:104px;font-family:${FONT.mono};font-size:22px;color:${GREY}`,
    }),
    bars.map((b) => [b.col, b.label]),
  );
  const foot = h(
    'div',
    {
      style: `position:absolute;left:140px;right:140px;bottom:64px;display:flex;justify-content:space-between;font-family:${FONT.mono};font-size:22px;letter-spacing:0.08em;color:${GREY}`,
    },
    h('span', { text: 'northfold.co' }),
    h('span', { text: '04 / 12' }),
  );
  const root = h(
    'div',
    {
      style: `position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden;background:${PAPER};transform-origin:0 0`,
    },
    kicker,
    head,
    sub,
    chart,
    foot,
  );

  const RECTS = {
    kicker: { x: 140, y: 122, w: 452, h: 44 },
    head: { x: 140, y: 300, w: 820, h: 330 },
    chart: { x: CHART.x, y: CHART.y, w: CHART.w, h: CHART.h },
    bars: { x: CHART.x + 40, y: CHART.y + 130, w: CHART.w - 80, h: 540 },
  };

  return {
    root,
    rect: (name) => RECTS[name],
    // The kicker's box depends on the mono font's metrics; read it once the
    // slide is in the document.
    measure() {
      RECTS.kicker = { x: 134, y: 122, w: kicker.offsetWidth + 12, h: kicker.offsetHeight + 12 };
    },
    // Each edit blends 0 (as written) → 1 (after the agent's change).
    update({ head: hp = 0, chart: cp = 0, kicker: kp = 0 } = {}) {
      const a = clamp(hp);
      set(before, {
        opacity: 1 - a,
        filter: `blur(${a * 14}px)`,
        transform: `translateY(${-a * 20}px)`,
      });
      set(after, {
        opacity: a,
        filter: `blur(${(1 - a) * 14}px)`,
        transform: `translateY(${(1 - a) * 24}px)`,
      });
      for (const b of bars) {
        const v = lerp(b.before, b.after, clamp(cp));
        const hh = (v / MAX) * PLOT.h;
        set(b.fill, {
          height: hh,
          background: b.est ? (cp > 0.5 ? C.brand : INKS) : INKS,
          opacity: b.est ? clamp(cp * 2) : 1,
        });
        set(b.hatch, { height: hh, opacity: b.est ? 1 - clamp(cp * 2) : 0 });
        set(b.value, { bottom: hh + 12 });
        text(b.value, b.est && cp < 0.5 ? `~${v.toFixed(1)}` : v.toFixed(1));
      }
      set(kicker, {
        color: kp > 0 ? `color-mix(in oklch, ${GREY}, ${C.brand} ${clamp(kp) * 100}%)` : GREY,
      });
    },
  };
}
