import { beatGrid, sequence } from '#lib/film.js';

export const DURATION = 26;
export const { BEAT, BAR } = beatGrid(120);

export const { spans: SPANS, transitions: TRANSITIONS } = sequence(DURATION, [
  { name: 'count', at: 0 },
  { name: 'mosaic', at: 12 },
  { name: 'outro', at: 19 },
]);

// Chapters hand off through an old-TV power cycle instead of cards: the
// outgoing screen collapses over the last 0.32 s before the cut.
export const CRT_OFF = 0.32;
export const POWER = { count: 0.15, mosaic: 12, outro: 19, end: 24.7 };

export const ARRIVALS = 47;
export const ARRIVE = Array.from(
  { length: ARRIVALS },
  (_, i) => 1.0 + 6.2 * (i / (ARRIVALS - 1)) ** 0.62,
);

export const COUNT_HIT = 8;
export const MOSAIC_HIT = 16;
export const OUTRO_HIT = 20;

export const MOSAIC = { raster: 12.35, rowGap: 0.11, draw: 14.2, drawEnd: 15.85 };
export const OUTRO = { word: 19.35, line: 20.7, star: 21.4, press: 22.0, coin: 22.6 };

export const HITS = [
  { t: COUNT_HIT, amount: 1, flash: 1 },
  { t: MOSAIC_HIT, amount: 0.8, flash: 0.5 },
  { t: OUTRO_HIT, amount: 1, flash: 0.7 },
];
