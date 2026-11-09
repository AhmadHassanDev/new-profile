import Image from "next/image";
import type { Block, Screen, Source } from "@/content/cases";
import Evolution from "./Evolution";
import Pipeline from "./Pipeline";
import { fitLetters } from "@/lib/fit";
import Prototypes from "./Prototypes";
import Timeline from "./Timeline";
import { COVER_HEIGHT, COVER_WIDTH, DISCIPLINE_COLOR } from "@/content/site";
import type { Lang } from "@/i18n/lang";
import { ui, type Dict } from "@/i18n/ui";

/**
 * A figure with no Arabic in it ("530 ms", "5★", "−98%", "£337m") reads left to right in both languages, so the
 * Arabic page shows "530 ms", not "ms 530". Figures with Arabic words ("13.4 ألف") keep the page's direction.
 */
const ltr = (value: string) => (/[\u0600-\u06FF]/.test(value) ? undefined : "ltr");

// The page's words, handed to each block (server components share no context). Chapters are labelled with the
// step of the process they cover (t.labels).
type T = Dict["caseStudy"] & { newTab: string };

function Statement({ text }: { text: string }) {
  return (
    <section className="px-4 py-16 md:px-10 md:py-24">
      <p className="max-w-5xl font-display text-[length:calc((clamp(1.9rem,4.4vw,4.5rem))*var(--ds))] leading-[1.05] font-semibold">
        {text}
      </p>
    </section>
  );
}

type ChapterProps = Extract<Block, { kind: "chapter" }> & { index: number; t: T };

