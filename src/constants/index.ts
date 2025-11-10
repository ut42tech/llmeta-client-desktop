export const GRID_CELL_SIZE = 10;
export const HALF_GRID_CELL_SIZE = GRID_CELL_SIZE / 2;

export const PERFORMANCE = {
  MOVEMENT_UPDATE_THROTTLE: 50, // ms
  POSITION_LERP_FACTOR: 0.2,
  ROTATION_LERP_FACTOR: 0.2,
  ANIMATION_FADE_DURATION: 0.1,
};

export const PRECISION = {
  DECIMAL_PLACES: 2,
};

export const PHYSICS = {
  RESET_Y_THRESHOLD: -10,
};

export const LIGHTING = {
  LIGHT_OFFSET: { x: 2, y: 5, z: 2 },
  DIRECTIONAL_INTENSITY: 1.2,
  AMBIENT_INTENSITY: 1,
};

export { url as idleUrl } from "@pmndrs/viverse/dist/assets/idle.js";
export { url as jumpDownUrl } from "@pmndrs/viverse/dist/assets/jump-down.js";
export { url as jumpForwardUrl } from "@pmndrs/viverse/dist/assets/jump-forward.js";
export { url as jumpLoopUrl } from "@pmndrs/viverse/dist/assets/jump-loop.js";
export { url as jumpUpUrl } from "@pmndrs/viverse/dist/assets/jump-up.js";
// Character model and animation asset URLs (re-exported from @pmndrs/viverse)
export { url as mannequinUrl } from "@pmndrs/viverse/dist/assets/mannequin.js";
export { url as runUrl } from "@pmndrs/viverse/dist/assets/run.js";
export { url as walkUrl } from "@pmndrs/viverse/dist/assets/walk.js";
