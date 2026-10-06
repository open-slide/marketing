import { beatGrid, sequence } from '#lib/film.js';

export const DURATION = 22;
export const { BEAT, BAR } = beatGrid(120);

export const { spans: SPANS, transitions: TRANSITIONS } = sequence(DURATION, [
  { name: 'hero', at: 0 },
  { name: 'outro', at: 14 },
]);

export const HERO = {
  lines: 0.2,
  badge: 0.7,
  count: 1.4,
  hit: 4.0,
  unit: 4.25,
  badgeOut: 6.0,
  shrink: 6.3,
  grid: 6.6,
  tiles: 7.2,
  type: 8.0,
  select: 9.0,
  comment: 9.4,
  apply: 10.6,
  out: 12.4,
};
export const OUTRO = { thanks: 14.2, sub: 15.1, cta: 16.0, star: 16.8, foot: 17.4, fade: 20.5 };

// Apple-clean: moments land with light and sound, never shake.
export const HITS = [];
