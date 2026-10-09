import { h, set } from '#lib/dom.js';
import { C, FONT } from '#theme';

const page = (...children) =>
  h(
    'div',
    {
      style: `position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden;background:${C.paper};color:#0a0a0a;font-family:${FONT.sans}`,
    },
    h('div', {
      style: 'position:absolute;left:140px;top:100px;width:1640px;height:3px;background:#0a0a0a',
    }),
    ...children,
  );

const folio = (n) =>
  h('div', {
    text: `0${n} / 03`,
    style: `position:absolute;left:1660px;top:1000px;font-family:${FONT.mono};font-size:22px;letter-spacing:0.08em;color:#6b6b6b`,
  });

export const ITEMS = ['One page per URL.', 'Frozen mid-reveal.', 'Ready when settled.'];

export function listPage() {
  const items = ITEMS.map((label, i) =>
    h(
      'div',
      {
        style:
          'display:flex;align-items:baseline;gap:48px;padding:34px 0;border-top:2px solid #0a0a0a',
      },
      h('span', {
        text: `0${i + 1}`,
        style: `font-family:${FONT.mono};font-size:34px;color:${C.hot}`,
      }),
      h('span', {
        text: label,
        style: 'font-size:84px;font-weight:700;letter-spacing:-0.04em;line-height:1',
      }),
    ),
  );
  const root = page(
    h('div', {
      text: 'WHAT SHIPS',
      style: `position:absolute;left:140px;top:150px;font-family:${FONT.mono};font-size:26px;letter-spacing:0.3em;color:${C.hot}`,
    }),
    h('div', { style: 'position:absolute;left:140px;top:300px;width:1640px' }, items),
    folio(2),
  );
  return {
    root,
    reveal(n) {
      items.forEach((el, i) => {
        set(el, { opacity: i < n ? 1 : 0 });
      });
    },
  };
}

export function endPage() {
  const root = page(
    h('div', {
      text: 'Thanks.',
      style:
        'position:absolute;left:140px;top:330px;font-size:300px;font-weight:800;letter-spacing:-0.06em;line-height:1',
    }),
    h('div', {
      text: 'open-slide.dev',
      style: `position:absolute;left:150px;top:720px;font-family:${FONT.mono};font-size:40px;color:${C.hot}`,
    }),
    folio(3),
  );
  return { root };
}
