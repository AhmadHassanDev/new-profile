"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { localePath } from "@/i18n/lang";
import { useLang } from "@/i18n/LangProvider";
import { ui } from "@/i18n/ui";
import HeroCanvas, { EXCITE_EVENT } from "./hero/HeroCanvas";
import LiquidName, { type Lit } from "./hero/LiquidName";
import Stats from "./hero/Stats";
import { SHAPE_EVENT, type ShapeEventDetail } from "./hero/objects/types";

// The process, in its three colours. Order matches the particle shapes' word index.
const LIT = ["text-cyan", "text-violet", "text-coral"];

const NONE: Lit = [false, false, false];
const ALL: Lit = [true, true, true];
const only = (i: number): Lit => [i === 0, i === 1, i === 2];

const excite = (on: boolean) => () => window.dispatchEvent(new CustomEvent(EXCITE_EVENT, { detail: on }));

export default function Hero() {
  const lang = useLang();
  const t = ui(lang).hero;
  const VERBS = t.verbs.map((text, i) => ({ text, lit: LIT[i] }));
  const [lit, setLit] = useState<Lit>(only(0));
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // The particles act out the verbs: each discipline shape lights its word, the logo lights all
    // three, the showpieces none. Until the first shape arrives (or without WebGL), cycle on a timer.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let step = 0;
    let timer = reduced ? undefined : window.setInterval(() => setLit(only(++step % LIT.length)), 2200);
    const onShape = (e: Event) => {
      window.clearInterval(timer);
      timer = undefined;
      const { id, word } = (e as CustomEvent<ShapeEventDetail>).detail;
      setLit(word !== null ? only(word) : id === "mark" ? ALL : NONE);
    };
    window.addEventListener(SHAPE_EVENT, onShape);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(SHAPE_EVENT, onShape);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-bg">
      {/* Shown while three.js loads, and instead of it when WebGL is unavailable */}
      <div
        aria-hidden
        data-intro-hide
        className="absolute h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[100px] portrait:top-[26%] portrait:left-1/2 landscape:top-[45%] landscape:left-[76%] rtl:landscape:left-[24%]"
        style={{ background: "var(--spectrum)" }}
      />
      <HeroCanvas />
      {/* Where the particles live in landscape; the 3D scene fits itself to whichever zone is showing */}
      <div aria-hidden data-particle-zone className="pointer-events-none absolute end-[3vw] top-[12%] bottom-[20%] w-[38vw] portrait:hidden" />

      <div className="relative flex min-h-[100svh] flex-col px-4 pt-24 pb-8 md:px-10 md:pb-10">
        {/* Where the particles live in portrait: their own band above the headline */}
        <div aria-hidden data-particle-zone className="pointer-events-none h-[30svh] min-h-[200px] shrink-0 landscape:hidden" />

        <div data-intro-hide className="pointer-events-none portrait:mt-6 landscape:my-auto landscape:py-6">
          {/* Signature */}
          <p className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-muted md:mb-7 md:gap-x-4 md:text-base">
            <span className="text-xl font-semibold text-ink md:text-3xl">{ui(lang).common.name}</span>
            <span aria-hidden className="h-px w-8 bg-line md:w-12" />
            {t.role}
          </p>

          {/* Stays in the page for screen readers and search; turns transparent once the liquid copy takes over.
              Sized so the longest word always fits beside (landscape) or under (portrait) the particles. */}
          <h1
            ref={headingRef}
            className="font-display font-bold uppercase leading-[0.86] text-ink data-[liquid=true]:[&_span]:text-transparent"
          >
            <span className="sr-only">{t.srName}</span>
            {VERBS.map((verb, i) => (
              <span
                key={verb.text}
                data-line
                className="reveal block portrait:text-[length:calc((calc(13.2vw_-_0.3rem))*var(--ds))] md:portrait:text-[length:calc((calc(13.2vw_-_0.7rem))*var(--ds))] landscape:text-[length:calc((min(calc(7.5vw_-_0.35rem),calc((100svh_-_25rem)/2.6)))*var(--ds))]"
              >
                <span
                  className={`animate-rise block transition-colors duration-700 ${lit[i] ? verb.lit : ""}`}
                  style={{ animationDelay: `${i * 110}ms` }}
                >
                  {verb.text}
                  {t.stop}
                </span>
              </span>
            ))}
          </h1>
        </div>

        {/* Copy and calls to action */}
        <div data-intro-hide className="relative z-10 mt-auto flex flex-col gap-6 pt-6 md:gap-8 landscape:flex-row landscape:items-end landscape:justify-between">
          <div className="max-w-lg">
            <p className="text-base leading-snug font-medium text-muted md:text-xl">
              {t.lineA}
              <span className="text-ink">{t.lineB}</span>
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3 md:mt-6">
              <a
                href="#work"
                onPointerEnter={excite(true)}
                onPointerLeave={excite(false)}
                onFocus={excite(true)}
                onBlur={excite(false)}
                className="group inline-flex items-center gap-3 rounded-full bg-ink py-2 pe-2 ps-6 text-base font-semibold text-bg transition-transform duration-300 hover:scale-[1.04]"
              >
                {t.seeWork}
                <span
                  aria-hidden
                  className="grid h-10 w-10 place-items-center rounded-full text-ink transition-transform duration-500 group-hover:rotate-[-45deg] rtl:group-hover:rotate-[45deg]"
                  style={{ background: "var(--spectrum)" }}
                >
                  <span className="arrow">→</span>
                </span>
              </a>
              <Link
                href={localePath(lang, "/contact")}
                onPointerEnter={excite(true)}
                onPointerLeave={excite(false)}
                onFocus={excite(true)}
                onBlur={excite(false)}
                className="inline-flex items-center rounded-full border border-line bg-bg/40 px-6 py-[15px] text-base font-semibold backdrop-blur-md transition-colors duration-300 hover:border-ink"
              >
                {t.talk}
              </Link>
            </div>
          </div>
          <Stats />
        </div>
      </div>
      <LiquidName heading={headingRef} lit={lit} />
    </section>
  );
}
