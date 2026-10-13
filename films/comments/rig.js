import { h, set } from '#lib/dom.js';

export const INK = '#060607';
export const GLOW = 'oklch(0.66 0.21 28)';

// An orbit camera over a CSS 3D world. The world origin sits at frame
// centre; the camera looks at `target` from `dist` px away, so at
// `dist === persp` a plane through the target renders 1:1.
// `unit` renders world content at that many device px per world px (CSS
// zoom on `add`ed elements) so macro shots stay sharp; world coordinates
// stay in unzoomed px.
export function rig(root, { persp = 1800, unit = 1 } = {}) {
  const U = unit;
  const view = h('div', {
    class: 'fill',
    style: `perspective:${persp}px;perspective-origin:50% 50%;overflow:hidden`,
  });
  const world = h('div', {
    class: 'abs preserve',
    style: 'left:960px;top:540px;width:0;height:0',
  });
  view.append(world);
  root.append(view);
  let cur = { persp };
  return {
    view,
    world,
    cam({ tx = 0, ty = 0, tz = 0, dist = persp, yaw = 0, pitch = 0, roll = 0, fov = persp } = {}) {
      cur = { tx, ty, tz, dist, yaw, pitch, roll, persp: fov };
      set(view, { perspective: `${fov}px` });
      set(world, {
        transform: `translateZ(${fov - dist * U}px) rotateZ(${roll}deg) rotateX(${pitch}deg) rotateY(${yaw}deg) translate3d(${-tx * U}px, ${-ty * U}px, ${-tz * U}px)`,
      });
    },
    // Mounts `el` in the world, zoomed by `unit`.
    add(el) {
      const wrap = h('div', { class: 'abs', style: `zoom:${U}` }, el);
      const holder = h('div', { class: 'abs preserve' }, wrap);
      world.append(holder);
      return holder;
    },
    place(el, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1 } = {}) {
      set(el, {
        transform: `translate3d(${x * U}px, ${y * U}px, ${z * U}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`,
      });
    },
    // Screen position and scale of a world point under the current camera,
    // matching the CSS transform above.
    project([x, y, z = 0]) {
      const { tx, ty, tz, dist, yaw, pitch, roll, persp: P } = cur;
      const r = Math.PI / 180;
      let px = (x - tx) * U;
      let py = (y - ty) * U;
      let pz = (z - tz) * U;
      const cy = Math.cos(yaw * r);
      const sy = Math.sin(yaw * r);
      [px, pz] = [px * cy + pz * sy, -px * sy + pz * cy];
      const cx = Math.cos(pitch * r);
      const sx = Math.sin(pitch * r);
      [py, pz] = [py * cx - pz * sx, py * sx + pz * cx];
      const cz = Math.cos(roll * r);
      const sz = Math.sin(roll * r);
      [px, py] = [px * cz - py * sz, px * sz + py * cz];
      pz += P - dist * U;
      const k = P / (P - pz);
      return [960 + px * k, 540 + py * k, k];
    },
  };
}

// Anamorphic streak: a thin horizontal flare with a hot core, drawn in
// screen space over the world.
export function flare(color = GLOW) {
  const streak = h('div', {
    class: 'abs',
    style: `width:1800px;height:6px;margin:-3px 0 0 -900px;border-radius:50%;background:radial-gradient(50% 50% at 50% 50%, rgb(255 255 255 / 0.95), ${color} 18%, transparent 70%);filter:blur(2px);mix-blend-mode:screen;opacity:0`,
  });
  const core = h('div', {
    class: 'abs',
    style: `width:360px;height:360px;margin:-180px 0 0 -180px;border-radius:50%;background:radial-gradient(closest-side, rgb(255 255 255 / 0.55), ${color} 30%, transparent 100%);mix-blend-mode:screen;opacity:0`,
  });
  const el = h('div', { class: 'fill', style: 'pointer-events:none' }, core, streak);
  return {
    el,
    update({ x, y, amount = 1, width = 1, size = 1 }) {
      set(streak, {
        transform: `translate(${x}px, ${y}px) scaleX(${width})`,
        opacity: Math.min(1, amount),
      });
      set(core, {
        transform: `translate(${x}px, ${y}px) scale(${size})`,
        opacity: Math.min(1, amount * 0.8),
      });
    },
  };
}

// Per-shot grade: a heavy vignette plus a top light pool, so every shot sits
// in the same dark room.
export function grade(root, { pool = 'oklch(0.5 0.12 30 / 0.16)', at = '50% -10%' } = {}) {
  const light = h('div', {
    class: 'fill',
    style: `background:radial-gradient(70% 60% at ${at}, ${pool}, transparent 70%);mix-blend-mode:screen;pointer-events:none`,
  });
  const vig = h('div', {
    class: 'fill',
    style:
      'background:radial-gradient(110% 85% at 50% 50%, transparent 45%, rgb(0 0 0 / 0.55) 100%);pointer-events:none',
  });
  const fade = h('div', { class: 'fill', style: 'background:#000;opacity:0;pointer-events:none' });
  root.append(light, vig, fade);
  return { light, vig, fade };
}

// Gradient type, Linear style: bright at the top-left, falling to grey.
export const TITLE_FILL =
  'background:linear-gradient(180deg, #ffffff 20%, rgb(255 255 255 / 0.62) 100%);-webkit-background-clip:text;background-clip:text;color:transparent';

const CAM = ['tx', 'ty', 'tz', 'dist', 'yaw', 'pitch', 'roll', 'fov'];
const DEF = { tx: 0, ty: 0, tz: 0, yaw: 0, pitch: 0, roll: 0 };

// Hero shots: each `{ at, from, to }` is one camera setup that drifts at a
// constant rate from `from` to `to` until the next shot cuts in. Returns the
// camera and the active shot, so shots can carry their own settings.
export function shots(list, end, persp = 1800) {
  const base = { ...DEF, dist: persp, fov: persp };
  return (T) => {
    let i = list.length - 1;
    while (i > 0 && T < list[i].at) i--;
    const shot = list[i];
    const until = list[i + 1]?.at ?? end;
    const p = Math.min(1, Math.max(0, (T - shot.at) / (until - shot.at)));
    const a = { ...base, ...shot.from };
    const b = { ...a, ...shot.to };
    const cam = Object.fromEntries(CAM.map((k) => [k, a[k] + (b[k] - a[k]) * p]));
    return { cam, shot };
  };
}
