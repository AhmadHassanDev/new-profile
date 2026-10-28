"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PROJECTS, SERVICES, typeOf } from "@/content/site";
import { FRAME, previewOf } from "./work/ProjectCard";

// Each service with the projects that show it, and a link to the work page filtered to them
const ROWS = SERVICES.map((service) => {
  const projects = PROJECTS.filter((p) =>
    service.type ? typeOf(p.kind) === service.type : service.tag ? p.disciplines.includes(service.tag) : false,
  );
  const query = service.type ? `type=${encodeURIComponent(service.type)}` : `tag=${encodeURIComponent(service.tag ?? "")}`;
  return { ...service, projects, href: service.contact ? "#contact" : `/work?${query}#projects` };
}).filter((row) => row.contact || row.projects.length);

// Up to three covers fan out behind each other in the floating preview
const FAN = [
  { rotate: 0, x: 0, y: 0 },
  { rotate: -7, x: -26, y: 14 },
  { rotate: 6, x: 24, y: 22 },
];

/**
 * What Ahmed does, as a list of giant rows. Hovering one wipes its title into the spectrum and
 * floats that service's project covers beside the cursor, leaning into the way it moves. Each
 * row opens the work page filtered to it (or contact, for a service with nothing published yet).
 */
/** Stand-in for branding work: Ahmed's own mark on frosted glass. */
function BrandCard() {
  return (
    <span className="absolute inset-0 grid place-items-center bg-surface-2/80 backdrop-blur-xl">
      <span
        aria-hidden
        className="absolute inset-0 opacity-50"
        style={{ background: "radial-gradient(60% 70% at 20% 100%, rgb(196 113 237 / 0.45), transparent 70%), radial-gradient(50% 60% at 90% 0%, rgb(9 199 251 / 0.35), transparent 70%)" }}
      />
      <Image src="/logo.svg" alt="" width={58} height={45} className="relative w-32" />
    </span>
  );
}

export default function Services() {
  const [active, setActive] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview || !window.matchMedia("(pointer: fine)").matches) return;
    const pos = { x: target.current.x, y: target.current.y };
    let frame = 0;
    const tick = () => {
      const dx = target.current.x - pos.x;
      pos.x += dx * 0.14;
      pos.y += (target.current.y - pos.y) * 0.14;
      const lean = Math.max(-12, Math.min(12, dx * 0.08));
      preview.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) rotate(${lean}deg)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    // Sits just right of the cursor, so the title being pointed at stays readable
    const onMove = (e: PointerEvent) => (target.current = { x: e.clientX + 210, y: e.clientY - 20 });
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section aria-labelledby="services-title" className="relative px-4 py-32 md:px-10 md:py-48">
      <div className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
        <h2 id="services-title" className="font-display text-5xl leading-[0.9] font-bold tracking-[-0.04em] uppercase md:text-7xl">
          What I
          <br />
          <span className="text-spectrum animate-shimmer">do</span>
        </h2>
        <p className="max-w-xs text-lg text-muted md:text-right">Pick one to see the work behind it.</p>
      </div>

      <ul onPointerLeave={() => setActive(null)} className="border-b border-line">
        {ROWS.map((row, i) => (
          <li key={row.title} className="border-t border-line">
            <Link
              href={row.href}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="service-row group flex items-center gap-4 py-6 md:gap-8 md:py-9"
            >
              <span className="w-8 shrink-0 font-display text-sm font-semibold text-muted md:w-12">0{i + 1}</span>
              <span
                data-text={row.title}
                className="service-title relative min-w-0 flex-1 font-display text-[8.4vw] leading-[0.95] font-bold tracking-[-0.05em] uppercase md:text-[5.4vw]"
              >
                {row.title}
              </span>
              <span className="hidden shrink-0 text-sm font-medium whitespace-nowrap text-muted md:block">
                {row.contact ?? `${row.projects.length} ${row.projects.length === 1 ? "project" : "projects"}`}
              </span>
              <span
                aria-hidden
                className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-lg transition-all duration-500 group-hover:rotate-45 group-hover:border-transparent group-hover:bg-ink group-hover:text-bg md:size-14"
              >
                ↗
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* The floating preview: every service's covers are here from the start, so swapping is instant */}
      <div
        ref={previewRef}
        aria-hidden
        data-active={active !== null}
        className="service-preview pointer-events-none fixed top-0 left-0 z-40 hidden w-[300px] md:block lg:w-[360px]"
      >
        {ROWS.map((row, i) =>
          row.contact ? (
            <div
              key={row.title}
              data-show={active === i}
              className="service-cover absolute inset-0 overflow-hidden rounded-[18px] shadow-[0_30px_60px_-15px_rgb(0_0_0/0.8)] ring-1 ring-white/10"
              style={{ ...FRAME, "--fan": "none" } as React.CSSProperties}
            >
              <BrandCard />
            </div>
          ) : row.projects.slice(0, FAN.length).map((project, k) => {
            const fan = FAN[k];
            return project.cover ? (
              <div
                key={`${row.title}-${project.slug}`}
                data-show={active === i}
                className="service-cover absolute inset-0 overflow-hidden rounded-[18px] shadow-[0_30px_60px_-15px_rgb(0_0_0/0.8)] ring-1 ring-white/10"
                style={
                  {
                    ...FRAME,
                    zIndex: FAN.length - k,
                    "--fan": `translate(${fan.x}px, ${fan.y}px) rotate(${fan.rotate}deg)`,
                    transitionDelay: `${k * 50}ms`,
                  } as React.CSSProperties
                }
              >
                <Image
                  src={project.cover}
                  alt=""
                  fill
                  sizes="360px"
                  placeholder={previewOf(project.cover) ? "blur" : "empty"}
                  blurDataURL={previewOf(project.cover)}
                  className="object-cover"
                />
              </div>
            ) : null;
          }),
        )}
        {/* Sizes the box; the covers stack inside it */}
        <div style={FRAME} />
      </div>
    </section>
  );
}
