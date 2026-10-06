import { mtof, SR } from '../../audio/dsp.mjs';
import { COUNT, FIELD, OUTRO } from './timeline.js';

// A quiet chamber score instead of the house kit: felt piano, a slow string
// pad, and glass bells on the two arrivals. D major, one chord per bar.
const CH = {
  Gmaj9: { bass: 43, pad: [55, 59, 62, 66, 69], arp: [55, 62, 66, 69, 71, 74] },
  Asus: { bass: 45, pad: [57, 62, 64, 69, 71], arp: [57, 62, 64, 69, 71, 76] },
  Dmaj9: { bass: 38, pad: [50, 57, 61, 64, 66], arp: [50, 57, 61, 64, 66, 69] },
  Bm9: { bass: 47, pad: [50, 54, 57, 59, 61], arp: [47, 54, 57, 61, 62, 66] },
  'D/F#': { bass: 42, pad: [54, 57, 61, 62, 64], arp: [54, 57, 62, 64, 66, 69] },
  Em9: { bass: 40, pad: [55, 59, 62, 64, 66], arp: [52, 59, 62, 66, 67, 71] },
  A7sus: { bass: 45, pad: [55, 57, 62, 64, 67], arp: [57, 62, 64, 67, 69, 74] },
};
const BARS = 'Gmaj9 Asus Dmaj9 Bm9 Gmaj9 D/F# Em9 Dmaj9 Gmaj9 Asus Bm9 Dmaj9'.split(' ');
const chordAt = (t) => CH[BARS[Math.min(BARS.length - 1, Math.floor(t / 2))]];

