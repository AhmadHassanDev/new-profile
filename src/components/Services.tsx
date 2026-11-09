"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { siteFor } from "@/content";
import { typeOf } from "@/content/site";
import { localePath, LANGS, type Lang } from "@/i18n/lang";
import { useLang } from "@/i18n/LangProvider";
import { ui } from "@/i18n/ui";
import { FRAME, previewOf } from "./work/ProjectCard";

// Each service with the projects that show it, and a link to the work page filtered to them
const rowsFor = (lang: Lang) => {
  const { SERVICES, PROJECTS } = siteFor(lang);
  return SERVICES.map((service) => {
    const projects = PROJECTS.filter((p) =>
      service.type ? typeOf(p.kind) === service.type : service.tag ? p.disciplines.includes(service.tag) : false,
    );
    const query = service.type ? `type=${encodeURIComponent(service.type)}` : `tag=${encodeURIComponent(service.tag ?? "")}`;
    return { ...service, projects, href: localePath(lang, service.contact ? "/contact" : `/work?${query}#projects`) };
  }).filter((row) => row.contact || row.projects.length);
};
const ROWS_BY_LANG = Object.fromEntries(LANGS.map((l) => [l, rowsFor(l)])) as Record<Lang, ReturnType<typeof rowsFor>>;

// Up to three covers fan out behind each other in the floating preview
const FAN = [
  { rotate: 0, x: 0, y: 0 },
  { rotate: -7, x: -26, y: 14 },
  { rotate: 6, x: 24, y: 22 },
];

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

/**
 * What Ahmed does, as a list of giant rows. Hovering one wipes its title into the spectrum and
 * floats that service's project covers beside the cursor, leaning into the way it moves. Each
 * row opens the work page filtered to it (or contact, for a service with nothing published yet).
 */
export default function Services() {
  const lang = useLang();
  const t = ui(lang).services;
  const ROWS = ROWS_BY_LANG[lang];
  const [active, setActive] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const preview = previewRef.current;
    if (!section || !preview || !window.matchMedia("(pointer: fine)").matches) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let frame = 0;
    const place = (lean: number) =>
      (preview.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) rotate(${lean}deg)`);
    // Only runs while the preview is still catching up with the cursor; stops once it's at rest
    const tick = () => {
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        Object.assign(pos, target);
        place(0);
        frame = 0;
        return;
      }
      pos.x += dx * 0.14;
      pos.y += dy * 0.14;
      place(Math.max(-12, Math.min(12, dx * 0.08)));
      frame = requestAnimationFrame(tick);
    };
    // Sits just past the cursor on the side the titles don't run to (right in English, left in Arabic), so the
    // title being pointed at stays readable. Reduced motion: no trail, no lean.
    const side = getComputedStyle(section).direction === "rtl" ? -1 : 1;
    const onMove = (e: PointerEvent) => {
      Object.assign(target, { x: e.clientX + side * 210, y: e.clientY - 20 });
      if (reduced) {
        Object.assign(pos, target);
        place(0);
      } else if (!frame) frame = requestAnimationFrame(tick);
    };
    // Follow the pointer only while the section is on screen
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) return window.addEventListener("pointermove", onMove);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      frame = 0;
    });
    observer.observe(section);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="services-title" className="relative px-4 py-32 md:px-10 md:py-48">
      <div className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
        <h2 id="services-title" className="font-display text-5xl leading-[0.9] font-bold uppercase md:text-7xl">
          {t.top}
          <br />
          <span className="text-spectrum animate-shimmer">{t.bottom}</span>
        </h2>
        <p className="max-w-xs text-lg text-muted md:text-end">{t.pick}</p>
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
                className="service-title relative min-w-0 flex-1 font-display text-[length:calc((8.4vw)*var(--ds))] leading-[0.95] font-bold uppercase md:text-[length:calc((5.4vw)*var(--ds))]"
              >
                {row.title}
              </span>
              <span className="hidden shrink-0 text-sm font-medium whitespace-nowrap text-muted md:block">
                {row.contact ?? t.count(row.projects.length)}
              </span>
              <span
                aria-hidden
                className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-lg transition-all duration-500 group-hover:rotate-45 rtl:group-hover:-rotate-45 group-hover:border-transparent group-hover:bg-ink group-hover:text-bg md:size-14"
              >
                <span className="arrow">↗</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* The floating preview: every service's covers are here from the start, so swapping is instant */}
      <div
        ref={previewRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-40 hidden w-[300px] md:block lg:w-[360px]"
      >
        {ROWS.map((row, i) =>
          row.contact ? (
            <div
              key={row.title}
              data-show={active === i}
              className="service-cover absolute inset-0 overflow-hidden rounded-[18px] shadow-[0_30px_60px_-15px_rgb(0_0_0/0.8)]"
              style={{ ...FRAME, "--fan": "none" } as React.CSSProperties}
            >
              <BrandCard />
            </div>
          ) : row.projects.slice(0, FAN.length).map((project, k) => {
            const fan = FAN[k];
            const cover = project.cover;
            return (
              <div
                key={`${row.title}-${project.slug}`}
                data-show={active === i}
                className="service-cover absolute inset-0 overflow-hidden rounded-[18px] shadow-[0_30px_60px_-15px_rgb(0_0_0/0.8)]"
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
                  src={cover}
                  alt=""
                  fill
                  sizes="360px"
                  placeholder={previewOf(cover) ? "blur" : "empty"}
                  blurDataURL={previewOf(cover)}
                  className="object-cover"
                />
              </div>
            );
          }),
        )}
        {/* Sizes the box; the covers stack inside it */}
        <div style={FRAME} />
      </div>
    </section>
  );
}
