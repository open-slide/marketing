import { impulse, prog, tween } from '#lib/anim.js';
import { h, set, split } from '#lib/dom.js';
import { inOutSine, outExpo } from '#lib/ease.js';
import { defineScene } from '#lib/scene.js';
import { C, FONT } from '#theme';
import { logoMark } from '#ui/logo.js';
import { CTA, FEATURE, SITE, TAGLINE } from '../copy.js';
import { flare, GLOW, grade, INK, TITLE_FILL } from '../rig.js';
import { OUTRO as CUE, SPANS } from '../timeline.js';

export default defineScene({
  name: 'outro',
  span: SPANS.outro,
  build(root) {
    set(root, { background: INK });
    const bloom = h('div', {
      class: 'fill',
      style: `background:radial-gradient(42% 40% at 50% 46%, ${GLOW}, transparent 72%);mix-blend-mode:screen;opacity:0`,
    });
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
    const stack = h('div', { class: 'fill' }, lockup, line, cta, site);
    const fl = flare();
    root.append(bloom, stack, fl.el);
    const g = grade(root, { pool: 'oklch(0.55 0.14 30 / 0.12)' });
    return { bloom, chars, stack, line, cta, site, fl, g };
  },
  update(s, _t, T) {
    const punch = impulse(T, CUE.lockup, 0.7);
    s.chars.forEach((c, i) => {
      const p = prog(T, CUE.lockup + 0.05 + i * 0.035, 0.9, outExpo);
      set(c.inner, {
        opacity: p,
        filter: p < 1 ? `blur(${(1 - p) * 14}px)` : 'none',
        transform: `translateY(${(1 - p) * 18}px)`,
      });
    });
    set(s.stack, {
      transform: `scale(${tween(T, CUE.lockup, SPANS.outro[1] - CUE.lockup, 1.02, 0.99, inOutSine)})`,
    });
    set(s.bloom, { opacity: 0.14 + punch * 0.3 });
    const rise = (el, at, extra = '') => {
      const p = prog(T, at, 0.9, outExpo);
      set(el, {
        opacity: p,
        filter: p < 1 ? `blur(${(1 - p) * 10}px)` : 'none',
        transform: `${extra}translateY(${(1 - p) * 14}px)`,
      });
    };
    rise(s.line, CUE.lockup + 0.3);
    rise(s.cta, CUE.cta, 'translateX(-50%) ');
    rise(s.site, CUE.site);
    s.fl.update({ x: 960, y: 365, amount: punch * 0.7, width: 1.1, size: 0.9 });
    set(s.g.fade, { opacity: prog(T, CUE.fade, SPANS.outro[1] - CUE.fade - 0.05, inOutSine) });
  },
});
