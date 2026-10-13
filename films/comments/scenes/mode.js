import { impulse, keys, prog } from '#lib/anim.js';
import { h, set } from '#lib/dom.js';
import { glide, inOutSine, outExpo, spring } from '#lib/ease.js';
import { defineScene, rectIn } from '#lib/scene.js';
import { DARK, FONT } from '#theme';
import { islandHint } from '#ui/comments.js';
import { HINT_EMPTY } from '../copy.js';
import { camPath, dissolve, drift, flare, GLOW, grade, INK, rig } from '../rig.js';
import { MODE as CUE, SPANS } from '../timeline.js';
import { editor, WIN } from '../ui/editor.js';

const KEY = 220;
const DEPTH = 10;

// A physical keycap: stacked slabs for the skirt, a dished top with the
// legend, and a brand glow that blooms underneath on press.
function keycapObject(label) {
  const skirt = Array.from({ length: DEPTH }, (_, i) =>
    h('div', {
      class: 'abs',
      style: `width:${KEY}px;height:${KEY}px;border-radius:44px;background:rgb(${26 - i} ${26 - i} ${28 - i});transform:translateZ(${-i * 4}px)`,
    }),
  );
  const top = h(
    'div',
    {
      class: 'abs',
      style: `width:${KEY}px;height:${KEY}px;border-radius:44px;background:radial-gradient(90% 90% at 40% 25%, #3a3a3e, #1d1d20 70%);box-shadow:inset 0 2px 0 rgb(255 255 255 / 0.14), inset 0 -10px 24px rgb(0 0 0 / 0.5);display:grid;place-items:center;transform:translateZ(1px)`,
    },
    h('span', {
      text: label,
      style: `font-family:${FONT.sans};font-size:96px;font-weight:500;color:#f2f2f2;letter-spacing:-0.02em`,
    }),
  );
  const glow = h('div', {
    class: 'abs',
    style: `left:-90px;top:-90px;width:${KEY + 180}px;height:${KEY + 180}px;border-radius:50%;background:radial-gradient(closest-side, ${GLOW}, transparent);transform:translateZ(${-DEPTH * 4 - 2}px);opacity:0`,
  });
  const cap = h('div', { class: 'abs preserve' }, [...skirt].reverse(), top);
  const el = h('div', { class: 'abs preserve' }, glow, cap);
  return { el, cap, glow };
}

export default defineScene({
  name: 'mode',
  span: SPANS.mode,
  build(root) {
    set(root, { background: INK });
    const cam = rig(root, { unit: 2.5 });
    const ed = editor();
    const win = cam.add(ed.el);
    cam.place(win, { x: -WIN.w / 2, y: -WIN.h / 2 });
    const island = islandHint({ theme: DARK, empty: HINT_EMPTY });
    ed.overlay.append(island.el);
    island.measure();

    const sw = rectIn(ed.switcher.el, ed.el);
    const comment = rectIn(ed.switcher.items[2], ed.el);
    const sx = sw.cx - WIN.w / 2;
    const sy = sw.cy - WIN.h / 2;
    const key = keycapObject('C');
    const keyAt = { x: sx - 760, y: sy + 260, z: 900 };
    const kh = cam.add(key.el);
    cam.place(kh, { ...keyAt, rx: 0 });
    const kx = keyAt.x + KEY / 2;
    const ky = keyAt.y + KEY / 2;

    const camAt = camPath([
      [
        SPANS.mode[0],
        { tx: kx - 60, ty: ky + 40, tz: keyAt.z, dist: 1350, yaw: -32, pitch: 28, roll: -5 },
      ],
      [
        CUE.press,
        { tx: kx, ty: ky, tz: keyAt.z, dist: 1000, yaw: -18, pitch: 21, roll: -3 },
        inOutSine,
      ],
      [
        CUE.press + 0.4,
        { tx: kx + 10, ty: ky, tz: keyAt.z, dist: 970, yaw: -16, pitch: 20, roll: -2.6 },
        inOutSine,
      ],
      [
        CUE.slide - 0.1,
        { tx: sx + 10, ty: sy + 8, tz: 0, dist: 380, yaw: 6, pitch: 14, roll: 0.6 },
        glide,
      ],
      [CUE.hint, { tx: sx - 10, ty: sy + 10, dist: 350, yaw: 3, pitch: 12, roll: 0.3 }, inOutSine],
      [SPANS.mode[1], { tx: -60, ty: 110, dist: 1750, yaw: -9, pitch: 24, roll: -1.5 }, inOutSine],
    ]);
    const fl = flare();
    root.append(fl.el);
    const g = grade(root, { pool: 'oklch(0.55 0.14 30 / 0.14)', at: '60% -10%' });
    const fadeIn = dissolve(root, SPANS.mode[0]);
    return { fadeIn, cam, ed, island, key, kh, keyAt, camAt, comment, fl, g };
  },
  update(s, _t, T) {
    s.fadeIn(T);
    const d = drift(T, 0.6, 4);
    const c = s.camAt(T);
    s.cam.cam({ ...c, yaw: c.yaw + d.yaw, pitch: c.pitch + d.pitch, roll: c.roll + d.roll });

    const down = keys(T, [
      [CUE.press - 0.12, 0],
      [CUE.press, 1, inOutSine],
      [CUE.press + 0.45, 0, inOutSine],
    ]);
    set(s.key.cap, { transform: `translateZ(${-down * 18}px)` });
    set(s.key.glow, { opacity: down * 0.8 + impulse(T, CUE.press, 0.8) * 0.4 });
    const away = prog(T, CUE.press + 0.6, 1.0, inOutSine);
    set(s.kh, {
      opacity: 1 - prog(T, CUE.press + 1.2, 0.6, inOutSine),
      filter: away > 0.01 ? `blur(${away * 8}px)` : 'none',
    });

    const slide = spring(T - CUE.slide, { stiffness: 120, damping: 20 });
    s.ed.update({ mode: T < CUE.slide ? 1 : 1 + slide });
    const defocus = 1 - prog(T, CUE.press + 0.6, 1.2, inOutSine);
    set(s.ed.el, { filter: defocus > 0.01 ? `blur(${defocus * 6}px)` : 'none' });

    const pill = prog(T, CUE.hint, 1.0, outExpo);
    s.island.update({ cx: s.ed.island.cx, y: s.ed.island.y, show: pill, mode: 0 });

    const [fx, fy] = s.cam.project([s.comment.cx - WIN.w / 2, s.comment.cy - WIN.h / 2, 0]);
    s.fl.update({ x: fx, y: fy, amount: impulse(T, CUE.slide, 0.9) * 0.6, width: 0.8, size: 0.5 });
  },
});
