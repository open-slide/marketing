import { HERO, OUTRO } from './timeline.js';

// Clean, bright electronic: a ticking clock under the count, a soft groove
// under the bento, and an open major chord for the thank-you. F major.
const CHORDS = {
  Dm9: { pad: [57, 60, 64, 65, 69], bass: 38, arp: [62, 65, 69, 72, 76, 77] },
  Bbmaj9: { pad: [58, 62, 65, 69, 72], bass: 34, arp: [58, 62, 65, 69, 72, 74] },
  Csus: { pad: [60, 65, 67, 70, 72], bass: 36, arp: [60, 65, 67, 72, 74, 79] },
  Fmaj9: { pad: [57, 60, 64, 67, 69], bass: 41, arp: [60, 64, 67, 69, 72, 76] },
  Am7: { pad: [57, 60, 64, 67, 72], bass: 45, arp: [57, 60, 64, 67, 72, 76] },
};
// One chord per bar (2 s).
const BARS = 'Dm9 Csus Fmaj9 Am7 Bbmaj9 Fmaj9 Csus Fmaj9 Bbmaj9 Csus Fmaj9';

export default function score(kit) {
  const { beats, kick, hat, crash, reverseCymbal, bassNote, padChord, bell, pluck } = kit;
  const chordAt = kit.progression(CHORDS, BARS);
  const groove = (from, to, opts) => kit.groove(from, to, { chordAt, ...opts });

  // Count: filtered pad, a clock of hats tightening into the bar.
  padChord(0, 2, CHORDS.Dm9.pad, { gain: 0.7, cutoff: (t) => 400 + t * 300, attack: 1.4 });
  padChord(2, 2, CHORDS.Csus.pad, { gain: 0.75, cutoff: (t) => 1000 + (t - 2) * 700, attack: 0.3 });
  for (const t of beats(HERO.count, HERO.hit, 0.25))
    hat(t, 0.12 + 0.2 * ((t - HERO.count) / 2.6), false, 0.15);
  for (const t of beats(2, HERO.hit)) kick(t, 0.35, { tone: 0.5 });
  [65, 67, 72, 74, 77, 79, 84].forEach((m, i) => {
    pluck(HERO.count + 0.3 + i * 0.33, m, { gain: 0.14, pan: i % 2 ? 0.4 : -0.4, bright: 0.7 });
  });
  reverseCymbal(HERO.hit, 1.2, 0.6);

  // The bar: an open F, glass on top.
  kick(HERO.hit, 1, { sidechain: true });
  crash(HERO.hit, 0.5, 2.4);
  bassNote(HERO.hit, 29, 1.6, 0.9, 0.4);
  [72, 76, 79, 84].forEach((m, i) => {
    bell(HERO.hit + 0.12 * i, m, 0.1, i % 2 ? 0.5 : -0.5);
  });
  groove(4.5, 6.4, { hats: '8', clapOn: false, padGain: 0.5, cutoff: 1500 });
  reverseCymbal(HERO.tiles + 0.8, 1.6, 0.4);

  // Bento: the groove opens up while the tiles play.
  crash(8, 0.35);
  groove(8, 12, { hats: '16', arp: true, padGain: 0.45, cutoff: 2000, arpBright: 0.8 });
  groove(12, 12.5, { hats: '8', clapOn: false, padGain: 0.4, cutoff: 1200 });
  padChord(12.5, 1.5, CHORDS.Csus.pad, {
    gain: 0.6,
    cutoff: (t) => 2000 - (t - 12.5) * 900,
    release: 0.6,
  });
  reverseCymbal(OUTRO.thanks - 0.2, 1.6, 0.7);

  // Thank you: the home chord, then a light groove under the call to action.
  kick(14, 1);
  crash(14, 0.55, 3);
  bassNote(14, 29, 2, 0.9, 0.5);
  padChord(14, 2, [53, 57, 60, 64, 67, 72], {
    gain: 0.9,
    cutoff: (t) => 3200 - (t - 14) * 600,
    attack: 0.02,
  });
  [72, 76, 79, 84, 88].forEach((m, i) => {
    bell(14.2 + i * 0.22, m, 0.1, i % 2 ? 0.5 : -0.5);
  });
  groove(16, 20, {
    hats: '8',
    clapOn: false,
    arp: true,
    padGain: 0.45,
    cutoff: 1800,
    arpBright: 0.7,
  });
  kick(20, 0.8);
  padChord(20, 1.6, CHORDS.Fmaj9.pad, {
    gain: 0.8,
    cutoff: (t) => Math.max(500, 2400 - (t - 20) * 1200),
    release: 0.6,
  });
  bell(20.1, 84, 0.09, 0);
  bell(20.35, 79, 0.07, 0.4);
}
