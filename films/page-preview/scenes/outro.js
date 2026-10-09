import { impulse, prog, tween } from '#lib/anim.js';
import { h, set, split } from '#lib/dom.js';
import { outExpo, swift } from '#lib/ease.js';
import { defineScene } from '#lib/scene.js';
import { C, FONT, SHADOW } from '#theme';
import { logoMark } from '#ui/logo.js';
import { CTA, SITE, TAGLINE } from '../copy.js';
import { FAINT, INK, SOFT, STAGE } from '../style.js';
import { DURATION, SPANS } from '../timeline.js';

const CUE = { word: 30.6, hit: 32.0, cta: 32.6, site: 33.0, fade: DURATION - 1.4 };

export default defineScene({
  name: 'outro',
  span: SPANS.outro,
  sfx: [
    [CUE.word - 0.4, 'riser', 0.45, { dur: CUE.hit - CUE.word + 0.4 }],
    [CUE.hit, 'impact', 0.55],
    [CUE.cta, 'pop', 0.45],
    [CUE.site, 'blip', 0.4],
  ],
  build(root) {
    set(root, { background: STAGE });
    const mark = logoMark({ size: 128, glow: false });
    const word = h('div', {
      style: `font-family:${FONT.sans};font-size:116px;font-weight:650;letter-spacing:-0.055em;line-height:1;color:${INK};white-space:nowrap;padding-bottom:0.08em`,
    });
    const chars = split(word, 'open-slide', { by: 'char', mask: true });
    const lockup = h(
      'div',
      {
        style:
          'position:absolute;left:0;right:0;top:330px;display:flex;align-items:center;justify-content:center;gap:32px',
      },
      h('div', { style: 'width:128px;height:128px;flex:none' }, mark.el),
      word,
    );
    const line = h('div', {
      text: TAGLINE,
      style: `position:absolute;left:0;right:0;top:534px;text-align:center;font-family:${FONT.sans};font-size:48px;font-weight:500;letter-spacing:-0.025em;color:${SOFT}`,
    });
    const cta = h(
      'div',
      {
        class: 'mono',
        style: `position:absolute;left:50%;top:668px;display:flex;align-items:center;height:76px;padding:0 32px;border-radius:999px;background:#fff;box-shadow:${SHADOW.floating};font-size:30px;color:${INK};white-space:pre`,
      },
      h('span', { text: '$ ', style: `color:${C.brand};font-weight:600` }),
      CTA,
    );
    const site = h('div', {
      class: 'mono',
      text: SITE,
      style: `position:absolute;left:0;right:0;top:810px;text-align:center;font-size:24px;letter-spacing:0.14em;color:${FAINT}`,
    });
    const veil = h('div', { class: 'fill', style: 'background:#fbfbfa;opacity:0' });
    root.append(lockup, line, cta, site, veil);
    return { chars, lockup, line, cta, site, veil };
  },
  update(s, _t, T) {
    s.chars.forEach((c, i) => {
      const p = prog(T, CUE.word + i * 0.04, 0.8, outExpo);
      set(c.inner, { transform: `translateY(${(1 - p) * 105}%)`, opacity: p > 0 ? 1 : 0 });
    });
    const punch = impulse(T, CUE.hit, 0.3);
    const drift = tween(T, 29.6, 6.4, 0.97, 1.01, swift);
    set(s.lockup, { transform: `scale(${drift + punch * 0.015})` });

    const lp = prog(T, CUE.hit + 0.1, 0.7, outExpo);
    set(s.line, { opacity: lp, transform: `translateY(${(1 - lp) * 16}px)` });
    const cp = prog(T, CUE.cta, 0.7, outExpo);
    set(s.cta, { opacity: cp, transform: `translateX(-50%) translateY(${(1 - cp) * 16}px)` });
    const sp = prog(T, CUE.site, 0.7, outExpo);
    set(s.site, { opacity: sp, transform: `translateY(${(1 - sp) * 12}px)` });
    set(s.veil, { opacity: prog(T, CUE.fade, 1.3) });
  },
});
