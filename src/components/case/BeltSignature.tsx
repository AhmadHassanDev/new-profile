"use client";

import { useEffect, useRef } from "react";

// The BJJ ranks in order, each earning four stripes before the next; black is the last
const BELTS = [
  { name: "White belt", color: "#ecebe6" },
  { name: "Blue belt", color: "#2f5fd0" },
  { name: "Purple belt", color: "#7a46b8" },
  { name: "Brown belt", color: "#7a4a2a" },
  { name: "Black belt", color: "#222225" },
];
const STRIPES = 4;
const STEPS = (BELTS.length - 1) * (STRIPES + 1); // every stripe and promotion on the way to black

/**
 * Anubis's signature: reading the page is a journey through the ranks. A Jiu-Jitsu belt hangs in the
 * margin, earning stripes as you go and promoted to the next colour every fifth, from white at the top
 * to black at the bottom, where its bar turns Anubis red. Behind the page, the academy's red glows up
 * from the floor the further you train, under a faint Anubis mark (the jackal's head; its wordmark stays below the fold).
 */
export default function BeltSignature() {
  const groundRef = useRef<HTMLDivElement>(null);
  const beltRef = useRef<HTMLDivElement>(null);
  const stripesRef = useRef<HTMLOListElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stripes = stripesRef.current ? [...stripesRef.current.children] : [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target = 0;
    let shown = 0;
    let step = -1;
    let frame = 0;
    // How far the page scrolls, measured only when its size changes, so a scroll reads just scrollY
    let scrollable = 0;

    const rank = (next: number) => {
      const belt = Math.floor(next / (STRIPES + 1));
      const earned = next % (STRIPES + 1);
      const promoted = step >= 0 && belt !== Math.floor(step / (STRIPES + 1));
      step = next;
      beltRef.current?.style.setProperty("--belt", BELTS[belt].color);
      beltRef.current?.toggleAttribute("data-black", belt === BELTS.length - 1);
      stripes.forEach((stripe, i) => ((stripe as HTMLElement).dataset.earned = String(i < earned)));
      if (nameRef.current) nameRef.current.textContent = BELTS[belt].name;
      if (countRef.current) countRef.current.textContent = earned ? `${earned} stripe${earned > 1 ? "s" : ""}` : "";
      // A promotion gets its moment: the rank pops as the belt changes colour
      if (promoted && !reduced) {
        nameRef.current?.parentElement?.animate([{ scale: 1.2 }, { scale: 1 }], { duration: 500, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" });
      }
    };
    const paint = () => {
      groundRef.current?.style.setProperty("--trained", shown.toFixed(4));
      const next = Math.min(STEPS, Math.floor(shown * (STEPS + 1)));
      if (next !== step) rank(next);
    };
    // Ease toward the scroll position, so the glow settles rather than jumps
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
      <div ref={groundRef} aria-hidden className="belt-ground pointer-events-none fixed inset-0 -z-10">
        <div className="belt-heat absolute inset-0" />
        <div className="belt-mark absolute -right-[8vh] -bottom-[24vh] h-[80vh] w-[48vh]" />
      </div>

      {/* The belt: its colour is the rank, and the bar near its end holds the stripes earned */}
      <div aria-hidden className="pointer-events-none fixed top-1/2 right-7 z-20 hidden -translate-y-1/2 md:block">
        <div ref={beltRef} className="belt relative h-[42vh] w-3 rounded-[3px]">
          <div className="belt-bar absolute inset-x-0 bottom-[8%] flex h-[24%] items-center justify-center">
            <ol ref={stripesRef} className="flex h-full flex-col justify-center gap-[10%]">
              {Array.from({ length: STRIPES }, (_, i) => (
                <li key={i} className="belt-stripe block h-[3px] w-3" />
              ))}
            </ol>
          </div>
          <span className="absolute top-0 right-6 flex origin-right items-baseline gap-1.5 rounded-full bg-bg/70 px-2.5 py-1 font-display text-xs font-bold whitespace-nowrap backdrop-blur-md">
            <span ref={nameRef}>{BELTS[0].name}</span>
            <span ref={countRef} className="text-muted" />
          </span>
        </div>
      </div>
    </>
  );
}
