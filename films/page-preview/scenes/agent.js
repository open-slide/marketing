import { envelope, prog, tween } from '#lib/anim.js';
import { h, set, text } from '#lib/dom.js';
import { lerp, outBack, outExpo, snap, swift } from '#lib/ease.js';
import { defineScene, rectIn } from '#lib/scene.js';
import { FONT, SHADOW } from '#theme';
import { icon } from '#ui/icons.js';
import { launchSlide } from '#ui/launch-slide.js';
import { DECK } from '../copy.js';
import { BAD, FAINT, INK, OK, SOFT, STAGE } from '../style.js';
import { SPANS } from '../timeline.js';
import { previewFrame } from '../ui/frame.js';

const CUE = {
  read: 10.6,
  readOut: 11.0,
  open: 11.8,
  frame: 11.9,
  settle: 12.3,
  ready: 14.0,
  shot1: 14.5,
  flash1: 15.0,
  say: 15.9,
  flag: 16.0,
  edit: 17.0,
  editOut: 17.3,
  reload: 17.5,
  ready2: 18.0,
  shot2: 18.5,
  flash2: 19.0,
  done: 20.0,
};
const BUG = [450, 0];
const FRAME_W = 940;
const THUMB_W = 192;
const LAYERS = ['bg', 'rule', 'eyebrow', 'head', 'sub', 'img', 'pill', 'folio'];

const mono = (str, color = INK, extra = '') =>
  h('span', { class: 'mono', text: str, style: `color:${color};${extra}` });

function toolRow(name, arg) {
  return h(
    'div',
    { style: 'display:flex;align-items:center;gap:14px;height:42px;font-size:22px' },
    h('span', { style: `width:10px;height:10px;border-radius:50%;background:${INK};flex:none` }),
    mono(name, INK, 'font-weight:600'),
    mono(arg, SOFT),
  );
}

function resultRow(...children) {
  return h(
    'div',
    {
      style:
        'display:flex;align-items:center;gap:14px;min-height:40px;padding-left:4px;font-size:21px',
    },
    h('span', {
      style: `width:16px;height:16px;margin:-12px 0 0 0;border-left:2px solid ${FAINT};border-bottom:2px solid ${FAINT};flex:none`,
    }),
    ...children,
  );
}

function thumb(headOffset) {
  const s = launchSlide();
  s.update({ headOffset });
  set(s.root, { transform: `scale(${THUMB_W / 1920})` });
  return h(
    'div',
    {
      style: `position:relative;width:${THUMB_W}px;height:${THUMB_W * 0.5625}px;border-radius:6px;overflow:hidden;flex:none;box-shadow:0 0 0 1px oklch(0 0 0 / 0.1), 0 4px 12px -4px oklch(0 0 0 / 0.2)`,
    },
    s.root,
  );
}

const statusText = () => mono('', FAINT);

