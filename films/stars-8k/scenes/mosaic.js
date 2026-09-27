import { impulse, prog } from '#lib/anim.js';
import { h, set, text } from '#lib/dom.js';
import { outExpo } from '#lib/ease.js';
import { typeOn, withCommas } from '#lib/fx.js';
import { hash } from '#lib/rand.js';
import { defineScene } from '#lib/scene.js';
import { MILESTONE } from '../copy.js';
import { STARGAZERS } from '../stargazers.js';
import { blink, CONFETTI, crt, P, PIX, PIXS, pixelShadow, pixelStar } from '../style.js';
import { CRT_OFF, MOSAIC_HIT as HIT, MOSAIC, POWER, SPANS } from '../timeline.js';

const EIGHT = ['.####.', '##..##', '##..##', '.####.', '##..##', '##..##', '.####.'];
const K = ['##..##', '##.##.', '####..', '###...', '####..', '##.##.', '##..##'];
const BLANK = '.'.repeat(16);
const MASK = [BLANK, ...EIGHT.map((r, i) => `.${r}..${K[i]}.`), BLANK];
const COLS = 16;
const ROWS = 9;
const CELL = 100;
const AV = 88;
const SCALE = 0.72;
const BX = 960 - (COLS * CELL * SCALE) / 2;
const BY = 572 - (ROWS * CELL * SCALE) / 2;
const TIP = HIT + 0.7;
const OFF = SPANS.mosaic[1] - CRT_OFF;

const cells = [];
MASK.forEach((row, r) => {
  [...row].forEach((ch, c) => {
    cells.push({ r, c, on: ch === '#' });
  });
});
const lit = cells.filter((x) => x.on).length;
const RECENT = STARGAZERS.slice(-cells.length);
const center = RECENT.findIndex((s) => s.n === MILESTONE);
const LIT = RECENT.slice(center - Math.floor(lit / 2) - 6, center - Math.floor(lit / 2) - 6 + lit);
const REST = RECENT.filter((s) => !LIT.includes(s));
let li = 0;
let ri = 0;
for (const cell of cells) cell.who = cell.on ? LIT[li++] : REST[ri++];
const champCell = cells.find((x) => x.who.n === MILESTONE);
const spot = cells.find((x) => x.r === 1 && x.c === 3);
[champCell.who, spot.who] = [spot.who, champCell.who];
cells.forEach((cell, i) => {
  cell.drawAt = MOSAIC.draw + hash(i * 17 + 3) * (MOSAIC.drawEnd - MOSAIC.draw);
});
const RANGE = `#${withCommas(RECENT[0].n)}-#${withCommas(RECENT.at(-1).n)}`;

