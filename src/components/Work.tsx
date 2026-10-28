"use client";

import { useEffect, useRef } from "react";
import { PROJECTS } from "@/content/site";
import { MoreCard, ProjectCard } from "./work/ProjectCard";

// A fixed pool of cards, wrapped around the screen as the grid moves, so it never ends.
// Tile (i, j) shows TILES[(i + 2j) % n], so side-by-side and stacked cards always differ.
// The pool is sized so the cards that meet across each wrap differ too, whatever n is.
const TILES = [...PROJECTS, null]; // null: the "more on the way" card
const STEP = 2;
const fits = (count: number, step: number) => ((count - 1) * step) % TILES.length !== 0;
const COLS = [8, 10, 12].find((c) => fits(c, 1)) ?? 8; // even, so the half-card column offset lines up
const ROWS = [7, 8, 9, 10].find((r) => fits(r, STEP)) ?? 7;
const DRIFT = { x: -14, y: -9 }; // px per second when left alone
const mod = (n: number, m: number) => ((n % m) + m) % m;

/**
 * Selected work as an endless wall of cards filling the screen. It drifts on its own; drag to
 * fling it around (it eases back out of a slight zoom when you let go). Scrolling the page past
 * it nudges it along too. On touch screens, sideways swipes move the grid and vertical ones
 * still scroll the page.
 */
export default function Work({
  as: Heading = "h2",
  title = ["Selected", "work"],
  action,
}: {
  /** The work page uses the grid as its opening, so there it is the page's h1 */
  as?: "h1" | "h2";
  title?: [string, string];
  /** A call to action under the title, e.g. to the full list */
  action?: React.ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const plane = planeRef.current;
    if (!section || !plane) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tiles = tileRefs.current;

    const offset = { x: 0, y: 0 };
    const velocity = { x: 0, y: 0 };
    const cell = { w: 1, h: 1 };
    const drag = { active: false, id: -1, x: 0, y: 0, moved: 0, lastT: 0 };
    let zoom = 1;
    let lastScroll = window.scrollY;
    let last = performance.now();
    let frame = 0;
    let visible = false;

    const measure = () => {
      const first = tiles[0];
      if (!first) return;
      const gap = parseFloat(getComputedStyle(plane).getPropertyValue("--gap")) || 0;
      cell.w = first.offsetWidth + gap;
      cell.h = first.offsetHeight + gap;
      // Start with a card's centre roughly in the middle of the screen
      offset.x = section.clientWidth / 2 - cell.w * 1.5;
      offset.y = section.clientHeight / 2 - cell.h * 1.5;
      place();
    };

    const place = () => {
      const width = COLS * cell.w;
      const height = ROWS * cell.h;
      tiles.forEach((tile, k) => {
        if (!tile) return;
        const i = k % COLS;
        const j = Math.floor(k / COLS);
        // Every other column sits half a card lower
        const x = mod(i * cell.w + offset.x, width) - cell.w;
        const y = mod(j * cell.h + offset.y + (i % 2) * cell.h * 0.5, height) - cell.h;
        tile.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      plane.style.transform = `scale(${zoom})`;
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const scroll = window.scrollY;
      if (!drag.active) {
        // Let go: the fling decays back into the idle drift
        const ease = 1 - Math.exp(-dt * 2.2);
        velocity.x += ((reduced ? 0 : DRIFT.x) - velocity.x) * ease;
        velocity.y += ((reduced ? 0 : DRIFT.y) - velocity.y) * ease;
        offset.x += velocity.x * dt;
        offset.y += velocity.y * dt - (scroll - lastScroll) * 0.35;
      }
      lastScroll = scroll;
      zoom += ((drag.active && drag.moved > 6 ? 0.93 : 1) - zoom) * (1 - Math.exp(-dt * 8));
      place();
      if (visible) frame = requestAnimationFrame(tick);
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      Object.assign(drag, { active: true, id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0, lastT: performance.now() });
      velocity.x = 0;
      velocity.y = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.active || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      const dy = e.pointerType === "touch" ? 0 : e.clientY - drag.y; // touch: vertical stays page scroll
      const now = performance.now();
      const dt = Math.max((now - drag.lastT) / 1000, 1 / 240);
      drag.moved += Math.abs(dx) + Math.abs(dy);
      if (drag.moved > 6 && !section.hasPointerCapture(e.pointerId)) section.setPointerCapture(e.pointerId);
      offset.x += dx;
      offset.y += dy;
      velocity.x = velocity.x * 0.6 + (dx / dt) * 0.4;
      velocity.y = velocity.y * 0.6 + (dy / dt) * 0.4;
      Object.assign(drag, { x: e.clientX, y: e.clientY, lastT: now });
      if (reduced) place();
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== drag.id) return;
      drag.active = false;
      if (reduced) place();
    };
    // A drag shouldn't also count as a click on whatever card it started on
    const onClick = (e: MouseEvent) => {
      if (drag.moved > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) {
        last = performance.now();
        lastScroll = window.scrollY;
        frame = requestAnimationFrame(tick);
      }
    });
    const resize = new ResizeObserver(measure);

    measure();
    observer.observe(section);
    resize.observe(section);
    section.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    section.addEventListener("click", onClick, true);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      section.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      section.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <section
      id="work"
      ref={sectionRef}
      aria-labelledby="work-title"
      className="relative h-[100svh] cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing"
    >
      {/* The real list, for screen readers; the wall below is decoration made of copies */}
      <ul className="sr-only">
        {PROJECTS.map((p) => (
          <li key={p.slug}>
            {p.name}: {p.kind}, {p.year}. {p.summary}
          </li>
        ))}
      </ul>

      <div
        ref={planeRef}
        aria-hidden
        className="absolute inset-0 origin-center will-change-transform [--card-w:78vw] [--gap:20px] md:[--card-w:clamp(320px,28vw,520px)] md:[--gap:32px]"
      >
        {Array.from({ length: COLS * ROWS }, (_, k) => {
          const i = k % COLS;
          const j = Math.floor(k / COLS);
          const tile = TILES[(i + j * STEP) % TILES.length];
          return (
            <div
              key={k}
              ref={(el) => {
                tileRefs.current[k] = el;
              }}
              className="absolute top-0 left-0 w-[var(--card-w)] will-change-transform"
            >
              {tile ? <ProjectCard project={tile} /> : <MoreCard />}
            </div>
          );
        })}
      </div>

      {/* Top and bottom edges fade into the page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in srgb, var(--bg) 70%, transparent), transparent 22%, transparent 78%, var(--bg))",
        }}
      />
      <header className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-start gap-3 px-4 pt-24 md:flex-row md:items-start md:justify-between md:px-10 md:pt-28">
        <div className="flex flex-col items-start gap-3">
          {/* A pane of frosted glass so the title stays readable over whatever slides beneath */}
          <Heading
            id="work-title"
            className="rounded-[28px] border border-line bg-bg/55 px-5 py-4 font-display text-5xl leading-[0.9] font-bold tracking-[-0.04em] uppercase backdrop-blur-xl md:px-7 md:py-6 md:text-7xl"
          >
            {title[0]}
            <br />
            <span className="text-spectrum animate-shimmer">{title[1]}</span>
          </Heading>
          {action}
        </div>
        <p className="flex items-center gap-2 rounded-full border border-line bg-bg/60 px-4 py-2 text-xs font-semibold text-muted backdrop-blur-md md:text-sm">
          <span aria-hidden className="text-ink">
            ✥
          </span>
          <span className="md:hidden">Swipe to explore</span>
          <span className="hidden md:inline">Drag to explore</span>
        </p>
      </header>
    </section>
  );
}
