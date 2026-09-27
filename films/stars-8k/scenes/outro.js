import { impulse, prog } from '#lib/anim.js';
import { attr, h, set, text } from '#lib/dom.js';
import { clamp, outBack, outExpo, snap } from '#lib/ease.js';
import { typeOn } from '#lib/fx.js';
import { hash } from '#lib/rand.js';
import { defineScene } from '#lib/scene.js';
import { FONT } from '#theme';
import { icon } from '#ui/icons.js';
import { logoMark } from '#ui/logo.js';
import { CTA, REPO, THANKS } from '../copy.js';
import { blink, crt, P, PIX, PIXS, pixelShadow } from '../style.js';
import { OUTRO as CUE, OUTRO_HIT as HIT, POWER, SPANS } from '../timeline.js';

const MARK = 170;

export default defineScene({
  name: 'outro',
  span: SPANS.outro,
  sfx: [[CUE.press, 'click', 0.9]],
  build(root) {
    set(root, { background: '#000' });
    const screen = h('div', { class: 'fill', style: `background:${P.night}` });
    const stars = Array.from({ length: 110 }, (_, i) => {
      const layer = i % 3;
      const sz = [3, 5, 8][layer];
      const el = h('div', {
        style: `position:absolute;left:0;top:${Math.floor(hash(i * 11 + 3) * 1080)}px;width:${sz}px;height:${sz}px;background:${i % 7 ? P.cream : P.cyan};opacity:${[0.35, 0.6, 0.9][layer]}`,
      });
      return { el, x0: hash(i * 5 + 1) * 2000, speed: [60, 160, 380][layer] };
    });

    const mark = logoMark({ size: MARK, tile: false });
    const word = h('div', {
      text: 'open-slide',
      style: `font-family:${PIX};font-size:84px;color:${P.cream};margin-left:18px;white-space:nowrap`,
    });
    const lockup = h(
      'div',
      { style: 'position:absolute;left:50%;top:0;display:flex;align-items:center' },
      h('div', { style: `width:${MARK}px;height:${MARK}px;flex:none` }, mark.el),
      word,
    );
    const slam = h('div', {
      text: '8,000 STARS',
      style: `position:absolute;left:50%;top:0;font-family:${PIX};font-size:118px;color:${P.yellow};text-shadow:${pixelShadow(P.brand, 12)};white-space:nowrap;opacity:0`,
    });
    const line = h('div', {
      style: `position:absolute;left:0;right:0;top:606px;text-align:center;font-family:${PIX};font-size:34px;color:${P.cream};white-space:pre`,
    });

    const starIcon = icon('star', { size: 34, stroke: 2, color: 'rgb(240 246 252 / 0.7)' });
    const starFill = icon('star', { size: 34, stroke: 2, color: '#e3b341', fill: '#e3b341' });
    const btnLabel = h('span', { text: 'Starred', style: 'display:inline-block' });
    const gh = h(
      'div',
      {
        style: `position:absolute;left:50%;top:700px;display:flex;align-items:stretch;border-radius:12px;overflow:hidden;box-shadow:inset 0 0 0 2px rgb(240 246 252 / 0.14);font-family:${FONT.sans};font-size:34px;font-weight:600;color:#f0f6fc;white-space:nowrap;opacity:0`,
      },
      h(
        'div',
        {
          style:
            'display:flex;align-items:center;gap:14px;padding:16px 28px;background:#21262d;border-right:2px solid rgb(240 246 252 / 0.14)',
        },
        h(
          'span',
          { style: 'position:relative;width:34px;height:34px;display:block' },
          h('span', { class: 'abs', style: 'display:flex' }, starIcon),
          h('span', { class: 'abs', style: 'display:flex' }, starFill),
        ),
        btnLabel,
      ),
      h('div', {
        text: '8k',
        style: 'display:flex;align-items:center;padding:16px 28px;background:#161b22',
      }),
    );

    const coinWord = h('span', { text: 'INSERT COIN', style: `color:${P.yellow}` });
    const coin = h(
      'div',
      {
        style: `position:absolute;left:0;right:0;top:858px;display:flex;justify-content:center;gap:28px;font-family:${PIX};font-size:26px;white-space:nowrap;opacity:0`,
      },
      coinWord,
      h('span', { text: '▶', style: `color:${P.grid}` }),
      h('span', { text: CTA, style: `color:${P.cream}` }),
    );
    const url = h('div', {
      text: `github.com/${REPO}`,
      style: `position:absolute;left:0;right:0;top:926px;text-align:center;font-family:${PIXS};font-size:32px;font-weight:500;color:rgb(255 244 224 / 0.6);opacity:0`,
    });

    screen.append(...stars.map((s) => s.el), lockup, slam, line, gh, coin, url);
    root.append(screen);
    set(btnLabel, { width: btnLabel.offsetWidth });
    return {
      screen,
      stars,
      mark,
      word,
      lockup,
      slam,
      line,
      gh,
      starFill,
      btnLabel,
      coin,
      coinWord,
      url,
      lw: lockup.offsetWidth,
      lh: lockup.offsetHeight,
      sw: slam.offsetWidth,
      sh: slam.offsetHeight,
      gw: gh.offsetWidth,
    };
  },
  update(s, _t, T) {
    set(s.screen, crt(T, POWER.outro, POWER.end));
    const post = T >= HIT;
    const punch = impulse(T, HIT, 0.3);

    s.stars.forEach((st) => {
      const x = ((((st.x0 - st.speed * T) % 2000) + 2000) % 2000) - 40;
      set(st.el, { transform: `translateX(${Math.round(x / 4) * 4}px)` });
    });

    s.mark.darts.forEach((g, i) => {
      const land = CUE.word + 0.1 + i * 0.08;
      const p = clamp((T - (land - 0.45)) / 0.45);
      attr(g, 'transform', `translate(${(-2000 * (1 - snap(p))).toFixed(1)} 0)`);
      attr(g, 'opacity', T < land - 0.45 ? 0 : 1);
    });
    attr(s.mark.glow, 'opacity', (prog(T, CUE.word + 0.3, 0.3) * (0.4 + punch * 0.6)).toFixed(3));
    const typed = Math.floor(clamp((T - CUE.word - 0.35) / 0.5) * 10);
    text(s.word, 'open-slide'.slice(0, typed));
    set(s.lockup, { transform: `translate(${-s.lw / 2}px, ${250 - s.lh / 2}px)` });

    const sp = prog(T, HIT, 0.3, outExpo);
    const k = post ? Math.round((3 - 2 * sp) * 8) / 8 : 3;
    set(s.slam, {
      opacity: post ? 1 : 0,
      transform: `translate(${-s.sw / 2}px, ${450 - s.sh / 2 - Math.round(punch * 3) * 6}px) scale(${k})`,
    });

    text(s.line, typeOn(THANKS.toUpperCase(), T, CUE.line, 32));

    const gp = prog(T, CUE.star, 0.5, outExpo);
    const press = impulse(T, CUE.press, 0.12);
    set(s.gh, {
      opacity: T >= CUE.star ? 1 : 0,
      transform: `translate(${-s.gw / 2}px, ${Math.round((1 - gp) * 5) * 6}px) scale(${1 - press * 0.05})`,
    });
    const starred = T >= CUE.press;
    set(s.starFill, {
      opacity: starred ? 1 : 0,
      transform: `scale(${starred ? outBack(2.4)(prog(T, CUE.press, 0.35)) : 0})`,
    });
    text(s.btnLabel, starred ? 'Starred' : 'Star');

    set(s.coin, { opacity: T >= CUE.coin ? 1 : 0 });
    set(s.coinWord, { opacity: blink(T, 1.6) ? 1 : 0.15 });
    set(s.url, { opacity: T >= CUE.coin + 0.4 ? 1 : 0 });
  },
});
