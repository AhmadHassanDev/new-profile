"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { DISCIPLINE_COLOR, PROCESS } from "@/content/site";

type Scene = import("./process/ProcessScene").ProcessScene;

const INTRO = "I'm Ahmed. An Egyptian designer who codes, and a developer who designs. Keep scrolling and watch me work.";
const INTRO_WORDS = INTRO.split(" ");

// When each block of copy is on screen, along the section's scroll (0..1). Matches the 3D stages.
const WINDOWS: [number, number][] = [
  [-1, 0.1],
  [0.13, 0.33],
  [0.37, 0.55],
  [0.59, 0.79],
  [0.85, 2],
];
const FADE = 0.035;
const STEP_COLORS = PROCESS.map((step) => DISCIPLINE_COLOR[step.name]);

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * Home: who Ahmed is, then his process acted out in 3D. The section is tall and its view stays
 * pinned while you scroll through it; scroll position drives both the scene and the copy.
 */
export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scene: Scene | null = null;
    let disposed = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      const box = section.getBoundingClientRect();
      const p = clamp01(-box.top / (box.height - window.innerHeight));
      scene?.setProgress(p);

      // The intro reads itself in as the section arrives, finishing just after it pins
      const arriving = clamp01(1 - box.top / window.innerHeight);
      introRef.current?.style.setProperty("--p", String(clamp01(arriving * 0.5 + (p / 0.08) * 0.5)));
      WINDOWS.forEach(([start, end], i) => {
        const el = blockRefs.current[i];
        if (!el) return;
        const enter = clamp01((p - start) / FADE);
        const leave = clamp01((p - end) / FADE);
        const shown = enter * (1 - leave);
        el.style.opacity = String(shown);
        el.style.transform = `translate3d(0, ${(1 - enter) * 48 - leave * 48}px, 0)`;
        el.style.filter = shown < 0.99 ? `blur(${(1 - shown) * 10}px)` : "";
        el.style.pointerEvents = shown > 0.5 ? "auto" : "none";
        el.setAttribute("aria-hidden", String(shown < 0.5));
      });
      // Which step we're on, and how far through the whole process
      stepRefs.current.forEach((step, i) => {
        const [start, end] = WINDOWS[i + 1];
        step?.toggleAttribute("data-active", p >= start - FADE && p < end + FADE);
        step?.toggleAttribute("data-done", p >= end + FADE);
      });
      if (barRef.current) barRef.current.style.transform = `scaleX(${clamp01((p - 0.1) / 0.72)})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onPointer = (e: PointerEvent) =>
      scene?.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("pointermove", onPointer);

    let resizeObserver: ResizeObserver | undefined;
    let visibility: IntersectionObserver | undefined;
    import("./process/ProcessScene").then(({ ProcessScene }) => {
      if (disposed) return;
      try {
        scene = new ProcessScene(canvas, reduced);
      } catch {
        return; // No WebGL: the copy still plays, over the glow.
      }
      const live = scene;
      const size = () => live.resize(canvas.clientWidth, canvas.clientHeight);
      resizeObserver = new ResizeObserver(size);
      resizeObserver.observe(canvas);
      visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? live.start() : live.stop()));
      visibility.observe(section);
      size();
      update();
      canvas.dataset.ready = "true";
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onPointer);
      resizeObserver?.disconnect();
      visibility?.disconnect();
      scene?.dispose();
    };
  }, []);

  return (
    <section id="about" ref={sectionRef} aria-label="About me" className="relative h-[640svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* The 3D gets its own zone: right of the copy on wide screens, above it on tall ones.
            Its edges fade into the page so the scene never meets the text. */}
        <div className="process-zone absolute portrait:inset-x-0 portrait:top-28 portrait:h-[44%] md:portrait:top-36 landscape:inset-y-0 landscape:right-0 landscape:left-[38%]">
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[100px]"
            style={{ background: "var(--spectrum)" }}
          />
          <canvas
            ref={canvasRef}
            aria-hidden
            className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000 data-[ready=true]:opacity-100"
          />
        </div>

        {/* Where we are in the process */}
        <div className="absolute inset-x-0 top-24 flex items-center justify-between gap-6 px-4 md:top-28 md:px-10">
          <p className="hidden text-sm font-semibold text-muted sm:block">About me</p>
          <div className="w-full sm:w-auto">
            <ol className="flex justify-between gap-6 text-xs font-semibold text-muted sm:justify-end sm:text-sm">
              {PROCESS.map((step, i) => (
                <li
                  key={step.verb}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  className="flex items-center gap-2 transition-colors duration-500 data-[active]:text-ink data-[done]:text-ink/60"
                  style={{ "--c": STEP_COLORS[i] } as React.CSSProperties}
                >
                  <span className="font-display text-[var(--c)]">0{i + 1}</span>
                  {step.verb}
                </li>
              ))}
            </ol>
            <span className="mt-3 block h-px w-full overflow-hidden bg-line">
              <span ref={barRef} className="block h-full w-full origin-left scale-x-0" style={{ background: "var(--spectrum)" }} />
            </span>
          </div>
        </div>

        {/* The copy: one block per stage, stacked in the same spot */}
        <div className="absolute inset-x-4 grid portrait:bottom-8 landscape:top-1/2 landscape:left-10 landscape:w-[min(34vw,560px)] landscape:-translate-y-1/2 md:inset-x-10 md:portrait:bottom-12">
          <div
            ref={(el) => {
              blockRefs.current[0] = el;
            }}
            className="[grid-area:1/1] portrait:self-end landscape:self-center will-change-transform"
          >
            <p
              ref={introRef}
              className="font-display text-[7.4vw] leading-[1.06] font-semibold tracking-[-0.035em] md:portrait:text-[5.6vw] landscape:text-[clamp(1.6rem,2.9vw,3.25rem)]"
              style={{ "--n": INTRO_WORDS.length } as React.CSSProperties}
            >
              {INTRO_WORDS.map((word, i) => (
                <span
                  key={i}
                  className="scroll-word"
                  style={{ "--i": i, color: word === "designer" ? "var(--violet)" : word === "developer" ? "var(--coral)" : undefined } as React.CSSProperties}
                >
                  {word}{" "}
                </span>
              ))}
            </p>
            <p className="mt-8 flex items-center gap-3 text-sm font-semibold text-muted">
              <span aria-hidden className="scroll-cue relative block h-10 w-px overflow-hidden bg-line" />
              Scroll
            </p>
          </div>

          {PROCESS.map((step, i) => {
            const color = STEP_COLORS[i];
            return (
              <div
                key={step.verb}
                ref={(el) => {
                  blockRefs.current[i + 1] = el;
                }}
                className="[grid-area:1/1] portrait:self-end landscape:self-center opacity-0 will-change-transform"
              >
                <p className="flex items-center gap-3 text-sm font-semibold text-muted">
                  <span className="font-display" style={{ color }}>
                    0{i + 1}
                  </span>
                  <span aria-hidden className="h-px w-10" style={{ background: color }} />
                  {step.name}
                </p>
                <h3 className="mt-3 font-display text-[12.5vw] leading-[0.86] font-bold tracking-[-0.05em] uppercase md:mt-4 md:portrait:text-[10.5vw] landscape:text-[clamp(2.5rem,4.6vw,6rem)]">
                  {step.verb}
                  <span style={{ color }}>.</span>
                </h3>
                <p className="mt-3 font-display text-lg leading-tight font-semibold tracking-[-0.02em] md:mt-4 md:text-2xl">{step.line}</p>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted md:mt-4 md:text-lg">{step.body}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5 md:mt-5 md:gap-2">
                  {step.kit.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border bg-bg/50 px-3 py-1.5 text-xs font-medium backdrop-blur-md md:px-4 md:py-2 md:text-sm"
                      style={{ borderColor: `color-mix(in srgb, ${color} 40%, transparent)` }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          <div
            ref={(el) => {
              blockRefs.current[4] = el;
            }}
            className="[grid-area:1/1] portrait:self-end landscape:self-center opacity-0 will-change-transform"
          >
            <h3 className="font-display text-[12.5vw] leading-[0.86] font-bold tracking-[-0.05em] uppercase md:portrait:text-[10.5vw] landscape:text-[clamp(2.5rem,4.6vw,6rem)]">
              <span className="text-spectrum animate-shimmer">Shipped.</span>
            </h3>
            <p className="mt-4 max-w-md font-display text-lg leading-tight font-semibold tracking-[-0.02em] md:mt-5 md:text-2xl">
              Six years. 60+ clients. 5+ regions. <span className="text-muted">One person, end to end.</span>
            </p>
            <Link
              href="/about"
              data-cursor="Hi"
              className="group mt-8 inline-flex items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-6 text-base font-semibold text-bg transition-transform duration-300 hover:scale-[1.04]"
            >
              More about me
              <span
                className="grid h-10 w-10 place-items-center rounded-full text-ink transition-transform duration-500 group-hover:rotate-[-45deg]"
                style={{ background: "var(--spectrum)" }}
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
