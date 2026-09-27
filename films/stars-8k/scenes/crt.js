import { h, set } from '#lib/dom.js';
import { noise1 } from '#lib/rand.js';
import { defineScene } from '#lib/scene.js';
import { DURATION } from '../timeline.js';

// A tube over every chapter: scanlines, curved-glass shading, a faint flicker.
export default defineScene({
  name: 'crt',
  span: [0, DURATION],
  z: 50,
  build(root) {
    const lines = h('div', {
      class: 'fill',
      style:
        'background:repeating-linear-gradient(to bottom, rgb(0 0 0 / 0.26) 0 3px, transparent 3px 6px);mix-blend-mode:multiply',
    });
    const glass = h('div', {
      class: 'fill',
      style:
        'background:radial-gradient(120% 110% at 50% 50%, transparent 58%, rgb(0 0 0 / 0.55) 100%)',
    });
    const flicker = h('div', { class: 'fill', style: 'background:#fff;opacity:0' });
    root.append(lines, glass, flicker);
    set(root, { pointerEvents: 'none' });
    return { flicker };
  },
  update(s, _t, T) {
    set(s.flicker, { opacity: Math.max(0, noise1(T * 24, 5)) * 0.025 });
  },
});
