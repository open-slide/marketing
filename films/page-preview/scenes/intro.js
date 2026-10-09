import { impulse, prog, tween } from '#lib/anim.js';
import { h, set, split, text } from '#lib/dom.js';
import { outExpo, swift } from '#lib/ease.js';
import { caretOn, scramble, typeOn } from '#lib/fx.js';
import { defineScene } from '#lib/scene.js';
import { C, FONT, SHADOW } from '#theme';
import { logoMark } from '#ui/logo.js';
import { FEATURE, ROUTE } from '../copy.js';
import { INK, SOFT, STAGE } from '../style.js';
import { SPANS } from '../timeline.js';

const CUE = { eyebrow: 0.4, word: 1.0, hit: 2.0, pill: 2.3, url: 2.55 };
const EYEBROW = 'New in open-slide';
const CPS = 32;
const SPLIT = ROUTE.indexOf('preview');

export default defineScene({
  name: 'intro',
  span: SPANS.intro,
  sfx: [
    [0.2, 'swell', 0.5],
    [CUE.eyebrow, 'blip', 0.4],
    [CUE.hit, 'impact', 0.55],
    [CUE.pill, 'pop', 0.45],
    ...[...ROUTE].map((_, i) => [CUE.url + i / CPS, 'type', 0.3]),
  ],
  build(root) {
    set(root, { background: STAGE });
    const mark = logoMark({ size: 52, glow: false });
    const eyebrow = h('div', {
      class: 'mono',
      style: `font-size:24px;letter-spacing:0.2em;text-transform:uppercase;color:${SOFT};white-space:nowrap`,
    });
    const top = h(
      'div',
      { style: 'display:flex;align-items:center;gap:18px;height:52px' },
      h('div', { style: 'width:52px;height:52px;flex:none' }, mark.el),
      eyebrow,
    );
    const word = h('div', {
      style: `font-family:${FONT.sans};font-size:176px;font-weight:650;letter-spacing:-0.055em;line-height:1;color:${INK};white-space:nowrap;padding-bottom:0.08em`,
    });
    const chars = split(word, FEATURE, { by: 'char', mask: true });
    const head = h('span', { style: `color:${INK}` });
    const tail = h('span', { style: `color:${C.brand}` });
    const caret = h('span', {
      style: `display:inline-block;width:3px;height:1.1em;margin-left:4px;vertical-align:-0.18em;background:${C.brand}`,
    });
    const pill = h(
      'div',
      {
        class: 'mono',
        style: `display:flex;align-items:center;height:76px;padding:0 30px;border-radius:999px;background:#fff;box-shadow:${SHADOW.floating};font-size:34px;letter-spacing:-0.01em;white-space:pre`,
      },
      head,
      tail,
      caret,
    );
    const stack = h(
      'div',
      {
        style:
          'position:absolute;left:0;right:0;top:50%;display:flex;flex-direction:column;align-items:center;gap:40px',
      },
      top,
      word,
      pill,
    );
    root.append(stack);
    return { eyebrow, top, chars, pill, head, tail, caret, stack, h: stack.offsetHeight };
  },
  update(s, _t, T) {
    const ep = prog(T, CUE.eyebrow, 0.6, outExpo);
    text(s.eyebrow, scramble(EYEBROW, T, CUE.eyebrow, 0.6, 5));
    set(s.top, { opacity: ep, transform: `translateY(${(1 - ep) * 14}px)` });
    s.chars.forEach((c, i) => {
      const p = prog(T, CUE.word + i * 0.035, 0.8, outExpo);
      set(c.inner, { transform: `translateY(${(1 - p) * 105}%)`, opacity: p > 0 ? 1 : 0 });
    });

    const pp = prog(T, CUE.pill, 0.6, outExpo);
    set(s.pill, {
      opacity: pp,
      transform: `translateY(${(1 - pp) * 18}px) scale(${0.96 + 0.04 * pp})`,
    });
    const typed = typeOn(ROUTE, T, CUE.url, CPS);
    text(s.head, typed.slice(0, SPLIT));
    text(s.tail, typed.slice(SPLIT));
    const done = T > CUE.url + ROUTE.length / CPS;
    set(s.caret, { opacity: !done || caretOn(T) ? 1 : 0 });

    const punch = impulse(T, CUE.hit, 0.3);
    const drift = tween(T, 0, 4.4, 0.97, 1.01, swift);
    set(s.stack, { transform: `translateY(${-s.h / 2}px) scale(${drift + punch * 0.015})` });
  },
});
