import { impulse, prog } from '#lib/anim.js';
import { h, set, text } from '#lib/dom.js';
import { clamp, glide, inOutCubic, outBack, outExpo, swift } from '#lib/ease.js';
import { typeOn, withCommas } from '#lib/fx.js';
import { defineScene } from '#lib/scene.js';
import { FONT } from '#theme';
import { icon } from '#ui/icons.js';
import { COMMENT, MILESTONE, PROMPT, REPO, TILES, UNIT } from '../copy.js';
import { COLS, cross, FRAME, frameLines, GRADIENT, hline, MID, P, vline } from '../style.js';
import { HERO as CUE, SPANS } from '../timeline.js';

const NUM = 280;
const SHRINK = 0.6;
const PAD = 40;

// The count lands on 9,000 exactly on the bar, easing out like a fine dial.
const countAt = (T) => {
  const p = prog(T, CUE.count, CUE.hit - CUE.count);
  return MILESTONE * (1 - (1 - p) ** 4);
};
const TICKS = [];
for (let T = CUE.count + 0.1; T < CUE.hit - 0.05; T += 0.125) {
  TICKS.push([Math.round(T * 1000) / 1000, 'tick', 0.1 + 0.15 * ((T - CUE.count) / 2.6)]);
}

const RECTS = {
  agent: { x: COLS[0], y: FRAME.y0, w: COLS[1] - COLS[0], h: MID - FRAME.y0 },
  canvas: { x: COLS[0], y: MID, w: COLS[1] - COLS[0], h: FRAME.y1 - MID },
  stars: { x: COLS[1], y: FRAME.y0, w: COLS[2] - COLS[1], h: FRAME.y1 - FRAME.y0 },
  inspect: { x: COLS[2], y: FRAME.y0, w: COLS[3] - COLS[2], h: MID - FRAME.y0 },
  oss: { x: COLS[2], y: MID, w: COLS[3] - COLS[2], h: FRAME.y1 - MID },
};
const ORDER = ['stars', 'agent', 'inspect', 'canvas', 'oss'];

function tile(key, visual) {
  const r = RECTS[key];
  const spec = TILES[key];
  const label = h(
    'div',
    {
      style: `display:flex;align-items:center;gap:12px;color:${P.gray};font-family:${FONT.mono};font-size:20px;letter-spacing:0.04em;text-transform:uppercase`,
    },
    icon(spec.icon, { size: 22, stroke: 1.75 }),
    h('span', { text: spec.label }),
  );
  const copy = spec.lead
    ? h(
        'div',
        {
          style: `font-family:${FONT.sans};font-size:29px;line-height:1.3;letter-spacing:-0.015em;font-weight:500;color:${P.gray}`,
        },
        h('span', { text: `${spec.lead} `, style: `color:${P.fg};font-weight:600` }),
        spec.rest,
      )
    : null;
  const inner = h(
    'div',
    {
      style: `position:absolute;inset:0;padding:${PAD - 4}px ${PAD}px ${PAD}px;display:flex;flex-direction:column;justify-content:space-between;opacity:0`,
    },
    label,
    h(
      'div',
      { style: 'flex:1;display:flex;align-items:center;justify-content:center' },
      visual ?? '',
    ),
    copy ?? '',
  );
  const el = h(
    'div',
    { style: `position:absolute;left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px` },
    inner,
  );
  return { el, inner };
}

