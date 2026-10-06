import { beatGrid, sequence } from '#lib/film.js';

export const DURATION = 24;
export const { BEAT, BAR } = beatGrid(120);

// Hard cuts on matched frames: the gold star holds its place across the
// count → field cut, and the field dissolves to bare paper before the outro.
export const { spans: SPANS, transitions: TRANSITIONS } = sequence(DURATION, [
  { name: 'count', at: 0 },
  { name: 'field', at: 8 },
  { name: 'outro', at: 16 },
]);

// The star ornament's place on screen in the count chapter.
export const ORN = { x: 960, y: 704, size: 44 };

export const COUNT = {
  line: 0.3,
  eyebrow: 0.7,
  number: 1.0,
  roll: 2.2,
  draw: 2.4,
  hit: 4.0,
  unit: 4.5,
  out: 6.9,
};
export const FIELD = { zoom: 8.0, zoomEnd: 11.2, labels: 10.8, sweep: 11.2, hit: 14.0, out: 15.3 };
export const OUTRO = { mark: 16.0, word: 16.3, line: 17.0, thanks: 17.3, cta: 18.0, site: 18.5 };

// Gentle: this film lands its moments with light and sound, not shake.
export const HITS = [];
