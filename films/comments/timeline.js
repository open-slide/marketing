import { beatGrid, sequence } from '#lib/film.js';

export const DURATION = 66;
export const { BEAT, BAR } = beatGrid(120);

// Each shot is one long camera move. Shots dissolve into each other over
// 1.2 s centred on the bar line; only the drop inside `apply` is a hard cut.
export const { spans: SPANS } = sequence(DURATION, [
  { name: 'cold', at: 0 },
  { name: 'title', at: 6, overlap: 0.6 },
  { name: 'mode', at: 12, overlap: 0.6 },
  { name: 'element', at: 20, overlap: 0.6 },
  { name: 'region', at: 32, overlap: 0.6 },
  { name: 'rail', at: 44, overlap: 0.6 },
  { name: 'apply', at: 48, overlap: 0.6 },
  { name: 'outro', at: 58, overlap: 0.6 },
]);

export const COLD = { rack: 2.0 };
export const TITLE = { hit: 6, sweep: 6.8, tag: 7.8 };
export const MODE = { press: 14, slide: 16, hint: 17 };
export const ELEMENT = {
  hover: 22.0,
  click: 23.0,
  type: 24.4,
  cps: 9,
  send: 28.0,
  count: 29.5,
};
export const REGION = {
  down: 33.5,
  up: 35.5,
  type: 36.0,
  cps: 11,
  post: 39.2,
  click: 40.6,
  type2: 41.0,
  cps2: 9,
  post2: 42.6,
};
export const RAIL = { badges: [45, 46, 47] };
export const APPLY = {
  type: 48.8,
  cps: 8,
  enter: 51.5,
  drop: 52,
  resolve: [53, 54, 55],
  // The three comments on other pages clear right after.
  rest: [55.6, 56.0, 56.4],
  // At zero the pill swaps straight back to the empty hint.
  clear: 56.4,
};
export const OUTRO = { converge: 60.8, lockup: 62, cta: 62.8, site: 63.3, fade: 64.6 };

// The pill's total: 3 comments on page 1, then 3 more across the deck in the
// rail shot.
export const TOTAL = 6;

export const HITS = [
  { t: TITLE.hit, amount: 0.12 },
  { t: APPLY.drop, amount: 0.18 },
  { t: OUTRO.lockup, amount: 0.1 },
];
