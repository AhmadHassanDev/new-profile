"use client";

import { useEffect, useRef } from "react";
import ToolLogo from "./ToolLogo";
import { fitLetters } from "@/lib/fit";

/**
 * The build journey: one card per tool, joined by a line that carries the project's colour from the
 * first to the last. The cards light up in order as the section scrolls into view.
 */
export default function Pipeline({ title, steps }: { title: string; steps: { tool: string; does: string }[] }) {
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
      { threshold: 0.35 },
    );
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  // "Figma to live" splits at "to"; an Arabic title ("من Figma للايف") at its last word, which takes the gradient
  const arabic = /[\u0600-\u06FF]/.test(title);
  const cut = title.lastIndexOf(" ");
  const [first, ...rest] = arabic && cut > 0 ? [title.slice(0, cut), title.slice(cut + 1)] : title.split(" to ");
  return (
    <section className="@container px-4 py-16 md:px-10 md:py-24">
      <h2 className="mb-12 fit-heading font-display leading-[0.9] font-bold uppercase [--fit-max:3rem] md:[--fit-max:4.5rem] md:mb-16" style={fitLetters(title)}>
        {first}
        {rest.length ? (
          <>
            <br />
            <span className="bg-gradient-to-r from-[var(--accent)] rtl:bg-gradient-to-l to-[var(--accent-2)] bg-clip-text text-transparent">
              {arabic ? rest.join(" ") : `to ${rest.join(" to ")}`}
            </span>
          </>
        ) : null}
      </h2>

      <ol ref={listRef} className="pipeline relative grid gap-4 md:grid-cols-4 md:gap-5">
        {/* The current that runs from card to card */}
        <span aria-hidden className="pipeline-line absolute top-0 bottom-0 left-[3.25rem] w-[2px] md:top-[4.25rem] md:right-8 md:bottom-auto md:left-8 md:h-[2px] md:w-auto" />
        {steps.map((step, i) => (
          <li
            key={step.tool}
            className="pipeline-step group relative flex items-center gap-5 rounded-[28px] bg-surface/70 p-5 backdrop-blur-xl transition-[transform] duration-500 hover:-translate-y-1 md:flex-col md:items-start md:gap-10 md:p-7"
            style={{ "--i": i } as React.CSSProperties}
          >
            <ToolLogo name={step.tool} className="size-16 shrink-0 shadow-[0_10px_30px_-10px_rgb(0_0_0/0.8)] md:size-[4.5rem]" />
            <span className="min-w-0">
              <span className="block font-display text-xs font-semibold text-[var(--accent-2)]">0{i + 1}</span>
              <span className="mt-1 block font-display text-3xl font-bold md:text-[length:calc((2.4rem)*var(--ds))]">{step.tool}</span>
              <span className="mt-2 block text-base text-muted md:text-lg">{step.does}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
