"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { CLIENTS, type Client } from "@/content/site";

// Two belts moving in opposite directions. Each repeats its logos so it can loop seamlessly: one set of a belt
// is 3,100px+ wide, so a second copy is enough to keep the loop full on any common screen.
const ROWS = [CLIENTS.filter((_, i) => i % 2 === 0), CLIENTS.filter((_, i) => i % 2 === 1)];
const REPEAT = 2;
const BASE_SPEED = 28; // px per second
const REVEAL_RADIUS = 80; // px: how much of a logo the cursor shows in colour

function LogoImage({ client, className }: { client: Client; className: string }) {
  // Drawn at its final size from the start, so the belts never reflow as logos arrive
  const height = client.size ?? 44;
  const width = Math.round((height * client.logo.width) / client.logo.height);
  return (
    <Image
      src={client.logo.src}
      alt=""
      width={width}
      height={height}
      unoptimized
      loading="lazy"
      decoding="async"
      draggable={false}
      style={{ width, height }}
      className={`pointer-events-none max-w-none select-none ${className}`}
    />
  );
}

function Logo({ client, copy, far }: { client: Client; copy: boolean; far: boolean }) {
  return (
    <li
      aria-hidden={copy || undefined}
      className={`flex shrink-0 items-center ${copy ? "motion-reduce:hidden" : ""}`}
    >
      <span
        data-belt={far ? 1 : 0}
        className={`logo-item relative grid h-28 place-items-center px-10 md:h-36 md:px-16 ${far ? "scale-[0.82] opacity-70" : ""}`}
      >
        <span className="sr-only">{client.name}</span>
        {/* White by default; the original colours show through wherever the cursor shines */}
        <LogoImage client={client} className={client.tone === "gray" ? "opacity-80 grayscale" : "opacity-70 brightness-0 invert"} />
        <span className="logo-reveal absolute inset-0 grid place-items-center">
          <LogoImage client={client} className="" />
        </span>
      </span>
    </li>
  );
}

type Item = { el: HTMLElement; belt: number; cx: number; cy: number; w: number; h: number; scale: number; lit: boolean };

