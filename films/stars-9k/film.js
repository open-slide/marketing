import { defineFilm } from '#lib/film.js';
import count from './scenes/count.js';
import field from './scenes/field.js';
import outro from './scenes/outro.js';
import { FONTS } from './style.js';
import { DURATION, HITS, TRANSITIONS } from './timeline.js';

export default defineFilm({
  title: 'open-slide 9,000 stars',
  duration: DURATION,
  bpm: 120,
  poster: 5.2,
  fonts: FONTS,
  scenes: [count, field, outro],
  transitions: TRANSITIONS,
  hits: HITS,
  vignette: 0.3,
});
