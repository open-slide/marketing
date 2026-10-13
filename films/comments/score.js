import { Biquad, mtof, rng, Saw, Sine, TAU } from '../../audio/dsp.mjs';
import { APPLY as CMD, NOTES } from './copy.js';
import { APPLY, CUTS, DEMO, OUTRO } from './timeline.js';

// A cinematic pulse instead of the house kit: a sub drone, felt piano,
// a ticking clock on eighths, a muted ostinato, soft toms, and braams on the
// hits. All of the sound design is drawn here too, so nothing borrows the
// shared sfx palette. One chord per bar (2 s).
const CH = {
  Dm: { root: 38, pad: [57, 60, 64, 65, 69], keys: [69, 72, 74, 76, 77, 81] },
  Bb: { root: 34, pad: [58, 62, 65, 69, 72], keys: [65, 69, 70, 72, 74, 77] },
  F: { root: 41, pad: [57, 60, 64, 65, 69], keys: [65, 69, 72, 76, 77, 81] },
  C: { root: 36, pad: [55, 60, 62, 64, 67], keys: [64, 67, 72, 74, 76, 79] },
  Gm: { root: 43, pad: [58, 62, 65, 67, 70], keys: [67, 70, 74, 77, 79, 82] },
};
const BARS = ['Dm Bb F', 'C Dm Bb', 'F C Gm', 'Bb F C', 'Bb Dm Dm', 'Dm Bb F F F']
  .join(' ')
  .split(' ');
const chordAt = (t) => CH[BARS[Math.min(BARS.length - 1, Math.floor(t / 2))]];

const typeTimes = (text, start, cps) =>
  Array.from(text, (ch, i) => [start + (i + 1) / cps, ch]).filter(([, ch]) => ch !== ' ');

