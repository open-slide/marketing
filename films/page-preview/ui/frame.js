import { h, set, text } from '#lib/dom.js';
import { clamp } from '#lib/ease.js';
import { FONT, SHADOW } from '#theme';
import { BAD, FAINT, INK, OK } from '../style.js';

const TONE = {
  loading: { fg: 'oklch(0.145 0 0 / 0.6)', bg: 'oklch(0.145 0 0 / 0.05)', dot: FAINT },
  ready: { fg: OK, bg: 'oklch(0.6 0.15 155 / 0.1)', dot: OK },
  error: { fg: BAD, bg: 'oklch(0.6 0.2 25 / 0.1)', dot: BAD },
};

// The chrome-less preview: a bare 16:9 page with the route and its
// data-osd-preview state above it. `slide.root` is a 1920 × 1080 element.
export function previewFrame({ w, slide, fontSize = 22 }) {
  const k = w / 1920;
  const hh = w * 0.5625;
  const url = h('span', { style: `color:${INK}` });
  const query = h('span', { style: 'color:oklch(0.6 0.2 25)' });
  const dot = h('span', { style: 'width:9px;height:9px;border-radius:50%;flex:none' });
  const state = h('span');
  const chip = h(
    'div',
    {
      class: 'mono',
      style: `display:flex;align-items:center;gap:10px;height:40px;padding:0 16px;border-radius:999px;font-size:${fontSize - 2}px;white-space:nowrap`,
    },
    dot,
    h('span', {}, h('span', { text: 'data-osd-preview=', style: `color:${FAINT}` }), state),
  );
  const header = h(
    'div',
    {
      style: `position:absolute;left:0;top:-62px;width:${w}px;display:flex;align-items:center;justify-content:space-between`,
    },
    h(
      'div',
      { class: 'mono', style: `font-size:${fontSize}px;white-space:pre;letter-spacing:-0.01em` },
      url,
      query,
    ),
    chip,
  );
  set(slide.root, { transform: `scale(${k})`, transformOrigin: '0 0' });
  const bar = h('div', {
    style:
      'position:absolute;left:0;top:0;width:32%;height:4px;border-radius:2px;background:oklch(0.6 0.2 25)',
  });
  const errorText = h('div', {
    class: 'mono',
    style: `position:absolute;left:36px;top:32px;right:36px;font-size:${fontSize + 2}px;line-height:1.5;color:oklch(0.72 0.17 25);white-space:pre-wrap`,
  });
  const errorLayer = h(
    'div',
    { style: 'position:absolute;inset:0;background:#000;opacity:0' },
    errorText,
  );
  const flash = h('div', { style: 'position:absolute;inset:0;background:#fff;opacity:0' });
  const box = h(
    'div',
    {
      style: `position:absolute;left:0;top:0;width:${w}px;height:${hh}px;border-radius:14px;overflow:hidden;background:#000;box-shadow:${SHADOW.overlay};font-family:${FONT.sans}`,
    },
    slide.root,
    errorLayer,
    bar,
    flash,
  );
  const el = h(
    'div',
    { style: `position:absolute;left:0;top:0;width:${w}px;height:${hh}px` },
    header,
    box,
  );

  return {
    el,
    box,
    header,
    k,
    w,
    h: hh,
    update({
      path = '',
      q = '',
      status = 'loading',
      T = 0,
      flash: fl = 0,
      error = 0,
      errorMsg = '',
    }) {
      text(url, path);
      text(query, q);
      const tone = TONE[status];
      text(state, `"${status}"`);
      set(state, { color: tone.fg });
      set(dot, { background: tone.dot });
      set(chip, { background: tone.bg });
      const loading = status === 'loading';
      const x = ((T * 0.9) % 1) * 1.6 - 0.35;
      set(bar, { opacity: loading ? 1 : 0, transform: `translateX(${x * w}px)` });
      set(errorLayer, { opacity: clamp(error) });
      text(errorText, errorMsg);
      set(flash, { opacity: clamp(fl) });
    },
  };
}
