"use client";

import { useEffect, useRef, useState } from "react";
import { LOADER_PROGRESS, markLoaderDone } from "@/lib/loader";

const MIN_MS = 2400; // long enough to watch the logo gather
const MAX_MS = 6500; // never hold the page hostage
const EXIT_MS = 900;

type Phase = "loading" | "exiting" | "gone";

/**
 * The page loader has no panel of its own: the hero particles are the show. This tracks real
 * progress (fonts, page, 3D scene), broadcasts it so the particles gather into the logo as it
 * climbs, keeps the rest of the page hidden, and lets go at 100 so the logo bursts into the hero.
 */
export default function Loader() {
  const [phase, setPhase] = useState<Phase>("loading");
  const percentRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      markLoaderDone();
      queueMicrotask(() => setPhase("gone"));
      return;
    }

    const start = performance.now();
    const ready = { fonts: false, page: document.readyState === "complete", scene: false };
    document.fonts.ready.then(() => (ready.fonts = true));
    const onLoad = () => (ready.page = true);
    window.addEventListener("load", onLoad);

    let shown = 0;
    let frame = 0;
    let exitTimer = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      ready.scene ||= !!document.querySelector("canvas[data-ready='true']");
      const milestones = 0.25 + 0.25 * Number(ready.fonts) + 0.25 * Number(ready.page) + 0.25 * Number(ready.scene);
      // Real progress, paced so the gathering is watchable; forced to finish at MAX_MS.
      const target = elapsed > MAX_MS ? 1 : Math.min(milestones, elapsed / MIN_MS);
      shown += (target - shown) * 0.06;
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
          <span ref={percentRef} className="font-display text-2xl font-bold tracking-[-0.04em] text-ink tabular-nums">
            00
          </span>
          <span className="text-spectrum ml-0.5 font-display text-base font-bold">%</span>
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-line">
        <div ref={barRef} className="h-full origin-left scale-x-0" style={{ background: "var(--spectrum)" }} />
      </div>
    </div>
  );
}
