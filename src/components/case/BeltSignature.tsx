"use client";

import { useEffect, useRef } from "react";

// The BJJ ranks in order, each earning four stripes before the next; black is the last
const BELTS = [
  { name: "White belt", color: "#ecebe6" },
  { name: "Blue belt", color: "#2f5fd0" },
  { name: "Purple belt", color: "#7a46b8" },
  { name: "Brown belt", color: "#7a4a2a" },
  { name: "Black belt", color: "#1c1c1f" },
];
const STRIPES = 4;
const STEPS = (BELTS.length - 1) * (STRIPES + 1); // every stripe and promotion on the way to black
const BLACK = BELTS.length - 1;
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

/**
 * Anubis's signature: reading the page is a journey through the ranks. A woven Jiu-Jitsu belt hangs
 * in the margin. Stripes are taped onto its rank bar as you read, and every fifth step is a promotion:
 * the belt snaps tight in its new colour, a ring bursts off the bar, and the new rank slides into the
 * card beside it, over the ladder of ranks filling in. At the bottom it's a black belt, its bar Anubis red:
 * Oss. Behind the page, the academy's red glows up from the floor the further you train, under a faint
 * Anubis mark that comes up with it.
 */
export default function BeltSignature() {
  const groundRef = useRef<HTMLDivElement>(null);
  const beltRef = useRef<HTMLDivElement>(null);
  const stripesRef = useRef<HTMLOListElement>(null);
  const burstRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const ladderRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stripes = stripesRef.current ? [...stripesRef.current.children] : [];
    const rungs = ladderRef.current ? [...ladderRef.current.children] : [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target = 0;
    let shown = 0;
    let step = -1;
    let frame = 0;
    // How far the page scrolls, measured only when its size changes, so a scroll reads just scrollY
    let scrollable = 0;

    // The ceremony: the belt snaps tight, a ring in the new colour bursts off the bar, and the new rank
    // slides into the card in place of the old one
    const promote = () => {
      if (reduced) return;
      beltRef.current?.animate([{ scale: "1 1" }, { scale: "1.7 1.02" }, { scale: "1 1" }], { duration: 520, easing: SPRING });
      burstRef.current?.animate(
        [
          { scale: 0.4, opacity: 0.9 },
          { scale: 3.2, opacity: 0 },
        ],
        { duration: 700, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
      nameRef.current?.animate(
        [
          { opacity: 0, translate: "0 45%" },
          { opacity: 1, translate: "0 0" },
        ],
        { duration: 520, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
    };

    const rank = (next: number) => {
      const belt = Math.floor(next / (STRIPES + 1));
      const earned = next % (STRIPES + 1);
      const promoted = step >= 0 && belt > Math.floor(step / (STRIPES + 1));
      step = next;
      // On the belt's wrapper, so the burst ring beside it takes the colour too
      beltRef.current?.parentElement?.style.setProperty("--belt", BELTS[belt].color);
      beltRef.current?.toggleAttribute("data-black", belt === BLACK);
      cardRef.current?.toggleAttribute("data-black", belt === BLACK);
      stripes.forEach((stripe, i) => ((stripe as HTMLElement).dataset.earned = String(i < earned)));
      rungs.forEach((rung, i) => ((rung as HTMLElement).dataset.earned = String(i <= belt)));
      if (nameRef.current) nameRef.current.textContent = BELTS[belt].name;
      if (promoted) promote();
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

      <div aria-hidden className="pointer-events-none fixed top-1/2 right-5 z-20 hidden -translate-y-1/2 md:block">
        <div className="relative h-[42vh] w-3.5">
          {/* The belt: woven, in the rank's colour, with the bar near its end where stripes are taped on */}
          <div ref={beltRef} className="belt absolute inset-0 rounded-[3px]">
            <div className="belt-bar absolute inset-x-0 bottom-[8%] h-[24%]">
              <ol ref={stripesRef} className="flex h-full flex-col justify-center gap-[12%] px-[2px]">
                {Array.from({ length: STRIPES }, (_, i) => (
                  <li key={i} className="belt-stripe block h-[3px] w-full" />
                ))}
              </ol>
            </div>
          </div>
          <span ref={burstRef} className="belt-burst absolute bottom-[20%] left-1/2 size-10 -translate-x-1/2 translate-y-1/2 rounded-full opacity-0" />

          {/* The rank card, upright along the belt so it stays out of the text: the ladder of ranks so far,
              the rank, and "Oss." once it's black */}
          <span
            ref={cardRef}
            className="belt-card absolute top-0 right-full mr-2.5 flex origin-top flex-col items-center gap-2.5 rounded-full bg-bg/70 px-1.5 py-3 backdrop-blur-md"
          >
            <span ref={ladderRef} className="flex flex-col gap-1">
              {BELTS.map((belt, i) => (
                <span
                  key={belt.name}
                  className="belt-rung block h-3.5 w-[3px] rounded-full"
                  // Black would vanish on the dark card, so its rung shows the black belt's red bar too
                  style={{ background: i === BLACK ? "linear-gradient(#3a3a3f 62%, #d11f2f 62%)" : belt.color }}
                />
              ))}
            </span>
            <span className="flex items-center gap-1.5 font-display text-xs font-bold whitespace-nowrap [writing-mode:vertical-rl]">
              <span ref={nameRef}>{BELTS[0].name}</span>
              <span className="belt-oss text-[var(--accent-2)]">Oss.</span>
            </span>
          </span>
        </div>
      </div>
    </>
  );
}
