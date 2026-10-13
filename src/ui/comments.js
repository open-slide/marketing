import { h, set, text } from '../lib/dom.js';
import { clamp, lerp } from '../lib/ease.js';
import { C, FONT, LIGHT, SHADOW } from '../theme.js';
import { icon } from './icons.js';

// Comment mode from core's comment-layer.tsx: pins, the floating composer
// and preview cards, the hover/marquee frames, the island hint pill, and the
// speech-bubble pointer. Sizes are core's CSS px; pass `theme` (LIGHT/DARK).

export const PIN = 24;
export const GAP = 8;
export const CARD_W = 288;

// Pin sits on the frame's top-right corner, its tail toward the target.
export function pinAt(frame) {
  return { x: frame.x + frame.w - 3, y: frame.y - PIN + 3 };
}

export function commentPin({ theme = LIGHT } = {}) {
  const el = h(
    'div',
    {
      style: `position:absolute;left:0;top:0;width:${PIN}px;height:${PIN}px;border-radius:999px 999px 999px 3px;background:${C.brand};color:oklch(0.985 0 0);display:grid;place-items:center;box-shadow:0 0 0 2px ${theme.background}, ${SHADOW.floating};transform-origin:0 100%`,
    },
    icon('message-square', { size: 12, stroke: 2 }),
  );
  return {
    el,
    update({ x, y, show = 1, lit = 0 }) {
      const s = clamp(show);
      set(el, {
        transform: `translate(${x}px, ${y}px) scale(${s * (1 + 0.1 * lit)})`,
        opacity: s > 0 ? 1 : 0,
      });
    },
  };
}

// Solid (selected), dashed (hover or idle region), or marquee (dragging).
export function commentFrame() {
  const el = h('div', {
    style: `position:absolute;left:0;top:0;border:1px solid ${C.brand};opacity:0`,
  });
  return {
    el,
    update({ x, y, w, h: hh, show = 1, style = 'solid', fill = 0 }) {
      set(el, {
        transform: `translate(${x}px, ${y}px)`,
        width: w,
        height: hh,
        opacity: clamp(show),
        borderStyle: style === 'dashed' ? 'dashed' : 'solid',
        borderColor: style === 'dashed' ? 'oklch(0.6 0.2 25 / 0.7)' : C.brand,
        background: fill ? `oklch(0.6 0.2 25 / ${fill})` : 'transparent',
      });
    },
  };
}

function card(theme) {
  return h('div', {
    style: `position:absolute;left:0;top:0;width:${CARD_W}px;border-radius:10px;border:1px solid ${theme.border};background:${theme.card};box-shadow:${SHADOW.overlay};font-family:${FONT.sans};color:${theme.fg};transform-origin:0 0`,
  });
}

// The composer: text on the card, a ⌘↵ hint, and one round send button.
export function commentComposer({
  theme = LIGHT,
  placeholder = 'Describe a change for the agent…',
} = {}) {
  const el = card(theme);
  const body = h('div', {
    style:
      'min-height:52px;padding:10px 12px 4px;font-size:12.5px;line-height:1.5;white-space:pre-wrap',
  });
  const value = h('span');
  const caret = h('span', {
    style: `display:inline-block;width:1px;height:1.15em;margin-left:1px;vertical-align:-0.2em;background:${C.brand}`,
  });
  const ph = h('span', { text: placeholder, style: `color:${theme.mutedFg};opacity:0.6` });
  body.append(value, caret, ph);
  const sendOff = h(
    'div',
    {
      style: `position:absolute;inset:0;border-radius:999px;display:grid;place-items:center;background:${theme.muted};color:${theme.mutedFg};opacity:0.5`,
    },
    icon('arrow-up', { size: 14, stroke: 2.5 }),
  );
  const sendOn = h(
    'div',
    {
      style: `position:absolute;inset:0;border-radius:999px;display:grid;place-items:center;background:${C.brand};color:oklch(0.985 0 0);box-shadow:inset 0 1px 0 oklch(1 0 0 / 0.18), 0 1px 0 oklch(0 0 0 / 0.16);opacity:0`,
    },
    icon('arrow-up', { size: 14, stroke: 2.5 }),
  );
  const send = h('div', { style: 'position:relative;width:28px;height:28px' }, sendOff, sendOn);
  const kbd = h('span', {
    text: '⌘↵',
    style: `font-family:${FONT.mono};font-size:9.5px;letter-spacing:0.04em;padding:2px 6px;border-radius:4px;border:1px solid ${theme.border};background:${theme.muted};color:${theme.mutedFg}`,
  });
  const footer = h(
    'div',
    {
      style:
        'display:flex;align-items:center;justify-content:space-between;padding:2px 8px 8px 12px',
    },
    kbd,
    send,
  );
  el.append(body, footer);
  return {
    el,
    send,
    kbd,
    update({ x, y, show = 1, typed = '', caretOn = true, press = 0 }) {
      const s = clamp(show);
      set(el, {
        transform: `translate(${x}px, ${y}px) scale(${0.94 + 0.06 * s})`,
        opacity: s,
        filter: s < 1 ? `blur(${(1 - s) * 6}px)` : 'none',
      });
      text(value, typed);
      set(ph, { display: typed ? 'none' : 'inline' });
      set(caret, { opacity: caretOn ? 1 : 0 });
      set(sendOn, { opacity: typed.trim() ? 1 : 0 });
      set(send, { transform: `scale(${1 - 0.1 * clamp(press)})` });
    },
  };
}

