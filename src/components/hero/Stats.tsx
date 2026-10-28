"use client";

import { useLayoutEffect, useRef } from "react";
import { STATS } from "@/content/site";
import { whenLoaderDone } from "@/lib/loader";

// Starts once the loader lifts and the headline has risen into place.
const DELAY_MS = 900;
const DURATION_MS = 1600;

/** The real numbers are in the HTML; on screen they count up from zero once. */
export default function Stats({ className = "" }: { className?: string }) {
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nodes = numberRefs.current;
    nodes.forEach((node) => node && (node.textContent = "0"));

    let frame = 0;
    let start = Infinity;
    let cancelled = false;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / DURATION_MS));
      const eased = 1 - Math.pow(1 - t, 4);
      STATS.forEach((stat, i) => {
        const node = nodes[i];
        if (node) node.textContent = String(Math.round(stat.value * eased));
      });
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    whenLoaderDone().then(() => {
      if (cancelled) return;
      start = performance.now() + DELAY_MS;
      frame = requestAnimationFrame(tick);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      STATS.forEach((stat, i) => {
        const node = nodes[i];
        if (node) node.textContent = String(stat.value);
      });
    };
  }, []);

  return (
    <dl className={`flex ${className}`}>
      {STATS.map((stat, i) => (
        <div key={stat.label} className={`flex flex-col-reverse gap-1 ${i > 0 ? "border-l border-line pl-5 md:pl-8" : ""} pr-5 md:pr-8 last:pr-0`}>
          <dt className="text-xs font-medium whitespace-nowrap text-muted md:text-sm">{stat.label}</dt>
          <dd className="font-display text-3xl leading-none font-bold tracking-[-0.04em] md:text-5xl">
            <span ref={(el) => {
              numberRefs.current[i] = el;
            }}>
              {stat.value}
            </span>
            <span className="text-spectrum ml-[0.12em]">{stat.suffix}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
