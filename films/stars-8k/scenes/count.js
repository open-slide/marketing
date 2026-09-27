import { impulse, keys, prog } from '#lib/anim.js';
import { attr, h, set } from '#lib/dom.js';
import { clamp, outExpo, snap, swift } from '#lib/ease.js';
import { withCommas } from '#lib/fx.js';
import { hash } from '#lib/rand.js';
import { route } from '#lib/route.js';
import { defineScene, rectIn } from '#lib/scene.js';
import { cursor } from '#ui/cursor.js';
import { guides, selection } from '#ui/selection.js';
import { MILESTONE, REPO } from '../copy.js';
import { STARGAZERS } from '../stargazers.js';
import { blink, CONFETTI, crt, P, PIX, PIXS, pixelStar } from '../style.js';
import { ARRIVALS, ARRIVE, CRT_OFF, COUNT_HIT as HIT, POWER, SPANS } from '../timeline.js';

const FIRST = MILESTONE - ARRIVALS;
const PLAYERS = STARGAZERS.filter((s) => s.n >= FIRST && s.n <= MILESTONE);
const ROLL = ARRIVE.map((a, i) => (i ? Math.min(0.14, (a - ARRIVE[i - 1]) * 0.9) : 0.14));
const LAST_ROLL = 0.16;
const CUE = { click: 8.75, grab: 9.5, drag: 9.6, snapTo: 10.5, release: 10.9 };
const LH = 200;
const CY = 390;
const ROW = 80;
const ROWS = 4;
const HORIZON = 700;
const SEL_S = 1.8;
const PAD = 18;
const OFF = SPANS.count[1] - CRT_OFF;
const q = (v, g = 6) => Math.round(v / g) * g;