// Read-only hover preview: a mono meta line and the note.
export function commentPreview({ theme = LIGHT, meta = 'line 12', note = '' } = {}) {
  const el = card(theme);
  el.append(
    h('div', {
      text: meta,
      style: `padding:8px 12px 0;font-family:${FONT.mono};font-size:10px;color:${theme.mutedFg}`,
    }),
    h('p', {
      text: note,
      style: 'margin:0;padding:4px 12px 12px;font-size:12.5px;line-height:1.625',
    }),
  );
  return {
    el,
    update({ x, y, show = 1 }) {
      const s = clamp(show);
      set(el, {
        transform: `translate(${x}px, ${y}px) scale(${0.94 + 0.06 * s})`,
        opacity: s,
        filter: s < 1 ? `blur(${(1 - s) * 6}px)` : 'none',
      });
    },
  };
}

const plural = (n) => (n === 1 ? 'comment' : 'comments');

// The island pill at the bottom of the canvas. It holds either the empty hint
// or "N comments · Run /apply-comments …"; the shell eases between their
// widths while the copy blurs across, and only the digits roll on a count
// change.
export function islandHint({
  theme = LIGHT,
  empty = 'Click an element or drag across a region to leave a comment.',
} = {}) {
  const pill = `font-family:${FONT.sans};font-size:11px;line-height:16px;white-space:nowrap`;
  const hint = h('span', { text: empty, style: `${pill};position:absolute;left:12px;top:6px` });
  const digitsA = h('span', { style: 'display:block' });
  const digitsB = h('span', { style: 'display:block' });
  const roll = h(
    'span',
    { style: 'display:inline-grid;overflow:hidden;height:16px;vertical-align:bottom' },
    h('span', { style: 'display:block' }, digitsA, digitsB),
  );
  const word = h('span');
  const count = h(
    'span',
    { style: `${pill};position:absolute;left:12px;top:6px` },
    h(
      'span',
      { style: `font-weight:500;color:${theme.fg};font-variant-numeric:tabular-nums` },
      roll,
      ' ',
      word,
    ),
    h('span', { text: '·', style: 'margin:0 6px' }),
    'Run ',
    h('code', {
      text: '/apply-comments',
      style: `font-family:${FONT.mono};border-radius:4px;background:${theme.muted};padding:2px 4px;color:${theme.fg}`,
    }),
    ' in your agent to apply these.',
  );
  const el = h(
    'div',
    {
      style: `position:absolute;left:0;top:0;height:30px;border-radius:999px;border:1px solid ${theme.border};background:${theme.card};box-shadow:${SHADOW.floating};color:${theme.mutedFg};overflow:hidden;transform-origin:50% 100%`,
    },
    hint,
    count,
  );
  let widths = null;
  const measure = () => {
    text(digitsA, '6');
    text(word, 'comments');
    widths = { hint: hint.offsetWidth + 26, count: count.offsetWidth + 26 };
  };
  return {
    el,
    measure,
    // `mode` blends 0 (hint) → 1 (count). `from`/`to`/`roll` drive the digit
    // roll; the label follows the target count.
    update({ cx, y, show = 1, mode = 0, from = 0, to = 0, roll: r = 1 }) {
      if (!widths) measure();
      const s = clamp(show);
      const m = clamp(mode);
      const w = lerp(widths.hint, widths.count, m);
      set(el, {
        width: w,
        transform: `translate(${cx - w / 2}px, ${y}px) translateY(${(1 - s) * 6}px) scale(${0.9 + 0.1 * s})`,
        opacity: s,
        filter: s < 1 ? `blur(${(1 - s) * 6}px)` : 'none',
      });
      set(hint, { opacity: 1 - m, filter: `blur(${m * 6}px)` });
      set(count, { opacity: m, filter: `blur(${(1 - m) * 6}px)` });
      const up = to >= from;
      const p = clamp(r);
      text(digitsA, up ? from : to);
      text(digitsB, up ? to : from);
      set(roll.firstChild, {
        transform: `translateY(${(up ? -p : p - 1) * 16}px)`,
      });
      text(word, plural(p > 0.5 ? to : from));
    },
  };
}

// core's comment-mode pointer: a speech bubble with its tip, the hotspot, at
// the bottom-left.
const BUBBLE = 'M12 3a9 9 0 0 1 9 9a9 9 0 0 1-9 9H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 9-9z';

export function bubbleCursor({ size = 24, shadow = true } = {}) {
  const k = size / 24;
  const svg = h(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      style: `position:absolute;left:${-3 * k}px;top:${-21 * k}px;overflow:visible;${shadow ? 'filter:drop-shadow(0 3px 5px rgb(0 0 0 / 0.35))' : ''}`,
    },
    h('path', {
      d: BUBBLE,
      fill: '#fff',
      stroke: '#111',
      'stroke-width': 1.5,
      'stroke-linejoin': 'round',
    }),
  );
  const el = h(
    'div',
    { style: 'position:absolute;left:0;top:0;z-index:500;pointer-events:none' },
    svg,
  );
  return {
    el,
    svg,
    update({ x, y, opacity = 1, press = 0 }) {
      set(el, {
        transform: `translate(${x}px, ${y}px) scale(${1 - 0.12 * clamp(press)})`,
        opacity,
      });
    },
  };
}

export const BUBBLE_PATH = BUBBLE;
