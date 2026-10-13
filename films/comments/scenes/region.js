import { envelope, impulse, prog } from '#lib/anim.js';
import { set } from '#lib/dom.js';
import { inOutSine, spring, swift } from '#lib/ease.js';
import { caretOn, typeOn } from '#lib/fx.js';
import { route } from '#lib/route.js';
import { defineScene } from '#lib/scene.js';
import { C, DARK } from '#theme';
import { CARD_W } from '#ui/comments.js';
import { NOTES } from '../copy.js';
import { camPath, dissolve, drift, grade, INK } from '../rig.js';
import { REGION as CUE, SPANS } from '../timeline.js';
import { editorStage } from '../ui/stage.js';

export default defineScene({
  name: 'region',
  span: SPANS.region,
  build(root) {
    set(root, { background: INK });
    const st = editorStage(root);
    const R = st.F.chart;
    const K = st.F.kicker;
    const card = st.cardAt('chart');
    const card2 = st.cardAt('kicker');
    const drag = (T) => {
      const p = inOutSine(Math.min(1, Math.max(0, (T - CUE.down) / (CUE.up - CUE.down))));
      return [R.x + R.w * p, R.y + R.h * p];
    };
    const path = route(
      [R.x - 260, R.y + R.h + 200],
      [
        { at: CUE.down - 0.15, dur: 1.6, to: [R.x, R.y], bend: 0.1, ease: inOutSine },
        { from: CUE.down, until: CUE.up, fn: drag },
        {
          at: CUE.post + 0.2,
          dur: 1.2,
          to: [R.x + R.w - 40, R.y + R.h + 60],
          ease: inOutSine,
        },
        {
          at: CUE.click - 0.05,
          dur: 1.2,
          to: [K.x + K.w * 0.55, K.y + K.h * 0.5],
          bend: -0.08,
          ease: inOutSine,
        },
        { at: CUE.post2 + 1.6, dur: 1.4, to: [K.x + K.w + 320, K.y + 320], ease: inOutSine },
      ],
    );

    const [rx, ry] = st.toWorld(R.x + R.w / 2, R.y + R.h / 2);
    const [cx, cy] = st.toWorld(card.x + CARD_W / 2, card.y + 50);
    const [kx, ky] = st.toWorld(card2.x, card2.y + 30);
    const [S, E] = SPANS.region;
    // Settles over the chart for the drag, eases onto the composer, then a
    // slow lateral pan to the kicker and a long crane out to the whole page.
    const camAt = camPath([
      [S, { tx: rx + 80, ty: ry - 60, dist: 1650, yaw: 16, pitch: 26, roll: 4 }],
      [CUE.up, { tx: rx, ty: ry, dist: 1250, yaw: 10, pitch: 19, roll: 2.5 }, inOutSine],
      [CUE.type + 0.6, { tx: cx, ty: cy + 20, dist: 880, yaw: 5, pitch: 12, roll: 1.2 }, inOutSine],
      [
        CUE.post + 0.2,
        { tx: cx - 20, ty: cy + 24, dist: 800, yaw: 1, pitch: 10, roll: 0.6 },
        inOutSine,
      ],
      [CUE.type2 + 0.3, { tx: kx, ty: ky, dist: 820, yaw: -6, pitch: 9, roll: -1 }, inOutSine],
      [
        CUE.post2 + 0.2,
        { tx: kx + 20, ty: ky + 10, dist: 780, yaw: -8, pitch: 8, roll: -1.4 },
        inOutSine,
      ],
      [E, { tx: 60, ty: 40, dist: 1800, yaw: -11, pitch: 18, roll: -2 }, inOutSine],
    ]);
    grade(root, { pool: 'oklch(0.55 0.14 30 / 0.14)', at: '75% -10%' });
    const fadeIn = dissolve(root, SPANS.region[0]);
    return { fadeIn, st, R, K, card, card2, path, drag, camAt };
  },
  update(s, _t, T) {
    const { st } = s;
    s.fadeIn(T);
    const d = drift(T, 0.6, 7);
    const c = s.camAt(T);
    st.cam.cam({ ...c, yaw: c.yaw + d.yaw, pitch: c.pitch + d.pitch, roll: c.roll + d.roll });
    st.sweep(T, SPANS.region[0], 220);
    const macro = envelope(T, CUE.up + 0.3, CUE.post2 + 0.6, 1.0, 1.0, inOutSine);
    set(st.ed.slide.root, { filter: macro > 0.01 ? `blur(${macro * 2.5}px)` : 'none' });

    const [x, y] = s.path(T);
    const second = T >= CUE.click - 0.1;
    st.pointer(T, {
      x,
      y,
      press: T >= CUE.down && T < CUE.up ? 1 : impulse(T, CUE.click, 0.12),
      card: null,
      show: 1 - prog(T, CUE.post2 + 1.4, 0.6),
    });

    const dragging = T >= CUE.down && T < CUE.up;
    const [mx, my] = s.drag(T);
    s.st.marquee.update({
      x: s.R.x,
      y: s.R.y,
      w: Math.max(0, mx - s.R.x),
      h: Math.max(0, my - s.R.y),
      show: dragging ? 1 : 0,
      fill: 0.1,
    });

    const open = prog(T, CUE.up + 0.1, 0.55, swift);
    const close = prog(T, CUE.post + 0.12, 0.5, inOutSine);
    const open2 = prog(T, CUE.click + 0.1, 0.55, swift);
    const close2 = prog(T, CUE.post2 + 0.12, 0.5, inOutSine);

    st.pins.head.update({ ...st.P.head, show: 1 });
    st.frames.head.update({ ...st.F.head, show: 0 });

    const placed = T >= CUE.up;
    st.frames.chart.update({
      ...s.R,
      show: placed ? 1 : 0,
      style: close > 0.5 ? 'dashed' : 'solid',
      fill: close > 0.5 ? 0 : 0.05,
    });
    st.pins.chart.update({
      ...st.P.chart,
      show: placed ? spring(T - CUE.up, { stiffness: 150, damping: 18 }) : 0,
      lit: 1 - close,
    });

    st.frames.kicker.update({ ...s.K, show: second && T >= CUE.click ? 1 - close2 : 0 });
    st.hover.update({
      ...s.K,
      style: 'dashed',
      show: T < CUE.click ? prog(T, CUE.click - 0.5, 0.35, inOutSine) : 0,
    });
    st.pins.kicker.update({
      ...st.P.kicker,
      show: T >= CUE.click ? spring(T - CUE.click, { stiffness: 150, damping: 18 }) : 0,
      lit: 1 - close2,
    });

    const first = T < CUE.click;
    const typed = first
      ? typeOn(NOTES.chart, Math.min(T, CUE.post), CUE.type, CUE.cps)
      : typeOn(NOTES.kicker, Math.min(T, CUE.post2), CUE.type2, CUE.cps2);
    st.composer.update({
      ...(first ? s.card : s.card2),
      show: first ? open * (1 - close) : open2 * (1 - close2),
      typed,
      caretOn:
        caretOn(T, 1.2) ||
        (T > CUE.type && T < CUE.post - 0.4) ||
        (T > CUE.type2 && T < CUE.post2 - 0.4),
    });
    const kbdHot = Math.max(impulse(T, CUE.post, 0.35), impulse(T, CUE.post2, 0.35));
    set(st.composer.kbd, {
      color: kbdHot > 0.3 ? '#fff' : DARK.mutedFg,
      borderColor: kbdHot > 0.3 ? C.brand : DARK.border,
    });

    const n = T < CUE.post2 + 0.1 ? 2 : 3;
    const from = n - 1;
    const rollAt = n === 2 ? CUE.post + 0.1 : CUE.post2 + 0.1;
    st.island.update({
      cx: st.ed.island.cx,
      y: st.ed.island.y,
      show: 1,
      mode: 1,
      from,
      to: n,
      roll: prog(T, rollAt, 0.6, swift),
    });
    const count = T < CUE.post + 0.1 ? 1 : T < CUE.post2 + 0.1 ? 2 : 3;
    st.ed.update({ mode: 2, count });
  },
});