export default function score(kit) {
  const { drums, bass, pads, arps, sfx, verbSend } = kit.buses;
  const { N } = kit;
  const BEAT = 0.5;

  // Instruments.

  function piano(t, midi, { gain = 0.5, pan = 0, decay = 2.6, bus = arps } = {}) {
    const f = mtof(midi);
    const parts = [1, 2, 3, 4, 5, 6].map((k) => ({
      osc: new Sine((k * 0.13) % 1),
      f: f * k * Math.sqrt(1 + 0.00035 * k * k),
      a: 1 / k ** 1.6,
      d: decay / (0.6 + k * 0.5),
    }));
    const hammer = new Biquad('lp', 1800, 0.7);
    bus.voice(
      t,
      decay * 2,
      (x) => {
        const att = x < 0.006 ? x / 0.006 : 1;
        let v = 0;
        for (const p of parts) v += p.osc.run(p.f) * p.a * Math.exp(-x / p.d);
        return (v * 0.5 + hammer.run(N()) * Math.exp(-x / 0.012) * 0.25) * att;
      },
      { gain, pan },
    );
  }

  function strings(t, dur, notes, { gain = 0.5, attack = 1.2, release = 1.4, cutoff = 1400 } = {}) {
    notes.forEach((m, n) => {
      [-0.08, 0.08].forEach((cents, k) => {
        const osc = new Saw((n * 0.31 + k * 0.47) % 1);
        const lp = new Biquad('lp', 800, 0.5);
        const f = mtof(m);
        pads.voice(
          t,
          dur + release,
          (x, i) => {
            if (i % 64 === 0) {
              const c = typeof cutoff === 'function' ? cutoff(t + x) : cutoff;
              lp.set(c, 0.5);
            }
            const vib = 1 + 0.0025 * Math.sin(TAU * (4.6 + n * 0.3) * x + k);
            const a = Math.min(1, x / attack) ** 2;
            const r = x > dur ? Math.max(0, 1 - (x - dur) / release) : 1;
            return lp.run(osc.run(f * vib * 2 ** (cents / 12))) * a * r;
          },
          { gain: gain * 0.05, pan: (k ? 0.7 : -0.7) * (n % 2 ? 1 : 0.6) },
        );
      });
    });
  }

  function drone(t, dur, midi, gain = 0.6) {
    const a = new Sine();
    const b = new Sine(0.3);
    const f = mtof(midi);
    bass.voice(
      t,
      dur,
      (x) => {
        const env = Math.min(1, x / 1.5) * Math.min(1, (dur - x) / 0.8);
        const wob = 1 + 0.15 * Math.sin(TAU * 0.25 * x);
        return (a.run(f) * 0.8 + b.run(f * 2.003) * 0.25) * env * wob;
      },
      { gain },
    );
  }

  function air(t, dur, { gain = 0.3, from = 400, to = 2400 } = {}) {
    const l = new Biquad('bp', from, 0.7);
    const r = new Biquad('bp', from, 0.7);
    pads.voice(
      t,
      dur,
      (x, i) => {
        if (i % 64 === 0) {
          const f = from * (to / from) ** (x / dur);
          l.set(f, 0.7);
          r.set(f * 1.15, 0.7);
        }
        const env = Math.min(1, x / 1.2) * Math.min(1, (dur - x) / 0.6);
        return [l.run(N()) * env, r.run(N()) * env];
      },
      { gain },
    );
  }

  function sub(t, gain = 0.8, f0 = 52) {
    const s = new Sine();
    bass.voice(
      t,
      0.5,
      (x) =>
        s.run(f0 + 40 * Math.exp(-x / 0.025)) * Math.exp(-x / 0.18) * (x < 0.003 ? x / 0.003 : 1),
      { gain },
    );
  }

  function tom(t, gain = 0.8, f0 = 92, pan = 0) {
    const s = new Sine();
    const lp = new Biquad('lp', 900, 0.8);
    drums.voice(
      t,
      0.8,
      (x) =>
        Math.tanh(s.run(f0 * (0.55 + 0.45 * Math.exp(-x / 0.06))) * Math.exp(-x / 0.32) * 1.6) +
        lp.run(N()) * Math.exp(-x / 0.03) * 0.5,
      { gain, pan },
    );
    verbSend.voice(t, 0.3, (x) => s.run(f0) * Math.exp(-x / 0.1), { gain: gain * 0.3 });
  }

  function tick(t, gain = 0.2, pan = 0) {
    const hp = new Biquad('hp', 6500, 0.9);
    const s = new Sine();
    drums.voice(
      t,
      0.05,
      (x) => hp.run(N()) * Math.exp(-x / 0.005) + s.run(5200) * Math.exp(-x / 0.004) * 0.3,
      { gain, pan },
    );
  }

  function ostinato(t, midi, dur, gain = 0.5, bright = 1) {
    const a = new Saw(0.2);
    const b = new Saw(0.7);
    const lp = new Biquad('lp', 300, 1.6);
    const f = mtof(midi);
    bass.voice(
      t,
      dur + 0.05,
      (x, i) => {
        if (i % 16 === 0) lp.set(140 + 900 * bright * Math.exp(-x / 0.05), 1.6);
        const env = (x < 0.004 ? x / 0.004 : 1) * (x > dur ? Math.max(0, 1 - (x - dur) / 0.05) : 1);
        return lp.run((a.run(f) - b.run(f * 1.004)) * 0.5) * env;
      },
      { gain },
    );
  }

  function glass(t, midi, { gain = 0.12, pan = 0, decay = 0.5 } = {}) {
    const s = new Sine();
    const m = new Sine();
    const f = mtof(midi);
    arps.voice(
      t,
      decay * 3,
      (x) => s.run(f + m.run(f * 2) * f * 0.8 * Math.exp(-x / 0.08)) * Math.exp(-x / decay),
      { gain, pan },
    );
  }

  function braam(t, notes, { gain = 0.8, dur = 3.2 } = {}) {
    notes.forEach((m, n) => {
      [-0.15, 0, 0.15].forEach((c, k) => {
        const osc = new Saw((n * 0.2 + k * 0.3) % 1);
        const lp = new Biquad('lp', 200, 1.1);
        const f = mtof(m) * 2 ** (c / 12);
        pads.voice(
          t,
          dur,
          (x, i) => {
            if (i % 32 === 0) lp.set(140 + 2600 * Math.exp(-x / 0.35) * Math.min(1, x / 0.05), 1.1);
            const env = Math.min(1, x / 0.03) * Math.exp(-x / (dur * 0.38));
            return Math.tanh(lp.run(osc.run(f)) * 2.2) * env;
          },
          { gain: gain * 0.09, pan: (k - 1) * 0.7 },
        );
      });
    });
  }

  function boom(t, gain = 1) {
    const s = new Sine();
    bass.voice(
      t,
      2.6,
      (x) => Math.tanh(s.run(28 + 46 * Math.exp(-x / 0.12)) * Math.exp(-x / 0.9) * 2.2),
      { gain: gain * 0.9 },
    );
    const lp = new Biquad('lp', 700, 0.7);
    sfx.voice(t, 1.6, (x) => lp.run(N()) * Math.exp(-x / 0.35), { gain: gain * 0.4 });
    verbSend.voice(t, 0.5, (x) => N() * Math.exp(-x / 0.15), { gain: gain * 0.7 });
  }

  // Reversed-reverb swell that lands exactly on `at`.
  function swellInto(at, dur = 1.2, gain = 0.5, top = 5000) {
    const a = new Biquad('bp', 300, 0.6);
    const b = new Biquad('bp', 300, 0.6);
    sfx.voice(
      at - dur,
      dur,
      (x, i) => {
        const p = x / dur;
        if (i % 32 === 0) {
          a.set(200 + top * p * p, 0.6);
          b.set(260 + top * p * p, 0.6);
        }
        const e = p ** 3;
        return [a.run(N()) * e, b.run(N()) * e];
      },
      { gain },
    );
  }

  // Sound design.

  function mouse(t, gain = 0.5) {
    const bp = new Biquad('bp', 2600, 1.6);
    const s = new Sine();
    sfx.voice(
      t,
      0.05,
      (x) => bp.run(N()) * Math.exp(-x / 0.0025) * 1.2 + s.run(1100) * Math.exp(-x / 0.006) * 0.3,
      { gain },
    );
  }

  const keyRng = rng(31);
  function thock(t, gain = 0.4) {
    const r = keyRng();
    const lp = new Biquad('lp', 1400 + r * 900, 0.8);
    const s = new Sine();
    const f = 120 + r * 50;
    sfx.voice(
      t,
      0.09,
      (x) => lp.run(N()) * Math.exp(-x / 0.008) * 0.9 + s.run(f) * Math.exp(-x / 0.02) * 0.7,
      { gain, pan: r * 0.5 - 0.25 },
    );
  }

  function keyDown(t, gain = 0.8) {
    thock(t, gain);
    const s = new Sine();
    sfx.voice(t, 0.3, (x) => s.run(70 - 20 * x) * Math.exp(-x / 0.07), { gain: gain * 0.6 });
    const hp = new Biquad('hp', 4000);
    sfx.voice(t + 0.012, 0.02, (x) => hp.run(N()) * Math.exp(-x / 0.003), { gain: gain * 0.4 });
  }

  // The pin landing: a soft low bloop under a glassy ping.
  function pinDrop(t, midi = 86, gain = 0.6) {
    const s = new Sine();
    sfx.voice(t, 0.25, (x) => s.run(180 + 260 * Math.min(1, x / 0.04)) * Math.exp(-x / 0.06), {
      gain: gain * 0.5,
    });
    glass(t + 0.01, midi, { gain: gain * 0.22, decay: 0.7 });
    glass(t + 0.01, midi + 12, { gain: gain * 0.06, decay: 0.4 });
  }

  function bloom(t, gain = 0.3) {
    const s = new Sine();
    const hp = new Biquad('hp', 2000);
    sfx.voice(
      t,
      0.35,
      (x) =>
        s.run(600 + 900 * (x / 0.35)) * Math.sin((Math.PI * x) / 0.35) * 0.3 +
        hp.run(N()) * Math.sin((Math.PI * x) / 0.35) * 0.2,
      { gain },
    );
  }

  function send(t, gain = 0.5) {
    const bp = new Biquad('bp', 1000, 1.4);
    sfx.voice(
      t,
      0.28,
      (x, i) => {
        if (i % 16 === 0) bp.set(800 + 7000 * (x / 0.28), 1.4);
        return bp.run(N()) * Math.sin((Math.PI * x) / 0.28);
      },
      { gain: gain * 0.6 },
    );
    glass(t + 0.12, 93, { gain: gain * 0.12, decay: 0.5 });
  }

  function roll(t, gain = 0.35) {
    [0, 0.05].forEach((o, k) => {
      const s = new Sine();
      sfx.voice(t + o, 0.04, (x) => s.run(k ? 3100 : 2500) * Math.exp(-x / 0.008), {
        gain: gain * 0.4,
      });
    });
  }

  function lock(t, gain = 0.6) {
    const s = new Sine();
    const bp = new Biquad('bp', 1800, 2);
    sfx.voice(
      t,
      0.18,
      (x) => s.run(140) * Math.exp(-x / 0.04) * 0.8 + bp.run(N()) * Math.exp(-x / 0.01),
      { gain },
    );
    glass(t + 0.02, 81, { gain: gain * 0.2, decay: 0.9 });
  }

  function resolve(t, midi, gain = 0.6) {
    const s = new Sine();
    sfx.voice(t, 0.2, (x) => s.run(900 - 2600 * x) * Math.exp(-x / 0.04), { gain: gain * 0.3 });
    glass(t, midi, { gain: gain * 0.26, decay: 1.2 });
    glass(t + 0.04, midi + 7, { gain: gain * 0.1, decay: 0.8, pan: 0.3 });
  }

  // Arrangement.

  // The pulse: ticks on eighths, a sub on beats 1 and 3, a muted ostinato,
  // optional toms, and a string chord per bar.
  const pulse = (from, to, { ticks = 1, subs = 1, ost = 1, bright = 0.6, toms = 0 } = {}) => {
    for (let t = from; t < to - 1e-6; t += BEAT / 2) {
      const step = Math.round(t / (BEAT / 2));
      tick(t, (step % 4 === 0 ? 0.17 : 0.08) * ticks, step % 2 ? 0.3 : -0.3);
    }
    for (let t = from; t < to - 1e-6; t += BEAT) {
      const b = Math.round(t / BEAT) % 4;
      if (subs && b % 2 === 0) sub(t, 0.5 * subs);
      const ch = chordAt(t);
      if (ost) {
        ostinato(t, ch.root, BEAT / 2 - 0.04, 0.36 * ost, bright);
        ostinato(t + BEAT / 2, ch.root + 12, BEAT / 2 - 0.04, 0.24 * ost, bright);
      }
      if (toms) {
        if (b === 0) tom(t, 0.65 * toms, 86);
        if (b === 1) tom(t + BEAT * 0.5, 0.4 * toms, 108, 0.25);
        if (b === 3) tom(t + BEAT * 0.5, 0.4 * toms, 76, -0.25);
      }
    }
    for (let bar = Math.ceil(from / 2) * 2; bar < to - 0.01; bar += 2) {
      strings(bar, 2, chordAt(bar).pad, {
        gain: 0.4,
        attack: 0.5,
        release: 0.8,
        cutoff: 800 + bright * 1400,
      });
    }
  };
  const motif = (from, to, { octave = 0, gain = 0.18, every = 1 } = {}) => {
    const pat = [0, 3, 1, 4, 2, 5, 3, 1];
    let k = 0;
    for (let t = from; t < to - 1e-6; t += every) {
      const keys = chordAt(t).keys;
      piano(t, keys[pat[k % pat.length]] + octave, { gain, pan: k % 2 ? 0.3 : -0.3, decay: 2 });
      k++;
    }
  };
  // Each hero-shot cut gets a soft low tap, so the edit breathes with the
  // music.
  const cut = (t, gain = 0.3) => {
    sub(t, gain, 48);
    tick(t, 0.12);
  };

  // Demo: the music starts with the first shot and builds across the montage.
  drone(0, 26, 26, 0.18);
  pulse(0, 8, { ticks: 0.8, subs: 0.7, ost: 0.5, bright: 0.4 });
  pulse(8, 14, { ticks: 0.9, subs: 0.9, ost: 0.8, bright: 0.5 });
  pulse(14, 23, { ticks: 1, subs: 1, ost: 1, bright: 0.65 });
  pulse(23, 26, { ticks: 1.1, subs: 1, ost: 1, bright: 0.8, toms: 0.5 });
  motif(0, 26, { gain: 0.15 });
  for (const t of Object.values(CUTS).slice(1)) cut(t);

  mouse(DEMO.modeClick, 0.5);
  lock(DEMO.modeClick + 0.02, 0.5);
  bloom(DEMO.hint, 0.22);

  mouse(DEMO.click, 0.55);
  pinDrop(DEMO.click + 0.02, 86, 0.55);
  bloom(DEMO.click + 0.06, 0.2);
  for (const [t] of typeTimes(NOTES.head, DEMO.type, DEMO.cps)) thock(t, 0.28);
  mouse(DEMO.send, 0.5);
  send(DEMO.send + 0.02, 0.5);
  roll(DEMO.count + 0.05, 0.5);

  mouse(DEMO.down, 0.45);
  const dragDur = DEMO.up - DEMO.down;
  const drag = new Biquad('bp', 1200, 2);
  sfx.voice(
    DEMO.down,
    dragDur,
    (x, i) => {
      if (i % 32 === 0) drag.set(800 + 2200 * (x / dragDur), 2);
      return drag.run(N()) * Math.sin((Math.PI * x) / dragDur);
    },
    { gain: 0.1 },
  );
  mouse(DEMO.up, 0.4);
  pinDrop(DEMO.up + 0.02, 88, 0.55);
  bloom(DEMO.up + 0.06, 0.2);
  for (const [t] of typeTimes(NOTES.chart, DEMO.type2, DEMO.cps2)) thock(t, 0.26);
  keyDown(DEMO.post, 0.5);
  send(DEMO.post + 0.03, 0.45);

  mouse(DEMO.click3, 0.5);
  pinDrop(DEMO.click3 + 0.02, 91, 0.55);
  for (const [t] of typeTimes(NOTES.kicker, DEMO.type3, DEMO.cps3)) thock(t, 0.26);
  keyDown(DEMO.post3, 0.5);
  send(DEMO.post3 + 0.03, 0.45);

  DEMO.badges.forEach((t, i) => {
    pinDrop(t, [86, 89, 93][i], 0.5);
  });
  air(23, 3, { gain: 0.18, from: 500, to: 3200 });

  // Apply: the terminal over ticks and a rising string bed, a breath, then
  // the drop.
  for (let t = 26; t < APPLY.enter - 1e-6; t += BEAT / 2) tick(t, 0.11, 0);
  for (let t = 26; t < APPLY.enter; t += BEAT * 2) sub(t, 0.35 + (t - 26) * 0.08);
  strings(26, APPLY.enter - 26, [62, 65, 69, 74], {
    gain: 0.45,
    attack: 1.6,
    release: 0.2,
    cutoff: (t) => 600 + (t - 26) * 900,
  });
  for (const [t] of typeTimes(CMD, APPLY.type, APPLY.cps)) thock(t, 0.36);
  keyDown(APPLY.enter, 0.75);
  swellInto(APPLY.drop, 0.6, 0.3, 6000);

  braam(APPLY.drop, [26, 38, 45, 50, 57], { gain: 0.75, dur: 3.2 });
  boom(APPLY.drop, 0.9);
  pulse(30, 35, { ticks: 1.15, subs: 1.1, ost: 1.05, bright: 1, toms: 0.9 });
  motif(30, 35, { octave: 12, gain: 0.13, every: 0.5 });
  APPLY.resolve.forEach((t, i) => {
    resolve(t, [86, 89, 93][i], 0.6);
  });
  APPLY.rest.forEach((t, i) => {
    glass(t, [96, 98, 100][i], { gain: 0.06, decay: 0.5 });
    roll(t, 0.35);
  });
  bloom(APPLY.clear + 0.1, 0.18);
  cut(APPLY.close, 0.35);

  // Outro: the copy over a held chord, then the logo lands on the bar with
  // one heavy low hit that rings out under the fade.
  strings(OUTRO.text, OUTRO.logo - OUTRO.text, CH.Bb.pad, {
    gain: 0.45,
    attack: 0.4,
    release: 0.3,
    cutoff: 1600,
  });
  drone(OUTRO.text, OUTRO.logo - OUTRO.text + 0.2, 34, 0.3);
  piano(OUTRO.text + 0.15, 74, { gain: 0.24, decay: 3 });
  piano(OUTRO.text + 1.15, 77, { gain: 0.2, pan: 0.25, decay: 3 });
  for (let t = OUTRO.text; t < OUTRO.logo - 0.4; t += BEAT) tick(t, 0.06, 0);
  boom(OUTRO.logo, 1);
  braam(OUTRO.logo, [29, 41, 48, 53], { gain: 0.55, dur: 4.2 });
  strings(OUTRO.logo, 3.8, [53, 57, 60, 65, 69, 72], {
    gain: 0.55,
    attack: 0.05,
    release: 1.2,
    cutoff: (t) => 2600 - (t - OUTRO.logo) * 380,
  });
  drone(OUTRO.logo, 4, 29, 0.5);
}
