import { defineFilm } from '#lib/film.js';
import { FEATURE } from './copy.js';
import apply from './scenes/apply.js';
import demo from './scenes/demo.js';
import outro from './scenes/outro.js';
import { DURATION, HITS } from './timeline.js';

export default defineFilm({
  title: `${FEATURE} launch`,
  duration: DURATION,
  bpm: 120,
  poster: 9.6,
  scenes: [demo, apply, outro],
  hits: HITS,
});
