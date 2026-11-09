// Google Tag Manager. GA4 and any other tags are set up inside the container, not in the code.
export const GTM_ID = "GTM-PLJZRDH8";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Sends an event to Tag Manager's dataLayer. In GTM, a Custom Event trigger on the event name forwards it to GA4.
 * Safe to call anywhere: before the container loads, events queue in the dataLayer and are read once it does.
 */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}