export default defineScene({
  name: 'mosaic',
  span: SPANS.mosaic,
  build(root) {
    set(root, { background: '#000' });
    const screen = h('div', {
      class: 'fill',
      style: `background:${P.night};background-image:linear-gradient(rgb(255 46 136 / 0.07) 2px, transparent 2px), linear-gradient(90deg, rgb(255 46 136 / 0.07) 2px, transparent 2px);background-size:48px 48px`,
    });
    const title = h('div', {
      text: 'HALL OF FAME',
      style: `position:absolute;left:0;right:0;top:78px;text-align:center;font-family:${PIX};font-size:58px;color:${P.yellow};text-shadow:${pixelShadow(P.brand, 8)}`,
    });
    const board = h('div', {
      style: `position:absolute;left:${BX}px;top:${BY}px;width:${COLS * CELL}px;height:${ROWS * CELL}px;transform:scale(${SCALE});transform-origin:0 0;background:${P.ink};box-shadow:0 0 0 10px ${P.cream}, 0 0 0 20px ${P.ink}, 0 0 0 30px ${P.grid}`,
    });
    const items = cells.map((cell) => {
      const style = `position:absolute;inset:0;width:${AV}px;height:${AV}px;image-rendering:pixelated;opacity:0`;
      const px8 = h('img', { src: cell.who.px8, style });
      const px16 = h('img', { src: cell.who.px16, style });
      const full = h('img', {
        src: cell.who.src,
        style: style.replace(';image-rendering:pixelated', ''),
      });
      const el = h(
        'div',
        {
          style: `position:absolute;left:${cell.c * CELL + (CELL - AV) / 2}px;top:${cell.r * CELL + (CELL - AV) / 2}px;width:${AV}px;height:${AV}px;background:rgb(255 255 255 / 0.04)`,
        },
        px8,
        px16,
        full,
      );
      board.append(el);
      return { ...cell, el, px8, px16, full };
    });
    const champ = items.find((x) => x.who.n === MILESTONE);

    const tipText = h('span', {
      style: `font-family:${PIXS};font-size:38px;font-weight:700;color:${P.cream}`,
    });
    const caret = h('span', {
      text: '▼',
      style: `font-family:${PIX};font-size:18px;color:${P.yellow};margin-left:6px`,
    });
    const tip = h(
      'div',
      {
        style: `position:absolute;left:0;top:0;display:flex;align-items:center;gap:18px;padding:16px 24px;background:${P.ink};box-shadow:0 0 0 5px ${P.cream}, 0 0 0 10px ${P.ink};white-space:nowrap;opacity:0`,
      },
      pixelStar(34, P.yellow),
      h('span', {
        text: `#${withCommas(MILESTONE)}`,
        style: `font-family:${PIX};font-size:26px;color:${P.yellow}`,
      }),
      tipText,
      caret,
    );

    const caption = h('div', {
      style: `position:absolute;left:0;right:0;top:958px;text-align:center;font-family:${PIX};font-size:24px;color:${P.cream};white-space:pre`,
    });

    const sparks = Array.from({ length: 70 }, (_, i) => {
      const sz = 8 + Math.floor(hash(i * 13 + 2) * 3) * 4;
      const el = h('div', {
        style: `position:absolute;left:0;top:0;width:${sz}px;height:${sz}px;background:${CONFETTI[i % CONFETTI.length]};opacity:0`,
      });
      return { el, a: hash(i * 7 + 5) * Math.PI * 2, d: 500 + hash(i * 3 + 1) * 700 };
    });

    const tail = h('div', {
      style: `position:absolute;left:0;top:0;width:0;height:0;border-left:16px solid transparent;border-right:16px solid transparent;border-top:18px solid ${P.cream};opacity:0`,
    });
    screen.append(title, board, ...sparks.map((sp) => sp.el), tip, tail, caption);
    root.append(screen);

    const cx = BX + (champ.c * CELL + CELL / 2) * SCALE;
    const cy = BY + champ.r * CELL * SCALE;
    return {
      screen,
      title,
      board,
      items,
      champ,
      tip,
      tail,
      tipText,
      caret,
      caption,
      sparks,
      cx,
      cy,
    };
  },
  update(s, _t, T) {
    set(s.screen, crt(T, POWER.mosaic, OFF));
    const post = T >= HIT;
    const punch = impulse(T, HIT, 0.3);

    set(s.title, {
      opacity: T >= MOSAIC.raster - 0.2 ? 1 : 0,
      transform: `translateY(${post ? -Math.round(punch * 3) * 6 : 0}px)`,
    });

    s.items.forEach((it) => {
      const shown = T >= MOSAIC.raster + it.r * MOSAIC.rowGap;
      const drawn = it.on && T >= it.drawAt;
      const stage =
        !post || !it.on
          ? 0
          : T < HIT + 0.08 + it.c * 0.015
            ? 0
            : T < HIT + 0.2 + it.c * 0.015
              ? 1
              : 2;
      const dim = post && !it.on ? 0.14 : 0.32;
      const op = !shown ? 0 : drawn ? 1 : dim;
      set(it.px8, { opacity: stage === 0 ? op : 0 });
      set(it.px16, { opacity: stage === 1 ? op : 0 });
      set(it.full, { opacity: stage === 2 ? op : 0 });
      const pop = drawn ? impulse(T, it.drawAt, 0.08) * 0.25 : 0;
      set(it.el, {
        transform: `scale(${1 + pop + (it.on ? punch * 0.1 : 0)})`,
        boxShadow: drawn
          ? `0 0 0 5px ${post && blink(T + it.c * 0.05, 4) && T < HIT + 1 ? P.cyan : P.yellow}`
          : 'none',
        zIndex: drawn ? 1 : 0,
      });
    });

    set(s.board, {
      boxShadow: `0 0 0 10px ${P.cream}, 0 0 0 20px ${P.ink}, 0 0 0 30px ${post && T < HIT + 0.6 && blink(T, 8) ? P.yellow : P.grid}`,
    });

    s.sparks.forEach((sp) => {
      const p = prog(T, HIT, 1.2, outExpo);
      const d = sp.d * p;
      const x = Math.round((960 + Math.cos(sp.a) * d) / 8) * 8;
      const y = Math.round((572 + Math.sin(sp.a) * d * 0.6) / 8) * 8;
      set(sp.el, { opacity: post && p < 0.95 ? 1 : 0, transform: `translate(${x}px, ${y}px)` });
    });

    text(s.tipText, `@${typeOn(s.champ.who.login, T, TIP + 0.15, 22)}`);
    set(s.caret, { opacity: T > TIP + 0.8 && blink(T, 2) ? 1 : 0 });
    set(s.tip, {
      opacity: T >= TIP ? 1 : 0,
      transform: `translate(${s.cx - 150}px, ${s.cy - 104 + (T < TIP + 0.1 ? 8 : 0)}px)`,
    });

    set(s.tail, {
      opacity: T >= TIP ? 1 : 0,
      transform: `translate(${s.cx - 16}px, ${s.cy - 24}px)`,
    });
    const loading = T < HIT;
    const dots = '.'.repeat(Math.floor(T * 4) % 4).padEnd(3, ' ');
    text(s.caption, loading ? `LOADING PLAYERS${dots}` : `THE NEWEST 144 OF 8,000 STARS  ${RANGE}`);
    set(s.caption, {
      opacity: T < MOSAIC.raster ? 0 : loading || blink(T, 5) || T > HIT + 0.6 ? 1 : 0,
      color: loading ? P.cyan : P.cream,
    });
  },
});