export default function score(kit) {
  const { padChord, bell, kick, reverseCymbal } = kit;
  const { arps } = kit.buses;

  // Additive piano: slightly stretched partials, higher ones dying first.
  function piano(t, midi, { gain = 0.3, pan = 0, dur = 3, bus = arps } = {}) {
    const f = mtof(midi);
    const B = 0.00035;
    const base = 2.6 * (f / 262) ** -0.45;
    const parts = [1, 2, 3, 4, 5, 6].map((n) => ({
      w: (2 * Math.PI * f * n * Math.sqrt(1 + B * n * n)) / SR,
      a: (1 / n ** 1.25) * (n === 1 ? 1 : 0.7),
      tau: base / (1 + 0.7 * (n - 1)),
      ph: n * 0.37,
    }));
    const len = Math.min(dur, base * 2.2) + 0.3;
    bus.voice(
      t,
      len,
      (x) => {
        let v = 0;
        for (const p of parts) v += p.a * Math.sin(p.ph + p.w * x * SR) * Math.exp(-x / p.tau);
        const atk = x < 0.004 ? x / 0.004 : 1;
        const rel = x > len - 0.3 ? Math.max(0, (len - x) / 0.3) : 1;
        return v * atk * rel * 0.5;
      },
      { gain, pan },
    );
  }
  const roll = (t, notes, gain = 0.26, gap = 0.035) =>
    notes.forEach((m, k) => {
      piano(t + k * gap, m, { gain: gain * (k ? 0.8 : 1), pan: (k / notes.length - 0.5) * 0.6 });
    });
  const pad = (from, bars, g = 0.55, cutoff = 1300) => {
    for (let b = 0; b < bars; b++) {
      const t = from + b * 2;
      padChord(t, 2, chordAt(t).pad, { gain: g, cutoff, attack: 0.9, release: 1.2 });
    }
  };
  const arp = (from, to, { step = 0.5, gain = 0.15, up = 12, climb = 0 } = {}) => {
    for (let t = from, k = 0; t < to - 1e-6; t += step, k++) {
      const a = chordAt(t).arp;
      const lift = Math.floor((climb * (t - from)) / (to - from)) * 12;
      piano(t, a[(k * 2) % a.length] + up + lift, {
        gain: gain * (0.85 + 0.15 * ((k + 1) % 2)),
        pan: k % 2 ? 0.35 : -0.35,
        dur: 1.6,
      });
    }
  };
  const low = (t, m, g = 0.3) => piano(t, m, { gain: g, dur: 4 });
  const glass = (t, notes, g = 0.08) =>
    notes.forEach((m, k) => {
      bell(t + k * 0.09, m, g, k % 2 ? 0.45 : -0.45, 2.2);
    });

  // Count: a hairline of sound, then the odometer climbing into the 9.
  padChord(0, 2, CH.Gmaj9.pad, {
    gain: 0.5,
    cutoff: (t) => 500 + t * 400,
    attack: 1.6,
    release: 1.2,
  });
  piano(COUNT.line, 74, { gain: 0.2 });
  piano(COUNT.number, 69, { gain: 0.17, pan: -0.2 });
  piano(COUNT.number + 0.5, 78, { gain: 0.15, pan: 0.2 });
  pad(2, 1, 0.5, 1200);
  arp(2, 4, { step: 0.25, gain: 0.1, up: 12 });
  reverseCymbal(COUNT.hit, 1.4, 0.25);

  low(COUNT.hit, 38, 0.36);
  low(COUNT.hit, 50, 0.22);
  roll(COUNT.hit, [62, 69, 73, 76, 78], 0.22);
  glass(COUNT.hit + 0.05, [86, 90, 93], 0.07);
  pad(4, 2, 0.6, 1500);
  arp(4.5, 8, { step: 0.5, gain: 0.12, up: 12 });
  piano(5, 81, { gain: 0.12, pan: 0.3 });
  piano(6, 78, { gain: 0.12, pan: -0.3 });
  piano(6.5, 74, { gain: 0.11 });
  low(6, 47, 0.24);

  // Field: the camera pulls back over a slow pulse; the sweep climbs to #9,000.
  low(FIELD.zoom, 43, 0.3);
  pad(8, 3, 0.6, 1600);
  arp(8, 11.2, { step: 0.5, gain: 0.12, up: 12 });
  for (let t = 10; t < FIELD.hit - 1e-6; t += 1) kick(t, 0.22, { tone: 0.35 });
  low(10, 42, 0.26);
  low(12, 40, 0.26);
  arp(FIELD.sweep, FIELD.hit, { step: 0.25, gain: 0.11, up: 12, climb: 2 });
  reverseCymbal(FIELD.hit, 1.6, 0.3);

  low(FIELD.hit, 38, 0.36);
  low(FIELD.hit, 50, 0.22);
  roll(FIELD.hit, [62, 69, 73, 76, 81], 0.22);
  glass(FIELD.hit + 0.05, [90, 93, 97], 0.07);
  pad(14, 1, 0.6, 1500);
  piano(15, 78, { gain: 0.11, pan: 0.2 });

  // Outro: a small, open-ended tune over the lockup, resolving home.
  pad(16, 4, 0.55, 1400);
  low(OUTRO.mark, 43, 0.28);
  low(18, 45, 0.26);
  low(20, 47, 0.26);
  low(22, 38, 0.34);
  low(22, 50, 0.2);
  const tune = [
    [16.5, 74, 0.5],
    [17.0, 71, 0.5],
    [17.5, 74, 1],
    [18.5, 76, 0.5],
    [19.0, 78, 0.5],
    [19.5, 76, 1],
    [20.5, 74, 0.5],
    [21.0, 73, 0.5],
    [21.5, 71, 0.5],
  ];
  for (const [t, m, d] of tune) piano(t, m, { gain: 0.17, dur: d + 1, pan: 0.1 });
  arp(16, 22, { step: 0.5, gain: 0.08, up: 0 });
  roll(22, [57, 62, 66, 69, 73, 74], 0.2, 0.05);
  glass(22.1, [86, 93], 0.06);
  padChord(22, 1.6, CH.Dmaj9.pad, {
    gain: 0.6,
    cutoff: (t) => Math.max(500, 1500 - (t - 22) * 500),
    attack: 0.4,
    release: 1,
  });
}
