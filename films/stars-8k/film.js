import { defineFilm } from '#lib/film.js';
import count from './scenes/count.js';
import crt from './scenes/crt.js';
import mosaic from './scenes/mosaic.js';
import outro from './scenes/outro.js';
import { FONTS } from './style.js';
import { DURATION, HITS, TRANSITIONS } from './timeline.js';

export default defineFilm({
  title: 'open-slide 8,000 stars',
  duration: DURATION,
  bpm: 120,
  poster: 17.4,
  fonts: FONTS,
  scenes: [count, mosaic, outro, crt],
  transitions: TRANSITIONS,
  hits: HITS,
});
