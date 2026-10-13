import { impulse, prog } from '#lib/anim.js';
import { set } from '#lib/dom.js';
import { inOutSine, spring, swift } from '#lib/ease.js';
import { caretOn, typeOn } from '#lib/fx.js';
import { route } from '#lib/route.js';
import { defineScene, rectIn } from '#lib/scene.js';
import { C, DARK } from '#theme';
import { CARD_W, PIN } from '#ui/comments.js';
import { NOTES } from '../copy.js';
import { flare, grade, INK, shots } from '../rig.js';
import { DEMO as CUE, CUTS, LATER, SPANS } from '../timeline.js';
import { editorStage } from '../ui/stage.js';

const pop = (T, at) => (T >= at ? spring(T - at, { stiffness: 260, damping: 19 }) : 0);

// Which note the single composer is showing, and when it opens and closes.
const NOTE_RUNS = [
  { key: 'head', open: CUE.click, close: CUE.send, type: CUE.type, cps: CUE.cps },
  { key: 'chart', open: CUE.up, close: CUE.post, type: CUE.type2, cps: CUE.cps2 },
  { key: 'kicker', open: CUE.click3, close: CUE.post3, type: CUE.type3, cps: CUE.cps3 },
];
const SAVED = [CUE.send, CUE.post, CUE.post3];

