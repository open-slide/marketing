import { beatGrid, sequence } from '#lib/film.js';

export const DURATION = 39;
export const { BEAT, BAR } = beatGrid(120);

// A montage of hero shots: tight, near-frontal crops of the UI, each with a
// small drift, cut on the beat. `demo` and `apply` hold several shots each.
export const { spans: SPANS } = sequence(DURATION, [
  { name: 'demo', at: 0 },
  { name: 'apply', at: 26 },
  { name: 'outro', at: 35 },
]);

// Shot cuts inside `demo`.
export const CUTS = {
  switch: 0,
  hint: 3,
  hover: 5,
  compose: 8,
  count: 12,
  drag: 14,
  compose2: 17,
  kicker: 20,
  rail: 23,
};

export const DEMO = {
  modeClick: 1.2,
  hint: 3.3,
  hover: 6.0,
  click: 7.0,
  type: 8.3,
  cps: 12,
  send: 11.2,
  count: 12.4,
  down: 14.4,
  up: 15.6,
  type2: 17.2,
  cps2: 14,
  post: 19.7,
  click3: 20.8,
  type3: 21.1,
  cps3: 12,
  post3: 22.4,
  badges: [23.5, 24.1, 24.7],
};

// Rail rows that gain a badge in the rail shot, one comment each.
export const LATER = [2, 3, 5];

export const APPLY = {
  type: 26.6,
  cps: 12,
  enter: 28.8,
  drop: 30,
  resolve: [30.6, 31.3, 32.0],
  // The three comments on other pages clear right after.
  rest: [32.5, 32.8, 33.1],
  // At zero the pill swaps straight back to the empty hint.
  clear: 33.1,
  close: 33,
};

export const OUTRO = { lockup: 35, cta: 35.6, site: 36.0, fade: 37.6 };

// The pill's total: 3 comments on page 1, then 3 more across the deck in the
// rail shot.
export const TOTAL = 6;

export const HITS = [
  { t: APPLY.drop, amount: 0.15 },
  { t: OUTRO.lockup, amount: 0.08 },
];
