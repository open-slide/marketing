import { envelope, prog, tween } from '#lib/anim.js';
import { h, set, text } from '#lib/dom.js';
import { outExpo, swift } from '#lib/ease.js';
import { defineScene } from '#lib/scene.js';
import { C, FONT, SHADOW } from '#theme';
import { launchSlide } from '#ui/launch-slide.js';
import { DECK } from '../copy.js';
import { FAINT, INK, STAGE } from '../style.js';
import { SPANS } from '../timeline.js';
import { previewFrame } from '../ui/frame.js';
import { endPage, listPage } from '../ui/pages.js';

const PAGE = [
  [21.6, 1],
  [23.0, 2],
  [23.5, 3],
  [24.1, 2],
  [27.6, 9],
];
const STEP = [
  [25.0, 1],
  [25.5, 2],
  [26.0, 3],
  [27.6, null],
];
const CUE = { capA: 22.5, capB: 25.0, capC: 27.8, error: 27.6, end: 30.4 };
const SETTLE = 0.22;
const W = 1000;

const at = (list, T, fallback) => {
  let v = fallback;
  let since = Number.NEGATIVE_INFINITY;
  for (const [t, value] of list) {
    if (T >= t) {
      v = value;
      since = t;
    }
  }
  return { v, since };
};

const caption = (token, rest) =>
  h(
    'div',
    {
      style: `position:absolute;left:0;right:0;top:930px;display:flex;justify-content:center;align-items:baseline;gap:16px;font-family:${FONT.sans};font-size:40px;font-weight:550;letter-spacing:-0.025em;color:${INK};white-space:nowrap`,
    },
    h('span', {
      class: 'mono',
      text: token,
      style: `font-size:36px;font-weight:500;letter-spacing:0;color:${C.brand}`,
    }),
    h('span', { text: rest }),
  );

export default defineScene({
  name: 'params',
  span: SPANS.params,
  sfx: [
    ...PAGE.slice(1, 4).map(([t]) => [t, 'tick', 0.6]),
    [STEP[0][0], 'pop', 0.5],
    ...STEP.slice(1, 3).map(([t]) => [t, 'pop', 0.45]),
    [CUE.error, 'slam', 0.45],
    [CUE.capA, 'blip', 0.3],
    [CUE.capB, 'blip', 0.3],
    [CUE.capC, 'blip', 0.3],
  ],
  build(root) {
    set(root, { background: STAGE });
    const cam = h('div', { class: 'fill', style: 'transform-origin:50% 45%' });
    root.append(cam);

    const cover = launchSlide();
    cover.update();
    const list = listPage();
    const end = endPage();
    const pages = [cover.root, list.root, end.root];
    const deck = h(
      'div',
      { style: 'position:absolute;left:0;top:0;width:1920px;height:1080px' },
      pages,
    );
    const frame = previewFrame({ w: W, slide: { root: deck } });
    set(frame.el, { left: `${960 - W / 2}px`, top: '318px' });

    const pv = h('span', { class: 'pv' });
    const sv = h('span', { class: 'sv' });
    const stepPart = h(
      'span',
      { style: 'display:inline-flex' },
      h('span', { text: '&step=', style: `color:${INK}` }),
      h('span', { style: 'display:inline-block' }, sv),
    );
    const url = h(
      'div',
      {
        class: 'mono',
        style: `position:absolute;left:50%;top:118px;display:flex;align-items:center;height:96px;padding:0 40px;border-radius:999px;background:#fff;box-shadow:${SHADOW.floating};font-size:44px;letter-spacing:-0.01em;white-space:pre;transform:translateX(-50%)`,
      },
      h('span', { text: `/s/${DECK}/preview`, style: `color:${FAINT}` }),
      h('span', { text: '?p=', style: `color:${INK}` }),
      h('span', { style: 'display:inline-block' }, pv),
      stepPart,
    );
    set(pv, { color: C.brand, display: 'inline-block' });
    set(sv, { color: C.brand, display: 'inline-block' });

    const caps = [
      caption('p', 'picks the page.'),
      caption('step', 'freezes a reveal mid-way.'),
      caption('error', 'says exactly what broke.'),
    ];
    cam.append(frame.el, url, ...caps);
    return { cam, frame, pages, list, url, pv, sv, stepPart, caps };
  },
  update(s, _t, T) {
    set(s.cam, { transform: `scale(${tween(T, 21.6, 8.8, 1, 1.02, swift)})` });

    const page = at(PAGE, T, 1);
    const step = at(STEP, T, null);
    const roll = (since) => prog(T, since, 0.3, outExpo);

    text(s.pv, String(page.v));
    const pr = roll(page.since);
    set(s.pv, { transform: `translateY(${(1 - pr) * -24}px)`, opacity: pr });

    const hasStep = step.v != null;
    set(s.stepPart, { display: hasStep ? 'inline-flex' : 'none' });
    text(s.sv, hasStep ? String(step.v) : '');
    const sr = roll(step.since);
    set(s.sv, { transform: `translateY(${(1 - sr) * -24}px)`, opacity: sr });

    s.pages.forEach((el, i) => {
      set(el, { display: page.v === i + 1 ? 'block' : 'none' });
    });
    s.list.reveal(hasStep ? step.v : 3);

    const lastChange = Math.max(page.since, step.since);
    const error = page.v > 3;
    const status = error ? 'error' : T - lastChange < SETTLE ? 'loading' : 'ready';
    s.frame.update({
      path: '',
      q: '',
      status,
      T,
      error: error ? prog(T, CUE.error, 0.15) : 0,
      errorMsg: 'Page 9 is out of range (1–3).',
    });
    const fp = prog(T, 21.6, 0.01);
    set(s.frame.el, { opacity: fp });

    const capWin = [
      [CUE.capA, CUE.capB - 0.15],
      [CUE.capB, CUE.capC - 0.15],
      [CUE.capC, CUE.end],
    ];
    s.caps.forEach((el, i) => {
      const [a, b] = capWin[i];
      const e = envelope(T, a, b, 0.45, 0.2);
      set(el, { opacity: e, transform: `translateY(${(1 - e) * 12}px)` });
    });
  },
});
