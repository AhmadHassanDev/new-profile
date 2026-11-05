"use client";

import { useEffect, useRef } from "react";

const TURNS = 4.25;
const RADIUS = 34; // in a 76-unit box
const POINTS = 900;
const PEAK_MA = 2.5; // stimulation at the end of the page, as a typical programmed amplitude

// The spiral test neurologists ask tremor patients to draw: an Archimedean spiral from the centre out.
// Its wobble starts strong at the centre and fades to nothing by the outer turn, so drawing it from the
// centre shows a tremor settling.
const SPIRAL = (() => {
  const parts: string[] = [];
  for (let i = 0; i <= POINTS; i++) {
    const t = i / POINTS;
    const angle = t * TURNS * Math.PI * 2;
    const tremor = Math.pow(1 - t, 1.6) * 3.2 * (Math.sin(t * 190) * 0.65 + Math.sin(t * 433 + 1.3) * 0.35);
    const r = 1.5 + t * RADIUS + tremor;
    parts.push(`${i ? "L" : "M"}${(38 + Math.cos(angle) * r).toFixed(2)} ${(38 + Math.sin(angle) * r).toFixed(2)}`);
  }
  return parts.join(" ");
})();

/**
 * London DBS's signature: the spiral test. In the margin, a spiral draws itself from the centre as you
 * read. Near the centre the line shakes, like a tremor patient's drawing; turn by turn it steadies, while
 * a stimulator readout beneath it dials the current up, so by the end of the page the tremor has settled,
 * the way deep brain stimulation settles it. Behind the page, the brand's clinical blue.
 */
export default function SpiralSignature() {
  const groundRef = useRef<HTMLDivElement>(null);
  const drawnRef = useRef<SVGPathElement>(null);
  const ampRef = useRef<HTMLSpanElement>(null);
  const stateRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target = 0;
    let shown = 0;
    let frame = 0;
    let settled = false;
    // How far the page scrolls, measured only when its size changes, so a scroll reads just scrollY
    let scrollable = 0;

    const paint = () => {
      groundRef.current?.style.setProperty("--stim", shown.toFixed(4));
      // Always a little drawn, so there's a spiral to read from the first screen
      drawnRef.current?.style.setProperty("stroke-dashoffset", String(1 - (0.04 + shown * 0.96)));
      if (ampRef.current) ampRef.current.textContent = `${(shown * PEAK_MA).toFixed(1)} mA`;
      const done = shown >= 0.985;
      if (done !== settled) {
        settled = done;
        if (stateRef.current) stateRef.current.textContent = done ? "Settled" : "DBS on";
        stateRef.current?.toggleAttribute("data-settled", done);
      }
    };
    const tick = () => {
      shown += (target - shown) * 0.1;
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
      <div ref={groundRef} aria-hidden className="dbs-ground pointer-events-none fixed inset-0 -z-10">
        <div className="dbs-glow absolute inset-0" />
      </div>

      {/* The spiral test, with the stimulator's readout under it */}
      <div aria-hidden className="pointer-events-none fixed top-1/2 right-5 z-20 hidden w-[76px] -translate-y-1/2 flex-col items-center md:flex">
        <svg viewBox="0 0 76 76" className="size-[76px] overflow-visible">
          <path d={SPIRAL} fill="none" stroke="rgb(255 255 255 / 0.1)" strokeWidth="1" strokeLinejoin="round" />
          <path
            ref={drawnRef}
            d={SPIRAL}
            pathLength={1}
            fill="none"
            stroke="var(--accent-2)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1"
            strokeDashoffset="0.96"
          />
        </svg>
        {/* Stacked short lines, so the readout stays inside the margin the spiral sits in */}
        <span className="mt-3 flex flex-col items-center rounded-[12px] bg-bg/75 px-2.5 py-1.5 text-center backdrop-blur-md">
          <span ref={stateRef} className="dbs-state block font-display text-[9px] font-semibold tracking-[0.08em] whitespace-nowrap text-muted uppercase">
            DBS on
          </span>
          <span ref={ampRef} className="mt-0.5 block font-display text-xs font-bold whitespace-nowrap tabular-nums">
            0.0 mA
          </span>
          <span className="block font-display text-[10px] font-semibold whitespace-nowrap text-muted">130 Hz</span>
        </span>
      </div>
    </>
  );
}
