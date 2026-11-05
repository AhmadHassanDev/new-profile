"use client";

import { useEffect, useRef, useState } from "react";

/** 72.483 → "01:12.48" */
const clock = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${String(m).padStart(2, "0")}:${s.toFixed(2).padStart(5, "0")}`;
};

/**
 * Blacksprint's signature: reading the page is a sprint. A stopwatch in the margin runs only while
 * you're moving (scrolling), and each section of the page is a lap: pass one and its mark on the track
 * turns lime, with that lap's split flashing beside the clock. At the bottom it stops at the finish,
 * with your time. Behind the page, the studio's lime glows up from the floor as you near the end.
 */
export default function SprintSignature() {
  const groundRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const runnerRef = useRef<HTMLSpanElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const lapRef = useRef<HTMLSpanElement>(null);
  const splitRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLSpanElement>(null);
  const ticksRef = useRef<HTMLOListElement>(null);
  // Where each lap (a section of the page) starts along the track, from 0 to 1
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target = 0;
    let shown = 0;
    let frame = 0;
    let elapsed = 0; // seconds spent moving
    let lastScrollAt = 0;
    let lastTick = 0;
    let lap = 0;
    let lapStart = 0;
    let finished = false;
    let starts: number[] = [];
    let scrollable = 0;

    const paint = () => {
      groundRef.current?.style.setProperty("--run", shown.toFixed(4));
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${shown})`;
      if (runnerRef.current) runnerRef.current.style.transform = `translateY(${shown * 100}%)`;
      if (clockRef.current) clockRef.current.textContent = clock(elapsed);
    };

    // A lap is done once the next section reaches the middle of the screen
    const checkLap = () => {
      const passed = starts.filter((start) => start <= target + 0.0001).length;
      if (passed > lap) {
        const split = elapsed - lapStart;
        lapStart = elapsed;
        lap = passed;
        if (splitRef.current && lap > 1) {
          splitRef.current.textContent = `+${clock(split)}`;
          if (!reduced) splitRef.current.animate([{ opacity: 0, translate: "0 6px" }, { opacity: 1, translate: "0 0", offset: 0.15 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], { duration: 1600 });
        }
      } else if (passed < lap) {
        lap = passed;
      }
      const done = target >= 0.995;
      if (lapRef.current) lapRef.current.textContent = done ? "Finish" : `Lap ${Math.max(1, lap)}/${starts.length || 1}`;
      [...(ticksRef.current?.children ?? [])].forEach((tick, i) => ((tick as HTMLElement).dataset.passed = String(i < lap)));
      // The finish: the clock stops and says so
      if (done !== finished) {
        finished = done;
        cardRef.current?.toggleAttribute("data-finished", done);
        if (done && !reduced) cardRef.current?.animate([{ scale: 1.15 }, { scale: 1 }], { duration: 500, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" });
      }
    };

    // Runs only while you're moving: the clock counts, the runner eases to where you are
    const tick = (now: number) => {
      const moving = now - lastScrollAt < 250 && !finished;
      if (moving) elapsed += Math.min(0.1, (now - lastTick) / 1000);
      lastTick = now;
      shown += (target - shown) * (reduced ? 1 : 0.14);
      paint();
      frame = moving || Math.abs(target - shown) > 0.0005 ? requestAnimationFrame(tick) : 0;
    };
    const onScroll = () => {
      target = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      lastScrollAt = performance.now();
      checkLap();
      if (!frame) {
        lastTick = lastScrollAt;
        frame = requestAnimationFrame(tick);
      }
    };
    // Measured only when the page changes size (images loading, blocks streaming in), never on scroll
    const measure = () => {
      scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const sections = [...document.querySelectorAll<HTMLElement>("main.case > section")];
      const y = window.scrollY;
      starts = sections.map((section) =>
        Math.min(1, Math.max(0, (section.getBoundingClientRect().top + y - window.innerHeight * 0.5) / Math.max(1, scrollable))),
      );
      setLaps((previous) => (previous.length === starts.length && previous.every((v, i) => Math.abs(v - starts[i]) < 0.002) ? previous : starts));
      target = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      checkLap();
      shown = target;
      paint();
    };

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
      <div ref={groundRef} aria-hidden className="sprint-ground pointer-events-none fixed inset-0 -z-10">
        <div className="sprint-glow absolute inset-0" />
      </div>

      <div aria-hidden className="pointer-events-none fixed top-1/2 right-5 z-20 hidden -translate-y-1/2 md:block">
        {/* The stopwatch, above the track: time spent moving, the lap you're on, and each lap's split */}
        <span ref={cardRef} className="sprint-card absolute right-0 bottom-full mb-4 flex origin-bottom-right flex-col items-end">
          <span ref={splitRef} className="mb-1 font-display text-[10px] font-semibold text-[var(--accent-2)] tabular-nums opacity-0" />
          <span className="sprint-clock rounded-full bg-bg/75 px-2.5 py-1 font-display text-xs font-bold tabular-nums backdrop-blur-md">
            <span ref={clockRef}>00:00.00</span>
          </span>
          <span ref={lapRef} className="mt-1.5 font-display text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
            Lap 1/1
          </span>
        </span>

        {/* The track: lime behind you, a mark at the start of every lap, and the runner where you are */}
        <div className="relative h-[42vh] w-4">
          <span className="absolute inset-y-0 right-[7px] w-0.5 rounded-full bg-[rgb(222_246_101/0.14)]" />
          <span ref={fillRef} className="absolute inset-y-0 right-[7px] w-0.5 origin-top scale-y-0 rounded-full bg-[var(--accent-2)]" />
          <ol ref={ticksRef}>
            {laps.map((at, i) => (
              <li key={i} className="sprint-tick absolute right-[3px] block h-0.5 w-2.5 rounded-full" style={{ top: `${at * 100}%` }} />
            ))}
          </ol>
          <span ref={runnerRef} className="absolute inset-x-0 top-0 block h-full">
            <span className="absolute top-0 right-[3px] block size-2.5 -translate-y-1/2 rounded-full bg-[var(--accent-2)] shadow-[0_0_0_4px_rgb(222_246_101/0.18)]" />
          </span>
        </div>
      </div>
    </>
  );
}
