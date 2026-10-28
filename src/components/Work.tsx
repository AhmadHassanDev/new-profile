"use client";

import { useEffect, useRef, useState } from "react";
import { DISCIPLINE_COLOR, PROJECTS, type Project } from "@/content/site";

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [first, second = first] = project.disciplines.map((d) => DISCIPLINE_COLOR[d]);
  return (
    <article
      data-cursor="View"
      className="group relative flex h-[70svh] w-full shrink-0 flex-col overflow-hidden rounded-[32px] border border-line bg-surface p-6 md:h-[68vh] md:w-[min(72vw,920px)] md:p-10"
    >
      {/* Light */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-80 transition-all duration-700 ease-out group-hover:scale-110 group-hover:opacity-100"
        style={{
          background: `radial-gradient(60% 70% at 0% 100%, color-mix(in srgb, ${first} 55%, transparent), transparent 70%), radial-gradient(50% 60% at 100% 0%, color-mix(in srgb, ${second} 35%, transparent), transparent 70%)`,
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <span className="font-display text-sm font-medium text-muted">
          {String(index + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}
        </span>
        <span className="grid h-14 w-14 place-items-center rounded-full bg-ink text-xl text-bg transition-transform duration-500 group-hover:rotate-45">
          ↗
        </span>
      </div>

      <div className="relative mt-6 max-w-md">
        <p className="text-sm font-medium text-muted">
          {project.kind} · {project.year}
        </p>
        <p className="mt-3 text-lg leading-snug md:text-xl">{project.summary}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {project.disciplines.map((d) => (
            <li
              key={d}
              className="rounded-full border px-3 py-1 text-xs font-semibold"
              style={{ color: DISCIPLINE_COLOR[d], borderColor: `color-mix(in srgb, ${DISCIPLINE_COLOR[d]} 40%, transparent)` }}
            >
              {d}
            </li>
          ))}
        </ul>
      </div>

      <h3 className="relative mt-auto font-display text-[11vw] leading-[0.85] font-bold tracking-[-0.05em] uppercase md:text-[clamp(3rem,6vw,6.5rem)]">
        {project.name}
      </h3>
    </article>
  );
}

export default function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const desktop = window.matchMedia("(min-width: 768px)");

    let frame = 0;
    const update = () => {
      frame = 0;
      if (!desktop.matches) {
        track.style.transform = "";
        return;
      }
      const rect = section.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      const overflow = track.scrollWidth - window.innerWidth;
      track.style.transform = `translate3d(${-progress * overflow}px, 0, 0)`;
      setActive(Math.min(PROJECTS.length - 1, Math.round(progress * PROJECTS.length)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    desktop.addEventListener("change", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      desktop.removeEventListener("change", onScroll);
    };
  }, []);

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative md:h-[var(--work-h)]"
      style={{ "--work-h": `${(PROJECTS.length + 1) * 100}vh` } as React.CSSProperties}
    >
      <div className="flex flex-col md:sticky md:top-0 md:h-screen md:overflow-hidden">
        <header className="flex items-end justify-between px-4 pt-28 pb-8 md:px-10">
          <h2 className="font-display text-5xl leading-[0.9] font-bold tracking-[-0.04em] uppercase md:text-7xl">
            Selected
            <br />
            <span className="text-spectrum animate-shimmer">work</span>
          </h2>
          <p className="hidden text-right text-sm font-medium text-muted md:block">
            <span className="font-display text-3xl text-ink">{String(active + 1).padStart(2, "0")}</span>
            <span> / {String(PROJECTS.length).padStart(2, "0")}</span>
            <br />
            More on the way
          </p>
        </header>

        <div ref={trackRef} className="flex flex-col gap-6 px-4 will-change-transform md:flex-row md:px-10">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
          <div className="flex h-[40svh] shrink-0 flex-col justify-center rounded-[32px] border border-dashed border-line p-10 md:h-[68vh] md:w-[min(48vw,600px)]">
            <p className="font-display text-6xl font-bold tracking-[-0.04em] md:text-8xl">
              <span className="text-spectrum animate-shimmer">20+</span>
            </p>
            <p className="mt-4 max-w-xs text-lg text-muted">More case studies are being written up. The full archive lands soon.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
