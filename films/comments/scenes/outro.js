import { impulse, keys, prog } from '#lib/anim.js';
import { h, set, split } from '#lib/dom.js';
import { clamp, inOutCubic, inOutSine, lerp, outExpo } from '#lib/ease.js';
import { rng } from '#lib/rand.js';
import { defineScene } from '#lib/scene.js';
import { C, FONT } from '#theme';
import { icon } from '#ui/icons.js';
import { logoMark } from '#ui/logo.js';
import { CTA, FEATURE, SITE, TAGLINE } from '../copy.js';
import { camPath, dissolve, flare, GLOW, grade, INK, rig, TITLE_FILL } from '../rig.js';
import { OUTRO as CUE, SPANS } from '../timeline.js';

const COUNT = 46;
const CONVERGE = CUE.converge;
const DRIFT = 130;

// Every comment from the film, multiplied: a field of pins the camera flies
// through, which collapses into the lockup on the bar line.
function pinField(cam) {
  const r = rng(23);
  return Array.from({ length: COUNT }, () => {
    const size = 70 + r() * 50;
    const el = h(
      'div',
      {
        style: `width:${size}px;height:${size}px;border-radius:999px 999px 999px ${size * 0.12}px;background:linear-gradient(160deg, oklch(0.7 0.2 30), ${C.brand} 55%, oklch(0.46 0.17 25));display:grid;place-items:center;color:#fff;box-shadow:inset 0 2px 0 rgb(255 255 255 / 0.28)`,
      },
      icon('message-square', { size: size * 0.42, stroke: 2 }),
    );
    const holder = cam.add(el);
    const a = r() * Math.PI * 2;
    const rad = 260 + r() ** 0.7 * 1500;
    return {
      el,
      holder,
      size,
      x: Math.cos(a) * rad,
      y: Math.sin(a) * rad * 0.62,
      z: -2600 + r() * 2900,
      spin: (r() - 0.5) * 60,
      phase: r() * 6,
    };
  });
}