function Chapter({ discipline, title, body, findings, sources, index, t }: ChapterProps) {
  const color = DISCIPLINE_COLOR[discipline];
  return (
    <section className="grid gap-8 px-4 py-14 md:grid-cols-12 md:px-10 md:py-20">
      <div className="md:col-span-4">
        <p className="flex items-center gap-3 text-sm font-semibold text-muted">
          <span className="font-display" style={{ color }}>
            0{index + 1}
          </span>
          <span aria-hidden className="h-px w-10" style={{ background: color }} />
          {t.labels[discipline]}
        </p>
      </div>
      <div className="@container md:col-span-8">
        <h2 className="fit-heading font-display leading-[0.95] font-bold uppercase [--fit-max:2.25rem] md:[--fit-max:3.75rem]" style={fitLetters(title)}>
          {title}
        </h2>
        {body ? (
          body.split("\n\n").map((paragraph, i) => (
            <p key={i} className="mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
              {paragraph}
            </p>
          ))
        ) : (
          <Pending className="mt-6">{t.writeUpSoon}</Pending>
        )}
        {findings?.length ? (
          // Two by two until the column is wide enough for four figures in a row (a pair stays a pair)
          <dl className={`mt-10 grid grid-cols-2 gap-3 md:gap-4 ${findings.length === 4 ? "xl:grid-cols-4" : ""}`}>
            {findings.map((f) => (
              // Numbers line up along the top whatever their labels' length (reversed, so the label follows in reading order)
              <div key={f.label} className="@container flex flex-col-reverse justify-end gap-2 rounded-[22px] bg-surface/60 p-5 backdrop-blur-xl md:p-6">
                <dt className="text-sm text-muted">{f.label}</dt>
                {/* Sized to the card, so a long figure like "£337m" (4.5em wide) never spills out */}
                <dd className="font-display text-[length:calc((min(2.25rem,21cqw))*var(--ds))] leading-none font-bold xl:text-[length:calc((min(3rem,21cqw))*var(--ds))]">
                  <span dir={ltr(f.value)}>{f.value}</span>
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        <Sources sources={sources} t={t} />
      </div>
    </section>
  );
}

function Sources({ sources, t }: { sources?: Source[]; t: T }) {
  if (!sources?.length) return null;
  return (
    <p className="mt-6 text-sm text-muted">
      {t.sources}{" "}
      {sources.map((source, i) => (
        <span key={source.href}>
          {i > 0 ? " · " : null}
          <a href={source.href} target="_blank" rel="noreferrer" className="underline decoration-line underline-offset-4 transition-colors hover:text-ink">
            {source.label}
            <span className="sr-only">{t.newTab}</span>
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

/** A result's number, sized to its card; a unit after it ("10 ms") sits smaller so the figure stays the hero */
function Figure({ value }: { value: string }) {
  const [number, unit] = value.split(" ");
  return (
    <span className="block font-display text-[length:calc((min(3rem,38cqw))*var(--ds))] font-bold whitespace-nowrap md:text-[length:calc((min(4.5rem,38cqw))*var(--ds))]">
      <span dir={ltr(value)}>
        {number}
        {unit ? <span className="ms-1 text-2xl text-muted md:text-3xl">{unit}</span> : null}
      </span>
    </span>
  );
}

function Results({ title, body, items, measuredWith, sources, t }: Omit<Extract<Block, { kind: "results" }>, "kind"> & { t: T }) {
  const slots = items.length ? items : [null, null, null];
  return (
    <section className="@container px-4 py-14 md:px-10 md:py-20">
      <h2 className="fit-heading font-display leading-[0.9] font-bold uppercase [--fit-max:3rem] md:[--fit-max:4.5rem]" style={fitLetters(title)}>
        {title}
      </h2>
      {body ? <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted md:text-xl">{body}</p> : null}
      {measuredWith ? (
        <p className="mt-8 inline-flex items-center gap-4 rounded-[22px] bg-surface/70 py-3 pe-6 ps-3 backdrop-blur-xl">
          {/* eslint-disable-next-line @next/next/no-img-element -- a small SVG mark, nothing to optimise */}
          <img src={measuredWith.logo} alt="" width={44} height={44} className="size-11 shrink-0" />
          <span>
            <span className="block text-xs font-semibold text-muted">{t.measured}</span>
            <span className="block font-semibold">{measuredWith.name}</span>
            {measuredWith.detail ? <span className="block text-sm text-muted">{measuredWith.detail}</span> : null}
          </span>
        </p>
      ) : null}
      <ul className={`mt-10 grid gap-4 md:mt-12 md:gap-5 ${slots.length === 4 ? "grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}>
        {slots.map((item, i) => (
          <li
            key={i}
            className={`@container flex min-h-[200px] flex-col rounded-[28px] p-6 md:min-h-[260px] md:p-9 ${
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
                  <span dir={ltr(item.change)}>{item.change}</span>
                </span>
              ) : null}
            </span>
            {item ? (
              <span className="mt-auto pt-8">
                {item.before ? (
                  // Where it started, struck through, so the jump reads at a glance
                  <span className="mb-1 block font-display text-[length:calc((min(1.5rem,18cqw))*var(--ds))] font-bold whitespace-nowrap text-muted/70 md:text-[length:calc((min(2.25rem,18cqw))*var(--ds))]">
                    <span className="sr-only">{t.from} </span>
                    <span dir={ltr(item.before)} className="line-through decoration-[var(--accent)] decoration-[3px]">
                      {item.before}
                    </span>
                    <span className="sr-only"> {t.to}</span>
                  </span>
                ) : null}
                <Figure value={item.value} />
                <span className="mt-3 block min-h-[2lh] text-base text-muted md:text-lg">{item.label}</span>
              </span>
            ) : (
              <span className="mt-auto pt-10">
                <span className="block font-display text-6xl font-bold text-muted/40 md:text-7xl">—</span>
                <span className="mt-3 block text-base text-muted">{t.resultSoon}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
      <Sources sources={sources} t={t} />
    </section>
  );
}

/**
 * The overview: a short lede beside the work. The first clause reads bright, the rest quieter, so it
 * reads like an editorial introduction rather than a poster.
 */
function Feature({ text, src, alt, t }: { text: string; src: string; alt: string; t: T }) {
  const split = text.indexOf(": ");
  const [lead, rest] = split > 0 ? [text.slice(0, split + 1), text.slice(split + 2)] : [text, ""];
  return (
    <section className="grid gap-10 px-4 py-16 md:grid-cols-12 md:gap-12 md:px-10 md:py-24">
      <div className="md:col-span-4 md:pt-2">
        <p className="flex items-center gap-3 text-sm font-semibold text-muted">
          <span aria-hidden className="h-px w-10 bg-[var(--accent-2)]" />
          {t.overview}
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

/**
 * An image held to a comfortable reading width; `full` lets it run wider for a showpiece. With its own
 * size it keeps its shape (a process board, say); without, it takes the cover's.
 */
function Picture({ src, alt, caption, full, width = COVER_WIDTH, height = COVER_HEIGHT }: Omit<Extract<Block, { kind: "image" }>, "kind">) {
  return (
    <figure className={`mx-auto px-4 py-8 md:px-10 md:py-12 ${full ? "max-w-[1400px]" : "max-w-[980px]"}`}>
      <div className="relative overflow-hidden rounded-[24px]" style={{ aspectRatio: `${width} / ${height}` }}>
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
function Screens({ title, screens, t }: { title: string; screens: Screen[]; t: T }) {
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
                  <div className="grid aspect-[4/5] place-items-center bg-surface/30 text-sm text-muted">{t.screenSoon}</div>
                )}
              </div>
              <p className="mt-4 px-1 font-display text-lg font-bold uppercase">{screen.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * The pages on phones, each in a handset (a dark bezel with a dynamic island). Like the browser windows,
 * hovering a phone, or focusing the strip, scrolls the page inside it from top to bottom.
 */
function Phones({ title, screens, t }: { title: string; screens: Screen[]; t: T }) {
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
            <li key={screen.label} className="w-[58vw] max-w-[300px] shrink-0 sm:w-[32vw] lg:w-[19vw]">
              <div className="rounded-[clamp(30px,4vw,44px)] bg-[#050507] p-[clamp(6px,0.7vw,9px)] shadow-[0_30px_60px_-25px_rgb(0_0_0/0.8)]">
                {screen.src && screen.width && screen.height ? (
                  <div
                    className="screen-window relative aspect-[393/852] overflow-hidden rounded-[clamp(24px,3.3vw,36px)] bg-surface"
                    style={{ "--scroll-time": `${((screen.height / screen.width) * 0.9).toFixed(1)}s` } as React.CSSProperties}
                  >
                    <Image
                      src={screen.src}
                      alt={`The ${screen.label} page on a phone`}
                      width={screen.width}
                      height={screen.height}
                      sizes="(min-width: 1580px) 300px, (min-width: 1024px) 19vw, (min-width: 640px) 32vw, 58vw"
                      className="screen-page block h-auto w-full"
                    />
                    {/* A soft frosted strip under the island, like a phone's status bar, so the page never collides with
                        it. It carries the screen's corner radius itself: Chrome doesn't clip a blur to a parent's corners */}
                    <span aria-hidden className="phone-status absolute inset-x-0 top-0 h-[7.5%] rounded-t-[clamp(24px,3.3vw,36px)]" />
                    <span aria-hidden className="absolute top-[2.2%] left-1/2 h-[3.4%] w-[30%] -translate-x-1/2 rounded-full bg-[#050507]" />
                  </div>
                ) : (
                  <div className="grid aspect-[393/852] place-items-center rounded-[36px] bg-surface/30 text-sm text-muted">{t.screenSoon}</div>
                )}
              </div>
              <p className="mt-4 px-1 font-display text-lg font-bold uppercase">{screen.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Directions explored before one shipped, side by side as full pages that scroll on hover. The one that
 * shipped carries a tag and stays bright; the others sit back until hovered. On phones they scroll sideways.
 */
function Directions({ title, body, options, t }: Omit<Extract<Block, { kind: "directions" }>, "kind"> & { t: T }) {
  return (
    <section className="py-16 md:py-24">
      <div className="@container px-4 md:px-10">
        <h2 className="fit-heading font-display leading-[0.9] font-bold uppercase [--fit-max:3rem] md:[--fit-max:4.5rem]" style={fitLetters(title)}>
          {title}
        </h2>
        {body ? <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">{body}</p> : null}
      </div>
      <ol className="mt-10 flex gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] md:mt-14 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-10">
        {options.map((option, i) => (
          <li
            key={option.label}
            className={`w-[78vw] shrink-0 transition-opacity duration-500 md:w-auto ${option.chosen ? "" : "md:opacity-55 md:hover:opacity-100"}`}
          >
            <div
              className="screen-window relative aspect-[3/4] overflow-hidden rounded-[22px] bg-surface shadow-[0_30px_60px_-25px_rgb(0_0_0/0.8)]"
              style={{ "--scroll-time": `${((option.height / option.width) * 1.4).toFixed(1)}s` } as React.CSSProperties}
            >
              <Image
                src={option.src}
                alt={`${t.direction} ${i + 1}, ${option.label}`}
                width={option.width}
                height={option.height}
                sizes="(min-width: 768px) calc((100vw - 120px) / 3), 78vw"
                className="screen-page block h-auto w-full"
              />
              {option.chosen ? (
                <span className="absolute end-3 top-3 rounded-full bg-[var(--accent-2)] px-3 py-1 text-xs font-bold text-[#0b0b0b]">{t.shipped}</span>
              ) : null}
            </div>
            <p className="mt-5 px-1 font-display text-xs font-semibold tracking-wide text-muted uppercase">{t.direction} {String(i + 1).padStart(2, "0")}</p>
            <p className="mt-1 px-1 font-display text-2xl leading-tight font-bold uppercase">{option.label}</p>
            <p className="mt-2 px-1 text-base text-muted">{option.idea}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Wide images in a strip that scrolls sideways and snaps to each, with a label under every one. */
function Gallery({ title, body, items }: Omit<Extract<Block, { kind: "gallery" }>, "kind">) {
  return (
    <section className="py-8 md:py-12">
      <div className="mb-6 px-4 md:mb-8 md:px-10">
        <h2 className="font-display text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>
        {body ? <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">{body}</p> : null}
      </div>
      <div
        role="region"
        aria-label={title}
        tabIndex={0}
        className="snap-x snap-mandatory overflow-x-auto rounded-[24px] [scrollbar-width:none] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent-2)]"
      >
        <ul className="flex w-max gap-4 px-4 pb-4 md:gap-6 md:px-10">
          {items.map((item) => (
            <li key={item.label} className="w-[86vw] shrink-0 snap-start scroll-ml-4 md:w-[56vw] md:scroll-ml-10 lg:w-[44vw]">
              <div className="relative overflow-hidden rounded-[24px] bg-surface" style={{ aspectRatio: `${item.width} / ${item.height}` }}>
                <Image src={item.src} alt={`${item.label}'s app`} fill sizes="(min-width: 1024px) 44vw, (min-width: 768px) 56vw, 86vw" className="object-cover" />
              </div>
              <p className="mt-4 flex items-baseline justify-between gap-4 px-1">
                <span className="font-display text-lg font-bold uppercase">{item.label}</span>
                {item.detail ? <span className="text-sm text-muted">{item.detail}</span> : null}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Renders a case study's blocks in the order the project chose them. */
export default function CaseBlocks({ blocks, lang = "en" }: { blocks: Block[]; lang?: Lang }) {
  const t: T = { ...ui(lang).caseStudy, newTab: ui(lang).common.newTab };
  let chapter = 0;
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "statement":
            return <Statement key={i} text={block.text} />;
          case "chapter":
            return <Chapter key={i} {...block} index={chapter++} t={t} />;
          case "pipeline":
            return <Pipeline key={i} title={block.title} steps={block.steps} />;
          case "feature":
            return <Feature key={i} text={block.text} src={block.src} alt={block.alt} t={t} />;
          case "image":
            return <Picture key={i} {...block} />;
          case "results":
            return <Results key={i} {...block} t={t} />;
          case "screens":
            return <Screens key={i} title={block.title} screens={block.screens} t={t} />;
          case "timeline":
            return <Timeline key={i} title={block.title} body={block.body} unit={block.unit} steps={block.steps} />;
          case "evolution":
            return <Evolution key={i} title={block.title} body={block.body} pairs={block.pairs} />;
          case "directions":
            return <Directions key={i} title={block.title} body={block.body} options={block.options} t={t} />;
          case "gallery":
            return <Gallery key={i} title={block.title} body={block.body} items={block.items} />;
          case "phones":
            return <Phones key={i} title={block.title} screens={block.screens} t={t} />;
          case "prototypes":
            return <Prototypes key={i} title={block.title} flows={block.flows} />;
        }
      })}
    </>
  );
}
