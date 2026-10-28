// Shared between the page loader and anything that should wait for it to lift.

export const LOADER_DONE = "loader:done";
/** Fired every frame while loading, with progress 0..1 as `detail`. */
export const LOADER_PROGRESS = "loader:progress";

type LoaderWindow = Window & { __loaderDone?: boolean };

export function markLoaderDone() {
  (window as LoaderWindow).__loaderDone = true;
  window.dispatchEvent(new Event(LOADER_DONE));
}

export function isLoaderDone() {
  return !!(window as LoaderWindow).__loaderDone;
}

/** Resolves once the loader has started revealing the page (immediately if it already has). */
export function whenLoaderDone(): Promise<void> {
  if ((window as LoaderWindow).__loaderDone) return Promise.resolve();
  return new Promise((resolve) => window.addEventListener(LOADER_DONE, () => resolve(), { once: true }));
}