export default defineScene({
  name: 'outro',
  span: SPANS.outro,
  build(root) {
    set(root, { background: INK });
    const bloom = h('div', {
      class: 'fill',
      style: `background:radial-gradient(42% 40% at 50% 46%, ${GLOW}, transparent 72%);mix-blend-mode:screen;opacity:0`,
    });
    root.append(bloom);
    const cam = rig(root, { persp: 1500 });
    const pins = pinField(cam);
    const camAt = camPath(
      [
        [SPANS.outro[0], { dist: 2500, yaw: -7, pitch: 3, roll: -2 }],
        [CONVERGE, { dist: 1650, yaw: 4, pitch: -2, roll: 1.5 }, inOutSine],
        [CUE.lockup, { dist: 1400, yaw: 0, pitch: 0, roll: 0 }, inOutSine],
      ],
      1500,
    );

    const mark = logoMark({ size: 130 });
    const name = h('div', {
      style: `font-family:${FONT.sans};font-size:118px;font-weight:700;letter-spacing:-0.05em;line-height:1.1;white-space:nowrap;padding-bottom:0.06em`,
    });
    const chars = split(name, 'open-slide', { by: 'char' });
    for (const c of chars) c.inner.style.cssText += `;${TITLE_FILL}`;
    const lockup = h(
      'div',
      {
        style:
          'position:absolute;left:0;right:0;top:300px;display:flex;align-items:center;justify-content:center;gap:34px',
      },
      h('div', { style: 'width:130px;height:130px;flex:none' }, mark.el),
      name,
    );
    const line = h(
      'div',
      {
        style: `position:absolute;left:0;right:0;top:500px;text-align:center;font-family:${FONT.sans};font-size:46px;font-weight:500;letter-spacing:-0.02em;color:rgb(255 255 255 / 0.62);white-space:nowrap`,
      },
      h('span', { text: `${FEATURE}. `, style: 'color:#f4f4f4' }),
      TAGLINE,
    );
    const cta = h(
      'div',
      {
        style: `position:absolute;left:50%;top:640px;padding:20px 32px;border-radius:16px;background:rgb(255 255 255 / 0.05);box-shadow:inset 0 0 0 1px rgb(255 255 255 / 0.12), inset 0 1px 0 rgb(255 255 255 / 0.1);font-family:${FONT.mono};font-size:32px;color:#f2f2f2;white-space:nowrap`,
      },
      h('span', { text: '$ ', style: `color:${C.brand};font-weight:700` }),
      CTA,
    );
    const site = h('div', {
      text: SITE,
      style: `position:absolute;left:0;right:0;top:790px;text-align:center;font-family:${FONT.mono};font-size:26px;letter-spacing:0.16em;color:rgb(255 255 255 / 0.48)`,
    });
    const fl = flare();
    root.append(lockup, line, cta, site, fl.el);
    const g = grade(root, { pool: 'oklch(0.55 0.14 30 / 0.12)' });
    const fadeIn = dissolve(root, SPANS.outro[0]);
    return { fadeIn, cam, pins, camAt, bloom, chars, lockup, line, cta, site, fl, g };
  },
  update(s, _t, T) {
    s.fadeIn(T);
    s.cam.cam(s.camAt(T));
    const conv = prog(T, CONVERGE, CUE.lockup - CONVERGE, inOutCubic);
    for (const p of s.pins) {
      const z = p.z + (T - SPANS.outro[0]) * DRIFT;
      const x = lerp(p.x, 0, conv);
      const y = lerp(p.y, 0, conv);
      const zz = lerp(z, 0, conv);
      s.cam.place(p.holder, {
        x: x - p.size / 2,
        y: y - p.size / 2,
        z: zz,
        ry: p.spin * Math.sin(T * 0.45 + p.phase),
        s: 1 - conv * 0.9,
      });
      const blur = Math.min(14, Math.abs(zz + 300) / 110);
      set(p.el, {
        filter: blur > 0.3 ? `blur(${blur}px)` : 'none',
        opacity: clamp(1 - prog(T, CUE.lockup - 0.25, 0.3, inOutSine)),
      });
    }

    const hit = T >= CUE.lockup;
    const punch = impulse(T, CUE.lockup, 0.8);
    s.chars.forEach((c, i) => {
      const p = prog(T, CUE.lockup + i * 0.05, 1.4, outExpo);
      set(c.inner, {
        opacity: p,
        filter: p < 1 ? `blur(${(1 - p) * 16}px)` : 'none',
        transform: `translateY(${(1 - p) * 22}px)`,
      });
    });
    const settle = keys(T, [
      [CUE.lockup, 1.04],
      [CUE.lockup + 2, 1, outExpo],
      [SPANS.outro[1], 0.985, inOutSine],
    ]);
    set(s.lockup, { opacity: hit ? 1 : 0, transform: `scale(${settle})` });
    set(s.bloom, { opacity: hit ? 0.16 + punch * 0.3 : prog(T, SPANS.outro[0], 3) * 0.1 });
    const rise = (el, at, extra = '') => {
      const p = prog(T, at, 1.2, outExpo);
      set(el, {
        opacity: p,
        filter: p < 1 ? `blur(${(1 - p) * 10}px)` : 'none',
        transform: `${extra}translateY(${(1 - p) * 16}px)`,
      });
    };
    rise(s.line, CUE.lockup + 0.4);
    rise(s.cta, CUE.cta, 'translateX(-50%) ');
    rise(s.site, CUE.site);
    s.fl.update({ x: 960, y: 365, amount: punch * 0.8, width: 1.1, size: 0.9 });
    set(s.g.fade, { opacity: prog(T, CUE.fade, SPANS.outro[1] - CUE.fade - 0.05, inOutSine) });
  },
});
