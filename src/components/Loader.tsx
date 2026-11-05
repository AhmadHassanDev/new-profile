"use client";

import { useEffect, useRef, useState } from "react";
import { isLoaderDone, LOADER_PROGRESS, markLoaderDone } from "@/lib/loader";

// The full show, for wide screens with a mouse: long enough to watch the logo gather, never holding the page hostage
const FULL = { min: 2400, max: 6500, ease: 3.7 };
// Phones, tablets and narrow windows: the hero copy is what they came for (and their LCP), so a quick gather that
// doesn't wait on the 3D scene. The particles pick up wherever the gather got to.
const QUICK = { min: 1200, max: 2500, ease: 10 };
const EXIT_MS = 900;

// Without JavaScript nothing would ever lift the loader: drop it, and with it the scroll lock and the hidden hero
const NO_SCRIPT =
  ".site-loader{display:none!important}body{overflow:visible!important}" +
  "header,[data-intro-hide]{opacity:1!important}.animate-rise{animation-play-state:running!important}";

type Phase = "loading" | "exiting" | "gone";

/**
 * The page loader has no panel of its own: the hero particles are the show. This tracks real
 * progress (fonts, page, 3D scene), broadcasts it so the particles gather into the logo as it
 * climbs, keeps the rest of the page hidden, and lets go at 100 so the logo bursts into the hero.
 */
export default function Loader() {
  // Coming back from another page, the intro already played: skip it. (The server and the first
  // load always start at "loading", so hydration still matches.)
  const [phase, setPhase] = useState<Phase>(() =>
    typeof window !== "undefined" && isLoaderDone() ? "gone" : "loading",
  );
  const percentRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaderDone()) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      markLoaderDone();
      queueMicrotask(() => setPhase("gone"));
      return;
    }

    const quick = !window.matchMedia("(pointer: fine) and (min-width: 768px)").matches;
    const { min, max, ease } = quick ? QUICK : FULL;
    const start = performance.now();
    let last = start;
    const ready = { fonts: false, page: document.readyState === "complete", scene: quick };
    document.fonts.ready.then(() => (ready.fonts = true));
    const onLoad = () => (ready.page = true);
    window.addEventListener("load", onLoad);

    let shown = 0;
    let frame = 0;
    let exitTimer = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      // The 3D scene counts once it's drawn, or once it's settled there won't be one
      ready.scene ||= !!document.querySelector("canvas[data-ready]");
      const milestones = 0.25 + 0.25 * Number(ready.fonts) + 0.25 * Number(ready.page) + 0.25 * Number(ready.scene);
      // Real progress, paced so the gathering is watchable; forced to finish at `max`. Eased by time, not frames,
      // so a 120Hz screen doesn't finish early and a busy phone doesn't drag on.
      const target = elapsed > max ? 1 : Math.min(milestones, elapsed / min);
      shown += (target - shown) * (1 - Math.exp(-dt * ease));
      if (target === 1 && shown > 0.995) shown = 1;

      window.dispatchEvent(new CustomEvent(LOADER_PROGRESS, { detail: shown }));
      if (percentRef.current) percentRef.current.textContent = String(Math.round(shown * 100)).padStart(2, "0");
      if (barRef.current) barRef.current.style.transform = `scaleX(${shown})`;

      if (shown < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }
      setPhase("exiting");
      markLoaderDone();
      exitTimer = window.setTimeout(() => setPhase("gone"), EXIT_MS);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(exitTimer);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <>
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: NO_SCRIPT }} />
      </noscript>
      <div aria-hidden className={`site-loader pointer-events-none fixed inset-0 z-[55] ${phase === "exiting" ? "is-exiting" : ""}`}>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-4 pb-6 text-sm font-medium md:px-10 md:pb-10">
          <p className="text-muted">
            <span className="text-ink">Ahmed Hassan</span>
            <br />
            Portfolio ©2026
          </p>
          <p className="text-right text-muted">
            Loading
            <br />
            <span ref={percentRef} className="font-display text-2xl font-bold text-ink tabular-nums">
              00
            </span>
            <span className="text-spectrum ml-0.5 font-display text-base font-bold">%</span>
          </p>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-line">
          <div ref={barRef} className="h-full origin-left scale-x-0" style={{ background: "var(--spectrum)" }} />
        </div>
      </div>
    </>
  );
}
