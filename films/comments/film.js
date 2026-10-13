import { defineFilm } from '#lib/film.js';
import { FEATURE } from './copy.js';
import apply from './scenes/apply.js';
import cold from './scenes/cold.js';
import element from './scenes/element.js';
import mode from './scenes/mode.js';
import outro from './scenes/outro.js';
import rail from './scenes/rail.js';
import region from './scenes/region.js';
import title from './scenes/title.js';
import { DURATION, HITS } from './timeline.js';

export default defineFilm({
  title: `${FEATURE} launch`,
  duration: DURATION,
  bpm: 120,
  poster: 15.6,
  scenes: [cold, title, mode, element, region, rail, apply, outro],
  hits: HITS,
});
