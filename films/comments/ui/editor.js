import { h, set, text } from '#lib/dom.js';
import { clamp, swift } from '#lib/ease.js';
import { C, FONT, DARK as P, SHADOW } from '#theme';
import { miniSlide } from '#ui/app.js';
import { icon } from '#ui/icons.js';
import { q3Slide } from './slide.js';

export const WIN = { w: 1600, h: 940, tool: 48, rail: 232, notes: 36 };

const btn = (name, { size = 28, iconSize = 15, color = 'oklch(0.93 0 0 / 0.72)' } = {}) =>
  h(
    'div',
    {
      style: `width:${size}px;height:${size}px;border-radius:5px;display:grid;place-items:center;flex:none;color:${color}`,
    },
    icon(name, { size: iconSize }),
  );

const sep = (height = 20) =>
  h('div', {
    style: `width:1px;height:${height}px;background:${P.hairline};margin:0 6px;flex:none`,
  });

const kbd = (label) =>
  h('span', {
    text: label,
    style: `font-family:${FONT.mono};font-size:9.5px;line-height:1;padding:3px 5px;border-radius:3px;border:1px solid ${P.border};color:${P.mutedFg}`,
  });

// Preview / Edit / Comment, with the sliding card behind the active icon.
export function modeSwitcher() {
  const indicator = h('div', {
    style: `position:absolute;left:2px;top:2px;width:32px;height:28px;border-radius:6px;background:${P.card};box-shadow:${SHADOW.edge}, inset 0 0 0 1px oklch(1 0 0 / 0.08)`,
  });
  const items = ['eye', 'pencil', 'message-square'].map((name) =>
    h(
      'div',
      {
        style: `position:relative;z-index:1;width:32px;height:28px;display:grid;place-items:center;color:${P.mutedFg}`,
      },
      icon(name, { size: 15 }),
    ),
  );
  const badge = h('div', {
    style: `position:absolute;right:-6px;top:-6px;z-index:2;height:14px;min-width:14px;padding:0 4px;border-radius:999px;background:${C.brand};color:#fff;font-family:${FONT.mono};font-size:9px;font-weight:600;line-height:14px;text-align:center;opacity:0`,
  });
  const el = h(
    'div',
    {
      style: `position:relative;display:flex;height:34px;padding:2px;border-radius:8px;border:1px solid ${P.border};background:oklch(0.23 0 0 / 0.7);flex:none`,
    },
    indicator,
    items,
  );
  items[2].append(badge);
  return {
    el,
    items,
    update({ mode = 1, count = 0 }) {
      set(indicator, { transform: `translateX(${mode * 32}px)` });
      items.forEach((it, i) => {
        set(it, { color: Math.abs(mode - i) < 0.5 ? P.fg : P.mutedFg });
      });
      set(badge, { opacity: count > 0 ? 1 : 0 });
      text(badge, count);
    },
  };
}