export default function Clients() {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const beltRefs = useRef<(HTMLUListElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const glow = glowRef.current;
    const track = trackRef.current;
    if (!section || !glow || !track) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Offsets live in [-span, 0): one full set of logos, so wrapping is invisible.
    const offsets = ROWS.map(() => (reduced ? 0 : Number.NaN));
    const spans = ROWS.map(() => 0);
    let items: Item[] = [];

    // Where every logo sits inside the belts, read from layout (untouched by the belts' transforms) once and
    // again on resize, so the light never has to measure anything while it runs.
    const measure = () => {
      beltRefs.current.forEach((belt, i) => {
        if (belt) spans[i] = belt.scrollWidth / REPEAT;
      });
      items = [...section.querySelectorAll<HTMLElement>(".logo-item")].flatMap((el) => {
        const belt = Number(el.dataset.belt);
        const ul = beltRefs.current[belt];
        if (!ul || !el.offsetWidth) return []; // hidden copies (reduced motion) take no part
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        return [{ el, belt, cx: ul.offsetLeft + el.offsetLeft + w / 2, cy: ul.offsetTop + el.offsetTop + h / 2, w, h, scale: belt === 1 ? 0.82 : 1, lit: true }];
      });
    };
    // Where the cursor is, and where the light has caught up to (it trails slightly).
    const pointer = { x: -9999, y: -9999, inside: false };
    const lamp = { x: -9999, y: -9999, radius: 0 };
    let lastScroll = window.scrollY;
    let velocity = 0;
    let last = performance.now();
    let frame = 0;
    let visible = false;

    // The glow lives in a fixed layer so the section's edges never clip it; it fades rather than snaps.
    const light = (dt: number) => {
      const ease = dt ? 1 - Math.exp(-dt * 14) : 1;
      lamp.x += (pointer.x - lamp.x) * ease;
      lamp.y += (pointer.y - lamp.y) * ease;
      lamp.radius += ((pointer.inside ? REVEAL_RADIUS : 0) - lamp.radius) * (dt ? 1 - Math.exp(-dt * 8) : 1);
      glow.style.transform = `translate3d(${lamp.x}px, ${lamp.y}px, 0) translate(-50%, -50%)`;
      glow.style.opacity = pointer.inside ? "1" : "0";
      section.style.setProperty("--r", `${lamp.radius}px`);
      // One read per frame: where the belts' (untransformed) box is on screen
      const origin = track.getBoundingClientRect();
      for (const item of items) {
        // The back row is scaled down about each logo's centre; map the light into the item's own, unscaled space.
        const x = (lamp.x - (origin.left + offsets[item.belt] + item.cx)) / item.scale;
        const y = (lamp.y - (origin.top + item.cy)) / item.scale;
        // Only logos the light can reach get new values; the rest are parked off once and left alone
        const near = Math.abs(x) < item.w / 2 + lamp.radius && Math.abs(y) < item.h / 2 + lamp.radius;
        if (!near && !item.lit) continue;
        item.lit = near;
        item.el.style.setProperty("--x", near ? `${x + item.w / 2}px` : "-999px");
        item.el.style.setProperty("--y", near ? `${y + item.h / 2}px` : "-999px");
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Scrolling pushes the belts faster and leans them; scrolling back up turns them around.
      const scroll = window.scrollY;
      const raw = dt > 0 ? (scroll - lastScroll) / dt : 0;
      lastScroll = scroll;
      velocity += (raw - velocity) * Math.min(1, dt * 6);
      const direction = velocity < -20 ? -1 : 1;
      const speed = BASE_SPEED + Math.min(Math.abs(velocity) * 0.35, 900);
      const lean = Math.max(-7, Math.min(7, velocity * -0.006));

      beltRefs.current.forEach((belt, i) => {
        const span = spans[i];
        if (!belt || !span) return;
        if (Number.isNaN(offsets[i])) offsets[i] = i === 0 ? 0 : -span;
        offsets[i] += (i === 0 ? -1 : 1) * direction * speed * dt;
        offsets[i] = (((offsets[i] % span) + span) % span) - span;
        belt.style.transform = `translate3d(${offsets[i]}px, 0, 0) skewX(${lean}deg)`;
      });

      light(dt);
      if (visible) frame = requestAnimationFrame(tick);
    };

    const onPointer = (e: PointerEvent) => {
      // Arriving from outside: start the light where the cursor is, not where it left.
      if (!pointer.inside) Object.assign(lamp, { x: e.clientX, y: e.clientY });
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.inside = true;
      if (reduced) light(0);
    };
    const onLeave = () => {
      pointer.inside = false;
      if (reduced) light(0);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (!visible) {
        pointer.inside = false;
        glow.style.opacity = "0";
      }
      if (visible && !reduced) {
        last = performance.now();
        lastScroll = window.scrollY;
        frame = requestAnimationFrame(tick);
      }
    });
    observer.observe(section);
    // Logos load lazily, but a moving belt brings in copies from off to the side, which lazy loading would only
    // fetch as they slide into view. Once the section is close, fetch every logo it shows.
    const preload = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.querySelectorAll("img").forEach((img) => (img.loading = "eager"));
        preload.disconnect();
      },
      { rootMargin: "600px 0px" },
    );
    preload.observe(section);
    const resize = new ResizeObserver(measure);
    resize.observe(track);
    section.addEventListener("pointermove", onPointer);
    section.addEventListener("pointerleave", onLeave);
    measure();
    light(0);

    return () => {
      observer.disconnect();
      preload.disconnect();
      resize.disconnect();
      cancelAnimationFrame(frame);
      section.removeEventListener("pointermove", onPointer);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="clients-title" className="relative overflow-hidden py-20 md:py-28">
      {/* Soft light that follows the cursor behind the logos */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 size-56 rounded-full opacity-0 transition-opacity duration-500 md:size-64"
        style={{ background: "radial-gradient(circle, rgb(196 113 237 / 0.2), rgb(9 199 251 / 0.08) 45%, transparent 70%)" }}
      />
      <div className="mb-10 flex flex-col gap-4 px-4 md:mb-14 md:flex-row md:items-end md:justify-between md:px-10">
        <h2 id="clients-title" className="font-display text-4xl leading-[0.9] font-bold uppercase md:text-6xl">
          Trusted by
          <br />
          <span className="text-spectrum animate-shimmer">teams that ship</span>
        </h2>
        <p className="flex flex-col gap-1 text-sm font-medium text-muted md:items-end">
          <span className="font-display text-5xl leading-none font-bold text-ink">
            {CLIENTS.length}
            <span className="text-spectrum ml-[0.12em]">+</span>
          </span>
          Brands
        </p>
      </div>

      <div ref={trackRef} className="relative z-[1] flex flex-col gap-2 py-6 md:gap-4 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        {ROWS.map((row, i) => (
          <ul
            key={i}
            ref={(el) => {
              beltRefs.current[i] = el;
            }}
            className="relative flex w-max will-change-transform motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center"
          >
            {Array.from({ length: REPEAT }, (_, copy) =>
              row.map((client) => <Logo key={`${copy}-${client.name}`} client={client} copy={copy > 0} far={i === 1} />),
            )}
          </ul>
        ))}
      </div>
    </section>
  );
}
