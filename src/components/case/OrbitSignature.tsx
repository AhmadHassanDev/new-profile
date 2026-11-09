"use client";

import { useLang } from "@/i18n/LangProvider";
import { ui } from "@/i18n/ui";
import { useEffect, useRef } from "react";

// Where each stage of the consultation starts, as a share of the page read; the call is the long one
const STAGES = [0, 0.16, 0.3, 0.4, 0.96];

// Soft cyan light down the page, alternating sides; they scroll with it, so none follows you around
const GLOWS = [
  { top: 3, x: 86, size: 62, alpha: 0.24 },
  { top: 13, x: 8, size: 56, alpha: 0.18 },
  { top: 23, x: 92, size: 58, alpha: 0.2 },
  { top: 33, x: 6, size: 60, alpha: 0.18 },
  { top: 43, x: 90, size: 56, alpha: 0.2 },
  { top: 53, x: 10, size: 62, alpha: 0.18 },
  { top: 63, x: 88, size: 58, alpha: 0.2 },
  { top: 73, x: 6, size: 56, alpha: 0.18 },
  { top: 83, x: 92, size: 60, alpha: 0.2 },
  { top: 94, x: 34, size: 70, alpha: 0.22 },
];

/** 75 → "01:15" */
const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * ORBS's signature: reading the page is a consultation. A call card in the margin walks through the
 * patient's journey as you go, triage, payment, the waiting room, then the call itself, its timer
 * running for as long as you stay on it, and at the bottom the doctor is rated. Soft pools of ORBS
 * cyan light the page as you go, fixed to the page rather than the screen.
 */
export default function OrbitSignature() {
  const t = ui(useLang()).signatures.orbit;
  const cardRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<HTMLSpanElement>(null);
  const starsRef = useRef<HTMLSpanElement>(null);
  const dotsRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scrollable = 0;
    let stage = -1;
    let onCall = 0; // seconds spent on the call
    let ticking = 0;

    const setStage = (next: number) => {
      if (next === stage) return;
      const first = stage === -1;
      stage = next;
      if (stageRef.current) stageRef.current.textContent = t.stages[next];
      [...(dotsRef.current?.children ?? [])].forEach((dot, i) => ((dot as HTMLElement).dataset.state = i < next ? "done" : i === next ? "now" : "next"));
      cardRef.current?.setAttribute("data-stage", String(next));
      if (timerRef.current) timerRef.current.hidden = next !== 3;
      if (starsRef.current) starsRef.current.hidden = next !== 4;
      // The call's timer runs in real time while you're on it, like a call does
      window.clearInterval(ticking);
      if (next === 3) {
        ticking = window.setInterval(() => {
          onCall += 1;
          if (timerRef.current) timerRef.current.textContent = clock(onCall);
        }, 1000);
      }
      if (!first && !reduced) cardRef.current?.animate([{ scale: 0.94 }, { scale: 1 }], { duration: 420, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" });
    };

    const update = () => {
      const read = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      setStage(STAGES.reduce((at, start, i) => (read >= start ? i : at), 0));
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${read})`;
    };
    const measure = () => {
      scrollable = document.documentElement.scrollHeight - window.innerHeight;
      update();
    };

    const resize = new ResizeObserver(measure);
    resize.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.clearInterval(ticking);
      resize.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, [t]);

  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {GLOWS.map((g, i) => (
          <span
            key={i}
            className="absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              top: `${g.top}%`,
              left: `${g.x}%`,
              width: `${g.size}vw`,
              background: `radial-gradient(closest-side, rgb(1 255 255 / ${g.alpha}), rgb(11 100 112 / ${g.alpha * 0.6}) 45%, transparent)`,
            }}
          />
        ))}
      </div>

      <div aria-hidden className="pointer-events-none fixed top-1/2 right-5 z-20 hidden -translate-y-1/2 md:block">
        {/* The call card: where the consultation is, the call's timer, then the rating */}
        <span ref={cardRef} className="orbit-card absolute right-0 bottom-full mb-4 flex origin-bottom-right flex-col items-end">
          <span className="font-display text-[length:calc((10px)*var(--ds))] font-semibold tracking-[0.12em] text-muted uppercase rtl:tracking-normal">{t.consult}</span>
          <span className="mt-1.5 flex items-center gap-2 rounded-full bg-bg/75 py-1 ps-2 pe-3 text-xs font-semibold whitespace-nowrap backdrop-blur-md">
            <span className="orbit-led size-2 rounded-full bg-[var(--accent-2)]" />
            <span ref={stageRef}>{t.stages[0]}</span>
            <span ref={timerRef} hidden dir="ltr" className="font-display text-[var(--accent-2)] tabular-nums">
              00:00
            </span>
          </span>
          <span ref={starsRef} hidden className="mt-1.5 text-sm tracking-[0.2em] text-[#ffc83d]">
            ★★★★★
          </span>
        </span>

        {/* The journey: a stop for each stage, cyan behind you */}
        <div className="relative h-[42vh] w-4">
          <span className="absolute inset-y-0 right-[7px] w-0.5 rounded-full bg-[rgb(1_255_255/0.14)]" />
          <span ref={fillRef} className="absolute inset-y-0 right-[7px] w-0.5 origin-top scale-y-0 rounded-full bg-[var(--accent-2)]" />
          <ol ref={dotsRef}>
            {STAGES.map((at, i) => (
              <li key={i} className="orbit-dot absolute right-[2px] block size-3 -translate-y-1/2 rounded-full" style={{ top: `${at * 100}%` }} />
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
