import { defineFilm } from '#lib/film.js';
import { FEATURE } from './copy.js';
import agent from './scenes/agent.js';
import intro from './scenes/intro.js';
import outro from './scenes/outro.js';
import params from './scenes/params.js';
import strip from './scenes/strip.js';
import { BACKDROP } from './style.js';
import { DURATION, HITS, TRANSITIONS } from './timeline.js';

export default defineFilm({
  title: `${FEATURE} launch`,
  duration: DURATION,
  bpm: 120,
  poster: 19.4,
  scenes: [intro, strip, agent, params, outro],
  transitions: TRANSITIONS,
  hits: HITS,
  backdrop: BACKDROP,
});
