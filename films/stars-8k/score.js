import { mtof, rng, SR } from '../../audio/dsp.mjs';
import {
  ARRIVE,
  COUNT_HIT,
  CRT_OFF,
  MOSAIC,
  MOSAIC_HIT,
  OUTRO,
  OUTRO_HIT,
  POWER,
  SPANS,
} from './timeline.js';

// A chiptune score built from NES-style voices instead of the house kit:
// pulse leads, a 4-bit triangle bass, and sample-and-hold noise drums.
const CHORDS = {
  Am: { root: 45, arp: [69, 72, 76] },
  F: { root: 41, arp: [69, 72, 77] },
  C: { root: 48, arp: [67, 72, 76] },
  G: { root: 43, arp: [67, 71, 74] },
};
const BARS = 'Am F C G C G Am F C G C F C'.split(' ');
const chordAt = (t) => CHORDS[BARS[Math.min(BARS.length - 1, Math.floor(t / 2))]];
const PENT = [69, 72, 74, 76, 79, 81, 84, 86, 88, 91];
const STEP16 = 0.125;

const q16 = (v) => Math.round(v * 15) / 15;

export default function score(kit) {
  const { drums, bass, pads, arps, sfx } = kit.buses;
  const noise = rng(42);

  function pulse(bus, t, midi, dur, opts = {}) {
    const { duty = 0.5, gain = 0.3, pan = 0, vib = 0, glide = 0, decay = 0, rel = 0.03 } = opts;
    const f0 = mtof(midi);
    let p = 0;
    bus.voice(
      t,
      dur + rel,
      (x) => {
        const bend =
          glide * Math.min(1, x / dur) + (vib && x > 0.15 ? vib * Math.sin(34.5 * x) : 0);
        p += (f0 * 2 ** (bend / 12)) / SR;
        p -= Math.floor(p);
        let env = x < 0.004 ? x / 0.004 : 1;
        if (decay) env *= Math.exp(-x / decay);
        if (x > dur) env *= Math.max(0, 1 - (x - dur) / rel);
        return (p < duty ? 0.5 : -0.5) * q16(env);
      },
      { gain, pan },
    );
  }

  function tri(t, midi, dur, { gain = 0.6, glide = 0, decay = 0, bus: b = bass } = {}) {
    const f0 = mtof(midi);
    let p = 0;
    b.voice(
      t,
      dur + 0.012,
      (x) => {
        p += (f0 * 2 ** ((glide * Math.min(1, x / dur)) / 12)) / SR;
        p -= Math.floor(p);
        const v = Math.round((2 - 4 * Math.abs(p - 0.5)) * 7.5) / 7.5 - 1;
        let env = decay ? Math.exp(-x / decay) : 1;
        if (x > dur) env *= Math.max(0, 1 - (x - dur) / 0.012);
        return v * env;
      },
      { gain },
    );
  }

  function hiss(
    t,
    dur,
    { rate = 12000, rateEnd = rate, gain = 0.4, decay = 0.1, pan = 0, bus: b = drums } = {},
  ) {
    let acc = 1;
    let v = 0;
    b.voice(
      t,
      dur,
      (x) => {
        acc += (rate * (rateEnd / rate) ** Math.min(1, x / dur)) / SR;
        if (acc >= 1) {
          acc -= Math.floor(acc);
          v = noise() * 2 - 1;
        }
        return v * q16(Math.exp(-x / decay));
      },
      { gain, pan },
    );
  }

  const kick = (t, g = 1) => {
    tri(t, 50, 0.13, { glide: -26, gain: g * 1.1, bus: drums });
    hiss(t, 0.02, { rate: 8000, decay: 0.006, gain: g * 0.3 });
  };
  const snare = (t, g = 1) => {
    hiss(t, 0.18, { rate: 9000, decay: 0.06, gain: g * 0.55 });
    tri(t, 55, 0.05, { glide: -12, gain: g * 0.35, bus: drums });
  };
  const hat = (t, g = 1, pan = 0.25) =>
    hiss(t, 0.05, { rate: 32000, decay: 0.014, gain: g * 0.3, pan });
  const crash = (t, g = 1) => hiss(t, 1.4, { rate: 22000, decay: 0.38, gain: g * 0.3 });
  const boom = (t, g = 1) => {
    hiss(t, 1.3, { rate: 7000, rateEnd: 260, decay: 0.34, gain: g * 0.75, bus: sfx });
    kick(t, 1.2 * g);
    crash(t, g);
  };
  const powerOn = (t) => pulse(sfx, t, 40, 0.34, { glide: 40, duty: 0.25, gain: 0.16 });
  const powerOff = (t) => {
    pulse(sfx, t, 88, CRT_OFF, { glide: -44, duty: 0.5, gain: 0.18 });
    hiss(t + CRT_OFF - 0.04, 0.12, { rate: 16000, decay: 0.04, gain: 0.2, bus: sfx });
  };
  const coin = (t, g = 0.3) => {
    pulse(sfx, t, 83, 0.07, { gain: g });
    pulse(sfx, t + 0.07, 88, 0.34, { gain: g, decay: 0.14 });
  };
  const fanfare = (t) => {
    [72, 76, 79].forEach((m, i) => {
      pulse(pads, t + i * 0.07, m, 0.07, { gain: 0.34 });
    });
    pulse(pads, t + 0.21, 84, 0.62, { gain: 0.34, vib: 0.35, decay: 0.5 });
    pulse(pads, t + 0.21, 76, 0.62, { duty: 0.25, gain: 0.2, vib: 0.35, decay: 0.5, pan: 0.3 });
    tri(t, 36, 0.8, { gain: 0.7 });
  };

  const bassLine = (from, to, g = 0.55, step = 0.25) => {
    for (let t = from, k = 0; t < to - 1e-6; t += step, k++) {
      const r = chordAt(t).root;
      tri(t, r + (k % 2 ? 12 : 0), step * 0.8, { gain: g });
    }
  };
  const chipArp = (from, to, { gain = 0.12, step = 0.0625, duty = 0.125, up = 0 } = {}) => {
    for (let t = from, k = 0; t < to - 1e-6; t += step, k++) {
      const a = chordAt(t).arp;
      pulse(arps, t, a[k % a.length] + up, step * 0.9, { duty, gain, pan: k % 2 ? 0.35 : -0.35 });
    }
  };
  const beat = (from, to, { kicks = 'four', snares = true, hats = 16, g = 1 } = {}) => {
    for (let t = from; t < to - 1e-6; t += 0.5) {
      const b = Math.round(t / 0.5) % 4;
      if (kicks === 'four' || (kicks === 'half' && b % 2 === 0)) kick(t, 0.9 * g);
      if (snares && b % 2 === 1) snare(t, 0.8 * g);
      const hs = hats === 16 ? 4 : hats === 8 ? 2 : 0;
      for (let k = 0; k < hs; k++) hat(t + (k * 0.5) / hs, (k % 2 ? 0.5 : 0.8) * g);
    }
  };
  const roll = (from, to, g = 0.7) => {
    for (let t = from; t < to - 1e-6; ) {
      const p = (t - from) / (to - from);
      snare(t, g * (0.3 + 0.7 * p));
      t += p < 0.5 ? STEP16 : STEP16 / 2;
    }
  };
  const melody = (notes) => {
    for (const [t, m, d] of notes) pulse(pads, t, m, d * 0.9, { gain: 0.3, vib: 0.25, decay: 0.6 });
  };

  powerOn(POWER.count);
  coin(0.45, 0.28);
  bassLine(1, 4, 0.4, 0.5);
  bassLine(4, 8, 0.5);
  for (let t = 2; t < 6; t += 0.25) hat(t, 0.6);
  for (let t = 4; t < 7; t += 0.5) kick(t, 0.8);
  beat(6, 7, { hats: 16 });
  roll(7, 8);
  chipArp(2, 8, { gain: 0.07 });
  ARRIVE.forEach((a, i) => {
    pulse(sfx, a, PENT[Math.floor((i / ARRIVE.length) * PENT.length)], 0.045, {
      duty: 0.25,
      gain: 0.2,
    });
  });
  pulse(pads, 6, 57, 2, { glide: 24, duty: 0.25, gain: 0.1, vib: 0.3 });

  boom(COUNT_HIT);
  fanfare(COUNT_HIT);
  beat(8.5, 11.5);
  bassLine(8.5, 11.5, 0.6);
  chipArp(8.5, 11.5, { gain: 0.08, up: 12 });
  melody([
    [9.0, 76, 0.25],
    [9.25, 79, 0.25],
    [9.5, 84, 0.5],
    [10.0, 83, 0.25],
    [10.25, 79, 0.25],
    [10.5, 74, 0.5],
    [11.0, 79, 0.25],
    [11.25, 83, 0.25],
  ]);
  for (let t = 11.5; t < SPANS.count[1] - CRT_OFF; t += STEP16 / 2) snare(t, 0.5);
  powerOff(SPANS.count[1] - CRT_OFF);

  powerOn(POWER.mosaic);
  [72, 74, 76, 77, 79, 81, 83, 84, 86].forEach((m, r) => {
    pulse(sfx, MOSAIC.raster + r * MOSAIC.rowGap, m, 0.06, { duty: 0.125, gain: 0.2 });
  });
  bassLine(12.5, 16, 0.5);
  beat(13, 14, { kicks: 'half', snares: false, hats: 8 });
  beat(14, 15, { hats: 16 });
  roll(15, 16);
  [53, 57, 60, 65, 69, 72, 77, 81, 84, 89, 93, 96].forEach((m, i) => {
    pulse(arps, MOSAIC.draw + 0.175 + i * STEP16, m, 0.1, { duty: 0.25, gain: 0.16 });
  });
  pulse(pads, 14, 53, 2, { glide: 24, duty: 0.25, gain: 0.09, vib: 0.3 });

  boom(MOSAIC_HIT);
  fanfare(MOSAIC_HIT);
  beat(16.5, 18.5);
  bassLine(16.5, 18.6, 0.6);
  chipArp(16.5, 18.6, { gain: 0.08, up: 12 });
  melody([
    [16.75, 76, 0.25],
    [17.0, 79, 0.25],
    [17.25, 84, 0.25],
    [17.5, 88, 0.5],
    [18.0, 86, 0.25],
    [18.25, 83, 0.25],
  ]);
  powerOff(SPANS.mosaic[1] - CRT_OFF);

  powerOn(POWER.outro);
  chipArp(19.1, 20, { gain: 0.1, step: 0.0625, up: 12 });
  roll(19.25, 20, 0.6);
  pulse(pads, 19, 55, 1, { glide: 29, duty: 0.25, gain: 0.1, vib: 0.3 });

  boom(OUTRO_HIT, 1.1);
  [72, 76, 79].forEach((m, i) => {
    pulse(pads, OUTRO_HIT + i * 0.06, m, 0.06, { gain: 0.32 });
  });
  pulse(pads, OUTRO_HIT + 0.18, 84, 0.3, { gain: 0.32 });
  tri(OUTRO_HIT, 36, 2.4, { gain: 0.7, decay: 2 });
  melody([
    [20.5, 79, 0.125],
    [20.625, 84, 0.125],
    [20.75, 88, 0.125],
    [20.875, 91, 0.5],
    [21.5, 88, 0.125],
    [21.625, 91, 0.125],
    [21.75, 96, 0.9],
  ]);
  beat(20.5, 22, { kicks: 'half', hats: 8, g: 0.8 });
  pulse(sfx, OUTRO.press, 96, 0.05, { gain: 0.22 });
  pulse(sfx, OUTRO.press + 0.05, 101, 0.3, { gain: 0.22, decay: 0.15 });
  coin(OUTRO.coin, 0.26);
  bassLine(22, 24.6, 0.4, 0.5);
  chipArp(22.5, 24.6, { gain: 0.06, step: 0.125 });
  for (let t = 23; t < 24.6; t += 0.5) hat(t, 0.4);
  powerOff(POWER.end);
}