export default defineScene({
  name: 'demo',
  span: SPANS.demo,
  build(root) {
    set(root, { background: INK });
    const st = editorStage(root);
    const { F } = st;
    const sw = rectIn(st.ed.switcher.items[2], st.ed.el);
    const rows = st.ed.rows.map((r) => rectIn(r.el, st.ed.el));
    const cards = Object.fromEntries(NOTE_RUNS.map((n) => [n.key, st.cardAt(n.key)]));
    const head = F.head;
    const R = F.chart;
    const K = F.kicker;
    const headAt = [head.x + head.w * 0.6, head.y + head.h * 0.42];
    const kickAt = [K.x + K.w * 0.55, K.y + K.h * 0.5];
    const send = (k) => [cards[k].x + CARD_W - 22, cards[k].y + 92];
    const drag = (T) => {
      const p = inOutSine(Math.min(1, Math.max(0, (T - CUE.down) / (CUE.up - CUE.down))));
      return [R.x + R.w * p, R.y + R.h * p];
    };
    const jump = (at, to) => ({ at, dur: 0.001, to });
    const path = route(
      [sw.cx + 170, sw.cy + 120],
      [
        { at: CUE.modeClick, dur: 0.9, to: [sw.cx, sw.cy], bend: 0.1 },
        { at: CUE.modeClick + 1.4, dur: 0.9, to: [sw.cx + 140, sw.cy + 160] },
        jump(CUTS.hover, [headAt[0] + 260, headAt[1] + 200]),
        { at: CUE.hover, dur: 0.9, to: headAt, bend: 0.12 },
        { at: CUE.send, dur: 0.7, to: send('head'), bend: -0.08 },
        { at: CUE.send + 0.8, dur: 0.7, to: [send('head')[0] + 80, send('head')[1] + 140] },
        jump(CUTS.drag, [R.x - 160, R.y - 90]),
        { at: CUE.down, dur: 0.4, to: [R.x, R.y] },
        { from: CUE.down, until: CUE.up, fn: drag },
        { at: CUE.up + 0.9, dur: 0.8, to: [R.x + R.w - 40, R.y + R.h + 70] },
        jump(CUTS.kicker, [kickAt[0] + 220, kickAt[1] + 160]),
        { at: CUE.click3, dur: 0.6, to: kickAt, bend: -0.08 },
        { at: CUE.post3 + 0.6, dur: 0.6, to: [kickAt[0] + 160, kickAt[1] + 200] },
      ],
    );

    // World coordinates of what each shot looks at.
    const W = (x, y) => st.toWorld(x, y);
    const [sx, sy] = W(sw.cx - 40, sw.cy);
    const [ix, iy] = W(st.ed.island.cx, st.ed.island.y + 15);
    const [hx, hy] = W(head.x + head.w * 0.62, head.y + head.h * 0.45);
    const [cx, cy] = W(cards.head.x + CARD_W / 2 - 40, cards.head.y + 46);
    const [rx, ry] = W(R.x + R.w / 2, R.y + R.h / 2);
    const [c2x, c2y] = W(cards.chart.x + CARD_W / 2, cards.chart.y + 60);
    const [kx, ky] = W(K.x + K.w * 0.8, K.y + 40);
    const [lx, ly] = W(rows[3].cx, rows[3].y);
    const camAt = shots(
      [
        {
          at: CUTS.switch,
          blur: 3,
          from: { tx: sx - 30, ty: sy, dist: 560, yaw: 3, pitch: 4, roll: -0.5 },
          to: { tx: sx + 10, dist: 500, yaw: 2 },
        },
        {
          at: CUTS.hint,
          blur: 3,
          from: { tx: ix - 40, ty: iy, dist: 520, yaw: -2, pitch: -3 },
          to: { tx: ix + 40, dist: 490 },
        },
        {
          at: CUTS.hover,
          blur: 0,
          from: { tx: hx, ty: hy, dist: 1180, yaw: -4, pitch: 5, roll: -0.6 },
          to: { tx: hx + 30, dist: 1060, yaw: -3 },
        },
        {
          at: CUTS.compose,
          blur: 2.5,
          from: { tx: cx, ty: cy, dist: 640, yaw: 3, pitch: 3 },
          to: { tx: cx + 20, dist: 580, yaw: 2 },
        },
        {
          at: CUTS.count,
          blur: 3,
          from: { tx: ix + 30, ty: iy, dist: 470, yaw: 2, pitch: -2 },
          to: { tx: ix - 20, dist: 440 },
        },
        {
          at: CUTS.drag,
          blur: 0,
          from: { tx: rx - 20, ty: ry, dist: 1050, yaw: 4, pitch: 6, roll: 0.6 },
          to: { tx: rx + 10, dist: 960, yaw: 3 },
        },
        {
          at: CUTS.compose2,
          blur: 2.5,
          from: { tx: c2x + 20, ty: c2y, dist: 650, yaw: -3, pitch: 3 },
          to: { tx: c2x - 10, dist: 590, yaw: -2 },
        },
        {
          at: CUTS.kicker,
          blur: 2,
          from: { tx: kx + 60, ty: ky, dist: 900, yaw: 3, pitch: 4 },
          to: { tx: kx + 100, dist: 820, yaw: 2 },
        },
        {
          at: CUTS.rail,
          blur: 4,
          from: { tx: lx, ty: ly - 120, dist: 980, yaw: 4, pitch: 5, roll: -0.6 },
          to: { ty: ly + 20, dist: 900 },
        },
      ],
      SPANS.demo[1],
    );
    const fl = flare();
    root.append(fl.el);
    grade(root, { pool: 'oklch(0.55 0.14 30 / 0.12)', at: '50% -10%' });
    return { st, sw, rows, cards, head, R, K, path, drag, camAt, fl };
  },
  update(s, _t, T) {
    const { st } = s;
    const { cam, shot } = s.camAt(T);
    st.cam.cam(cam);
    st.sweep(T, shot.at - 0.6, 300);
    set(st.ed.slide.root, { filter: shot.blur ? `blur(${shot.blur}px)` : 'none' });

    const [x, y] = s.path(T);
    const run = NOTE_RUNS.findLast((n) => T >= n.open) ?? NOTE_RUNS[0];
    const card = s.cards[run.key];
    const onChrome = T < CUTS.hint;
    st.pointer(T, {
      x,
      y,
      arrow: onChrome,
      press:
        T >= CUE.down && T < CUE.up
          ? 1
          : Math.max(impulse(T, CUE.click, 0.08), impulse(T, CUE.click3, 0.08)),
      clicks: [CUE.modeClick, CUE.send],
      card: T > run.open && T < run.close + 0.3 ? card : null,
      show: T < CUTS.rail ? 1 : 0,
    });

    st.ed.update({
      mode: T < CUE.modeClick ? 1 : 1 + spring(T - CUE.modeClick, { stiffness: 220, damping: 22 }),
      count: SAVED.filter((t) => T >= t).length + CUE.badges.filter((t) => T >= t).length,
      badges: [
        SAVED.some((t) => T >= t) ? { n: SAVED.filter((t) => T >= t).length } : null,
        null,
        ...[2, 3, 4, 5].map((row) => {
          const i = LATER.indexOf(row);
          return i >= 0 && T >= CUE.badges[i] ? { n: 1, show: pop(T, CUE.badges[i]) } : null;
        }),
      ],
    });

    st.hover.update({
      ...s.head,
      style: 'dashed',
      show: T >= CUE.hover - 0.1 && T < CUE.click ? 1 : 0,
    });
    const kHover = T >= CUE.click3 - 0.25 && T < CUE.click3;
    if (kHover) st.hover.update({ ...s.K, style: 'dashed', show: 1 });

    const closeOf = (n) => prog(T, n.close + 0.08, 0.3, swift);
    const [hRun, cRun, kRun] = NOTE_RUNS;
    st.frames.head.update({ ...s.head, show: T >= CUE.click ? 1 - closeOf(hRun) : 0 });
    st.pins.head.update({ ...st.P.head, show: pop(T, CUE.click), lit: 1 - closeOf(hRun) });
    st.marquee.update({
      x: s.R.x,
      y: s.R.y,
      w: Math.max(0, s.drag(T)[0] - s.R.x),
      h: Math.max(0, s.drag(T)[1] - s.R.y),
      show: T >= CUE.down && T < CUE.up ? 1 : 0,
      fill: 0.1,
    });
    const chartIdle = closeOf(cRun) > 0.5;
    st.frames.chart.update({
      ...s.R,
      show: T >= CUE.up ? 1 : 0,
      style: chartIdle ? 'dashed' : 'solid',
      fill: chartIdle ? 0 : 0.05,
    });
    st.pins.chart.update({ ...st.P.chart, show: pop(T, CUE.up), lit: 1 - closeOf(cRun) });
    st.frames.kicker.update({ ...s.K, show: T >= CUE.click3 ? 1 - closeOf(kRun) : 0 });
    st.pins.kicker.update({ ...st.P.kicker, show: pop(T, CUE.click3), lit: 1 - closeOf(kRun) });

    st.composer.update({
      ...card,
      show: prog(T, run.open + 0.05, 0.3, swift) * (1 - closeOf(run)),
      typed: typeOn(NOTES[run.key], Math.min(T, run.close), run.type, run.cps),
      caretOn: caretOn(T, 1.6) || (T > run.type && T < run.close - 0.3),
      press: impulse(T, CUE.send, 0.08),
    });
    const kbdHot = Math.max(impulse(T, CUE.post, 0.25), impulse(T, CUE.post3, 0.25));
    set(st.composer.kbd, {
      color: kbdHot > 0.3 ? '#fff' : DARK.mutedFg,
      borderColor: kbdHot > 0.3 ? C.brand : DARK.border,
    });

    const saved = SAVED.filter((t) => T >= t + 0.1).length;
    const last = saved ? SAVED[saved - 1] + 0.1 : 0;
    st.island.update({
      cx: st.ed.island.cx,
      y: st.ed.island.y,
      show: prog(T, CUE.hint, 0.4, swift),
      mode: prog(T, CUE.count, 0.45, inOutSine),
      from: Math.max(0, saved - 1),
      to: saved,
      roll: saved === 1 ? prog(T, CUE.count + 0.05, 0.35, swift) : prog(T, last, 0.35, swift),
    });

    let amount = 0;
    let at = null;
    const bursts = [
      [CUE.modeClick, [s.sw.cx, s.sw.cy]],
      [CUE.click, [st.P.head.x + PIN / 2, st.P.head.y + PIN / 2]],
      [CUE.up, [st.P.chart.x + PIN / 2, st.P.chart.y + PIN / 2]],
      [CUE.click3, [st.P.kicker.x + PIN / 2, st.P.kicker.y + PIN / 2]],
      ...LATER.map((row, i) => [CUE.badges[i], [s.rows[row].x + 18, s.rows[row].y + 34]]),
    ];
    for (const [t, p] of bursts) {
      const a = T >= t ? impulse(T, t, 0.4) : 0;
      if (a > amount) {
        amount = a;
        at = p;
      }
    }
    if (at) {
      const [fx, fy] = st.cam.project([...st.toWorld(at[0], at[1]), 0]);
      s.fl.update({ x: fx, y: fy, amount: amount * 0.55, width: 0.6, size: 0.45 });
    } else s.fl.update({ x: 0, y: 0, amount: 0 });
  },
});
