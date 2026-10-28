"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const LINES = ["Let's make", "it real."];
const LABEL = "Say hello";

// Each letter's twin takes its own spot along the spectrum: cyan → violet → coral
const STOPS = [
  [9, 199, 251],
  [196, 113, 237],
  [246, 79, 89],
];
function spectrumAt(t: number) {
  const scaled = Math.min(1, Math.max(0, t)) * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(scaled));
  const f = scaled - i;
  const [r, g, b] = STOPS[i].map((c, k) => Math.round(c + (STOPS[i + 1][k] - c) * f));
  return `rgb(${r} ${g} ${b})`;
}

/** A letter with two faces (optionally coloured); hovering the button flips it to the second. */
function Roll({ letter, index, face, twin }: { letter: string; index: number; face?: string; twin?: string }) {
  const char = letter === " " ? "\u00a0" : letter;
  return (
    <span className="roll" style={{ "--i": index } as React.CSSProperties}>
      <span className="roll-face" style={face ? { color: face } : undefined}>
        {char}
      </span>
      <span className="roll-face" style={twin ? { color: twin } : undefined}>
        {char}
      </span>
    </span>
  );
}

/**
 * The closing call to action: a plain link, clickable at once. Hovering it is the reward: the
 * headline above flips letter by letter into the spectrum, the button floods with colour from the
 * side your cursor came in (and drains toward where it leaves), and leans toward the cursor.
 */
export default function MakeItReal({ href, children }: { href: string; children?: React.ReactNode }) {
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const total = LINES.join("").length;

  useEffect(() => {
    const cta = ctaRef.current;
    const arrow = arrowRef.current;
    if (!cta || !arrow) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Where the pointer is inside the button, as a percentage, for the fill's origin
    const origin = (e: PointerEvent) => {
      const box = cta.getBoundingClientRect();
      cta.style.setProperty("--x", `${((e.clientX - box.left) / box.width) * 100}%`);
      cta.style.setProperty("--y", `${((e.clientY - box.top) / box.height) * 100}%`);
      return box;
    };
    const onMove = (e: PointerEvent) => {
      const box = origin(e);
      if (reduced || e.pointerType !== "mouse") return;
      const dx = (e.clientX - (box.left + box.width / 2)) / (box.width / 2);
      const dy = (e.clientY - (box.top + box.height / 2)) / (box.height / 2);
      cta.style.transform = `translate3d(${dx * 8}px, ${dy * 6}px, 0)`;
      arrow.style.transform = `translate3d(${dx * 8}px, ${dy * 8}px, 0) rotate(45deg)`;
    };
    const onLeave = (e: PointerEvent) => {
      origin(e);
      cta.style.transform = "";
      arrow.style.transform = "";
    };

    cta.addEventListener("pointerenter", origin);
    cta.addEventListener("pointermove", onMove);
    cta.addEventListener("pointerleave", onLeave);
    return () => {
      cta.removeEventListener("pointerenter", origin);
      cta.removeEventListener("pointermove", onMove);
      cta.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  let count = 0;
  return (
    <div className="make-real">
      <h2 aria-label={LINES.join(" ")} className="font-display text-[13vw] leading-[0.85] font-bold tracking-[-0.05em] uppercase md:text-[10vw]">
        {LINES.map((line, row) => (
          <span key={line} aria-hidden className="block">
            {[...line].map((letter) => {
              const index = count++;
              // The second line rests in the spectrum and flips to white; the first does the opposite
              const tint = spectrumAt(index / (total - 1));
              return row === 0 ? (
                <Roll key={index} letter={letter} index={index} twin={tint} />
              ) : (
                <Roll key={index} letter={letter} index={index} face={tint} />
              );
            })}
          </span>
        ))}
      </h2>

      <div className="mt-14 flex flex-col gap-10 md:mt-16 md:flex-row md:items-center md:justify-between">
        <Link
          ref={ctaRef}
          href={href}
          className="cta group relative inline-flex w-fit items-center gap-5 overflow-hidden rounded-full bg-ink py-3 pr-3 pl-9 text-xl font-semibold text-bg transition-transform duration-300 ease-out md:py-4 md:pr-4 md:pl-11 md:text-2xl"
        >
          {/* Floods in from where the cursor entered */}
          <span aria-hidden className="cta-fill absolute inset-0" style={{ background: "var(--spectrum)" }} />
          <span className="relative">
            <span className="sr-only">{LABEL}</span>
            {/* Taller letter frames than the headline's, so the y's tail stays hidden mid-flip */}
            <span aria-hidden className="inline-flex" style={{ "--roll": "1.35em" } as React.CSSProperties}>
              {[...LABEL].map((letter, i) => (
                <Roll key={i} letter={letter} index={i} />
              ))}
            </span>
          </span>
          <span
            ref={arrowRef}
            aria-hidden
            className="cta-arrow relative grid size-14 place-items-center rounded-full bg-bg text-2xl text-ink transition-transform duration-500 ease-out md:size-16"
          >
            ↗
          </span>
        </Link>
        {children}
      </div>
    </div>
  );
}
