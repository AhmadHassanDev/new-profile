import Image from "next/image";
import type { Block, Screen, Source } from "@/content/cases";
import Pipeline from "./Pipeline";
import { COVER_HEIGHT, COVER_WIDTH, DISCIPLINE_COLOR, type Discipline } from "@/content/site";

// Each chapter is labelled with the step of the process it covers
const CHAPTER_VERB: Record<Discipline, string> = {
  "UX research": "Research",
  "UI design": "Design",
  "Front-end": "Build",
  Branding: "Identity",
};

function Statement({ text }: { text: string }) {
  return (
    <section className="px-4 py-16 md:px-10 md:py-24">
      <p className="max-w-5xl font-display text-[clamp(1.9rem,4.4vw,4.5rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
        {text}
      </p>
    </section>
  );
}

type ChapterProps = Extract<Block, { kind: "chapter" }> & { index: number };

function Chapter({ discipline, title, body, findings, sources, index }: ChapterProps) {
  const color = DISCIPLINE_COLOR[discipline];
  return (
    <section className="grid gap-8 px-4 py-14 md:grid-cols-12 md:px-10 md:py-20">
      <div className="md:col-span-4">
        <p className="flex items-center gap-3 text-sm font-semibold text-muted">
          <span className="font-display" style={{ color }}>
            0{index + 1}
          </span>
          <span aria-hidden className="h-px w-10" style={{ background: color }} />
          {CHAPTER_VERB[discipline]}
        </p>
      </div>
      <div className="md:col-span-8">
        <h2 className="font-display text-4xl leading-[0.95] font-bold tracking-[-0.04em] uppercase md:text-6xl">{title}</h2>
        {body ? (
          body.split("\n\n").map((paragraph, i) => (
            <p key={i} className="mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
              {paragraph}
            </p>
          ))
        ) : (
          <Pending className="mt-6">Write-up coming soon</Pending>
        )}
        {findings?.length ? (
          <dl className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {findings.map((f) => (
              <div key={f.label} className="flex flex-col-reverse gap-2 rounded-[22px] bg-surface/60 p-5 backdrop-blur-xl md:p-6">
                <dt className="text-sm text-muted">{f.label}</dt>
                <dd className="font-display text-4xl font-bold tracking-[-0.04em] md:text-5xl">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        <Sources sources={sources} />
      </div>
    </section>
  );
}

function Sources({ sources }: { sources?: Source[] }) {
  if (!sources?.length) return null;
  return (
    <p className="mt-6 text-sm text-muted">
      Sources:{" "}
      {sources.map((source, i) => (
        <span key={source.href}>
          {i > 0 ? " · " : null}
          <a href={source.href} target="_blank" rel="noreferrer" className="underline decoration-line underline-offset-4 transition-colors hover:text-ink">
            {source.label}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </span>
      ))}
    </p>
  );
}

/** Marks a part of the story that's still being written, without pretending it's done. */
function Pending({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`inline-flex items-center gap-2 rounded-full border border-dashed border-line px-4 py-2 text-sm font-semibold text-muted ${className}`}>
      <span aria-hidden className="size-1.5 rounded-full bg-[var(--accent-2)]" />
      {children}
    </p>
  );
}

/** A result's number; a unit after it ("10 ms") sits smaller so the figure stays the hero */
function Figure({ value }: { value: string }) {
  const [number, unit] = value.split(" ");
  return (
    <span className="block font-display text-5xl font-bold tracking-[-0.05em] whitespace-nowrap md:text-7xl">
      {number}
      {unit ? <span className="ml-1 text-2xl tracking-[-0.02em] text-muted md:text-3xl">{unit}</span> : null}
    </span>
  );
}

function Results({ title, body, items, measuredWith, sources }: Omit<Extract<Block, { kind: "results" }>, "kind">) {
  const slots = items.length ? items : [null, null, null];
  return (
    <section className="px-4 py-14 md:px-10 md:py-20">
      <h2 className="font-display text-5xl leading-[0.9] font-bold tracking-[-0.04em] uppercase md:text-7xl">{title}</h2>
      {body ? <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted md:text-xl">{body}</p> : null}
      {measuredWith ? (
        <p className="mt-8 inline-flex items-center gap-4 rounded-[22px] bg-surface/70 py-3 pr-6 pl-3 backdrop-blur-xl">
          {/* eslint-disable-next-line @next/next/no-img-element -- a small SVG mark, nothing to optimise */}
          <img src={measuredWith.logo} alt="" width={44} height={44} className="size-11 shrink-0" />
          <span>
            <span className="block text-xs font-semibold text-muted">Measured with</span>
            <span className="block font-semibold">{measuredWith.name}</span>
            {measuredWith.detail ? <span className="block text-sm text-muted">{measuredWith.detail}</span> : null}
          </span>
        </p>
      ) : null}
      <ul className={`mt-10 grid gap-4 md:mt-12 md:gap-5 ${slots.length === 4 ? "grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}>
        {slots.map((item, i) => (
          <li
            key={i}
            className={`flex min-h-[200px] flex-col rounded-[28px] p-6 md:min-h-[260px] md:p-9 ${
              item ? "bg-surface/70 backdrop-blur-xl" : "bg-surface/30"
            }`}
          >
            <span className="flex items-center justify-between gap-3">
              <span className="font-display text-xs font-semibold text-[var(--accent-2)]">0{i + 1}</span>
              {item?.change ? (
                <span
                  className="rounded-full px-3 py-1 font-display text-sm font-bold text-white md:text-base"
                  style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
                >
                  {item.change}
                </span>
              ) : null}
            </span>
            {item ? (
              <span className="mt-auto pt-8">
                {item.before ? (
                  // Where it started, struck through, so the jump reads at a glance
                  <span className="mb-1 block font-display text-2xl font-bold tracking-[-0.03em] whitespace-nowrap text-muted/70 md:text-4xl">
                    <span className="sr-only">From </span>
                    <span className="line-through decoration-[var(--accent)] decoration-[3px]">{item.before}</span>
                    <span className="sr-only"> to</span>
                  </span>
                ) : null}
                <Figure value={item.value} />
                <span className="mt-3 block min-h-[2lh] text-base text-muted md:text-lg">{item.label}</span>
              </span>
            ) : (
              <span className="mt-auto pt-10">
                <span className="block font-display text-6xl font-bold tracking-[-0.05em] text-muted/40 md:text-7xl">—</span>
                <span className="mt-3 block text-base text-muted">Result coming soon</span>
              </span>
            )}
          </li>
        ))}
      </ul>
      <Sources sources={sources} />
    </section>
  );
}

/**
 * The overview: a short lede beside the work. The first clause reads bright, the rest quieter, so it
 * reads like an editorial introduction rather than a poster.
 */
function Feature({ text, src, alt }: { text: string; src: string; alt: string }) {
  const split = text.indexOf(": ");
  const [lead, rest] = split > 0 ? [text.slice(0, split + 1), text.slice(split + 2)] : [text, ""];
  return (
    <section className="grid gap-10 px-4 py-16 md:grid-cols-12 md:gap-12 md:px-10 md:py-24">
      <div className="md:col-span-4 md:pt-2">
        <p className="flex items-center gap-3 text-sm font-semibold text-muted">
          <span aria-hidden className="h-px w-10 bg-[var(--accent-2)]" />
          Overview
        </p>
        <p className="mt-6 text-2xl leading-snug font-medium text-muted md:text-[1.7rem]">
          <span className="text-ink">{lead}</span> {rest}
        </p>
      </div>
      <div
        className="relative overflow-hidden rounded-[24px] md:col-span-8"
        style={{ aspectRatio: `${COVER_WIDTH} / ${COVER_HEIGHT}` }}
      >
        {/* Eight of twelve columns inside the md:px-10 gutters (a touch generous where a signature narrows the page) */}
        <Image src={src} alt={alt} fill sizes="(min-width: 768px) calc((100vw - 80px) * 2 / 3), calc(100vw - 32px)" className="object-cover" />
      </div>
    </section>
  );
}

/** An image held to a comfortable reading width; `full` lets it run wider for a showpiece. */
function Picture({ src, alt, caption, full }: { src: string; alt: string; caption?: string; full?: boolean }) {
  return (
    <figure className={`mx-auto px-4 py-8 md:px-10 md:py-12 ${full ? "max-w-[1400px]" : "max-w-[980px]"}`}>
      <div className="relative overflow-hidden rounded-[24px]" style={{ aspectRatio: `${COVER_WIDTH} / ${COVER_HEIGHT}` }}>
        <Image
          src={src}
          alt={alt}
          fill
          // The figure's max width less its own padding (px-4, md:px-10)
          sizes={
            full
              ? "(min-width: 1400px) 1320px, (min-width: 768px) calc(100vw - 80px), calc(100vw - 32px)"
              : "(min-width: 980px) 900px, (min-width: 768px) calc(100vw - 80px), calc(100vw - 32px)"
          }
          className="object-cover"
        />
      </div>
      {caption ? <figcaption className="mt-4 px-2 text-sm text-muted">{caption}</figcaption> : null}
    </figure>
  );
}

/**
 * The pages, each in a browser window. Hovering a window scrolls through the whole page, quicker for
 * short pages and slower for long ones; a screen still to come holds its place. The strip itself takes
 * keyboard focus (its scrollbar is hidden), so arrow keys move it, and while focused every page scrolls
 * through as on hover (`.screens:focus-visible` in globals.css).
 */
function Screens({ title, screens }: { title: string; screens: Screen[] }) {
  return (
    <section className="py-8 md:py-12">
      <h2 className="mb-6 px-4 font-display text-sm font-semibold tracking-wide text-muted uppercase md:mb-8 md:px-10">{title}</h2>
      <div
        role="region"
        aria-label={title}
        tabIndex={0}
        className="screens overflow-x-auto rounded-[24px] [scrollbar-width:none] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent-2)]"
      >
        <ul className="flex w-max gap-4 px-4 pb-4 md:gap-6 md:px-10">
          {screens.map((screen) => (
            <li key={screen.label} className="w-[78vw] shrink-0 sm:w-[46vw] lg:w-[30vw]">
              <div className="overflow-hidden rounded-[20px] bg-surface shadow-[0_30px_60px_-25px_rgb(0_0_0/0.8)]">
                <div aria-hidden className="flex items-center gap-1.5 px-4 py-3">
                  <span className="size-2.5 rounded-full bg-ink/15" />
                  <span className="size-2.5 rounded-full bg-ink/15" />
                  <span className="size-2.5 rounded-full bg-ink/15" />
                </div>
                {screen.src && screen.width && screen.height ? (
                  <div
                    className="screen-window relative aspect-[4/5] overflow-hidden"
                    style={{ "--scroll-time": `${((screen.height / screen.width) * 1.4).toFixed(1)}s` } as React.CSSProperties}
                  >
                    <Image
                      src={screen.src}
                      alt={`The ${screen.label} page`}
                      width={screen.width}
                      height={screen.height}
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 78vw"
                      className="screen-page block h-auto w-full"
                    />
                  </div>
                ) : (
                  <div className="grid aspect-[4/5] place-items-center bg-surface/30 text-sm text-muted">Screen coming soon</div>
                )}
              </div>
              <p className="mt-4 px-1 font-display text-lg font-bold tracking-[-0.02em] uppercase">{screen.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Renders a case study's blocks in the order the project chose them. */
export default function CaseBlocks({ blocks }: { blocks: Block[] }) {
  let chapter = 0;
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "statement":
            return <Statement key={i} text={block.text} />;
          case "chapter":
            return <Chapter key={i} {...block} index={chapter++} />;
          case "pipeline":
            return <Pipeline key={i} title={block.title} steps={block.steps} />;
          case "feature":
            return <Feature key={i} text={block.text} src={block.src} alt={block.alt} />;
          case "image":
            return <Picture key={i} src={block.src} alt={block.alt} caption={block.caption} full={block.full} />;
          case "results":
            return <Results key={i} {...block} />;
          case "screens":
            return <Screens key={i} title={block.title} screens={block.screens} />;
        }
      })}
    </>
  );
}
