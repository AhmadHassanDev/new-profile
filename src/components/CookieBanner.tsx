"use client";

import { useEffect, useRef, useState } from "react";
import { type Choice, OPEN_CONSENT, readConsent, setConsent } from "@/lib/analytics";
import { whenLoaderDone } from "@/lib/loader";
import { lowPower } from "@/lib/motion";
import { useLang } from "@/i18n/LangProvider";
import { ui } from "@/i18n/ui";

type Scene = import("./cookie/CookieScene").CookieScene;

/**
 * Asks once whether analytics cookies are OK, with Accept and Reject given equal weight (as UK and EU rules expect).
 * Until a choice is made, Google's tags run with analytics storage denied. The footer's "Cookie settings" brings it
 * back, so a choice can be changed as easily as it was made.
 *
 * A 3D cookie floats over the card's corner and leans toward the pointer: accepting takes a bite out of it, rejecting
 * sends it sinking away. Where the 3D scenes rest (no GPU) it's a floating 🍪 instead.
 */
export default function CookieBanner() {
  const t = ui(useLang()).cookies;
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [current, setCurrent] = useState<Choice | null>(null);
  const [flat, setFlat] = useState(false); // no 3D: show the emoji
  const reopened = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<Scene | null>(null);

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
      setLeaving(false);
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

  // The cookie: loaded with the banner, only while it's open, and never where the 3D scenes rest
  useEffect(() => {
    const el = canvas.current;
    if (!open || !el) return;
    if (lowPower()) {
      const r = requestAnimationFrame(() => setFlat(true));
      return () => cancelAnimationFrame(r);
    }
    let disposed = false;
    let s: Scene | null = null;
    const onMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      s?.setPointer((e.clientX - (b.left + b.width / 2)) / 320, (e.clientY - (b.top + b.height / 2)) / 320);
    };
    import("./cookie/CookieScene")
      .then(({ CookieScene }) => CookieScene.create(el, window.matchMedia("(prefers-reduced-motion: reduce)").matches))
      .then((created) => {
        if (disposed) return created.dispose();
        s = created;
        // Already accepted (reopened from the footer): the cookie still has the bite in it
        if (readConsent() === "granted") s.bitten();
        s.start();
        scene.current = s;
        window.addEventListener("pointermove", onMove);
      })
      .catch(() => !disposed && setFlat(true));
    return () => {
      disposed = true;
      window.removeEventListener("pointermove", onMove);
      s?.dispose();
      scene.current = null;
    };
  }, [open]);

  const choose = (choice: Choice) => {
    if (leaving) return;
    setLeaving(true);
    setConsent(choice);
    // Let the cookie have its moment (a bite, or a sad sink), then slide the card away
    const s = scene.current;
    const ms = s ? (choice === "granted" ? s.bite() : s.drop()) : 0;
    setTimeout(() => {
      setShown(false);
      setTimeout(() => setOpen(false), 300);
    }, ms * 0.8);
  };

  if (!open) return null;

  return (
    <section
      aria-labelledby="cookie-title"
      className={`fixed inset-x-3 bottom-3 z-[60] rounded-[28px] border border-line bg-surface/90 p-6 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)] backdrop-blur-xl transition-[opacity,translate] duration-300 ease-out sm:inset-x-auto sm:bottom-6 sm:start-6 sm:max-w-md md:p-7 ${
        shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      {/* The cookie hangs over the top-right corner; decoration only */}
      <div aria-hidden className="pointer-events-none absolute -top-16 end-1 size-32 sm:-top-20 sm:-end-4 sm:size-40">
        {flat ? (
          <span className="cookie-float grid size-full place-items-center text-6xl sm:text-7xl">🍪</span>
        ) : (
          <canvas ref={canvas} className="size-full" />
        )}
      </div>

      <h2 ref={heading} id="cookie-title" tabIndex={-1} className="pe-24 font-display text-xl leading-tight font-bold uppercase outline-none sm:pe-28">
        {t.title}
        <span className="text-spectrum">{t.titleTail}</span>
      </h2>
      <p className="mt-3 text-base leading-relaxed text-muted">
        {t.body}
        <span className="text-ink">{t.settings}</span>
        {t.bodyTail}
      </p>
      {current ? (
        <p className="mt-3 text-sm text-muted">
          {t.now}
          <span className="font-semibold text-ink">{current === "granted" ? t.accepted : t.rejected}</span>
        </p>
      ) : null}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => choose("denied")}
          disabled={leaving}
          className="rounded-full border border-line bg-bg/40 px-5 py-3 text-base font-semibold text-ink transition-colors duration-300 hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
        >
          {t.reject}
        </button>
        <button
          type="button"
          onClick={() => choose("granted")}
          disabled={leaving}
          className="rounded-full bg-ink px-5 py-3 text-base font-semibold text-bg transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
        >
          {t.accept}
        </button>
      </div>
    </section>
  );
}

/** The footer link that brings the banner back */
export function CookieSettingsLink({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT))} className={className}>
      {ui(useLang()).cookies.settings}
    </button>
  );
}
