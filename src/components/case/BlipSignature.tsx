"use client";

import { useEffect, useRef } from "react";

const PIXELS = 24; // lime pixels down the meter
const PEAK = 1_000_000; // views at the bottom of the page: Bliphub's "1M+ organic views"

/** 1 → "1", 12_400 → "12.4K", 1_000_000 → "1M" */
const views = (n: number) =>
  n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${+(n / 1e3).toFixed(n < 1e4 ? 1 : 0)}K` : String(Math.round(n));

/**
 * Bliphub's signature: the page reads like a campaign going live. Behind it, the brand's navy deepens
 * from blue into teal as you go, from insight to impact. In the margin, a column of the logo's lime
 * pixels lights up one by one as you read, and the reach beside it grows the way a post does when it
 * takes off: slowly at first, then all at once, until it reaches a million.
 */
export default function BlipSignature() {
  const groundRef = useRef<HTMLDivElement>(null);
  const pixelsRef = useRef<HTMLOListElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const reachRef = useRef<HTMLSpanElement>(null);
  const unitRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const pixels = pixelsRef.current ? [...pixelsRef.current.children] : [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target = 0;
    let shown = 0;
    let lit = -1;
    let frame = 0;
    // How far the page scrolls, measured only when its size changes, so a scroll reads just scrollY
    let scrollable = 0;

    const paint = () => {
      groundRef.current?.style.setProperty("--reach", shown.toFixed(4));
      if (tipRef.current) tipRef.current.style.transform = `translateY(${shown * 100}%)`;
      // Views grow exponentially with the read, 1 at the top to a million at the bottom
      const reach = shown > 0.995 ? "1M+" : views(Math.pow(PEAK, shown));
      if (reachRef.current) reachRef.current.textContent = reach;
      if (unitRef.current) unitRef.current.textContent = reach === "1" ? "view" : "views";
      // Pixels light (and pop) as the read passes them, and go dark again on the way back up
      const now = Math.round(shown * PIXELS);
      if (now !== lit) {
        lit = now;
        pixels.forEach((pixel, i) => ((pixel as HTMLElement).dataset.lit = String(i < lit)));
      }
    };
    // Ease toward the scroll position, so the reading settles rather than jumps
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
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <>
      <div ref={groundRef} aria-hidden className="blip-ground pointer-events-none fixed inset-0 -z-10">
        <div className="blip-blue absolute inset-0" />
        <div className="blip-teal absolute inset-0" />
      </div>

      {/* The reach meter: lime pixels that light as you read, with the reach at the leading edge */}
      <div aria-hidden className="pointer-events-none fixed top-1/2 right-6 z-20 hidden -translate-y-1/2 md:block">
        <div className="relative h-[42vh] w-10">
          <ol ref={pixelsRef} className="absolute inset-y-0 right-[2px] flex flex-col justify-between">
            {Array.from({ length: PIXELS }, (_, i) => (
              <li key={i} className="blip-pixel block size-[6px]" />
            ))}
          </ol>
          <span ref={tipRef} className="absolute top-0 right-0 block h-full w-0">
            <span className="absolute top-0 right-6 flex -translate-y-1/2 items-baseline gap-1 rounded-full bg-bg/70 px-2.5 py-1 font-display text-xs font-bold whitespace-nowrap backdrop-blur-md">
              <span ref={reachRef}>1</span>
              <span ref={unitRef} className="text-muted">
                view
              </span>
            </span>
          </span>
        </div>
      </div>
    </>
  );
}
