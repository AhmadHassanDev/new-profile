"use client";

import { useLang } from "@/i18n/LangProvider";
import { ui } from "@/i18n/ui";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { fitLetters } from "@/lib/fit";

type Pair = { label: string; wire: string; final: string };

const WIDTH = 786; // screens are exported at twice a 393pt phone
const HEIGHT = 1704;

/**
 * From wireframe to final, one screen at a time, in a single handset. The wireframe sits over the
 * finished design and a split runs between them: a mouse moves it just by hovering, a finger or the
 * arrow keys drag it (it's a range input underneath), and the tabs switch screens. The first time it
 * comes into view the split sweeps across once, so it's clear there are two layers to compare.
 */
export default function Evolution({ title, body, pairs }: { title: string; body?: string; pairs: Pair[] }) {
  const t = ui(useLang()).caseStudy;
  const [active, setActive] = useState(0);
  const [split, setSplit] = useState(50);
  const phoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const phone = phoneRef.current;
    if (!phone || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        // One sweep: all wireframe, all final, then settle in the middle
        const start = performance.now();
        const sweep = (now: number) => {
          const t = Math.min(1, (now - start) / 2200);
          const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
          setSplit(t < 0.5 ? 100 - ease(t * 2) * 100 : ease((t - 0.5) * 2) * 50);
          if (t < 1) frame = requestAnimationFrame(sweep);
        };
        frame = requestAnimationFrame(sweep);
      },
      { threshold: 0.6 },
    );
    observer.observe(phone);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  // A mouse doesn't need to grab the handle: the split follows it across the phone
  const follow = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !phoneRef.current) return;
    const box = phoneRef.current.getBoundingClientRect();
    setSplit(Math.min(100, Math.max(0, ((event.clientX - box.left) / box.width) * 100)));
  };

  return (
    <section className="grid items-center gap-10 px-4 py-16 md:grid-cols-12 md:gap-12 md:px-10 md:py-24">
      <div className="@container md:col-span-6 lg:col-span-5">
        <h2 className="fit-heading font-display leading-[0.9] font-bold uppercase [--fit-max:3rem] md:[--fit-max:4.5rem]" style={fitLetters(title)}>
          {title}
        </h2>
        {body ? <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted md:text-xl">{body}</p> : null}
        <div role="group" aria-label={t.screens} className="mt-8 flex flex-wrap gap-2">
          {pairs.map((pair, i) => (
            <button
              key={pair.label}
              type="button"
              aria-pressed={i === active}
              onClick={() => setActive(i)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                i === active ? "bg-[var(--accent-2)] text-[var(--accent-ink)]" : "bg-surface/70 text-muted hover:text-ink"
              }`}
            >
              {pair.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center md:col-span-6 lg:col-span-7">
        <div className="w-full max-w-[340px] rounded-[44px] bg-[#050507] p-[9px] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)]">
          <div
            ref={phoneRef}
            onPointerMove={follow}
            className="relative aspect-[393/852] cursor-ew-resize overflow-hidden rounded-[36px] bg-surface has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-4 has-[input:focus-visible]:outline-[var(--accent-2)]"
            style={{ "--split": `${split}%` } as React.CSSProperties}
          >
            {pairs.map((pair, i) => (
              <div key={pair.label} aria-hidden={i !== active} className={`absolute inset-0 transition-opacity duration-500 ${i === active ? "opacity-100" : "opacity-0"}`}>
                {/* The finished screen; a long one (Home) shows its first screenful */}
                <Image src={pair.final} alt={`${pair.label}, final design`} fill sizes="340px" className="object-cover object-top" />
                {/* The wireframe over it, cut away right of the split */}
                <div className="absolute inset-0 [clip-path:inset(0_calc(100%-var(--split))_0_0)]">
                  <Image src={pair.wire} alt={`${pair.label}, wireframe`} width={WIDTH} height={HEIGHT} sizes="340px" className="h-full w-full object-cover object-top" />
                </div>
              </div>
            ))}
            <span aria-hidden className="phone-status absolute inset-x-0 top-0 h-[7.5%] rounded-t-[36px]" />
            <span aria-hidden className="absolute top-[2.2%] left-1/2 h-[3.4%] w-[30%] -translate-x-1/2 rounded-full bg-[#050507]" />

            {/* The split: a hairline with a handle, and what each side is */}
            <span aria-hidden className="pointer-events-none absolute inset-y-0 left-[var(--split)] w-0.5 -translate-x-1/2 bg-white/90 shadow-[0_0_20px_rgb(0_0_0/0.6)]">
              <span className="absolute top-1/2 left-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-sm font-bold text-[#101010] shadow-[0_8px_24px_-6px_rgb(0_0_0/0.7)]">
                ‹›
              </span>
            </span>
            <span aria-hidden className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
              {t.wireframe}
            </span>
            <span aria-hidden className="pointer-events-none absolute right-4 bottom-4 rounded-full bg-[var(--accent-2)] px-3 py-1 text-xs font-semibold text-[var(--accent-ink)]">
              {t.final}
            </span>

            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(split)}
              onChange={(event) => setSplit(Number(event.target.value))}
              aria-label={`Compare the ${pairs[active].label} wireframe with the final design`}
              aria-valuetext={`${Math.round(split)}% wireframe`}
              // Vertical swipes still scroll the page; sideways ones move the split
              className="absolute inset-0 h-full w-full cursor-ew-resize touch-pan-y opacity-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
