import { envelope, impulse, prog } from '#lib/anim.js';
import { set } from '#lib/dom.js';
import { inOutSine, spring, swift } from '#lib/ease.js';
import { caretOn, typeOn } from '#lib/fx.js';
import { route } from '#lib/route.js';
import { defineScene } from '#lib/scene.js';
import { CARD_W, PIN } from '#ui/comments.js';
import { NOTES } from '../copy.js';
import { camPath, dissolve, drift, flare, grade, INK } from '../rig.js';
import { ELEMENT as CUE, SPANS } from '../timeline.js';
import { editorStage } from '../ui/stage.js';

export default defineScene({
  name: 'element',
  span: SPANS.element,
  build(root) {
    set(root, { background: INK });
    const st = editorStage(root);
    const head = st.F.head;
    const card = st.cardAt('head');
    const path = route(
      [head.x + head.w + 320, head.y + head.h + 360],
      [
        {
          at: CUE.hover,
          dur: 2.0,
          to: [head.x + head.w * 0.62, head.y + head.h * 0.42],
          bend: 0.16,
          ease: inOutSine,
        },
        {
          at: CUE.send - 0.08,
          dur: 1.3,
          to: [card.x + CARD_W - 22, card.y + 92],
          bend: -0.1,
          ease: inOutSine,
        },
        {
          at: CUE.send + 2.2,
          dur: 1.8,
          to: [card.x + CARD_W + 120, card.y + 320],
          ease: inOutSine,
        },
      ],
    );

    const [hx, hy] = st.toWorld(head.x + head.w / 2, head.y + head.h / 2);
    const [cx, cy] = st.toWorld(card.x + CARD_W / 2, card.y + 50);
    const [ix, iy] = st.toWorld(st.ed.island.cx, st.ed.island.y);
    const [S, E] = SPANS.element;
    // A slow crane in to the headline, a drift onto the composer while the
    // note is written, then a glide down to the pill as it counts.
    const camAt = camPath([
      [S, { tx: hx + 140, ty: hy + 140, dist: 2500, yaw: -20, pitch: 28, roll: -3 }],
      [
        CUE.click - 0.2,
        { tx: hx + 20, ty: hy + 10, dist: 1350, yaw: -8, pitch: 12, roll: -1 },
        inOutSine,
      ],
      [CUE.type + 0.2, { tx: cx - 50, ty: cy, dist: 820, yaw: -3, pitch: 7, roll: 0 }, inOutSine],
      [CUE.send, { tx: cx - 10, ty: cy + 6, dist: 680, yaw: 4, pitch: 5, roll: 0.4 }, inOutSine],
      [
        CUE.count - 0.1,
        { tx: ix, ty: iy + 15, dist: 760, yaw: 3, pitch: -6, roll: 0.4 },
        inOutSine,
      ],
      [E, { tx: ix - 60, ty: iy - 140, dist: 1150, yaw: 8, pitch: -10, roll: 1 }, inOutSine],
    ]);

    const fl = flare();
    root.append(fl.el);
    grade(root, { pool: 'oklch(0.55 0.14 30 / 0.14)', at: '30% -10%' });
    const fadeIn = dissolve(root, SPANS.element[0]);
    return { fadeIn, st, head, card, path, camAt, fl };
  },
  update(s, _t, T) {
    const { st } = s;
    s.fadeIn(T);
    const d = drift(T, 0.6, 1);
    const c = s.camAt(T);
    st.cam.cam({ ...c, yaw: c.yaw + d.yaw, pitch: c.pitch + d.pitch, roll: c.roll + d.roll });
    st.sweep(T, SPANS.element[0], 220);

    const macro = envelope(T, CUE.click + 0.6, CUE.count - 0.2, 1.0, 1.0, inOutSine);
    set(st.ed.slide.root, { filter: macro > 0.01 ? `blur(${macro * 3}px)` : 'none' });

    const [x, y] = s.path(T);
    st.pointer(T, {
      x,
      y,
      press: impulse(T, CUE.click, 0.12),
      clicks: [CUE.send],
      card: T > CUE.click && T < CUE.send + 0.4 ? s.card : null,
      show: 1 - prog(T, CUE.send + 2.0, 0.6),
    });

    const sel = T >= CUE.click;
    st.hover.update({
      ...s.head,
      style: 'dashed',
      show: sel ? 0 : prog(T, CUE.hover - 0.4, 0.4, inOutSine),
    });
    const open = prog(T, CUE.click + 0.1, 0.55, swift);
    const close = prog(T, CUE.send + 0.12, 0.5, inOutSine);
    st.frames.head.update({ ...s.head, show: sel ? 1 - close : 0 });
    st.pins.head.update({
      ...st.P.head,
      show: sel ? spring(T - CUE.click, { stiffness: 150, damping: 18 }) : 0,
      lit: 1 - close,
    });
    st.pins.chart.update({ ...st.P.chart, show: 0 });
    st.pins.kicker.update({ ...st.P.kicker, show: 0 });
    st.composer.update({
      ...s.card,
      show: open * (1 - close),
      typed: typeOn(NOTES.head, Math.min(T, CUE.send), CUE.type, CUE.cps),
      caretOn: caretOn(T, 1.2) || (T > CUE.type && T < CUE.send - 0.5),
      press: impulse(T, CUE.send, 0.12),
    });

    st.island.update({
      cx: st.ed.island.cx,
      y: st.ed.island.y,
      show: 1,
      mode: prog(T, CUE.count, 0.9, inOutSine),
      from: 0,
      to: 1,
      roll: prog(T, CUE.count + 0.1, 0.6, swift),
    });
    st.ed.update({ mode: 2, count: T >= CUE.count ? 1 : 0 });

    const [px, py] = st.cam.project([
      ...st.toWorld(st.P.head.x + PIN / 2, st.P.head.y + PIN / 2),
      0,
    ]);
    s.fl.update({
      x: px,
      y: py,
      amount: impulse(T, CUE.click, 0.8) * 0.55 + impulse(T, CUE.send, 0.8) * 0.4,
      width: 0.6 + impulse(T, CUE.click, 0.9) * 0.4,
      size: 0.6,
    });
  },
});
