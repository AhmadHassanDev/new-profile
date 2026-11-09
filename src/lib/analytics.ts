// Google Tag Manager. GA4 and any other tags are set up inside the container, not in the code.
export const GTM_ID = "GTM-PLJZRDH8";

declare global {
  interface Window {
    dataLayer?: unknown[];
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

// ---- Consent (Google Consent Mode v2)

export type Choice = "granted" | "denied";

/** Where the visitor's choice is kept on their device, and how long before they're asked again */
export const CONSENT_KEY = "ah-consent";
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE = 365 * 24 * 60 * 60 * 1000;

/** The event the footer's "Cookie settings" link sends to bring the banner back */
export const OPEN_CONSENT = "ah:open-consent";

/**
 * Runs before Tag Manager loads (inlined ahead of the container script): every storage type that needs consent starts
 * denied, unless this visitor already chose, in which case their choice applies from the first hit.
 * Google's tags must read `arguments` objects from the dataLayer, which is why gtag isn't an arrow function.
 */
export const CONSENT_DEFAULTS = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
var c=null;try{c=JSON.parse(localStorage.getItem('${CONSENT_KEY}'));}catch(e){}
var a=c&&c.v===${CONSENT_VERSION}&&Date.now()-c.at<${CONSENT_MAX_AGE}&&c.analytics==='granted'?'granted':'denied';
gtag('consent','default',{analytics_storage:a,ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});`;

/** The visitor's saved choice, or null if they haven't chosen (or it's older than a year) */
export function readConsent(): Choice | null {
  try {
    const c = JSON.parse(localStorage.getItem(CONSENT_KEY) ?? "null");
    if (c?.v === CONSENT_VERSION && Date.now() - c.at < CONSENT_MAX_AGE && (c.analytics === "granted" || c.analytics === "denied")) {
      return c.analytics;
    }
  } catch {}
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- typed for callers; the body pushes `arguments`
function gtag(..._args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params -- Google's tags only read the arguments object, not an array
  window.dataLayer.push(arguments);
}

/** Saves the choice, tells Google's tags straight away, and on a refusal removes the analytics cookies already set */
export function setConsent(choice: Choice) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ v: CONSENT_VERSION, analytics: choice, at: Date.now() }));
  } catch {}
  gtag("consent", "update", { analytics_storage: choice });
  track("consent_update", { analytics_storage: choice });
  if (choice === "denied") clearAnalyticsCookies();
}

/** GA's cookies (_ga, _ga_<id>, _gid) on this host and its parent domain */
function clearAnalyticsCookies() {
  const host = location.hostname;
  const domains = ["", host, `.${host}`, `.${host.replace(/^www\./, "")}`];
  for (const name of document.cookie.split("; ").map((c) => c.split("=")[0])) {
    if (!/^_ga(_|$)|^_gid$|^_gat/.test(name)) continue;
    for (const d of domains) document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
  }
}
