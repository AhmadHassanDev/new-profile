import Image from "next/image";
import Link from "next/link";
import { caseFor } from "@/content/cases";
import previews from "@/content/covers.json";
import { COVER_HEIGHT, COVER_WIDTH, DISCIPLINE_COLOR, type Project } from "@/content/site";

// Tiny blurred stand-ins from `npm run covers`, keyed by file name, shown while a cover loads
const PREVIEWS: Record<string, string> = previews;
export const previewOf = (cover: string) => PREVIEWS[cover.split("/").pop()!.replace(/\.webp$/, "")];

// Covers all share one size, so the frame matches it exactly and nothing gets cropped
export const FRAME = { aspectRatio: `${COVER_WIDTH} / ${COVER_HEIGHT}` };

/** Name and details under the cover; one line each, so every card is the same height. */
function Caption({ title, detail, children }: { title: string; detail: string; children?: React.ReactNode }) {
  return (
    <div className="mt-3 flex h-14 items-start justify-between gap-3 px-1 md:mt-4">
      <div className="min-w-0">
        <h3 className="truncate font-display text-lg leading-tight font-bold tracking-[-0.03em] uppercase md:text-xl">{title}</h3>
        <p className="mt-1 truncate text-xs font-medium text-muted md:text-sm">{detail}</p>
      </div>
      {children}
    </div>
  );
}

// Each cover is fetched at the width it's actually drawn, so phones never pull a desktop-sized file.
// Wall: the tile's --card-w in Work.tsx (78vw, then clamp(320px, 28vw, 520px) from md). Grid: the
// one/two/three-column lists (px-4/md:px-10 gutters, gap-x-6), on the work page and under a case study.
const SIZES = {
  wall: "(min-width: 1857px) 520px, (min-width: 1143px) 28vw, (min-width: 768px) 320px, 78vw",
  grid: "(min-width: 1280px) calc((100vw - 128px) / 3), (min-width: 768px) calc((100vw - 104px) / 2), (min-width: 640px) calc((100vw - 56px) / 2), calc(100vw - 32px)",
};

/**
 * `full` adds the summary and discipline names, for the browsable list on the work page. Projects
 * with a case study link to it; the rest say a case study is coming, on the card itself so touch,
 * keyboard and screen-reader visitors get it too. `decorative` marks the copies in the drag wall: out
 * of the tab order and sized for the wall's tiles. `eager` is for covers seen on arrival (the LCP).
 */
export function ProjectCard({
  project,
  full = false,
  decorative = false,
  eager = false,
}: {
  project: Project;
  full?: boolean;
  decorative?: boolean;
  eager?: boolean;
}) {
  const href = caseFor(project.slug) ? `/work/${project.slug}` : undefined;
  const card = (
    <article
      data-cursor={href ? "View" : "Case study soon"}
      data-cursor-style={href ? undefined : "orbit"}
      className="group relative w-full transition-transform duration-500 ease-out hover:-translate-y-1.5"
    >
      <div
        className="relative overflow-hidden rounded-[22px] bg-surface transition-shadow duration-500 group-hover:shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)]"
        style={FRAME}
      >
        {/* Every listed project has a cover (PROJECTS only keeps those), so there's no fallback to draw */}
        <Image
          src={project.cover!}
          alt=""
          fill
          draggable={false}
          sizes={decorative ? SIZES.wall : SIZES.grid}
          loading={eager ? "eager" : undefined}
          fetchPriority={eager ? "high" : undefined}
          placeholder={previewOf(project.cover!) ? "blur" : "empty"}
          blurDataURL={previewOf(project.cover!)}
          className="pointer-events-none object-cover"
        />
      </div>
      <Caption title={project.name} detail={`${project.kind} · ${project.year}`}>
        {/* With `full` the names are spelled out below, so the dots are only for the eye there */}
        <ul className="flex shrink-0 gap-1 pt-1.5" aria-label="Disciplines" aria-hidden={full || undefined}>
          {project.disciplines.map((d) => (
            <li key={d} title={d} className="size-2.5 rounded-full" style={{ background: DISCIPLINE_COLOR[d] }}>
              <span className="sr-only">{d}</span>
            </li>
          ))}
        </ul>
      </Caption>
      {full ? (
        <div className="px-1">
          <p className="text-base leading-snug text-muted">{project.summary}</p>
          <ul className="mt-4 flex flex-wrap gap-1.5">
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
      ) : null}
      {href ? null : (
        // Last in the markup so it's read after the name, but it sits on the cover's corner. On the moving
        // wall it's solid: a blur there would be redone for every badge on every frame.
        <p
          className={`absolute top-3 left-3 rounded-full px-3 py-1.5 text-xs font-semibold text-ink md:top-4 md:left-4 ${
            decorative ? "bg-surface/90" : "bg-surface/70 backdrop-blur-md"
          }`}
        >
          Case study soon
        </p>
      )}
    </article>
  );
  return href ? (
    <Link href={href} tabIndex={decorative ? -1 : undefined} draggable={false} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}

