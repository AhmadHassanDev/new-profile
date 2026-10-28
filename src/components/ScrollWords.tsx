"use client";

import { useEffect, useRef } from "react";

export type Segment = { text: string; color?: string };

/**
 * Copy that reads itself in as you scroll: every word starts dim and lights up in turn.
 * JS only feeds scroll progress (--p); each word works out its own brightness in CSS.
 */
export default function ScrollWords({ segments, className = "" }: { segments: Segment[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = segments.flatMap((segment) => segment.text.split(" ").map((word) => ({ word, color: segment.color })));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--p", "1");
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      // Starts as the copy enters the lower part of the screen, done by the time it's well above the middle.
      const box = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = (vh * 0.85 - box.top) / (box.height + vh * 0.35);
      el.style.setProperty("--p", String(Math.min(1, Math.max(0, progress))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <p ref={ref} className={className} style={{ "--n": words.length } as React.CSSProperties}>
      {words.map(({ word, color }, i) => (
        <span key={i} className="scroll-word" style={{ "--i": i, color } as React.CSSProperties}>
          {word}{" "}
        </span>
      ))}
    </p>
  );
}
