import { beatGrid, sequence } from '#lib/film.js';

export const DURATION = 36;
export const { BEAT, BAR } = beatGrid(120);

export const { spans: SPANS, transitions: TRANSITIONS } = sequence(DURATION, [
  { name: 'intro', at: 0 },
  { name: 'strip', at: 4, enter: 'card' },
  { name: 'agent', at: 10, enter: 'card' },
  { name: 'params', at: 22, enter: 'card' },
  { name: 'outro', at: 30, enter: 'card' },
]);

export const HITS = [
  { t: 2, amount: 0.35 },
  { t: 8, amount: 0.3 },
  { t: 32, amount: 0.4 },
];
