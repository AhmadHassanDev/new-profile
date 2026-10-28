"use client";

import { useEffect, useRef, useState } from "react";

// A trailing dot that grows into a labelled disc over anything with data-cursor.
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    ref.current?.classList.remove("hidden");
    document.documentElement.classList.add("has-cursor");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    let frame = 0;

    const tick = () => {
      pos.x += (target.x - pos.x) * 0.18;
      pos.y += (target.y - pos.y) * 0.18;
      if (ref.current) ref.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      frame = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      const el = (e.target as Element).closest<HTMLElement>("[data-cursor]");
      setLabel(el?.dataset.cursor ?? null);
    };

    frame = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed top-0 left-0 z-[70] hidden">
      <div
        className={`grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-display text-xs font-bold uppercase transition-all duration-300 ease-out ${
          label ? "h-24 w-24 bg-ink text-bg" : "h-3 w-3 bg-white mix-blend-difference"
        }`}
      >
        {label && <span>{label}</span>}
      </div>
    </div>
  );
}
