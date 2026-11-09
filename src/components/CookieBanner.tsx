"use client";

import { useEffect, useRef, useState } from "react";
import { type Choice, OPEN_CONSENT, readConsent, setConsent } from "@/lib/analytics";
import { whenLoaderDone } from "@/lib/loader";

/**
 * Asks once whether analytics cookies are OK, with Accept and Reject given equal weight (as UK and EU rules expect).
 * Until a choice is made, Google's tags run with analytics storage denied. The footer's "Cookie settings" brings it
 * back, so a choice can be changed as easily as it was made.
 */
export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [current, setCurrent] = useState<Choice | null>(null);
  const reopened = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);

  // No choice saved yet: ask, a beat after the page is up. On the home page that's after the intro loader lifts and the
  // hero has started its reveal, so the banner never sits on top of the loading show.
  useEffect(() => {
    if (readConsent()) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    let live = true;
    const ready = document.querySelector(".site-loader") ? whenLoaderDone() : Promise.resolve();
    ready.then(() => {
      if (live) t = setTimeout(() => setOpen(true), 1200);
    });
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const onOpen = () => {
      reopened.current = true;
      setCurrent(readConsent());
      setOpen(true);
    };
    window.addEventListener(OPEN_CONSENT, onOpen);
    return () => window.removeEventListener(OPEN_CONSENT, onOpen);
  }, []);

  // Slide in on the frame after mounting; when reopened from the footer, take focus so keyboard users land on it
  useEffect(() => {
    if (!open) return;
    const r = requestAnimationFrame(() => setShown(true));
    if (reopened.current) heading.current?.focus();
    return () => cancelAnimationFrame(r);
  }, [open]);

  const choose = (choice: Choice) => {
    setConsent(choice);
    setCurrent(choice);
    setShown(false);
    setTimeout(() => setOpen(false), 300);
  };

  if (!open) return null;

  return (
    <section
      aria-labelledby="cookie-title"
      className={`fixed inset-x-3 bottom-3 z-[60] rounded-[28px] border border-line bg-surface/90 p-6 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)] backdrop-blur-xl transition-[opacity,translate] duration-300 ease-out sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-md md:p-7 ${
        shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <h2 ref={heading} id="cookie-title" tabIndex={-1} className="font-display text-xl leading-tight font-bold uppercase outline-none">
        Cookies? <span className="text-spectrum">Just analytics.</span>
      </h2>
      <p className="mt-3 text-base leading-relaxed text-muted">
        With your OK, Google Analytics sets cookies to show me which pages people visit and what brought them here. No ads, and no
        tracking across other sites. You can change your mind any time from <span className="text-ink">Cookie settings</span> in the footer.
      </p>
      {current ? (
        <p className="mt-3 text-sm text-muted">
          Right now: <span className="font-semibold text-ink">{current === "granted" ? "accepted" : "rejected"}</span>
        </p>
      ) : null}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => choose("denied")}
          className="rounded-full border border-line bg-bg/40 px-5 py-3 text-base font-semibold text-ink transition-colors duration-300 hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={() => choose("granted")}
          className="rounded-full bg-ink px-5 py-3 text-base font-semibold text-bg transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
        >
          Accept
        </button>
      </div>
    </section>
  );
}

/** The footer link that brings the banner back */
export function CookieSettingsLink({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT))} className={className}>
      Cookie settings
    </button>
  );
}
