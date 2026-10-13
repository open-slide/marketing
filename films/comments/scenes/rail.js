import { set } from '#lib/dom.js';
import { inOutSine, spring } from '#lib/ease.js';
import { defineScene, rectIn } from '#lib/scene.js';
import { camPath, dissolve, drift, flare, grade, INK } from '../rig.js';
import { RAIL as CUE, SPANS } from '../timeline.js';
import { editorStage } from '../ui/stage.js';

// Rail rows that gain a badge in this shot, and how many comments each gets.
export const LATER = [
  { row: 2, n: 1 },
  { row: 3, n: 1 },
  { row: 5, n: 1 },
];

export default defineScene({
  name: 'rail',
  span: SPANS.rail,
  build(root) {
    set(root, { background: INK });
    const st = editorStage(root);
    const rows = st.ed.rows.map((r) => rectIn(r.el, st.ed.el));
    const top = st.toWorld(rows[0].cx, rows[0].cy);
    const bot = st.toWorld(rows[5].cx, rows[5].cy);
    const camAt = camPath([
      [
        SPANS.rail[0],
        { tx: top[0] + 40, ty: top[1] - 60, dist: 900, yaw: -30, pitch: 48, roll: -12 },
      ],
      [
        SPANS.rail[1],
        { tx: bot[0] + 10, ty: bot[1] + 40, dist: 760, yaw: -18, pitch: 40, roll: -8 },
        inOutSine,
      ],
    ]);
    const fl = flare();
    root.append(fl.el);
    grade(root, { pool: 'oklch(0.55 0.14 30 / 0.16)', at: '20% 0%' });
    const fadeIn = dissolve(root, SPANS.rail[0]);
    return { fadeIn, st, rows, camAt, fl };
  },
  update(s, _t, T) {
    const { st } = s;
    s.fadeIn(T);
    const d = drift(T, 0.6, 9);
    const c = s.camAt(T);
    st.cam.cam({ ...c, yaw: c.yaw + d.yaw, pitch: c.pitch + d.pitch, roll: c.roll + d.roll });
    st.sweep(T, SPANS.rail[0], 200);
    set(st.ed.slide.root, { filter: 'blur(4px)' });

    const badges = [{ n: 3, show: 1 }];
    LATER.forEach((b, i) => {
      badges[b.row] = { n: b.n, show: spring(T - CUE.badges[i], { stiffness: 170, damping: 16 }) };
    });
    const total = 3 + LATER.filter((_, i) => T >= CUE.badges[i]).length;
    st.ed.update({ mode: 2, count: total, badges });
    st.pins.head.update({ ...st.P.head, show: 1 });
    st.pins.chart.update({ ...st.P.chart, show: 1 });
    st.pins.kicker.update({ ...st.P.kicker, show: 1 });
    st.frames.chart.update({ ...st.F.chart, show: 1, style: 'dashed' });
    st.island.update({ cx: st.ed.island.cx, y: st.ed.island.y, show: 1, mode: 1, from: 3, to: 3 });
    st.pointer(T, { x: 0, y: 0, show: 0 });

    let amount = 0;
    let fx = 0;
    let fy = 0;
    LATER.forEach((b, i) => {
      const a = Math.exp(-Math.max(0, T - CUE.badges[i]) / 0.7) * (T >= CUE.badges[i] ? 1 : 0);
      if (a > amount) {
        amount = a;
        const r = s.rows[b.row];
        [fx, fy] = st.cam.project([...st.toWorld(r.x + 18, r.y + 34), 0]);
      }
    });
    s.fl.update({ x: fx, y: fy, amount: amount * 0.5, width: 0.5, size: 0.4 });
  },
});
