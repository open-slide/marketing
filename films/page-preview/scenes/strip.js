import { envelope, impulse, prog } from '#lib/anim.js';
import { h, set, text } from '#lib/dom.js';
import { glide, lerp, outExpo, swift } from '#lib/ease.js';
import { caretOn, typeOn } from '#lib/fx.js';
import { defineScene } from '#lib/scene.js';
import { C, FONT, SHADOW } from '#theme';
import { slideViewer, WIN } from '#ui/app.js';
import { DECK, ORIGIN } from '../copy.js';
import { FAINT, INK, SOFT, STAGE } from '../style.js';
import { SPANS } from '../timeline.js';

const CUE = {
  pill: 4.5,
  cap1: 4.8,
  type: 5.6,
  enter: 6.6,
  fade: 6.9,
  grow: 7.2,
  hit: 8.0,
  dims: 8.25,
  cap2: 8.35,
};
const SUFFIX = '/preview?p=1';
const CPS = 18;
const ZOOM = 0.76;
const CY = 590;
const FRAME = { w: 1280, h: 720, cy: 590 };

const caption = (str) =>
  h('div', {
    text: str,
    style: `position:absolute;left:0;right:0;top:982px;text-align:center;font-family:${FONT.sans};font-size:38px;font-weight:550;letter-spacing:-0.025em;color:${INK};white-space:nowrap`,
  });

export default defineScene({
  name: 'strip',
  span: SPANS.strip,
  sfx: [
    [CUE.pill, 'pop', 0.5],
    ...[...SUFFIX].map((_, i) => [CUE.type + i / CPS, 'type', 0.4]),
    [CUE.enter, 'key', 0.7],
    [CUE.fade, 'suck', 0.35],
    [CUE.grow, 'whoosh', 0.5, { dur: 0.9 }],
    [CUE.hit, 'thud', 0.8],
    [CUE.dims, 'tick', 0.5],
  ],
  build(root) {
    set(root, { background: STAGE });
    const app = slideViewer();
    app.slide.update();
    set(app.slide.root, { borderRadius: '18px', overflow: 'hidden' });
    const win = h(
      'div',
      { class: 'abs', style: `transform-origin:${WIN.w / 2}px ${WIN.h / 2}px` },
      app.el,
    );
    const frameShadow = h('div', {
      style: `position:absolute;left:${960 - FRAME.w / 2}px;top:${FRAME.cy - FRAME.h / 2}px;width:${FRAME.w}px;height:${FRAME.h}px;border-radius:12px;box-shadow:${SHADOW.overlay};opacity:0`,
    });

    const origin = h('span', { text: ORIGIN, style: `color:${FAINT}` });
    const path = h('span', { text: `/s/${DECK}`, style: `color:${INK}` });
    const typed = h('span', { style: `color:${C.brand}` });
    const caret = h('span', {
      style: `display:inline-block;width:3px;height:1.1em;margin-left:3px;vertical-align:-0.18em;background:${C.brand}`,
    });
    const pill = h(
      'div',
      {
        class: 'mono',
        style: `position:absolute;left:50%;top:84px;display:flex;align-items:center;height:72px;padding:0 30px;border-radius:999px;background:#fff;box-shadow:${SHADOW.floating};font-size:32px;letter-spacing:-0.01em;white-space:pre`,
      },
      origin,
      path,
      typed,
      caret,
    );

    const dims = h(
      'div',
      {
        class: 'mono',
        style: `position:absolute;left:${960 + FRAME.w / 2 - 4}px;top:${FRAME.cy - FRAME.h / 2 - 44}px;display:flex;align-items:center;gap:12px;font-size:22px;color:${SOFT};white-space:nowrap;transform:translateX(-100%)`,
      },
      h('span', { style: `width:8px;height:8px;border-radius:50%;background:${C.emerald}` }),
      '1920 × 1080',
    );

    const cap1 = caption('The editor is built for you.');
    const cap2 = caption('The preview is built for your agent.');
    root.append(frameShadow, win, pill, dims, cap1, cap2);
    return { app, win, frameShadow, pill, typed, caret, dims, cap1, cap2 };
  },
  update(s, _t, T) {
    const tx = 960 - WIN.w / 2;
    const ty = CY - WIN.h / 2;
    const punch = impulse(T, CUE.hit, 0.25);
    set(s.win, { transform: `translate(${tx}px, ${ty}px) scale(${ZOOM})` });

    const fade = prog(T, CUE.fade, 0.7, swift);
    const grow = prog(T, CUE.grow, CUE.hit - CUE.grow, glide);
    const L = s.app.layout(0);
    const sw = FRAME.w / ZOOM;
    const scale = lerp(1, sw / L.sw, grow) * (1 + punch * 0.006);
    const dx = lerp(0, WIN.w / 2 - (L.sx + L.sw / 2), grow);
    const dy = lerp(0, WIN.h / 2 + (FRAME.cy - CY) / ZOOM - (L.sy + L.sh / 2), grow);
    s.app.update({ chromeFade: fade, slideTilt: { rx: 0, rz: 0, dx, dy, s: scale } });
    set(s.frameShadow, { opacity: grow ** 3 });

    const pp = prog(T, CUE.pill, 0.6, outExpo);
    const pulse = envelope(T, CUE.enter, CUE.enter + 0.5, 0.05, 0.4);
    set(s.pill, {
      opacity: pp,
      transform: `translateX(-50%) translateY(${(1 - pp) * 16}px) scale(${1 + pulse * 0.02})`,
      boxShadow: `${SHADOW.floating}, 0 0 0 ${pulse * 6}px oklch(0.6 0.2 25 / ${0.18 * pulse})`,
    });
    const done = T > CUE.type + SUFFIX.length / CPS;
    text(s.typed, typeOn(SUFFIX, T, CUE.type, CPS));
    set(s.caret, { opacity: T > CUE.enter ? 0 : !done || caretOn(T) ? 1 : 0 });

    const dp = prog(T, CUE.dims, 0.6, outExpo);
    set(s.dims, { opacity: dp, transform: `translateX(-100%) translateY(${(1 - dp) * 10}px)` });

    const c1 = envelope(T, CUE.cap1, CUE.fade + 0.2, 0.6, 0.35);
    set(s.cap1, { opacity: c1, transform: `translateY(${(1 - c1) * 12}px)` });
    const c2 = prog(T, CUE.cap2, 0.6, outExpo);
    set(s.cap2, { opacity: c2, transform: `translateY(${(1 - c2) * 12}px)` });
  },
});
