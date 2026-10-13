import { h, set } from '#lib/dom.js';
import { DARK } from '#theme';
import {
  bubbleCursor,
  CARD_W,
  commentComposer,
  commentFrame,
  commentPin,
  GAP,
  islandHint,
  PIN,
  pinAt,
} from '#ui/comments.js';
import { cursor } from '#ui/cursor.js';
import { HINT_EMPTY } from '../copy.js';
import { rig } from '../rig.js';
import { editor, WIN } from './editor.js';

// The chart region the second comment frames, in slide px.
export const REGION_RECT = { x: 1110, y: 300, w: 640, h: 590 };
export const COMMENTS = ['head', 'chart', 'kicker'];

// The dark editor floating in a camera rig, with comment mode's whole layer:
// a pin and frame per comment, the hover and marquee frames, one composer,
// the island pill, and both pointers (bubble on the canvas, arrow on cards).
export function editorStage(root, { unit = 2.5 } = {}) {
  const cam = rig(root, { unit });
  const ed = editor();
  cam.place(cam.add(ed.el), { x: -WIN.w / 2, y: -WIN.h / 2 });
  const sheen = h('div', {
    class: 'abs',
    style:
      'width:900px;height:2400px;top:-700px;background:linear-gradient(90deg, transparent, rgb(255 255 255 / 0.06) 45%, rgb(255 255 255 / 0.11) 50%, rgb(255 255 255 / 0.06) 55%, transparent);mix-blend-mode:screen;pointer-events:none',
  });
  ed.el.append(sheen);

  ed.slide.measure();
  const F = {
    head: ed.toWin(ed.slide.rect('head')),
    chart: ed.toWin(REGION_RECT),
    kicker: ed.toWin(ed.slide.rect('kicker')),
  };
  const P = Object.fromEntries(COMMENTS.map((k) => [k, pinAt(F[k])]));
  // core's placeBeside: right of the pin, flipped left when it would
  // overflow the layer.
  const cardAt = (k) => {
    let x = P[k].x + PIN + GAP;
    if (x + CARD_W > WIN.w - GAP) x = P[k].x - CARD_W - GAP;
    return { x, y: Math.max(GAP, P[k].y) };
  };

  const hover = commentFrame();
  const marquee = commentFrame();
  const frames = Object.fromEntries(COMMENTS.map((k) => [k, commentFrame()]));
  const pins = Object.fromEntries(COMMENTS.map((k) => [k, commentPin({ theme: DARK })]));
  const composer = commentComposer({ theme: DARK });
  const island = islandHint({ theme: DARK, empty: HINT_EMPTY });
  const bubble = bubbleCursor({ size: 24 });
  const arrow = cursor({ size: 24 });
  ed.overlay.append(
    hover.el,
    marquee.el,
    ...COMMENTS.map((k) => frames[k].el),
    ...COMMENTS.map((k) => pins[k].el),
    composer.el,
    island.el,
    bubble.el,
    arrow.el,
  );
  island.measure();
  composer.update({ x: 0, y: 0, show: 0 });
  ed.update({});

  const overCard = (x, y, card) =>
    card && x > card.x - 4 && x < card.x + CARD_W + 4 && y > card.y - 4 && y < card.y + 100;

  return {
    cam,
    ed,
    sheen,
    F,
    P,
    cardAt,
    hover,
    marquee,
    frames,
    pins,
    composer,
    island,
    toWorld: (x, y) => [x - WIN.w / 2, y - WIN.h / 2],
    // Bubble over the canvas, arrow over a card, like core.
    pointer(T, { x, y, press = 0, clicks = [], card = null, show = 1 }) {
      const a = overCard(x, y, card) ? 1 : 0;
      bubble.update({ x, y, press, opacity: show * (1 - a) });
      arrow.update(T, { x, y, clicks: a ? clicks : [], opacity: show * a });
    },
    sweep(T, t0, speed = 360) {
      set(sheen, { transform: `translateX(${-900 + (T - t0) * speed}px) rotate(18deg)` });
    },
  };
}
