"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { DISCIPLINE_COLOR, PROJECTS, typeOf, type Discipline } from "@/content/site";
import { ProjectCard } from "./ProjectCard";

const DISCIPLINES = Object.keys(DISCIPLINE_COLOR) as Discipline[];
const TYPES = [...new Set(PROJECTS.map((p) => typeOf(p.kind)))].sort();
const YEARS = [...new Set(PROJECTS.map((p) => p.year))].sort().reverse();

type Filters = { discipline: Discipline | null; type: string | null; year: string | null; newest: boolean };
const NONE: Filters = { discipline: null, type: null, year: null, newest: true };

// Links can open the list pre-filtered: /work?type=Mobile%20app or ?tag=UX%20research or ?year=2025.
// Read through useSyncExternalStore so the server render and first paint agree, then the URL applies.
const noSubscribe = () => () => {};
function fromUrl(search: string): Filters {
  const params = new URLSearchParams(search);
  const tag = params.get("tag") as Discipline | null;
  const type = params.get("type");
  const year = params.get("year");
  return {
    ...NONE,
    discipline: tag && DISCIPLINES.includes(tag) ? tag : null,
    type: type && TYPES.includes(type) ? type : null,
    year: year && YEARS.includes(year) ? year : null,
  };
}

function Pill({
  active,
  onClick,
  color,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color?: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${
        active ? "border-transparent bg-ink text-bg" : "border-line text-muted hover:border-ink/40 hover:text-ink"
      }`}
    >
      {color ? <span aria-hidden className="size-2 rounded-full" style={{ background: color }} /> : null}
      {children}
      {count !== undefined ? <span className={active ? "text-bg/60" : "text-muted/70"}>{count}</span> : null}
    </button>
  );
}

/** A native select dressed as a pill: compact, and the phone's own picker on touch screens. */
function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: string[];
  onChange: (value: string | null) => void;
}) {
  return (
    <span className="relative flex shrink-0 items-center">
      <select
        aria-label={label}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className={`cursor-pointer appearance-none rounded-full border py-2 pr-9 pl-4 text-sm font-semibold transition-colors duration-300 [&>option]:bg-bg [&>option]:text-ink ${
          value ? "border-transparent bg-ink text-bg" : "border-line bg-transparent text-muted hover:border-ink/40 hover:text-ink"
        }`}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span aria-hidden className={`pointer-events-none absolute right-3.5 text-[10px] ${value ? "text-bg" : "text-muted"}`}>
        ▼
      </span>
    </span>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex shrink-0 items-center gap-2">
      <span className="pr-1 text-xs font-semibold tracking-wide text-muted uppercase">{label}</span>
      {children}
    </div>
  );
}

/**
 * Every project as browsable cards, under the work page's grid. A sticky glass bar filters by
 * discipline, type and year, and flips the order; the cards rise back in whenever it changes.
 */
export default function WorkIndex() {
  const search = useSyncExternalStore(noSubscribe, () => window.location.search, () => "");
  const linked = useMemo(() => fromUrl(search), [search]);
  // The visitor's own choices take over from whatever the link asked for
  const [chosen, setFilters] = useState<Filters | null>(null);
  const filters = chosen ?? linked;
  const set = (change: Partial<Filters>) => setFilters({ ...filters, ...change });
  const filtered = useMemo(
    () =>
      PROJECTS.filter(
        (p) =>
          (!filters.discipline || p.disciplines.includes(filters.discipline)) &&
          (!filters.type || typeOf(p.kind) === filters.type) &&
          (!filters.year || p.year === filters.year),
      ).sort((a, b) => (filters.newest ? b.year.localeCompare(a.year) : a.year.localeCompare(b.year))),
    [filters],
  );
  const count = (match: (p: (typeof PROJECTS)[number]) => boolean) => PROJECTS.filter(match).length;
  const filtering = filters.discipline || filters.type || filters.year;

  return (
    <section id="projects" aria-labelledby="projects-title" className="scroll-mt-24 px-4 pt-24 pb-32 md:px-10 md:pt-32 md:pb-48">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2 id="projects-title" className="font-display text-5xl leading-[0.9] font-bold tracking-[-0.04em] uppercase md:text-7xl">
          Every
          <br />
          <span className="text-spectrum animate-shimmer">project</span>
        </h2>
        <p aria-live="polite" className="text-sm font-medium text-muted">
          <span className="font-display text-3xl text-ink md:text-5xl">{filtered.length}</span> of {PROJECTS.length}
        </p>
      </div>

      {/* Filters: a sticky pane of frosted glass; on small screens it scrolls sideways, fading at the edge */}
      <div className="below-nav sticky z-30 -mx-2 mt-10 px-2 md:mx-0 md:mt-14 md:px-0">
        <div className="flex items-center gap-5 overflow-x-auto rounded-full border border-line bg-bg/65 p-2 pl-5 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.7),inset_0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-2xl backdrop-saturate-150 [scrollbar-width:none] max-md:[mask-image:linear-gradient(to_right,#000_82%,transparent)]">
          <Group label="Tag">
            {DISCIPLINES.map((d) => (
              <Pill
                key={d}
                active={filters.discipline === d}
                color={DISCIPLINE_COLOR[d]}
                count={count((p) => p.disciplines.includes(d))}
                onClick={() => set({ discipline: filters.discipline === d ? null : d })}
              >
                {d}
              </Pill>
            ))}
          </Group>
          <Group label="Type">
            <Select label="Type" value={filters.type} options={TYPES} onChange={(type) => set({ type })} />
          </Group>
          <Group label="Year">
            <Select label="Year" value={filters.year} options={YEARS} onChange={(year) => set({ year })} />
          </Group>
          <Group label="Sort">
            <Pill active={false} onClick={() => set({ newest: !filters.newest })}>
              {filters.newest ? "Newest first ↓" : "Oldest first ↑"}
            </Pill>
          </Group>
          <button
            type="button"
            onClick={() => setFilters(NONE)}
            disabled={!filtering}
            className="ml-auto shrink-0 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink transition-opacity duration-300 disabled:pointer-events-none disabled:opacity-0"
          >
            Clear ✕
          </button>
        </div>
      </div>

      {filtered.length ? (
        // Keyed by the filters, so the cards rise back in, one after another, on every change
        <ul key={JSON.stringify(filters)} className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 md:mt-16 xl:grid-cols-3">
          {filtered.map((project, i) => (
            <li key={project.slug} className="animate-rise" style={{ animationDelay: `${i * 70}ms` }}>
              <ProjectCard project={project} full />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-16 flex flex-col items-start gap-5 rounded-[28px] border border-dashed border-line p-10">
          <p className="font-display text-2xl font-semibold tracking-[-0.02em] md:text-3xl">Nothing matches those filters yet.</p>
          <button
            type="button"
            onClick={() => setFilters(NONE)}
            className="rounded-full bg-ink px-6 py-3 text-base font-semibold text-bg transition-transform hover:scale-[1.04]"
          >
            Show everything
          </button>
        </div>
      )}
    </section>
  );
}
