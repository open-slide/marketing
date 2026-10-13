import { impulse, prog } from '#lib/anim.js';
import { h, set, split } from '#lib/dom.js';
import { glide, inOutSine, outExpo, spring } from '#lib/ease.js';
import { defineScene } from '#lib/scene.js';
import { C, FONT } from '#theme';
import { icon } from '#ui/icons.js';
import { FEATURE, TAGLINE } from '../copy.js';
import { camPath, dissolve, GLOW, grade, INK, rig, TITLE_FILL } from '../rig.js';
import { TITLE as CUE, SPANS } from '../timeline.js';

const PIN = 132;

export default defineScene({
  name: 'title',
  span: SPANS.title,
  build(root) {
    set(root, { background: INK });
    const bloom = h('div', {
      class: 'fill',
      style: `background:radial-gradient(40% 36% at 50% 50%, ${GLOW}, transparent 72%);mix-blend-mode:screen;opacity:0`,
    });
    root.append(bloom);
    const cam = rig(root, { persp: 1600, unit: 1.25 });

    const pin = h(
      'div',
      {
        style: `width:${PIN}px;height:${PIN}px;flex:none;border-radius:999px 999px 999px 14px;background:linear-gradient(160deg, oklch(0.7 0.2 30), ${C.brand} 55%, oklch(0.48 0.18 25));display:grid;place-items:center;color:#fff;box-shadow:inset 0 2px 0 rgb(255 255 255 / 0.3), 0 30px 80px -10px oklch(0.6 0.2 25 / 0.6);transform-origin:0 100%`,
      },
      icon('message-square', { size: 58, stroke: 2 }),
    );
    const word = h('div', {
      style: `font-family:${FONT.sans};font-size:176px;font-weight:600;letter-spacing:-0.055em;line-height:1;white-space:nowrap;padding-bottom:0.1em`,
    });
    const chars = split(word, FEATURE, { by: 'char' });
    for (const c of chars) c.inner.style.cssText += `;${TITLE_FILL}`;
    const shine = h('div', {
      text: FEATURE,
      style: `position:absolute;left:0;top:0;font-family:${FONT.sans};font-size:176px;font-weight:600;letter-spacing:-0.055em;line-height:1;white-space:nowrap;background:linear-gradient(100deg, transparent 40%, rgb(255 255 255 / 0.95) 50%, transparent 60%);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;mix-blend-mode:screen`,
    });
    const wordBox = h('div', { style: 'position:relative' }, word, shine);
    const row = h('div', { style: 'display:flex;align-items:center;gap:48px' }, pin, wordBox);
    const tag = h('div', {
      text: TAGLINE,
      style: `font-family:${FONT.sans};font-size:46px;font-weight:450;letter-spacing:-0.02em;color:rgb(255 255 255 / 0.6);white-space:nowrap;margin-top:34px`,
    });
    const block = h(
      'div',
      { style: 'display:flex;flex-direction:column;align-items:center' },
      row,
      tag,
    );
    const holder = cam.add(block);
    const bw = block.offsetWidth;
    const bh = block.offsetHeight;
    cam.place(holder, { x: -bw / 2, y: -bh / 2 });

    const camAt = camPath([
      [SPANS.title[0], { tx: 0, ty: 0, dist: 2050, yaw: -6, pitch: 3, roll: -0.8 }],
      [SPANS.title[1], { tx: -10, ty: 0, dist: 1720, yaw: 4, pitch: -1, roll: 0.4 }, inOutSine],
    ]);
    const g = grade(root, { pool: 'oklch(0.55 0.14 30 / 0.1)' });
    const fadeIn = dissolve(root, SPANS.title[0]);
    return { fadeIn, cam, bloom, pin, chars, shine, tag, camAt, g };
  },
  update(s, _t, T) {
    s.fadeIn(T);
    s.cam.cam(s.camAt(T));
    const punch = impulse(T, CUE.hit, 0.6);
    set(s.bloom, { opacity: 0.16 + punch * 0.3 + prog(T, CUE.hit, 6) * 0.12 });

    const land = spring(T - CUE.hit, { stiffness: 120, damping: 17 });
    set(s.pin, {
      transform: `translateY(${(1 - land) * -24}px) scale(${Math.max(0, land)})`,
      opacity: T >= CUE.hit ? 1 : 0,
    });
    s.chars.forEach((c, i) => {
      const p = prog(T, CUE.hit + 0.15 + i * 0.06, 1.5, outExpo);
      set(c.inner, {
        opacity: p,
        filter: p < 1 ? `blur(${(1 - p) * 22}px)` : 'none',
        transform: `translateY(${(1 - p) * 28}px)`,
      });
    });
    const sw = prog(T, CUE.sweep, 2.6, glide);
    set(s.shine, { backgroundPosition: `${100 - sw * 100}% 0`, opacity: sw > 0 && sw < 1 ? 1 : 0 });
    const tp = prog(T, CUE.tag, 1.6, outExpo);
    set(s.tag, {
      opacity: tp,
      filter: tp < 1 ? `blur(${(1 - tp) * 12}px)` : 'none',
      transform: `translateY(${(1 - tp) * 16}px)`,
    });
  },
});
