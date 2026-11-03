"use client";

import { useEffect, useRef } from "react";

const RESTING = 68; // bpm while you read
const PEAK = 118; // bpm when you scroll hard
const BEATS = 7; // heartbeats drawn down the strip
const BEAT = 60; // height of one beat in the strip's own units
const LINE = 34; // the trace's baseline, near the strip's right edge

// One heartbeat, top to bottom: flat, the P wave, the sharp QRS spike, the T wave, flat again
const beat = (y: number) =>
  [
    `L${LINE} ${y + 26}`,
    `Q${LINE - 4} ${y + 30} ${LINE} ${y + 34}`,
    `L${LINE + 3} ${y + 37}`,
    `L${LINE - 26} ${y + 40}`,
    `L${LINE + 7} ${y + 43}`,
    `L${LINE} ${y + 45}`,
    `Q${LINE - 7} ${y + 51} ${LINE} ${y + 56}`,
    `L${LINE} ${y + BEAT}`,
  ].join(" ");
const TRACE = `M${LINE} 0 ${Array.from({ length: BEATS }, (_, i) => beat(i * BEAT)).join(" ")}`;
const HEIGHT = BEATS * BEAT;

/**
 * PMG's signature: the page reads like a patient monitor. A calm clinic of sage greens sits behind it,
 * with a faint ECG-paper grid near the top. In the margin, a heart trace draws itself down as you read,
 * its tip beating, with a live heart rate that rests while you read and climbs when you scroll fast.
 */
export default function PulseSignature() {
  const drawnRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const rateRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let progress = 0;
    let shown = 0;
    let bpm = RESTING;
    let pace = 0; // how hard you're scrolling, which settles back to calm
    let lastY = window.scrollY;
    let lastT = performance.now();
    let frame = 0;
    // How far the page scrolls, measured only when its size changes, so a scroll reads just scrollY
    let scrollable = 0;

    const paint = () => {
      drawnRef.current?.style.setProperty("stroke-dashoffset", String(1 - shown));
      if (tipRef.current) {
        tipRef.current.style.transform = `translateY(${shown * 100}%)`;
        tipRef.current.style.setProperty("--beat", `${(60 / bpm).toFixed(3)}s`);
      }
      if (rateRef.current) rateRef.current.textContent = String(Math.round(bpm));
    };
    // The trace eases to where you are, and the heart rate eases toward how hard you're scrolling
    const tick = () => {
      shown += (progress - shown) * 0.12;
      pace *= 0.96;
      bpm += (RESTING + (PEAK - RESTING) * Math.min(1, pace) - bpm) * 0.05;
      paint();
      const settled = Math.abs(progress - shown) < 0.0005 && pace < 0.01 && Math.abs(bpm - RESTING) < 0.5;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };
    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      // Pixels per millisecond, scaled so a brisk scroll reads as exertion
      pace = Math.max(pace, Math.min(1, Math.abs(y - lastY) / Math.max(1, now - lastT) / 4));
      lastY = y;
      lastT = now;
      progress = scrollable > 0 ? Math.min(1, Math.max(0, y / scrollable)) : 0;
      if (reduced) {
        shown = progress;
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
      <div aria-hidden className="pulse-ground pointer-events-none fixed inset-0 -z-10">
        <div className="pulse-grid absolute inset-0" />
      </div>

      {/* The heart trace: faint ahead of you, drawn in mint behind you, with the beating tip and the rate */}
      <div aria-hidden className="pointer-events-none fixed top-1/2 right-6 z-20 hidden -translate-y-1/2 md:block">
        <div className="relative h-[42vh] w-10">
          <svg viewBox={`0 0 40 ${HEIGHT}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <path d={TRACE} fill="none" stroke="var(--line)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
            <path
              ref={drawnRef}
              d={TRACE}
              pathLength={1}
              fill="none"
              stroke="var(--accent-2)"
              strokeWidth="1.75"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray="1"
              strokeDashoffset="1"
            />
          </svg>
          <span ref={tipRef} className="absolute top-0 right-0 block h-full w-0">
            <span className="pulse-tip absolute top-0 right-[3px] block size-2 -translate-y-1/2 rounded-full bg-[var(--accent-2)]" />
            <span className="absolute top-0 right-7 flex -translate-y-1/2 items-baseline gap-1 rounded-full bg-bg/70 px-2.5 py-1 font-display text-xs font-bold whitespace-nowrap backdrop-blur-md">
              <span ref={rateRef}>{RESTING}</span>
              <span className="text-muted">bpm</span>
            </span>
          </span>
        </div>
      </div>
    </>
  );
}