function toolbar() {
  const tabs = h(
    'div',
    {
      style: `display:flex;padding:2px;border-radius:7px;background:oklch(0.23 0 0 / 0.7);box-shadow:inset 0 0 0 1px ${P.border}`,
    },
    h('div', {
      text: 'Slides',
      style: `height:24px;padding:0 12px;display:grid;place-items:center;font-size:12px;font-weight:500;border-radius:5px;background:${P.card};color:${P.fg};box-shadow:inset 0 0 0 1px oklch(1 0 0 / 0.06)`,
    }),
    h('div', {
      text: 'Assets',
      style: `height:24px;padding:0 12px;display:grid;place-items:center;font-size:12px;color:${P.mutedFg}`,
    }),
  );
  const agent = h(
    'div',
    {
      style: `height:22px;display:flex;align-items:center;gap:6px;padding:0 7px;border-radius:3px;border:1px solid ${P.hairline};font-size:10.5px;color:${P.fg}`,
    },
    h('span', { style: `width:6px;height:6px;border-radius:50%;background:${C.emerald}` }),
    'Agent connected',
  );
  const switcher = modeSwitcher();
  const present = h(
    'div',
    {
      style: `display:flex;height:28px;border-radius:5px;background:${C.brandDark};color:#fff;font-size:12.5px;font-weight:500;overflow:hidden`,
    },
    h(
      'div',
      { style: 'display:flex;align-items:center;gap:6px;padding:0 12px' },
      icon('play', { size: 13, fill: '#fff' }),
      'Present',
    ),
    h(
      'div',
      {
        style:
          'width:26px;display:grid;place-items:center;border-left:1px solid rgb(255 255 255 / 0.25)',
      },
      icon('chevron-down', { size: 14 }),
    ),
  );
  const textBtn = (label, name) =>
    h(
      'div',
      {
        style: `height:28px;padding:0 9px;display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:500;color:${P.fg}`,
      },
      icon(name, { size: 14 }),
      label,
    );
  const el = h(
    'div',
    {
      style: `position:absolute;left:0;top:0;width:${WIN.w}px;height:${WIN.tool}px;display:flex;align-items:center;padding:0 12px;gap:8px;color:${P.fg}`,
    },
    btn('chevron-left'),
    sep(),
    tabs,
    agent,
    h('div', { style: 'flex:1' }),
    switcher.el,
    sep(),
    btn('link-2'),
    btn('download'),
    h(
      'div',
      { style: 'display:flex;align-items:center;gap:6px' },
      textBtn('Design', 'palette'),
      kbd('D'),
    ),
    textBtn('Format', 'panel-right'),
    sep(),
    present,
    h('div', {
      text: 'Q3 Board Review',
      style: `position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:13.5px;font-weight:600;letter-spacing:-0.01em;color:${P.fg}`,
    }),
  );
  return { el, switcher };
}

const PAGES = [
  null,
  { bg: '#f3f0e8', fg: '#0c0c0c', accent: C.brand, title: 'Northfold\nQ3 review', kind: 'main' },
  { bg: '#0c0c0c', fg: '#f3f0e8', accent: C.brand, title: 'Pipeline\n+38%', kind: 'block' },
  { bg: '#f3f0e8', fg: '#0c0c0c', accent: C.brand, title: 'Hiring\nplan', kind: 'list' },
  { bg: C.brand, fg: '#fff', accent: '#0c0c0c', title: 'Q4\nbets', kind: 'block' },
  { bg: '#f3f0e8', fg: '#0c0c0c', accent: C.brand, title: 'Asks', kind: 'list' },
];

export const THUMB = 176;

function rail() {
  const mini = q3Slide();
  set(mini.root, { transform: `scale(${THUMB / 1920})` });
  const rows = PAGES.map((spec, i) => {
    const thumb = spec
      ? miniSlide(spec, { w: THUMB })
      : h(
          'div',
          {
            style: `position:relative;width:${THUMB}px;height:${THUMB * 0.5625}px;overflow:hidden;border-radius:4px`,
          },
          mini.root,
        );
    const badge = h('div', {
      style: `height:16px;min-width:16px;padding:0 4px;border-radius:999px;background:${C.brand};color:#fff;font-family:${FONT.mono};font-size:9.5px;font-weight:600;line-height:16px;text-align:center;transform-origin:50% 50%;opacity:0`,
    });
    const el = h(
      'div',
      {
        style: `display:flex;gap:10px;padding:8px 10px 8px 8px;border-radius:6px;${i === 0 ? `background:${P.muted}` : ''}`,
      },
      h(
        'div',
        { style: 'width:18px;display:flex;flex-direction:column;align-items:center;gap:6px' },
        h('span', {
          text: String(i + 1).padStart(2, '0'),
          style: `font-family:${FONT.mono};font-size:10px;color:${i === 0 ? C.brandDark : P.mutedFg};padding-top:2px`,
        }),
        badge,
      ),
      h(
        'div',
        {
          style: `border-radius:5px;box-shadow:0 0 0 ${i === 0 ? `1.5px ${C.brandDark}` : `1px ${P.hairline}`}`,
        },
        thumb,
      ),
    );
    return { el, badge };
  });
  const el = h(
    'div',
    {
      style: `position:absolute;left:0;top:${WIN.tool}px;width:${WIN.rail}px;height:${WIN.h - WIN.tool - WIN.notes}px;padding:6px 8px;overflow:hidden`,
    },
    h(
      'div',
      {
        style: `display:flex;align-items:center;justify-content:space-between;padding:8px 8px 10px;color:${P.mutedFg}`,
      },
      h('span', {
        text: 'PAGES',
        style: 'font-size:11px;font-weight:500;letter-spacing:0.08em',
      }),
      h(
        'div',
        { style: 'display:flex;align-items:center;gap:8px' },
        h('span', { text: '06', style: `font-family:${FONT.mono};font-size:10.5px` }),
        icon('grid-2x2', { size: 13 }),
      ),
    ),
    rows.map((r) => r.el),
  );
  return { el, rows, mini };
}

