"use client";

import { useEffect, useRef } from "react";

// The app's own three steps, reached a third of the way down the page apart
const STAGES = [
  { name: "Discover", at: 0 },
  { name: "Choose", at: 0.38 },
  { name: "Book", at: 0.76 },
];
const COLORS = ["#d3fc64", "#f85838", "#00d698"]; // Spark's lime, coral and teal

// Hand-drawn confetti, like the streamers on Spark's hero: three strokes burst from each step's dot
const CONFETTI = [
  "M2 18c6-2 4-10 10-9s3 9 9 7",
  "M4 4c3 5 9 2 10 8s-5 7-2 11",
  "M2 10c4-6 9 0 13-4s6 1 8-3",
];
const BURSTS = [
  { x: -30, y: -22, r: -20 },
  { x: -36, y: 4, r: 10 },
  { x: -26, y: 22, r: 35 },
];

/**
 * Spark's signature: reading the page is a booking. In the margin, a ticket of the app's three steps,
 * Discover, Choose and Book, fills as you read, and each step bursts into hand-drawn confetti in Spark's
 * colours when you reach it, like the streamers on its hero. At the bottom, the booking goes through:
 * the app's own confirmation slides in. Behind the page, a floodlit night in Spark's blue.
 */
export default function SparkSignature() {
  const groundRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const stagesRef = useRef<HTMLOListElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stages = stagesRef.current ? [...stagesRef.current.children] : [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target = 0;
    let shown = 0;
    let frame = 0;
    let reached = -1;
    let booked = false;
    // How far the page scrolls, measured only when its size changes, so a scroll reads just scrollY
    let scrollable = 0;

    const paint = () => {
      groundRef.current?.style.setProperty("--booking", shown.toFixed(4));
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${shown})`;
      const now = STAGES.filter((stage) => shown >= stage.at - 0.0001).length - 1;
      if (now !== reached) {
        reached = now;
        stages.forEach((stage, i) => ((stage as HTMLElement).dataset.reached = String(i <= now)));
        if (labelRef.current) labelRef.current.textContent = `0${now + 1} ${STAGES[now].name}`;
      }
      // The booking goes through at the very bottom, and is taken back if you scroll up again
      const done = shown >= 0.985;
      if (done !== booked) {
        booked = done;
        toastRef.current?.toggleAttribute("data-shown", done);
      }
    };
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
      <div ref={groundRef} aria-hidden className="spark-ground pointer-events-none fixed inset-0 -z-10">
        <div className="spark-flood absolute inset-0" />
      </div>

      {/* The ticket: the three steps along a track that fills as you read, the step you're on above it */}
      <div aria-hidden className="pointer-events-none fixed top-1/2 right-5 z-20 hidden -translate-y-1/2 md:block">
        <span ref={labelRef} className="absolute right-0 bottom-full mb-12 rounded-full bg-bg/75 px-2.5 py-1 font-display text-xs font-bold whitespace-nowrap backdrop-blur-md">
          01 Discover
        </span>
        <div className="relative h-[42vh] w-4">
          <span className="absolute inset-y-0 right-[7px] w-0.5 rounded-full bg-white/12" />
          <span ref={fillRef} className="absolute inset-y-0 right-[7px] w-0.5 origin-top scale-y-0 rounded-full bg-[var(--accent-2)]" />
          <ol ref={stagesRef}>
            {STAGES.map((stage, i) => (
              <li key={stage.name} className="spark-stage absolute right-0 size-4 -translate-y-1/2" style={{ top: `${stage.at * 100}%` }}>
                <span className="spark-dot absolute inset-0 rounded-full" />
                {BURSTS.map((burst, j) => (
                  <svg
                    key={j}
                    viewBox="0 0 24 24"
                    className="spark-confetti absolute top-1/2 left-1/2 size-6 overflow-visible"
                    style={{ translate: `${burst.x}px ${burst.y - 12}px`, rotate: `${burst.r}deg` }}
                  >
                    <path
                      d={CONFETTI[j]}
                      pathLength={1}
                      fill="none"
                      stroke={COLORS[(i + j) % COLORS.length]}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      style={{ transitionDelay: `${j * 90}ms` }}
                    />
                  </svg>
                ))}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* The booking goes through: the app's own notification, at the end of the page (held clear of the footer's links) */}
      <div
        ref={toastRef}
        aria-hidden
        className="spark-toast pointer-events-none fixed right-6 bottom-24 z-30 hidden items-center gap-3 rounded-[20px] bg-white px-4 py-3 text-[#0b1530] shadow-[0_20px_50px_-15px_rgb(0_0_0/0.7)] md:flex"
      >
        <span className="grid size-9 place-items-center rounded-full bg-[#004ab5] text-white">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <span>
          <span className="block text-sm font-bold">Padel booking confirmed</span>
          <span className="block text-xs text-[#4a5677]">Today at 7:00 PM in Maadi</span>
        </span>
      </div>
    </>
  );
}
