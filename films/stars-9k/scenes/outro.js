import { prog, tween } from '#lib/anim.js';
import { attr, h, set, split } from '#lib/dom.js';
import { inOutCubic, outExpo, swift } from '#lib/ease.js';
import { withCommas } from '#lib/fx.js';
import { defineScene } from '#lib/scene.js';
import { FONT, SHADOW } from '#theme';
import { logoMark } from '#ui/logo.js';
import { CTA, MILESTONE, SITE, THANKS } from '../copy.js';
import { goldStar, P, PAPER_BG, paper, SERIF } from '../style.js';
import { OUTRO as CUE, DURATION, SPANS } from '../timeline.js';

const MARK = 128;
const FADE = DURATION - 1.4;

export default defineScene({
  name: 'outro',
  span: SPANS.outro,
  sfx: [
    [CUE.mark, 'swell', 0.3],
    [CUE.cta, 'pop', 0.25],
    [CUE.site, 'blip', 0.18],
  ],
  build(root) {
    const bg = paper();

    const star = goldStar(26);
    const eyebrow = h(
      'div',
      {
        style:
          'position:absolute;left:0;right:0;top:250px;display:flex;justify-content:center;align-items:center;gap:18px;white-space:nowrap;opacity:0',
      },
      h('div', { style: 'width:26px;height:26px' }, star.el),
      h('span', {
        text: `${withCommas(MILESTONE)} stars on GitHub`.toUpperCase(),
        style: `font-family:${FONT.sans};font-size:22px;font-weight:500;letter-spacing:0.32em;color:${P.gold}`,
      }),
    );

    const mark = logoMark({ size: MARK, glow: false });
    const markBox = h(
      'div',
      {
        style: `width:${MARK}px;height:${MARK}px;flex:none;border-radius:${MARK * 0.22}px;box-shadow:${SHADOW.floating}, 0 18px 40px -16px rgb(60 40 10 / 0.35)`,
      },
      mark.el,
    );
    const word = h('div', {
      style: `font-family:${FONT.sans};font-size:104px;font-weight:600;letter-spacing:-0.045em;line-height:1.1;color:${P.ink};white-space:nowrap`,
    });
    const chars = split(word, 'open-slide', { by: 'char', mask: true });
    const lockup = h(
      'div',
      {
        style:
          'position:absolute;left:0;right:0;top:330px;display:flex;align-items:center;justify-content:center;gap:36px',
      },
      markBox,
      word,
    );

    const rule = h('div', {
      style: `position:absolute;left:${960 - 260}px;top:540px;width:520px;height:1.5px;background:linear-gradient(to right, transparent, ${P.hair} 20%, ${P.hair} 80%, transparent)`,
    });
    const thanks = h('div', {
      text: THANKS,
      style: `position:absolute;left:0;right:0;top:570px;text-align:center;font-family:${SERIF};font-style:italic;font-size:72px;color:${P.ink};white-space:nowrap;opacity:0`,
    });

    const cta = h(
      'div',
      {
        style: `position:absolute;left:50%;top:730px;display:flex;gap:16px;padding:20px 34px;border-radius:999px;background:rgb(255 255 255 / 0.6);box-shadow:inset 0 0 0 1.5px ${P.hair}, 0 10px 30px -18px rgb(60 40 10 / 0.3);font-family:${FONT.mono};font-size:29px;color:${P.ink};white-space:nowrap;opacity:0`,
      },
      h('span', { text: '$', style: `color:${P.gold}` }),
      h('span', { text: CTA }),
    );
    const site = h('div', {
      text: SITE,
      style: `position:absolute;left:0;right:0;top:862px;text-align:center;font-family:${FONT.mono};font-size:24px;letter-spacing:0.14em;color:${P.muted};opacity:0`,
    });

    const veil = h('div', { class: 'fill', style: `background:${PAPER_BG};opacity:0` });
    const group = h('div', { class: 'fill' }, eyebrow, lockup, rule, thanks, cta, site);
    root.append(bg, group, veil);
    return { star, eyebrow, markBox, chars, group, rule, thanks, cta, site, veil };
  },
  update(s, _t, T) {
    set(s.group, { transform: `scale(${tween(T, CUE.mark, 8, 0.985, 1.01, swift)})` });

    const mp = prog(T, CUE.mark, 1.4, outExpo);
    set(s.markBox, {
      opacity: mp,
      transform: `translateY(${(1 - mp) * 24}px) scale(${0.94 + mp * 0.06})`,
    });
    s.chars.forEach((c, i) => {
      const p = prog(T, CUE.word + i * 0.035, 1.1, outExpo);
      set(c.inner, { transform: `translateY(${(1 - p) * 105}%)`, opacity: p > 0 ? 1 : 0 });
    });

    const ep = prog(T, CUE.mark + 0.2, 1.2, swift);
    set(s.eyebrow, { opacity: ep, transform: `translateY(${(1 - ep) * 12}px)` });
    attr(s.star.outline, 'stroke-dashoffset', 0);
    attr(s.star.fill, 'opacity', 1);

    set(s.rule, { transform: `scaleX(${prog(T, CUE.line, 1.4, outExpo)})` });
    const tp = prog(T, CUE.thanks, 1.4, swift);
    set(s.thanks, {
      opacity: tp,
      transform: `translateY(${(1 - tp) * 20}px)`,
      filter: tp < 1 ? `blur(${((1 - tp) * 6).toFixed(2)}px)` : 'none',
    });

    const cp = prog(T, CUE.cta, 1.1, swift);
    set(s.cta, { opacity: cp, transform: `translateX(-50%) translateY(${(1 - cp) * 16}px)` });
    const sp = prog(T, CUE.site, 1.1, swift);
    set(s.site, { opacity: sp, transform: `translateY(${(1 - sp) * 12}px)` });

    set(s.veil, { opacity: prog(T, FADE, 1.3, inOutCubic) });
  },
});
