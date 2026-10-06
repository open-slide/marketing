import { defineFilm } from '#lib/film.js';
import hero from './scenes/hero.js';
import outro from './scenes/outro.js';
import { DURATION, HITS, TRANSITIONS } from './timeline.js';

export default defineFilm({
  title: 'open-slide 9,000 stars',
  duration: DURATION,
  bpm: 120,
  poster: 10.8,
  scenes: [hero, outro],
  transitions: TRANSITIONS,
  hits: HITS,
  vignette: 0,
});
