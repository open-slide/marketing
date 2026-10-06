import { prog, tween } from '#lib/anim.js';
import { h, set } from '#lib/dom.js';
import { inOutCubic, swift } from '#lib/ease.js';
import { defineScene } from '#lib/scene.js';
import { FONT } from '#theme';
import { icon } from '#ui/icons.js';
import { logoMark } from '#ui/logo.js';
import { CTA, SITE, STAR_BTN, SUB_LEAD, SUB_REST, THANKS } from '../copy.js';
import { FRAME, frameLines, P } from '../style.js';
import { OUTRO as CUE, DURATION, SPANS } from '../timeline.js';

const rise = (el, p, dy = 16, blur = 10) =>
  set(el, {
    opacity: p,
    transform: `translateY(${(1 - p) * dy}px)`,
    filter: p < 1 ? `blur(${((1 - p) * blur).toFixed(2)}px)` : 'none',
  });

export default defineScene({
  name: 'outro',
  span: SPANS.outro,
  sfx: [
    [CUE.thanks, 'shimmer', 0.5],
    [CUE.cta, 'pop', 0.35],
    [CUE.star, 'pop', 0.3],
    [CUE.foot, 'blip', 0.2],
  ],
  build(root) {
    set(root, { background: P.bg });
    const { lines, crosses } = frameLines();

    const words = THANKS.split(' ').map((w) =>
      h('span', { text: w, style: 'display:inline-block' }),
    );
    const thanks = h(
      'div',
      {
        style: `position:absolute;left:0;right:0;top:300px;display:flex;justify-content:center;gap:0.24em;font-family:${FONT.sans};font-size:190px;font-weight:700;letter-spacing:-0.06em;line-height:1;color:${P.fg};white-space:nowrap`,
      },
      ...words,
    );
    const sub = h(
      'div',
      {
        style: `position:absolute;left:0;right:0;top:530px;text-align:center;font-family:${FONT.sans};font-size:48px;font-weight:500;letter-spacing:-0.025em;color:${P.gray};white-space:nowrap;opacity:0`,
      },
      h('span', { text: `${SUB_LEAD} `, style: `color:${P.fg}` }),
      SUB_REST,
    );

    const btn = `display:flex;align-items:center;gap:14px;height:78px;padding:0 32px;border-radius:14px;font-size:28px;white-space:nowrap;opacity:0`;
    const cta = h(
      'div',
      {
        style: `${btn};background:${P.fg};color:#fff;font-family:${FONT.mono};box-shadow:0 8px 24px -10px rgb(0 0 0 / 0.45)`,
      },
      h('span', { text: '$', style: 'color:rgb(255 255 255 / 0.5)' }),
      CTA,
    );
    const star = h(
      'div',
      {
        style: `${btn};background:#fff;color:${P.fg};font-family:${FONT.sans};font-weight:500;box-shadow:0 0 0 1px ${P.line}, 0 2px 6px rgb(0 0 0 / 0.04)`,
      },
      icon('star', { size: 26, stroke: 1.75 }),
      STAR_BTN,
    );
    const buttons = h(
      'div',
      {
        style:
          'position:absolute;left:0;right:0;top:686px;display:flex;justify-content:center;gap:20px',
      },
      cta,
      star,
    );

    const mark = logoMark({ size: 46, glow: false });
    const foot = h(
      'div',
      {
        style: `position:absolute;left:0;right:0;top:${FRAME.y1 + 52}px;display:flex;justify-content:center;align-items:center;gap:16px;white-space:nowrap;opacity:0`,
      },
      h('div', { style: 'width:46px;height:46px' }, mark.el),
      h('span', {
        text: 'open-slide',
        style: `font-family:${FONT.sans};font-size:32px;font-weight:600;letter-spacing:-0.035em;color:${P.fg}`,
      }),
      h('span', { style: `width:1px;height:28px;background:${P.line};margin:0 8px` }),
      h('span', {
        text: SITE,
        style: `font-family:${FONT.mono};font-size:24px;color:${P.gray}`,
      }),
    );

    const veil = h('div', { class: 'fill', style: 'background:#fff;opacity:0' });
    const stage = h('div', { class: 'fill' }, thanks, sub, buttons);
    root.append(...lines, ...crosses, stage, foot, veil);
    return { lines, crosses, words, stage, sub, cta, star, foot, veil };
  },
  update(s, _t, T) {
    const fp = prog(T, CUE.thanks - 0.4, 0.8, swift);
    for (const el of [...s.lines, ...s.crosses]) set(el, { opacity: fp });

    s.words.forEach((el, i) => {
      rise(el, prog(T, CUE.thanks + i * 0.22, 1.1, swift), 40, 18);
    });
    rise(s.sub, prog(T, CUE.sub, 1, swift), 16, 8);
    rise(s.cta, prog(T, CUE.cta, 0.9, swift), 14, 6);
    rise(s.star, prog(T, CUE.star, 0.9, swift), 14, 6);
    rise(s.foot, prog(T, CUE.foot, 1, swift), 10, 6);
    set(s.stage, { transform: `scale(${tween(T, CUE.thanks, 7, 1.02, 1, swift)})` });

    set(s.veil, { opacity: prog(T, CUE.fade, DURATION - CUE.fade - 0.1, inOutCubic) });
  },
});
