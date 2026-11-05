"use client";

import { useEffect, useRef } from "react";
import { fitLetters } from "@/lib/fit";

type Step = { title: string; items: string[] };

/**
 * How the project ran, step by step (a week, a sprint). Each step has its own bar, shaded along the
 * project's colours from light to deep, and they fill one after another as the section scrolls into
 * view, lighting each step's card as they pass, so the timeline plays out rather than sits there.
 */
export default function Timeline({ title, body, unit, steps }: { title: string; body?: string; unit: string; steps: Step[] }) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        list.dataset.inview = "true";
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  // "Six weeks, research to handoff": the first part plain, the rest in the project's colours
  const [first, ...rest] = title.split(", ");
  const last = steps.length - 1;
  return (
    <section className="@container px-4 py-16 md:px-10 md:py-24">
      <h2 className="fit-heading font-display leading-[0.9] font-bold uppercase [--fit-max:3rem] md:[--fit-max:4.5rem]" style={fitLetters(title)}>
        {first}
        {rest.length ? (
          <>
            <br />
            <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-transparent">{rest.join(", ")}</span>
          </>
        ) : null}
      </h2>
      {body ? <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">{body}</p> : null}

      <ol ref={listRef} className="timeline mt-12 grid gap-3 sm:grid-cols-2 md:mt-16 md:gap-4 lg:grid-cols-3 2xl:grid-cols-6">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="timeline-step flex flex-col rounded-[24px] bg-surface/60 p-5 backdrop-blur-xl md:p-6"
            style={
              {
                "--i": i,
                // Light at the start, deepening to the end, like a belt darkening through the ranks
                "--step": `color-mix(in oklab, color-mix(in oklab, var(--accent-2) 55%, white) ${Math.round(100 - (i / last) * 100)}%, color-mix(in oklab, var(--accent) 80%, black))`,
              } as React.CSSProperties
            }
          >
            <span aria-hidden className="block h-1.5 overflow-hidden rounded-full bg-ink/10">
              <span className="timeline-fill block h-full rounded-full" />
            </span>
            <span className="timeline-copy mt-6 flex flex-1 flex-col">
              <span className="font-display text-xs font-semibold tracking-wide text-muted uppercase">
                {unit} {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-2 font-display text-2xl leading-[1.05] font-bold">{step.title}</span>
              <ul className="mt-5 space-y-1.5 text-base text-muted">
                {step.items.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full" style={{ background: "var(--step)" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
