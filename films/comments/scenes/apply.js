import { impulse, prog } from '#lib/anim.js';
import { h, set, text } from '#lib/dom.js';
import { glide, inOutSine, outExpo, swift } from '#lib/ease.js';
import { caretOn, typeOn } from '#lib/fx.js';
import { defineScene } from '#lib/scene.js';
import { C, FONT } from '#theme';
import { PIN } from '#ui/comments.js';
import { APPLY as CMD } from '../copy.js';
import { flare, GLOW, grade, INK, rig, shots } from '../rig.js';
import { APPLY as CUE, LATER, SPANS, TOTAL } from '../timeline.js';
import { COMMENTS, editorStage } from '../ui/stage.js';

const TERM = { w: 1180, h: 560 };

function terminal() {
  const dot = (c) =>
    h('div', { style: `width:12px;height:12px;border-radius:50%;background:${c}` });
  const typed = h('span');
  const caret = h('span', {
    style: `display:inline-block;width:0.6em;height:1.1em;vertical-align:-0.18em;margin-left:2px;background:${C.brand}`,
  });
  const out = h('div', {
    style: `margin-top:26px;font-size:30px;color:rgb(255 255 255 / 0.55);opacity:0`,
  });
  const el = h(
    'div',
    {
      style: `position:relative;width:${TERM.w}px;height:${TERM.h}px;border-radius:22px;background:linear-gradient(180deg, #121214, #0b0b0c);box-shadow:inset 0 0 0 1px rgb(255 255 255 / 0.09), inset 0 1px 0 rgb(255 255 255 / 0.12), 0 60px 120px -30px rgb(0 0 0 / 0.8);font-family:${FONT.mono};color:#ededed;overflow:hidden`,
    },
    h(
      'div',
      {
        style: `height:54px;display:flex;align-items:center;gap:9px;padding:0 22px;border-bottom:1px solid rgb(255 255 255 / 0.07)`,
      },
      dot('#3a3a3c'),
      dot('#3a3a3c'),
      dot('#3a3a3c'),
      h('span', {
        text: '~/northfold-deck',
        style: 'margin-left:16px;font-size:18px;color:rgb(255 255 255 / 0.45)',
      }),
    ),
    h(
      'div',
      { style: 'padding:56px 64px' },
      h('div', {
        text: `${TOTAL} comments pending in slides/q3-board-review`,
        style: 'font-size:24px;color:rgb(255 255 255 / 0.42);margin-bottom:34px',
      }),
      h(
        'div',
        { style: 'font-size:64px;font-weight:500;letter-spacing:-0.01em;white-space:nowrap' },
        h('span', { text: '› ', style: `color:${C.brand}` }),
        typed,
        caret,
      ),
      out,
    ),
  );
  return { el, typed, caret, out };
}

