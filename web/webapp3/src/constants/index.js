/**
 * Application constants and configuration.
 */

/** Default number of sticker columns in the grid */
export const GRID_COLUMNS = 4;

/** Sticker thumbnail dimensions (px) */
export const STICKER_SIZE = 64;

/** Drag activation delay (ms) - prevents accidental drags */
export const DRAG_DELAY = 250;

/** Touch drag tolerance (px) */
export const DRAG_TOLERANCE = 5;

/** Image retry count for sticker loading */
export const IMAGE_RETRY_COUNT = 10;

/** Image retry delay (seconds) */
export const IMAGE_RETRY_DELAY = 2;

/** App host - set via REACT_APP_HOST env var */
export const APP_HOST = process.env.REACT_APP_HOST || '';
