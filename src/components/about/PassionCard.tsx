"use client";

import { useEffect, useRef, useState } from "react";
import type { PassionObject, PassionScene } from "./PassionScene";

/**
 * An Off the clock card. On hover it floods with its colour and its 3D object springs up out of the
 * top corner (see PassionScene), leaning towards the cursor. Phones have no hover, so there it happens
 * as the card reaches the middle of the screen.
 */
export default function PassionCard({
  index,
  title,
  body,
  color,
  object,
}: {
  index: number;
  title: string;
  body: string;
  color: string;
  object: PassionObject;
}) {
  const cardRef = useRef<HTMLLIElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const sceneRef = useRef<PassionScene | null>(null);
  const activeRef = useRef(false);

  // Build the scene once the card is close, so the first hover is instant
  useEffect(() => {
    const card = cardRef.current;
    const canvas = canvasRef.current;
    if (!card || !canvas) return;
    let disposed = false;
    let resize: ResizeObserver | undefined;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        import("./PassionScene").then(({ PassionScene }) => {
          if (disposed) return;
          try {
            sceneRef.current = new PassionScene(canvas, object, window.matchMedia("(prefers-reduced-motion: reduce)").matches);
          } catch {
            return; // No WebGL: the card works without its object
          }
          sceneRef.current.show(activeRef.current);
          resize = new ResizeObserver(() => sceneRef.current?.resize());
          resize.observe(canvas);
        });
      },
      { rootMargin: "400px 0px" },
    );
    near.observe(card);
    return () => {
      disposed = true;
      near.disconnect();
      resize?.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [object]);

  const toggle = (on: boolean) => {
    activeRef.current = on;
    setActive(on);
    sceneRef.current?.show(on);
  };

  // Phones: the card comes alive as soon as it's well on screen (its top past the bottom fifth), and
  // rests again once it's mostly scrolled away (its bottom past the top fifth)
  useEffect(() => {
    const card = cardRef.current;
    if (!card || !window.matchMedia("(hover: none)").matches) return;
    const middle = new IntersectionObserver(([entry]) => toggle(entry.isIntersecting), { rootMargin: "-20% 0px -20% 0px" });
    middle.observe(card);
    return () => middle.disconnect();
  }, []);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    sceneRef.current?.setPointer(((e.clientX - rect.left) / rect.width) * 2 - 1, -(((e.clientY - rect.top) / rect.height) * 2 - 1));
  };

  return (
    <li
      ref={cardRef}
      data-active={active || undefined}
      onPointerEnter={(e) => e.pointerType === "mouse" && toggle(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && toggle(false)}
      onPointerMove={onMove}
      className="group relative flex min-h-[260px] flex-col p-6 transition-colors duration-500 data-[active]:text-bg md:min-h-[320px] md:p-8"
      style={{ "--c": color } as React.CSSProperties}
    >
      <span aria-hidden className="absolute inset-0 overflow-hidden rounded-[32px] bg-surface">
        {/* Floods the card with its colour from the corner */}
        <span className="passion-flood absolute inset-0 bg-[var(--c)]" />
      </span>
      {/* Its object, which rises out over the top of the card */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute -top-[26%] -right-[6%] z-10 aspect-square w-[64%] max-w-[300px] drop-shadow-[0_28px_28px_rgb(0_0_0/0.35)] md:-top-[30%]"
      />
      <div className="relative flex items-center justify-between">
        <span className="font-display text-sm font-semibold text-[var(--c)] transition-colors duration-500 group-data-[active]:text-bg">
          0{index + 1}
        </span>
        <span aria-hidden className="size-3 rounded-full bg-[var(--c)] transition-[transform,background-color] duration-500 group-data-[active]:scale-0" />
      </div>
      <h3 className="relative mt-auto font-display text-[13vw] leading-[0.9] font-bold tracking-[-0.05em] uppercase md:text-[clamp(2.5rem,4.2vw,4.5rem)]">
        {title}
      </h3>
      <p className="relative mt-4 max-w-md text-lg leading-snug text-muted transition-colors duration-500 group-data-[active]:text-bg">{body}</p>
    </li>
  );
}