export default defineScene({
  name: 'agent',
  span: SPANS.agent,
  sfx: [
    [CUE.read, 'blip', 0.5],
    [CUE.readOut, 'tick', 0.5],
    [CUE.open, 'blip', 0.5],
    [CUE.frame, 'pop', 0.5],
    [CUE.ready, 'check', 0.6],
    [CUE.shot1, 'blip', 0.5],
    [CUE.flash1, 'click', 0.9],
    [CUE.flash1 + 0.05, 'swish', 0.4],
    [CUE.say, 'tick', 0.4],
    [CUE.flag, 'pop', 0.5],
    [CUE.edit, 'blip', 0.5],
    [CUE.editOut, 'tick', 0.5],
    [CUE.reload, 'swish', 0.5],
    [CUE.ready2, 'check', 0.6],
    [CUE.shot2, 'blip', 0.5],
    [CUE.flash2, 'click', 0.9],
    [CUE.flash2 + 0.05, 'swish', 0.4],
    [CUE.done, 'success', 0.7],
  ],
  build(root) {
    set(root, { background: STAGE });
    const cam = h('div', { class: 'fill', style: 'transform-origin:50% 50%' });
    root.append(cam);

    const slide = launchSlide();
    const frame = previewFrame({ w: FRAME_W, slide });
    set(frame.el, { left: '850px', top: `${560 - frame.h / 2}px` });

    const flag = h(
      'div',
      { style: `position:absolute;left:0;top:0;border:3px dashed ${BAD};border-radius:10px` },
      h('div', {
        class: 'mono',
        text: 'overlap',
        style: `position:absolute;left:-3px;top:-46px;padding:6px 12px;border-radius:6px;background:${BAD};color:#fff;font-size:20px`,
      }),
    );
    frame.box.append(flag);

    const ready1 = statusText();
    const shot1 = thumb(BUG);
    const shot2 = thumb([0, 0]);
    const sayWords = 'The headline runs under the image.'
      .split(' ')
      .map((w) => h('span', { text: `${w} `, style: 'display:inline-block;white-space:pre' }));
    const looks = h(
      'span',
      {
        style: `display:flex;align-items:center;gap:8px;font-family:${FONT.sans};font-size:24px;font-weight:550;color:${OK}`,
      },
      icon('check', { size: 24, stroke: 2.6 }),
      'Looks right.',
    );

    const groups = [
      [
        toolRow('Read', 'node_modules/.open-slide/server.json'),
        resultRow(mono('url ', FAINT), mono('http://localhost:5173/', INK)),
      ],
      [toolRow('Open', `/s/${DECK}/preview?p=1`), resultRow(ready1)],
      [toolRow('Screenshot', '1920 × 1080'), resultRow(shot1)],
      [
        h(
          'div',
          {
            style: `padding:6px 0 6px 24px;font-family:${FONT.sans};font-size:27px;font-weight:500;letter-spacing:-0.015em;color:${INK}`,
          },
          sayWords,
        ),
      ],
      [toolRow('Edit', `slides/${DECK}/index.tsx`), resultRow(mono('1 line changed', SOFT))],
      [toolRow('Screenshot', '1920 × 1080'), resultRow(shot2, looks)],
    ];
    const rows = groups.map((g) =>
      h('div', { style: 'display:flex;flex-direction:column;gap:2px' }, g),
    );
    const header = h(
      'div',
      {
        style: `display:flex;align-items:center;gap:12px;padding:0 0 18px;margin-bottom:6px;border-bottom:1px solid oklch(0 0 0 / 0.07);font-family:${FONT.sans};font-size:22px;font-weight:600;color:${INK}`,
      },
      icon('terminal', { size: 22 }),
      'Agent',
      h('span', { style: 'flex:1' }),
      mono(DECK, FAINT, 'font-size:20px;font-weight:400'),
    );
    const log = h(
      'div',
      {
        style: `position:absolute;left:110px;top:150px;width:680px;padding:28px 30px 30px;border-radius:20px;background:#fff;box-shadow:${SHADOW.floating};display:flex;flex-direction:column;gap:14px`,
      },
      header,
      rows,
    );
    cam.append(frame.el, log);

    slide.update({ headOffset: BUG });
    const head = slide.rect('head', { headOffset: BUG });
    const img = slide.rect('img');
    const k = frame.k;
    const fx = img.x - 40;
    const fr = {
      x: fx * k,
      y: (head.y - 24) * k,
      w: (head.x + head.w + 40 - fx) * k,
      h: (head.h + 48) * k,
    };
    set(flag, { transform: `translate(${fr.x}px, ${fr.y}px)`, width: fr.w, height: fr.h });

    const boxR = rectIn(frame.box, root);
    const fly = (el) => {
      const r = rectIn(el, root);
      return { dx: boxR.x - r.x, dy: boxR.y - r.y, s: boxR.w / r.w };
    };
    return {
      cam,
      slide,
      frame,
      flag,
      rows,
      ready1,
      sayWords,
      shots: [
        { el: shot1, at: CUE.flash1, ...fly(shot1) },
        { el: shot2, at: CUE.flash2, ...fly(shot2) },
      ],
      looks,
    };
  },
  update(s, _t, T) {
    const drift = tween(T, 9.6, 12.8, 1, 1.025, swift);
    set(s.cam, { transform: `scale(${drift})` });

    const rowAt = [CUE.read, CUE.open, CUE.shot1, CUE.say, CUE.edit, CUE.shot2];
    s.rows.forEach((el, i) => {
      const p = prog(T, rowAt[i], 0.45, outExpo);
      set(el, { opacity: p, transform: `translateY(${(1 - p) * 10}px)` });
    });
    const resultAt = [CUE.readOut, CUE.open + 0.3, CUE.flash1, null, CUE.editOut, CUE.flash2];
    s.rows.forEach((el, i) => {
      const r = el.children[1];
      if (!r || resultAt[i] == null) return;
      set(r, { opacity: prog(T, resultAt[i], 0.3) });
    });
    s.sayWords.forEach((w, i) => {
      const p = prog(T, CUE.say + i * 0.06, 0.35, outExpo);
      set(w, { opacity: p, transform: `translateY(${(1 - p) * 8}px)` });
    });
    text(s.ready1, T < CUE.ready ? 'loading…' : 'ready');
    set(s.ready1, { color: T < CUE.ready ? FAINT : OK });

    const fixed = prog(T, CUE.reload + 0.05, 0.4, snap);
    const headOffset = [lerp(BUG[0], 0, fixed), 0];
    s.slide.update({ headOffset });
    LAYERS.forEach((name, i) => {
      const p = prog(T, CUE.settle + i * 0.14, 0.4, swift);
      set(s.slide.layers[name], { opacity: p });
    });

    const loading = T < CUE.ready || (T >= CUE.reload && T < CUE.ready2);
    const fp = prog(T, CUE.frame, 0.6, outExpo);
    set(s.frame.el, { opacity: fp, transform: `translateY(${(1 - fp) * 16}px)` });
    const flash =
      envelope(T, CUE.flash1, CUE.flash1 + 0.35, 0.03, 0.3) +
      envelope(T, CUE.flash2, CUE.flash2 + 0.35, 0.03, 0.3);
    s.frame.update({
      path: `/s/${DECK}/preview`,
      q: '?p=1',
      status: loading ? 'loading' : 'ready',
      T,
      flash: flash * 0.85,
    });
    const press =
      envelope(T, CUE.flash1, CUE.flash1 + 0.3, 0.04, 0.25) +
      envelope(T, CUE.flash2, CUE.flash2 + 0.3, 0.04, 0.25);
    set(s.frame.box, { transform: `scale(${1 - press * 0.012})` });

    const fl = envelope(T, CUE.flag, CUE.reload + 0.1, 0.35, 0.25);
    set(s.flag, { opacity: fl });
    set(s.flag.firstChild, {
      transform: `translateY(${(1 - outBack(1.6)(Math.min(1, fl))) * 8}px)`,
    });

    for (const sh of s.shots) {
      const p = prog(T, sh.at + 0.08, 0.65, outExpo);
      const sc = lerp(sh.s, 1, p);
      set(sh.el, {
        transformOrigin: '0 0',
        transform: `translate(${sh.dx * (1 - p)}px, ${sh.dy * (1 - p)}px) scale(${sc})`,
        opacity: T < sh.at ? 0 : 1,
      });
    }
    const lp = prog(T, CUE.done, 0.45, outExpo);
    set(s.looks, { opacity: lp, transform: `translateX(${(1 - lp) * -10}px)` });
  },
});
