import Image from "next/image";
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

/** `full` adds the summary and discipline names, for the browsable list on the work page. */
export function ProjectCard({ project, full = false }: { project: Project; full?: boolean }) {
  const [first, second = first] = project.disciplines.map((d) => DISCIPLINE_COLOR[d]);
  return (
    <article data-cursor="View" className="group w-full transition-transform duration-500 ease-out hover:-translate-y-1.5">
      <div
        className="relative overflow-hidden rounded-[22px] bg-surface ring-1 ring-line transition-shadow duration-500 group-hover:ring-ink/40 group-hover:shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)]"
        style={FRAME}
      >
        {project.cover ? (
          <Image
            src={project.cover}
            alt=""
            fill
            draggable={false}
            // Matches the card's width in the grid and in the list, so phones get small files
            sizes={full ? "(min-width: 1280px) 30vw, (min-width: 640px) 46vw, 92vw" : "(min-width: 768px) 28vw, 78vw"}
            placeholder={previewOf(project.cover) ? "blur" : "empty"}
            blurDataURL={previewOf(project.cover)}
            className="pointer-events-none object-cover"
          />
        ) : (
          // No cover yet: the project's colours and its name, in the same frame
          <div
            className="absolute inset-0 grid place-items-center p-6"
            style={{
              background: `radial-gradient(70% 80% at 0% 100%, color-mix(in srgb, ${first} 45%, transparent), transparent 70%), radial-gradient(60% 70% at 100% 0%, color-mix(in srgb, ${second} 30%, transparent), transparent 70%)`,
            }}
          >
            <span className="text-center font-display text-[clamp(1.75rem,3vw,3rem)] leading-[0.9] font-bold tracking-[-0.05em] uppercase">
              {project.name}
            </span>
          </div>
        )}
      </div>
      <Caption title={project.name} detail={`${project.kind} · ${project.year}`}>
        <ul className="flex shrink-0 gap-1 pt-1.5" aria-label="Disciplines">
          {project.disciplines.map((d) => (
            <li key={d} title={d} className="size-2.5 rounded-full" style={{ background: DISCIPLINE_COLOR[d] }} />
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
    </article>
  );
}

export function MoreCard() {
  return (
    <div className="w-full">
      <div className="grid place-items-center rounded-[22px] border border-dashed border-line" style={FRAME}>
        <span className="text-spectrum animate-shimmer font-display text-6xl font-bold tracking-[-0.04em] md:text-7xl">20+</span>
      </div>
      <Caption title="More work" detail="Case studies on the way" />
    </div>
  );
}

