"use client";

import { useEffect, useRef } from "react";

const MAX_DEPTH = 30; // metres at the bottom of the page
const TICKS = [0, 5, 10, 15, 20, 25, 30];

/**
 * SlyDive's signature: the page is a dive. Scrolling takes you from the dusk at the surface into
 * deep blue. Near the top, soft light plays across the water like sun on a sea surface, and it
 * fades the deeper you go. A gauge on the side reads out your depth, like a dive computer.
 */
export default function DiveSignature() {
  const waterRef = useRef<HTMLDivElement>(null);
  const readingRef = useRef<HTMLSpanElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const water = waterRef.current;
    if (!water) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target = 0;
    let shown = 0;
    let frame = 0;
    // How far the page scrolls, measured only when its size changes (from a ResizeObserver, after layout),
    // so a scroll reads just scrollY and never forces a reflow
    let scrollable = 0;

    const paint = () => {
      water.style.setProperty("--depth", shown.toFixed(4));
      if (readingRef.current) readingRef.current.textContent = String(Math.round(shown * MAX_DEPTH)).padStart(2, "0");
      if (markerRef.current) markerRef.current.style.transform = `translateY(${shown * 100}%)`;
    };
    // Ease toward the scroll position, so the depth reading settles like a real gauge
    const tick = () => {
      shown += (target - shown) * 0.12;
      paint();
      frame = Math.abs(target - shown) > 0.0005 ? requestAnimationFrame(tick) : 0;
    };
    const onScroll = () => {
      target = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      if (reduced) {
        shown = target;
        paint();
      } else if (!frame) frame = requestAnimationFrame(tick);
    };

    const measure = () => {
      scrollable = document.documentElement.scrollHeight - window.innerHeight;
      onScroll();
    };

    // The page grows as images load and blocks stream in; its first callback is the initial reading
    const resize = new ResizeObserver(measure);
    resize.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure); // the viewport's height alone doesn't resize the body
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <>
      <div ref={waterRef} aria-hidden className="dive-water pointer-events-none fixed inset-0 -z-10">
        <div className="dive-light absolute inset-0" />
        <div className="dive-rays absolute inset-0" />
      </div>

      {/* Depth gauge: a scale with ticks every 5 m and a live reading that follows you down */}
      <div aria-hidden className="pointer-events-none fixed top-1/2 right-6 z-20 hidden -translate-y-1/2 md:block">
        <div className="relative h-[42vh] w-10">
          <span className="absolute top-0 right-0 h-full w-px bg-line" />
          {TICKS.map((m) => (
            <span
              key={m}
              className="absolute right-0 flex -translate-y-1/2 items-center gap-2"
              style={{ top: `${(m / MAX_DEPTH) * 100}%` }}
            >
              <span className="font-display text-[length:calc((10px)*var(--ds))] font-semibold text-ink/60">{m}</span>
              <span className="h-px w-2 bg-line" />
            </span>
          ))}
          <span ref={markerRef} className="absolute top-0 right-0 block h-full w-0">
            <span className="absolute top-0 right-[-3px] block h-px w-4 -translate-y-1/2 bg-[var(--accent-2)]" />
            <span className="absolute top-0 right-6 -translate-y-1/2 rounded-full border border-line bg-bg/70 px-2.5 py-1 font-display text-xs font-bold whitespace-nowrap backdrop-blur-md">
              <span ref={readingRef}>00</span>
              <span className="text-muted"> m</span>
            </span>
          </span>
        </div>
      </div>
    </>
  );
}
