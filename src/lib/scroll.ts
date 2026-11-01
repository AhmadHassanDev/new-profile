/** Fired on window with `detail: true` while something (the mobile menu) needs the page to hold still. */
export const SCROLL_LOCK = "scroll:lock";

/**
 * Fired on window each time smooth scrolling moves the page, in the same frame, before it paints. Things
 * pinned to scroll position listen to it (as well as "scroll") so they move with the page, not a frame late.
 */
export const SMOOTH_SCROLL = "scroll:smooth";
