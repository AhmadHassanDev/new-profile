"use client";

import { useEffect, useRef, type RefObject } from "react";
import { whenLoaderDone } from "@/lib/loader";
import type { TextLine, TextStyle } from "./LiquidText";

type Liquid = import("./LiquidText").LiquidText;

// Matches the headline's rise-in animation (which starts as the loader lifts), so the swap to
// WebGL happens once the letters have landed.
const INTRO_MS = 1300;

/** Measures each `[data-line]` in the heading so the WebGL copy sits exactly on top of it. */
function measure(heading: HTMLElement, canvas: HTMLCanvasElement) {
  const origin = canvas.getBoundingClientRect();
  const lines = [...heading.querySelectorAll<HTMLElement>("[data-line]")];
  const css = getComputedStyle(lines[0]);
  const fontSize = parseFloat(css.fontSize);
  const style: TextStyle = {
    font: `${css.fontWeight} ${fontSize}px ${css.fontFamily}`,
    letterSpacing: parseFloat(css.letterSpacing) || 0,
  };

  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = style.font;
  const { fontBoundingBoxAscent: ascent, fontBoundingBoxDescent: descent } = probe.measureText("H");
  const lineHeight = parseFloat(css.lineHeight);

  // Where CSS puts the baseline inside each line box, ignoring the rise-in transform.
  const result: TextLine[] = lines.map((line) => {
    const box = line.getBoundingClientRect();
    return {
      text: (line.textContent ?? "").toUpperCase(),
      x: box.left - origin.left,
      baseline: box.top - origin.top + (lineHeight - (ascent + descent)) / 2 + ascent,
    };
  });
  return { lines: result, style };
}

export type Lit = [boolean, boolean, boolean];

export default function LiquidName({ heading, lit }: { heading: RefObject<HTMLHeadingElement | null>; lit: Lit }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liquidRef = useRef<Liquid | null>(null);
  const litRef = useRef(lit);

  useEffect(() => {
    litRef.current = lit;
    liquidRef.current?.setActive(lit);
  }, [lit]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const title = heading.current;
    if (!canvas || !title || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let disposed = false;
    let cleanup = () => {};

    Promise.all([
      import("./LiquidText"),
      document.fonts.ready,
      whenLoaderDone().then(() => new Promise((r) => setTimeout(r, INTRO_MS))),
    ]).then(
      ([{ LiquidText }]) => {
        if (disposed) return;
        let liquid: Liquid;
        try {
          liquid = new LiquidText(canvas);
        } catch {
          return; // No WebGL: the HTML name stays as it is.
        }

        const layout = () => {
          const { lines, style } = measure(title, canvas);
          liquid.setText(lines, style, canvas.clientWidth, canvas.clientHeight);
        };
        const onPointer = (e: PointerEvent) => {
          const box = canvas.getBoundingClientRect();
          liquid.setPointer(e.clientX - box.left, e.clientY - box.top);
        };

        layout();
        liquidRef.current = liquid;
        liquid.setActive(litRef.current);
        // Re-measure whenever either box changes, and once more after the page settles,
        // so the liquid copy never drifts off the real heading.
        const resizeObserver = new ResizeObserver(layout);
        resizeObserver.observe(canvas);
        resizeObserver.observe(title);
        const settle = window.setTimeout(layout, 600);
        const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? liquid.start() : liquid.stop()));
        visibility.observe(canvas);
        window.addEventListener("pointermove", onPointer);

        // Swap in one frame so the two copies never show at once.
        canvas.dataset.ready = "true";
        title.dataset.liquid = "true";

        cleanup = () => {
          window.clearTimeout(settle);
          resizeObserver.disconnect();
          visibility.disconnect();
          window.removeEventListener("pointermove", onPointer);
          delete title.dataset.liquid;
          liquidRef.current = null;
          liquid.dispose();
        };
      },
    );

    return () => {
      disposed = true;
      cleanup();
    };
  }, [heading]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-0 data-[ready=true]:opacity-100" />;
}