export default defineScene({
  name: 'apply',
  span: SPANS.apply,
  build(root) {
    set(root, { background: INK });
    const termLayer = h('div', { class: 'fill' });
    const edLayer = h('div', { class: 'fill' });
    root.append(edLayer, termLayer);

    const glow = h('div', {
      class: 'fill',
      style: `background:radial-gradient(40% 40% at 45% 55%, ${GLOW}, transparent 70%);mix-blend-mode:screen;opacity:0.16`,
    });
    termLayer.append(glow);
    const tcam = rig(termLayer, { persp: 1500, unit: 1.5 });
    const term = terminal();
    tcam.place(tcam.add(term.el), { x: -TERM.w / 2, y: -TERM.h / 2 });
    const tAt = shots(
      [
        {
          at: SPANS.apply[0],
          from: { tx: -150, ty: 10, dist: 1050, yaw: 4, pitch: 3, roll: 0.4 },
          to: { tx: -90, dist: 960, yaw: 3 },
        },
      ],
      CUE.drop,
      1500,
    );

    const st = editorStage(edLayer);
    const rings = COMMENTS.map(() => {
      const el = h('div', {
        style: `position:absolute;left:0;top:0;width:60px;height:60px;margin:-30px 0 0 -30px;border-radius:50%;border:2px solid ${C.brand};opacity:0`,
      });
      st.ed.overlay.append(el);
      return el;
    });
    const head = st.F.head;
    const [hx, hy] = st.toWorld(head.x + head.w * 0.42, head.y + head.h * 0.32);
    const eAt = shots(
      [
        {
          at: CUE.drop,
          from: { tx: 20, ty: 10, dist: 1620, yaw: -3, pitch: 4, roll: -0.4 },
          to: { tx: 0, dist: 1500, yaw: -2 },
        },
        {
          at: CUE.close,
          from: { tx: hx - 30, ty: hy, dist: 760, yaw: 3, pitch: 3 },
          to: { tx: hx + 10, dist: 700, yaw: 2 },
        },
      ],
      SPANS.apply[1],
    );
    const fl = flare();
    edLayer.append(fl.el);
    grade(edLayer, { pool: 'oklch(0.55 0.14 30 / 0.14)', at: '50% -10%' });
    grade(termLayer, { pool: 'oklch(0.55 0.14 30 / 0.1)', at: '30% 0%' });
    return { termLayer, edLayer, tcam, term, tAt, st, rings, eAt, fl };
  },
  update(s, _t, T) {
    const onTerm = T < CUE.drop;
    set(s.termLayer, { display: onTerm ? 'block' : 'none' });
    set(s.edLayer, { display: onTerm ? 'none' : 'block' });
    if (onTerm) {
      s.tcam.cam(s.tAt(T).cam);
      text(s.term.typed, typeOn(CMD, T, CUE.type, CUE.cps));
      set(s.term.caret, {
        opacity: T > CUE.enter || caretOn(T, 1.6) || T < CUE.type + 1.4 ? 1 : 0,
      });
      text(s.term.out, `Applying ${TOTAL} comments…`);
      set(s.term.out, { opacity: prog(T, CUE.enter + 0.1, 0.3, outExpo) });
      return;
    }

    const { st } = s;
    st.cam.cam(s.eAt(T).cam);
    st.sweep(T, CUE.drop - 0.6, 260);
    set(st.ed.slide.root, { filter: 'none' });

    const R = CUE.resolve;
    COMMENTS.forEach((k, i) => {
      st.pins[k].update({ ...st.P[k], show: 1 - prog(T, R[i], 0.35, inOutSine) });
      const p = T - R[i];
      set(s.rings[i], {
        transform: `translate(${st.P[k].x + PIN / 2}px, ${st.P[k].y + PIN / 2}px) scale(${0.4 + outExpo(Math.min(1, Math.max(0, p) / 0.8)) * 3})`,
        opacity: p >= 0 && p < 0.8 ? (1 - p / 0.8) * 0.8 : 0,
      });
    });
    st.frames.chart.update({ ...st.F.chart, show: 1 - prog(T, R[1], 0.3), style: 'dashed' });
    st.pointer(T, { x: 0, y: 0, show: 0 });

    const edits = {
      head: prog(T, R[0] + 0.1, 0.7, inOutSine),
      chart: prog(T, R[1] + 0.1, 0.9, glide),
      kicker: prog(T, R[2] + 0.1, 0.6, inOutSine),
    };
    const steps = [...R, ...CUE.rest];
    const k = steps.filter((t) => T >= t).length;
    const last = k ? steps[k - 1] : 0;
    const n = TOTAL - k;
    const pageOne = 3 - Math.min(3, k);
    const badges = [pageOne ? { n: pageOne } : null];
    LATER.forEach((row, i) => {
      badges[row] = T < CUE.rest[i] ? { n: 1 } : null;
    });
    st.ed.update({ mode: 2, count: n, edits, badges });
    st.island.update({
      cx: st.ed.island.cx,
      y: st.ed.island.y,
      show: 1,
      mode: 1 - prog(T, CUE.clear, 0.45, inOutSine),
      from: k ? n + 1 : n,
      to: n,
      roll: k ? prog(T, last, 0.3, swift) : 1,
    });

    let amount = impulse(T, CUE.drop, 0.6) * 0.3;
    let at = st.P.head;
    R.forEach((t, i) => {
      const a = T >= t ? impulse(T, t, 0.45) * 0.7 : 0;
      if (a > amount) {
        amount = a;
        at = st.P[COMMENTS[i]];
      }
    });
    const [fx, fy] = st.cam.project([...st.toWorld(at.x + PIN / 2, at.y + PIN / 2), 0]);
    s.fl.update({ x: fx, y: fy, amount, width: 0.8, size: 0.6 });
  },
});
