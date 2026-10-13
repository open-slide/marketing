import { prog } from '#lib/anim.js';
import { h, set } from '#lib/dom.js';
import { inOutSine, outExpo } from '#lib/ease.js';
import { defineScene } from '#lib/scene.js';
import { FONT } from '#theme';
import { FEATURE, TAGLINE } from '../copy.js';
import { grade, INK, TITLE_FILL } from '../rig.js';
import { OUTRO as CUE, SPANS } from '../timeline.js';
import { LOGO_SVG } from '../ui/logo.js';

const word = (text, style) =>
  h('span', { text, style: `display:inline-block;margin-right:0.25em;${style}` });

export default defineScene({
  name: 'outro',
  span: SPANS.outro,
  build(root) {
    set(root, { background: INK });
    const words = [
      ...`${FEATURE}.`.split(' ').map((w) => word(w, TITLE_FILL)),
      ...TAGLINE.split(' ').map((w) => word(w, 'color:rgb(255 255 255 / 0.5)')),
    ];
    const line = h(
      'div',
      {
        style: `position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;font-family:${FONT.sans};font-size:66px;font-weight:600;letter-spacing:-0.035em;line-height:1.2;white-space:nowrap`,
      },
      words,
    );
    const text = h('div', { class: 'fill' }, line);

    // The logo holds perfectly still: no entrance, no drift, just presence.
    const logo = h(
      'div',
      {
        class: 'fill',
        style: `display:flex;align-items:center;justify-content:center;gap:40px;background:radial-gradient(46% 42% at 50% 50%, oklch(0.3 0.06 35 / 0.35), transparent 72%)`,
      },
      h('div', { html: LOGO_SVG, style: 'width:168px;height:168px;flex:none' }),
      h('div', {
        text: 'open-slide',
        style: `font-family:${FONT.sans};font-size:132px;font-weight:700;letter-spacing:-0.05em;line-height:1;padding-bottom:0.08em;white-space:nowrap;${TITLE_FILL}`,
      }),
    );
    root.append(text, logo);
    const g = grade(root, { pool: 'oklch(0.55 0.14 30 / 0.08)' });
    return { text, logo, words, g };
  },
  update(s, _t, T) {
    const onLogo = T >= CUE.logo;
    set(s.text, { display: onLogo ? 'none' : 'block' });
    set(s.logo, { display: onLogo ? 'flex' : 'none' });
    s.words.forEach((w, i) => {
      const p = prog(T, CUE.text + 0.15 + i * 0.07, 0.9, outExpo);
      set(w, {
        opacity: p,
        filter: p < 1 ? `blur(${(1 - p) * 14}px)` : 'none',
        transform: `translateY(${(1 - p) * 16}px)`,
      });
    });
    set(s.g.fade, {
      opacity: prog(T, CUE.fade, SPANS.outro[1] - CUE.fade - 0.05, inOutSine),
    });
  },
});