// The editor in dark mode, comment mode on. `overlay` is in window px, like
// core's comment layer; `toWin` maps a slide rect into it.
export function editor() {
  const slide = q3Slide();
  const tb = toolbar();
  const rl = rail();
  const cardX = WIN.rail + 8;
  const cardW = WIN.w - cardX - 8;
  const cardH = WIN.h - WIN.tool - WIN.notes;
  const k = Math.min((cardW - 80) / 1920, (cardH - 80) / 1080);
  const L = {
    k,
    cardX,
    cardW,
    cardH,
    sx: cardX + (cardW - 1920 * k) / 2,
    sy: WIN.tool + (cardH - 1080 * k) / 2,
    sw: 1920 * k,
    sh: 1080 * k,
  };
  const card = h('div', {
    style: `position:absolute;left:${cardX}px;top:${WIN.tool}px;width:${cardW}px;height:${cardH}px;border-radius:10px;background:${P.background};box-shadow:inset 0 0 0 1px ${P.hairline}`,
  });
  set(slide.root, { transform: `translate(${L.sx}px, ${L.sy}px) scale(${k})` });
  const slideShadow = h('div', {
    style: `position:absolute;left:${L.sx}px;top:${L.sy}px;width:${L.sw}px;height:${L.sh}px;border-radius:6px;box-shadow:0 0 0 1px rgb(0 0 0 / 0.4), 0 20px 60px -10px rgb(0 0 0 / 0.6)`,
  });
  const notes = h(
    'div',
    {
      style: `position:absolute;left:0;bottom:0;width:${WIN.w}px;height:${WIN.notes}px;display:flex;align-items:center;gap:8px;padding:0 16px;font-size:12px;color:${P.mutedFg}`,
    },
    icon('notebook-pen', { size: 14 }),
    'Notes',
    h('span', { text: 'page 1/6', style: `font-family:${FONT.mono};font-size:10.5px` }),
  );
  const overlay = h('div', {
    style: `position:absolute;left:0;top:0;width:${WIN.w}px;height:${WIN.h}px;pointer-events:none`,
  });
  const el = h(
    'div',
    {
      style: `position:absolute;left:0;top:0;width:${WIN.w}px;height:${WIN.h}px;border-radius:16px;overflow:hidden;background:${P.chrome};box-shadow:inset 0 0 0 1px oklch(1 0 0 / 0.09), inset 0 1px 0 oklch(1 0 0 / 0.12);font-family:${FONT.sans};color:${P.fg}`,
    },
    tb.el,
    rl.el,
    card,
    slideShadow,
    slide.root,
    notes,
    overlay,
  );
  return {
    el,
    overlay,
    slide,
    mini: rl.mini,
    rows: rl.rows,
    switcher: tb.switcher,
    L,
    // Island pill centre-x and top, in window px (core: bottom-3 of the canvas).
    island: { cx: cardX + cardW / 2, y: WIN.tool + cardH - 12 - 30 },
    toWin(r) {
      return { x: L.sx + r.x * k, y: L.sy + r.y * k, w: r.w * k, h: r.h * k };
    },
    update({ mode = 2, count = 0, edits = {}, badges = [] } = {}) {
      tb.switcher.update({ mode, count });
      slide.update(edits);
      rl.mini.update(edits);
      rl.rows.forEach((r, i) => {
        const b = badges[i];
        const s = b ? clamp(b.show ?? 1) : 0;
        set(r.badge, {
          opacity: s > 0 ? 1 : 0,
          transform: `scale(${s > 0 ? swift(s) : 0})`,
        });
        if (b) text(r.badge, b.n);
      });
    },
  };
}
