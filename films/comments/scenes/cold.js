import { keys, prog } from '#lib/anim.js';
import { attr, h, set } from '#lib/dom.js';
import { glide, inOutSine } from '#lib/ease.js';
import { defineScene } from '#lib/scene.js';
import { BUBBLE_PATH } from '#ui/comments.js';
import { bokeh, camPath, GLOW, grade, INK, rig } from '../rig.js';
import { COLD as CUE, SPANS } from '../timeline.js';

const SIZE = 420;
const DEPTH = 16;

// The comment-mode pointer as a physical object: an extruded speech bubble
// turning in the dark, lit from the side.
function bubbleObject() {
  const k = SIZE / 24;
  const layers = Array.from({ length: DEPTH }, (_, i) => {
    const shade = Math.round(70 - (i / DEPTH) * 55);
    return h(
      'svg',
      {
        class: 'abs',
        width: SIZE,
        height: SIZE,
        viewBox: '0 0 24 24',
        style: `transform:translateZ(${-i * 2.2}px);overflow:visible`,
      },
      h('path', { d: BUBBLE_PATH, fill: `rgb(${shade} ${shade} ${shade + 2})` }),
    );
  });
  const stop = (offset, color, opacity = 1) =>
    h('stop', { offset, 'stop-color': color, 'stop-opacity': opacity });
  const sheenStops = [stop('0', '#fff', 0), stop('0.5', '#fff', 0.3), stop('1', '#fff', 0)];
  const face = h(
    'svg',
    {
      class: 'abs',
      width: SIZE,
      height: SIZE,
      viewBox: '0 0 24 24',
      style: 'transform:translateZ(1px);overflow:visible',
    },
    h(
      'defs',
      h(
        'linearGradient',
        { id: 'cold-face', x1: 0, y1: 0, x2: 0.8, y2: 1 },
        stop('0', '#ffffff'),
        stop('0.55', '#e9e9ec'),
        stop('1', '#a9abb2'),
      ),
      h(
        'linearGradient',
        { id: 'cold-sheen', x1: 0, y1: 0, x2: 1, y2: 0.35, gradientUnits: 'objectBoundingBox' },
        ...sheenStops,
      ),
    ),
    h('path', { d: BUBBLE_PATH, fill: 'url(#cold-face)' }),
    h('path', { d: BUBBLE_PATH, fill: 'url(#cold-sheen)', style: 'mix-blend-mode:screen' }),
    h('path', {
      d: BUBBLE_PATH,
      fill: 'none',
      stroke: '#111',
      'stroke-width': 1.5 / k + 0.5,
      'stroke-linejoin': 'round',
      opacity: 0.85,
    }),
  );
  const el = h(
    'div',
    { class: 'abs preserve', style: `width:${SIZE}px;height:${SIZE}px` },
    [...layers].reverse(),
    face,
  );
  return { el, sheenStops };
}

export default defineScene({
  name: 'cold',
  span: SPANS.cold,
  build(root) {
    set(root, { background: INK });
    const glow = h('div', {
      class: 'fill',
      style: `background:radial-gradient(38% 46% at 56% 52%, ${GLOW}, transparent 70%);opacity:0;mix-blend-mode:screen`,
    });
    const bk = bokeh(26, 11);
    root.append(glow, bk.el);
    const cam = rig(root, { persp: 1400, unit: 1.5 });
    const obj = bubbleObject();
    const holder = cam.add(obj.el);
    cam.place(holder, { x: -SIZE / 2, y: -SIZE / 2 });
    const g = grade(root, { pool: 'oklch(0.55 0.16 30 / 0.12)', at: '70% 40%' });

    // One unbroken orbit: the bubble turns from profile to face-on while the
    // camera eases in.
    const camAt = camPath(
      [
        [0, { tx: 30, ty: -20, dist: 1550, yaw: -46, pitch: 12, roll: -6 }],
        [SPANS.cold[1], { tx: 0, ty: 0, dist: 980, yaw: 12, pitch: -5, roll: 2 }, inOutSine],
      ],
      1400,
    );
    return { cam, obj, glow, bk, g, camAt };
  },
  update(s, _t, T) {
    s.cam.cam(s.camAt(T));
    const focus = keys(T, [
      [0, 14],
      [CUE.rack, 14],
      [CUE.rack + 1.8, 0, glide],
    ]);
    set(s.cam.view, { filter: focus > 0.05 ? `blur(${focus}px)` : 'none' });

    const sweep = prog(T, 1.0, 4.4, inOutSine);
    const [a, b, c] = s.obj.sheenStops;
    attr(a, 'offset', Math.max(0, sweep * 1.6 - 0.6));
    attr(b, 'offset', Math.min(1, Math.max(0, sweep * 1.6 - 0.3)));
    attr(c, 'offset', Math.min(1, sweep * 1.6));

    set(s.glow, { opacity: 0.1 + prog(T, 0.6, 4.6, inOutSine) * 0.45 });
    s.bk.update(T, { dx: -T * 24, fade: prog(T, 0, 1.8) });
    set(s.g.fade, { opacity: 1 - prog(T, 0, 1.6, inOutSine) });
  },
});
