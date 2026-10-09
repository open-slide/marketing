const CHORDS = {
  Fmaj7: { pad: [53, 57, 60, 64, 69], bass: 41, arp: [65, 69, 72, 76, 79, 81] },
  Am7: { pad: [57, 60, 64, 67, 71], bass: 45, arp: [64, 67, 69, 72, 76, 79] },
  Cmaj7: { pad: [55, 60, 64, 67, 71], bass: 36, arp: [64, 67, 71, 72, 76, 79] },
  G6: { pad: [55, 59, 62, 64, 67], bass: 43, arp: [62, 64, 67, 71, 74, 76] },
  Dm9: { pad: [57, 62, 64, 65, 69], bass: 38, arp: [62, 64, 65, 69, 72, 76] },
};
// One chord per bar (2 s at 120 BPM).
const BARS = 'Fmaj7 Fmaj7 Am7 G6 Fmaj7 Cmaj7 Am7 G6 Dm9 Fmaj7 Am7 G6 Fmaj7 Am7 Dm9 G6 Cmaj7 Cmaj7';

export default function score(kit) {
  const { beats, kick, hat, crash, reverseCymbal, bassNote, padChord, pluck, bell } = kit;
  const chordAt = kit.progression(CHORDS, BARS);
  const groove = (from, to, opts) =>
    kit.groove(from, to, { chordAt, clapOn: false, padGain: 0.45, cutoff: 1500, ...opts });

  padChord(0, 2.2, CHORDS.Fmaj7.pad, { gain: 0.7, cutoff: (t) => 600 + t * 500, attack: 1.4 });
  [0.4, 0.9, 1.4].forEach((t, i) => {
    pluck(t, CHORDS.Fmaj7.arp[i * 2], { gain: 0.25, pan: i % 2 ? 0.4 : -0.4, decay: 0.8 });
  });
  reverseCymbal(2, 1.0, 0.5);
  crash(2, 0.45);
  kick(2, 0.7, { tone: 0.5 });
  bassNote(2, 41, 1.8, 0.5, 0.3);
  groove(2, 4, { hats: '8', padGain: 0.5, cutoff: 1300 });

  groove(4, 8, { hats: '8', cutoff: 1400 });
  reverseCymbal(8, 0.8, 0.4);
  crash(8, 0.35);
  groove(8, 10, { hats: '8', arp: true, arpBright: 0.6 });

  // Busy log: keep the bed thin and plucky.
  groove(10, 20, { hats: '8', arp: true, arpBright: 0.5, padGain: 0.35, cutoff: 1300 });
  for (const t of [14, 18]) bell(t, 84, 0.06, 0.3, 1.2);
  bell(20, 88, 0.07, -0.3, 1.6);
  groove(20, 22, { hats: '16', arp: true, arpBright: 0.7, padGain: 0.4 });

  reverseCymbal(22, 0.8, 0.35);
  groove(22, 28, { hats: '16', arp: true, arpBright: 0.6, padGain: 0.4, cutoff: 1600 });
  groove(28, 30, { hats: '8', padGain: 0.35, cutoff: 1200 });
  for (const t of beats(29, 30, 0.25)) hat(t, 0.12 + (t - 29) * 0.2, false, 0);

  padChord(30, 2, CHORDS.G6.pad, { gain: 0.5, cutoff: (t) => 900 + (t - 30) * 900, attack: 1.2 });
  reverseCymbal(32, 1.2, 0.6);
  crash(32, 0.6, 3);
  kick(32, 0.85, { tone: 0.5 });
  padChord(32, 3.6, CHORDS.Cmaj7.pad.concat(76), {
    gain: 0.8,
    cutoff: (t) => 3000 - (t - 32) * 450,
    attack: 0.02,
    release: 1.2,
  });
  bassNote(32, 36, 3, 0.6, 0.3);
  [79, 84, 88, 91].forEach((m, i) => {
    bell(32.5 + i * 0.5, m, 0.08, i % 2 ? 0.4 : -0.4, 1.6);
  });
}