export default defineScene({
  name: 'count',
  span: SPANS.count,
  sfx: [
    [CUE.click, 'click', 1],
    [CUE.grab, 'grab', 0.8],
    [CUE.snapTo, 'snap', 0.7],
    [CUE.release, 'click', 0.6],
  ],
  build(root) {
    set(root, { background: '#000' });
    const screen = h('div', {
      class: 'fill',
      style: `background:linear-gradient(to bottom, ${P.night} 0%, ${P.deep} 58%, #3b0a45 ${(HORIZON / 1080) * 100}%, ${P.night} ${(HORIZON / 1080) * 100}%)`,
    });

    const stars = Array.from({ length: 70 }, (_, i) => {
      const s = 3 + Math.floor(hash(i * 3 + 1) * 3) * 2;
      const el = h('div', {
        style: `position:absolute;left:${Math.floor(hash(i * 7 + 2) * 1920)}px;top:${Math.floor(hash(i * 11 + 5) * (HORIZON - 40))}px;width:${s}px;height:${s}px;background:${i % 5 ? P.cream : P.cyan}`,
      });
      return { el, seed: i };
    });

    const glow = h('div', {
      style: `position:absolute;left:0;right:0;top:${HORIZON - 160}px;height:200px;background:radial-gradient(50% 100% at 50% 100%, rgb(255 46 136 / 0.45), transparent 70%)`,
    });
    const FLOOR = 1080 - HORIZON;
    const floor = h('svg', {
      width: 1920,
      height: FLOOR,
      style: `position:absolute;left:0;top:${HORIZON}px;overflow:visible`,
      stroke: P.grid,
      'stroke-width': 3,
      'shape-rendering': 'crispEdges',
    });
    for (let x = -2400; x <= 4320; x += 160) {
      floor.append(
        h('line', { x1: 960 + (x - 960) * 0.06, y1: 0, x2: x, y2: FLOOR, 'stroke-opacity': 0.75 }),
      );
    }
    const hlines = Array.from({ length: 12 }, () => {
      const l = h('line', { x1: 0, x2: 1920, y1: 0, y2: 0 });
      floor.append(l);
      return l;
    });
    floor.append(
      h('line', {
        x1: 0,
        x2: 1920,
        y1: 1,
        y2: 1,
        'stroke-width': 4,
        stroke: P.cream,
        'stroke-opacity': 0.6,
      }),
    );

    const oneUp = h('span', { text: '1UP', style: `color:${P.grid}` });
    const hud = h(
      'div',
      {
        style: `position:absolute;left:64px;right:64px;top:54px;display:flex;justify-content:space-between;align-items:center;font-family:${PIX};font-size:26px;white-space:nowrap`,
      },
      h(
        'div',
        { style: 'display:flex;gap:28px;align-items:center' },
        oneUp,
        h('span', { text: REPO, style: `color:${P.cream}` }),
      ),
      h('span', { text: `GOAL ${MILESTONE}`, style: `color:${P.yellow}` }),
    );

    const label = h('div', {
      text: 'GITHUB STARS',
      style: `position:absolute;left:0;right:0;top:176px;text-align:center;font-family:${PIX};font-size:34px;letter-spacing:0.08em;color:${P.cyan}`,
    });
    const banner = h('div', {
      style: `position:absolute;left:0;right:0;top:160px;display:flex;justify-content:center;font-family:${PIX};font-size:60px;white-space:nowrap;opacity:0`,
    });
    const bannerChars = [...'NEW HIGH SCORE!'].map((ch) => {
      const el = h('span', { text: ch === ' ' ? ' ' : ch, style: 'display:inline-block' });
      banner.append(el);
      return el;
    });

    const FS = LH * 0.95;
    const probe = h('span', {
      text: '0',
      style: `font-family:${PIX};font-size:${FS}px;line-height:1`,
    });
    root.append(probe);
    const DW = probe.offsetWidth;
    probe.remove();
    const col = () => {
      const strip = h(
        'div',
        { style: 'position:absolute;left:0;top:0;width:100%' },
        ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) =>
          h('div', {
            text: String(d),
            style: `height:${LH}px;line-height:${LH}px;text-align:center`,
          }),
        ),
      );
      const el = h(
        'div',
        { style: `position:relative;width:${DW}px;height:${LH}px;overflow:hidden` },
        strip,
      );
      return { el, strip };
    };
    const digits = Array.from({ length: 5 }, col);
    const num = h(
      'div',
      { style: `display:flex;font-family:${PIX};font-size:${FS}px;color:${P.yellow}` },
      ...digits.map((d) => d.el).reverse(),
    );
    const star = h(
      'div',
      { style: 'width:170px;height:170px;flex:none;margin-right:48px' },
      pixelStar(170, P.yellow),
    );
    const counter = h(
      'div',
      { style: 'position:absolute;left:50%;top:0;display:flex;align-items:center' },
      star,
      num,
    );

    const plus = ARRIVE.map((_, i) =>
      h('div', {
        text: '+1',
        style: `position:absolute;left:${q(i % 2 ? 1560 + hash(i * 5 + 9) * 220 : 90 + hash(i * 5 + 9) * 200)}px;top:0;font-family:${PIX};font-size:38px;color:${i % 2 ? P.cyan : P.cream};opacity:0`,
      }),
    );

    const TABLE_TOP = 596;
    const rowsClip = h('div', {
      style: `position:absolute;left:0;right:0;top:56px;height:${ROW * ROWS}px;overflow:hidden`,
    });
    const panel = h(
      'div',
      {
        style: `position:absolute;left:410px;top:${TABLE_TOP}px;width:1100px;height:${56 + ROW * ROWS + 12}px;background:rgb(7 1 15 / 0.9);box-shadow:0 0 0 6px ${P.cream}, 0 0 0 12px ${P.night}, 0 0 0 18px ${P.grid}`,
      },
      h(
        'div',
        {
          style: `display:flex;height:56px;align-items:center;padding:0 32px;font-family:${PIX};font-size:20px;color:${P.cyan}`,
        },
        h('span', { text: 'NO.', style: 'width:210px' }),
        h('span', { text: 'PLAYER' }),
      ),
      rowsClip,
    );
    const rows = PLAYERS.map((s) => {
      const champ = s.n === MILESTONE;
      const tag = h('span', {
        text: champ ? '8000TH!' : 'NEW',
        style: `margin-left:auto;padding:8px 12px;font-family:${PIX};font-size:18px;color:${P.ink};background:${champ ? P.yellow : P.cyan};opacity:0`,
      });
      const el = h(
        'div',
        {
          style: `position:absolute;left:0;right:0;top:0;height:${ROW}px;display:flex;align-items:center;padding:0 32px;white-space:nowrap`,
        },
        h('span', {
          text: `#${withCommas(s.n)}`,
          style: `width:210px;font-family:${PIX};font-size:24px;color:${champ ? P.brand : P.yellow}`,
        }),
        h('img', {
          src: s.src,
          style: `width:56px;height:56px;margin-right:24px;box-shadow:0 0 0 4px ${champ ? P.yellow : P.cream}`,
        }),
        h('span', {
          text: `@${s.login}`,
          style: `font-family:${PIXS};font-size:40px;font-weight:500;color:${P.cream}`,
        }),
        tag,
      );
      rowsClip.append(el);
      return { el, tag, champ };
    });

    const confetti = Array.from({ length: 110 }, (_, i) => {
      const s = 8 + Math.floor(hash(i * 13 + 4) * 3) * 5;
      const el = h('div', {
        style: `position:absolute;left:0;top:0;width:${s}px;height:${s}px;background:${CONFETTI[i % CONFETTI.length]};opacity:0`,
      });
      return {
        el,
        vx: (hash(i * 3 + 7) - 0.5) * 2200,
        vy: -500 - hash(i * 17 + 3) * 1100,
        delay: hash(i * 29 + 1) * 0.08,
      };
    });

    const layer = h('div', {
      class: 'abs',
      style: `width:${1920 / SEL_S}px;height:${1080 / SEL_S}px;transform:scale(${SEL_S});transform-origin:0 0`,
    });
    const sel = selection();
    const gd = guides(2);
    const cur = cursor();
    layer.append(gd.el, sel.el, cur.el);

    screen.append(
      ...stars.map((st) => st.el),
      glow,
      floor,
      hud,
      label,
      banner,
      counter,
      ...plus,
      panel,
      ...confetti.map((p) => p.el),
      layer,
    );
    root.append(screen);

    const cw = counter.offsetWidth;
    const nr = rectIn(num, root);
    const box = { cx: 960, cy: CY, w: cw, h: nr.h };
    const scaleAt = (T) =>
      keys(T, [
        [CUE.drag, 1],
        [CUE.snapTo, 1.14, swift],
      ]);
    const handle = (T) => {
      const s = scaleAt(T);
      return [(box.cx + (box.w * s) / 2 + PAD) / SEL_S, (box.cy + (box.h * s) / 2 + PAD) / SEL_S];
    };
    const path = route(
      [2000 / SEL_S, 1160 / SEL_S],
      [
        { at: CUE.click - 0.05, dur: 0.6, to: [(box.cx + 260) / SEL_S, (box.cy + 40) / SEL_S] },
        { at: CUE.grab - 0.05, dur: 0.55, to: handle, bend: -0.1 },
        { from: CUE.grab, until: CUE.release, fn: handle },
        { at: 11.5, dur: 0.7, to: [2000 / SEL_S, 1000 / SEL_S], ease: swift },
      ],
    );

    return {
      screen,
      stars,
      hlines,
      FLOOR,
      oneUp,
      label,
      banner,
      bannerChars,
      digits,
      num,
      star,
      counter,
      plus,
      rows,
      confetti,
      sel,
      gd,
      cur,
      path,
      box,
      scaleAt,
      cw,
    };
  },
  update(s, _t, T) {
    set(s.screen, crt(T, POWER.count, OFF));
    const post = T >= HIT;
    const punch = impulse(T, HIT, 0.3);

    s.stars.forEach((st) => {
      set(st.el, { opacity: hash(st.seed * 31 + Math.floor(T * 5)) > 0.2 ? 0.85 : 0.25 });
    });
    const flow = (T * 0.9) % 1;
    s.hlines.forEach((l, k) => {
      const u = (k + flow) / s.hlines.length;
      const y = Math.round(s.FLOOR * u ** 2.2);
      attr(l, 'y1', y);
      attr(l, 'y2', y);
      attr(l, 'stroke-opacity', (0.25 + 0.6 * u).toFixed(2));
    });
    set(s.oneUp, { opacity: blink(T, 1.5) ? 1 : 0 });

    let c = 0;
    ARRIVE.forEach((a, i) => {
      c += prog(T, a - ROLL[i], ROLL[i], snap);
    });
    c += prog(T, HIT - LAST_ROLL, LAST_ROLL, snap);
    const v = FIRST - 1 + c;
    const n = Math.floor(v + 1e-6);
    const f = clamp(v - n);
    s.digits.forEach((d, i) => {
      const pow = 10 ** i;
      const dig = Math.floor(n / pow) % 10;
      const pos = n % pow === pow - 1 ? dig + f : dig;
      set(d.strip, { transform: `translateY(${-pos * LH}px)` });
    });

    const sc = s.scaleAt(T);
    const lastArrival = ARRIVE.findLast((a) => a <= T) ?? -9;
    const bounce = post ? 0 : impulse(T, lastArrival, 0.08) * 0.02;
    set(s.counter, {
      transform: `translate(${-s.cw / 2}px, ${CY - LH / 2}px) scale(${sc + punch * 0.08 + bounce})`,
    });
    const flashShadow = post && T < HIT + 1 && blink(T, 6);
    set(s.num, { filter: `drop-shadow(10px 10px 0 ${flashShadow ? P.cyan : P.brand})` });
    const hop = post ? Math.round(impulse(T, HIT, 0.25) * 5) * 8 : 0;
    set(s.star, { transform: `translateY(${-hop}px)` });

    s.plus.forEach((el, i) => {
      const p = prog(T, ARRIVE[i], 0.6);
      set(el, {
        opacity: T >= ARRIVE[i] && p < 0.7 ? 1 : 0,
        transform: `translateY(${q(440 - p * 150, 8)}px)`,
      });
    });

    set(s.label, { opacity: post || T < 0.6 ? 0 : 1 });
    set(s.banner, { opacity: post && (T > HIT + 1.2 || blink(T, 5)) ? 1 : 0 });
    const tick = Math.floor(T * 12);
    s.bannerChars.forEach((el, i) => {
      set(el, {
        color: CONFETTI[(tick + i) % CONFETTI.length],
        transform: `translateY(${post ? Math.round(Math.sin(T * 8 + i * 0.6) * 2) * 4 : 0}px)`,
      });
    });

    const top = Math.round(c) - 1;
    s.rows.forEach((r, k) => {
      const y = (c - 1 - k) * ROW;
      const vis = y > -ROW && y < ROW * ROWS;
      set(r.el, {
        display: vis ? 'flex' : 'none',
        transform: `translateY(${y}px)`,
        background: k === top ? 'rgb(255 210 63 / 0.1)' : 'transparent',
      });
      set(r.tag, { opacity: k === top && (!r.champ || blink(T, 3)) ? 1 : 0 });
    });

    s.confetti.forEach((p) => {
      const dt = T - HIT - p.delay;
      if (dt < 0 || dt > 2.6) {
        set(p.el, { opacity: 0 });
        return;
      }
      const x = 960 + p.vx * dt;
      const y = CY + p.vy * dt + 1500 * dt * dt;
      set(p.el, { opacity: 1, transform: `translate(${q(x)}px, ${q(y)}px)` });
    });

    const selP = prog(T, CUE.click, 0.35, outExpo);
    const bw = s.box.w * sc + PAD * 2;
    const bh = s.box.h * sc + PAD * 2;
    s.sel.update({
      x: (s.box.cx - bw / 2) / SEL_S,
      y: (s.box.cy - bh / 2) / SEL_S,
      w: bw / SEL_S,
      h: bh / SEL_S,
      show: T < CUE.click ? 0 : 1,
      handles: selP,
      badgeText: '<h1>',
      badgeShow: selP,
      knob: 0,
    });
    const gOn = T >= CUE.snapTo && T < CUE.release + 0.4 ? 1 - prog(T, CUE.release, 0.4) : 0;
    const grow = prog(T, CUE.snapTo, 0.25, outExpo);
    s.gd.update([
      { x1: 960 / SEL_S, x2: 960 / SEL_S, y1: 120 / SEL_S, y2: 560 / SEL_S, opacity: gOn, grow },
      { x1: 200 / SEL_S, x2: 1720 / SEL_S, y1: CY / SEL_S, y2: CY / SEL_S, opacity: gOn, grow },
    ]);
    const [x, y] = s.path(T);
    s.cur.update(T, {
      x,
      y,
      opacity: T < CUE.click - 0.7 ? 0 : 1,
      clicks: [CUE.click, CUE.grab, CUE.release],
    });
  },
});