export default defineScene({
  name: 'hero',
  span: SPANS.hero,
  sfx: [
    [CUE.lines, 'swish', 0.3],
    [CUE.badge + 0.05, 'pop', 0.3],
    ...TICKS,
    [CUE.hit - 1.2, 'swell', 0.5],
    [CUE.hit, 'shimmer', 0.6],
    [CUE.shrink + 0.1, 'whoosh', 0.35, { dur: 0.9 }],
    ...ORDER.map((_, i) => [CUE.tiles + i * 0.12, 'pop', 0.22]),
    ...[...PROMPT].map((_, i) => [CUE.type + i / 18, 'type', 0.35]),
    [CUE.select, 'click', 0.6],
    [CUE.comment, 'pop', 0.4],
    [CUE.apply, 'success', 0.45],
    [CUE.out + 0.2, 'swish', 0.25],
  ],
  build(root) {
    set(root, { background: P.bg });

    const { lines, crosses } = frameLines();
    const [top, bottom, left, right] = lines;
    const inner = [
      vline(COLS[1], FRAME.y0, FRAME.y1, '50% 0'),
      vline(COLS[2], FRAME.y0, FRAME.y1, '50% 0'),
      hline(MID, COLS[0], COLS[1], '100% 50%'),
      hline(MID, COLS[2], COLS[3], '0 50%'),
    ];
    const innerCross = [
      [COLS[1], FRAME.y0],
      [COLS[2], FRAME.y0],
      [COLS[1], FRAME.y1],
      [COLS[2], FRAME.y1],
    ].map(([x, y]) => cross(x, y, 16));

    const badge = h(
      'div',
      {
        style: `position:absolute;left:50%;top:258px;display:flex;align-items:center;gap:14px;height:58px;padding:0 26px 0 22px;border-radius:999px;background:#fff;box-shadow:0 0 0 1px ${P.line}, 0 2px 6px rgb(0 0 0 / 0.04);font-family:${FONT.mono};font-size:23px;color:${P.fg2};white-space:nowrap;opacity:0`,
      },
      icon('star', { size: 24, stroke: 1.75, color: P.fg, fill: P.fg }),
      h('span', { text: REPO }),
    );

    const numStyle = `font-family:${FONT.sans};font-size:${NUM}px;font-weight:700;letter-spacing:-0.035em;line-height:1;font-variant-numeric:tabular-nums;white-space:nowrap;padding:0 0.06em`;
    const numInk = h('div', { style: `${numStyle};color:${P.fg}` });
    const fadeMask = 'linear-gradient(90deg, #000 40%, transparent 60%)';
    const numGrad = h('div', {
      class: 'abs',
      style: `${numStyle};left:0;top:0;width:100%;padding-bottom:0.25em;text-align:center;background:${GRADIENT};-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-mask-image:${fadeMask};mask-image:${fadeMask};-webkit-mask-size:250% 100%;mask-size:250% 100%;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat`,
    });
    const num = h('div', { style: 'position:relative;text-align:center' }, numInk, numGrad);
    const unit = h('div', {
      text: UNIT,
      style: `font-family:${FONT.sans};font-size:50px;font-weight:500;letter-spacing:-0.025em;color:${P.gray};margin-top:18px;opacity:0`,
    });
    const group = h(
      'div',
      {
        style: `position:absolute;left:0;top:0;width:1920px;display:flex;flex-direction:column;align-items:center`,
      },
      num,
      unit,
    );

    // Agent: a prompt box the agent's instruction types into.
    const typed = h('span');
    const caret = h('span', {
      style: `display:inline-block;width:2px;height:30px;margin-left:3px;background:${P.fg};vertical-align:-5px`,
    });
    const agent = tile(
      'agent',
      h(
        'div',
        {
          style: `width:100%;height:78px;display:flex;align-items:center;gap:14px;padding:0 22px;border-radius:14px;background:${P.wash};box-shadow:inset 0 0 0 1px ${P.line};font-family:${FONT.sans};font-size:26px;color:${P.fg2};white-space:nowrap;overflow:hidden`,
        },
        h('span', { text: '›', style: `font-family:${FONT.mono};color:${P.gray2}` }),
        h('span', {}, typed, caret),
      ),
    );

    const canvas = tile(
      'canvas',
      h(
        'div',
        {
          style: `position:relative;width:300px;height:169px;border-radius:10px;border:1.5px dashed ${P.gray2};display:grid;place-items:center;font-family:${FONT.mono};font-size:34px;letter-spacing:-0.02em;color:${P.fg}`,
        },
        '1920 × 1080',
      ),
    );

    // Inspector: select a headline, pin a comment, watch it get applied.
    const head = h('div', {
      text: 'Q3 Launch',
      style: `font-family:${FONT.sans};font-size:58px;font-weight:700;letter-spacing:-0.045em;line-height:1;color:${P.fg}`,
    });
    const sel = h('div', {
      style: `position:absolute;inset:-12px -16px;border:2px solid ${P.blue};border-radius:4px;opacity:0`,
    });
    const handles = [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ].map(([x, y]) =>
      h('div', {
        style: `position:absolute;left:${x * 100}%;top:${y * 100}%;width:10px;height:10px;margin:-5px 0 0 -5px;background:#fff;border:2px solid ${P.blue};border-radius:2px`,
      }),
    );
    sel.append(...handles);
    const bubbleIcon = h('span', { style: 'position:relative;width:22px;height:22px' });
    const bubbleDot = h('span', {
      class: 'abs',
      style: `width:22px;height:22px;border-radius:50%;background:${GRADIENT}`,
    });
    const bubbleCheck = h(
      'span',
      {
        class: 'abs',
        style: `width:22px;height:22px;border-radius:50%;background:${P.fg};display:grid;place-items:center;opacity:0`,
      },
      icon('check', { size: 14, stroke: 3, color: '#fff' }),
    );
    bubbleIcon.append(bubbleDot, bubbleCheck);
    const bubble = h(
      'div',
      {
        style: `position:absolute;left:62%;top:-78px;display:flex;align-items:center;gap:12px;padding:12px 18px 12px 14px;border-radius:14px 14px 14px 4px;background:#fff;box-shadow:0 0 0 1px ${P.line}, 0 8px 24px -8px rgb(0 0 0 / 0.18);font-family:${FONT.sans};font-size:23px;font-weight:500;color:${P.fg2};white-space:nowrap;opacity:0;transform-origin:0 100%`,
      },
      bubbleIcon,
      COMMENT,
    );
    const inspectBox = h(
      'div',
      { style: 'position:relative;margin-top:44px;margin-right:60px' },
      head,
      sel,
      bubble,
    );
    const inspect = tile('inspect', inspectBox);

    const oss = tile(
      'oss',
      h('div', {
        text: 'MIT',
        style: `font-family:${FONT.sans};font-size:120px;font-weight:700;letter-spacing:-0.06em;line-height:1;color:${P.fg}`,
      }),
    );
    const stars = tile('stars');
    const tiles = { stars, agent, inspect, canvas, oss };

    const content = h(
      'div',
      { class: 'fill' },
      ...lines,
      ...inner,
      ...crosses,
      ...innerCross,
      ...ORDER.map((k) => tiles[k].el),
      badge,
      group,
    );
    root.append(content);

    return {
      content,
      top,
      bottom,
      left,
      right,
      crosses,
      inner,
      innerCross,
      badge,
      bw: badge.offsetWidth,
      group,
      gh: group.offsetHeight,
      numInk,
      numGrad,
      unit,
      tiles,
      typed,
      caret,
      head,
      sel,
      bubble,
      bubbleCheck,
    };
  },
  update(s, _t, T) {
    // Frame: lines draw out from the centre, the + marks settle in.
    const lp = prog(T, CUE.lines, 1.4, outExpo);
    set(s.top, { transform: `scaleX(${lp})` });
    set(s.bottom, { transform: `scaleX(${lp})` });
    set(s.left, { transform: `scaleY(${lp})` });
    set(s.right, { transform: `scaleY(${lp})` });
    s.crosses.forEach((c, i) => {
      const p = prog(T, CUE.lines + 0.6 + i * 0.06, 0.6, swift);
      set(c, { opacity: p, transform: `rotate(${(1 - p) * 90}deg)` });
    });

    const bp = prog(T, CUE.badge, 1, swift);
    const bo = prog(T, CUE.badgeOut, 0.6, inOutCubic);
    set(s.badge, {
      opacity: bp * (1 - bo),
      transform: `translateX(${-s.bw / 2}px) translateY(${(1 - bp) * 12 - bo * 12}px)`,
      filter: bp < 1 ? `blur(${((1 - bp) * 6).toFixed(2)}px)` : 'none',
    });

    // The number: blur in while counting, gradient wipes across on the bar.
    const value = withCommas(Math.round(countAt(T)));
    text(s.numInk, value);
    text(s.numGrad, value);
    const np = prog(T, CUE.count, 0.9, swift);
    const pop = impulse(T, CUE.hit, 0.3);
    const wipe = prog(T, CUE.hit - 0.15, 0.9, inOutCubic);
    set(s.numInk, {
      opacity: wipe >= 1 ? 0 : np,
      filter: np < 1 ? `blur(${((1 - np) * 14).toFixed(2)}px)` : 'none',
    });
    const mp = `${((1 - wipe) * 100).toFixed(2)}% 0`;
    set(s.numGrad, {
      opacity: T < CUE.hit - 0.15 ? 0 : 1,
      maskPosition: mp,
      webkitMaskPosition: mp,
    });
    const up = prog(T, CUE.unit, 1, swift);
    set(s.unit, {
      opacity: up,
      transform: `translateY(${(1 - up) * 14}px)`,
      filter: up < 1 ? `blur(${((1 - up) * 6).toFixed(2)}px)` : 'none',
    });

    const sp = glide(prog(T, CUE.shrink, 1.1));
    const scale = (1 - sp * (1 - SHRINK)) * (1 + pop * 0.015);
    const cy = 548 + sp * 36;
    set(s.group, {
      transform: `translateY(${cy - s.gh / 2}px) scale(${scale})`,
      transformOrigin: `960px ${s.gh / 2}px`,
    });

    // Bento: the grid divides, then each tile fades up in turn.
    s.inner.forEach((el, i) => {
      const p = prog(T, CUE.grid + i * 0.08, 0.9, outExpo);
      set(el, { transform: `${i < 2 ? 'scaleY' : 'scaleX'}(${p})` });
    });
    s.innerCross.forEach((c, i) => {
      const p = prog(T, CUE.grid + 0.4 + i * 0.05, 0.5, swift);
      set(c, { opacity: p, transform: `rotate(${(1 - p) * 90}deg)` });
    });
    ORDER.forEach((k, i) => {
      const p = prog(T, CUE.tiles + i * 0.12, 0.9, swift);
      const o = prog(T, CUE.out + i * 0.08, 0.7, inOutCubic);
      set(s.tiles[k].inner, {
        opacity: p * (1 - o),
        transform: `translateY(${(1 - p) * 18 - o * 10}px)`,
        filter: p < 1 || o > 0 ? `blur(${((1 - p) * 8 + o * 8).toFixed(2)}px)` : 'none',
      });
    });

    text(s.typed, typeOn(PROMPT, T, CUE.type, 18));
    const typing = T >= CUE.type && T < CUE.type + PROMPT.length / 18 + 0.1;
    set(s.caret, { opacity: typing || Math.floor(T * 2.4) % 2 === 0 ? 1 : 0 });

    const selP = prog(T, CUE.select, 0.3, swift);
    set(s.sel, { opacity: T < CUE.select ? 0 : selP * (1 - prog(T, CUE.apply + 0.6, 0.4)) });
    const bp2 = prog(T, CUE.comment, 0.5, outBack(1.8));
    set(s.bubble, { opacity: clamp(bp2 * 2), transform: `scale(${0.6 + 0.4 * bp2})` });
    const ap = prog(T, CUE.apply, 0.5, swift);
    set(s.head, {
      color: ap > 0 ? `color-mix(in oklab, ${P.red} ${(ap * 100).toFixed(1)}%, ${P.fg})` : P.fg,
    });
    set(s.bubbleCheck, { opacity: ap });

    // Exit to white: the grid and the number go last.
    const out = prog(T, CUE.out + 0.5, 1, inOutCubic);
    set(s.content, { opacity: 1 - out });
  },
});
