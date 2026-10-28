import type { Metadata } from "next";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import ScrollWords from "@/components/ScrollWords";
import { BOOKS, DISCIPLINE_COLOR, PASSIONS, PROCESS, QUOTE, STORY } from "@/content/site";

export const metadata: Metadata = {
  title: "About — Ahmed Hassan",
  description:
    "Ahmed Hassan is an Egyptian designer and front-end developer: a computer science graduate who researches, designs and builds digital products.",
};

const FACTS = [
  { value: "6+", label: "Years" },
  { value: "60+", label: "Clients" },
  { value: "5+", label: "Regions" },
  { value: "’21", label: "CS, MIU" },
];

const STORY_COLORS = ["var(--cyan)", "var(--violet)", "var(--coral)", "var(--ink)"];

// Varied spine sizes so the shelf looks lived in.
const SPINE_HEIGHT = [92, 78, 70, 96, 86, 74, 82, 90, 98, 76, 84];
const SPINE_WIDTH = [60, 48, 44, 64, 56, 46, 52, 54, 66, 50, 52];

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-sm font-semibold text-muted">
      <span aria-hidden className="h-px w-10 bg-line" />
      {children}
    </p>
  );
}

export default function AboutPage() {
  return (
    <>
      <Cursor />
      <Nav />
      <main id="top">
        {/* Hello */}
        <section className="relative flex min-h-[100svh] flex-col overflow-hidden px-4 pt-32 pb-10 md:px-10 md:pb-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-1/4 -right-1/4 h-[90vmax] w-[90vmax] rounded-full opacity-25 blur-[140px]"
            style={{ background: "var(--spectrum)" }}
          />
          <span
            aria-hidden
            className="text-spectrum animate-shimmer pointer-events-none absolute -top-[8vh] right-[-12vw] font-display text-[120vh] leading-none font-bold opacity-[0.08] md:right-[2vw]"
          >
            /
          </span>

          <Kicker>About</Kicker>
          <h1 className="relative mt-8 font-display leading-[0.84] font-bold tracking-[-0.055em] uppercase">
            <span className="reveal block text-[17vw] md:text-[13.5vw]">
              <span className="animate-rise block">Hi, I&apos;m</span>
            </span>
            <span className="reveal block text-[17vw] md:text-[13.5vw]">
              <span className="text-spectrum animate-shimmer animate-rise block" style={{ animationDelay: "110ms" }}>
                Ahmed.
              </span>
            </span>
          </h1>

          <div className="relative mt-auto grid gap-10 pt-16 lg:grid-cols-12 lg:items-end">
            <p className="max-w-xl text-xl leading-snug font-medium text-muted md:text-2xl lg:col-span-5">
              Egyptian designer and front-end developer.{" "}
              <span className="text-ink">
                I research what people need, design what they&apos;ll choose, and build it myself.
              </span>
            </p>
            <dl className="grid grid-cols-4 lg:col-span-7">
              {FACTS.map((fact, i) => (
                <div key={fact.label} className={`flex flex-col-reverse gap-1 ${i > 0 ? "border-l border-line pl-3 md:pl-5 lg:pl-8" : ""}`}>
                  <dt className="text-xs font-medium text-muted md:text-sm">{fact.label}</dt>
                  <dd className="font-display text-2xl leading-none font-bold tracking-[-0.04em] md:text-4xl lg:text-5xl">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Story */}
        <section aria-labelledby="story-title" className="grid gap-12 px-4 py-32 md:grid-cols-12 md:px-10 md:py-48">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-32">
              <Kicker>The story</Kicker>
              <h2
                id="story-title"
                className="mt-6 font-display text-5xl leading-[0.9] font-bold tracking-[-0.04em] uppercase md:text-6xl"
              >
                The short
                <br />
                <span className="text-spectrum animate-shimmer">version</span>
              </h2>
            </div>
          </div>
          <ol className="md:col-span-8">
            {STORY.map((step, i) => (
              <li
                key={step.when}
                className="group relative grid gap-4 border-t border-line py-10 md:grid-cols-8 md:gap-8 md:py-14"
                style={{ "--c": STORY_COLORS[i] } as React.CSSProperties}
              >
                <span
                  aria-hidden
                  className="absolute top-[-1px] left-0 h-px w-0 bg-[var(--c)] transition-all duration-700 ease-out group-hover:w-full"
                />
                <p className="font-display text-4xl leading-none font-bold tracking-[-0.04em] text-[var(--c)] md:col-span-3 md:text-5xl">
                  {step.when}
                </p>
                <div className="md:col-span-5">
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.02em] md:text-3xl">{step.title}</h3>
                  <p className="mt-3 text-lg leading-relaxed text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Off the clock */}
        <section aria-labelledby="passions-title" className="px-4 pb-32 md:px-10 md:pb-48">
          <Kicker>What I love</Kicker>
          <h2
            id="passions-title"
            className="mt-6 mb-12 font-display text-5xl leading-[0.9] font-bold tracking-[-0.04em] uppercase md:mb-16 md:text-7xl"
          >
            Off the
            <br />
            <span className="text-spectrum animate-shimmer">clock</span>
          </h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {PASSIONS.map((passion, i) => (
              <li
                key={passion.title}
                className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-[32px] border border-line bg-surface p-6 transition-colors duration-500 hover:text-bg md:min-h-[380px] md:p-10"
                style={{ "--c": passion.color } as React.CSSProperties}
              >
                {/* Floods the card with its colour from the corner on hover */}
                <span aria-hidden className="passion-flood absolute inset-0 bg-[var(--c)]" />
                <div className="relative flex items-center justify-between">
                  <span className="font-display text-sm font-semibold text-[var(--c)] transition-colors duration-500 group-hover:text-bg">
                    0{i + 1}
                  </span>
                  <span aria-hidden className="size-3 rounded-full bg-[var(--c)] transition-colors duration-500 group-hover:bg-bg" />
                </div>
                <h3 className="relative mt-auto font-display text-[14vw] leading-[0.9] font-bold tracking-[-0.05em] uppercase md:text-[clamp(3rem,6vw,6rem)]">
                  {passion.title}
                </h3>
                <p className="relative mt-4 max-w-md text-lg leading-snug text-muted transition-colors duration-500 group-hover:text-bg">
                  {passion.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Quote */}
        <section aria-label="Favourite quote" className="px-4 pb-32 md:px-10 md:pb-48">
          <figure>
            <blockquote>
              <ScrollWords
                className="font-display text-[11vw] leading-[0.92] font-bold tracking-[-0.05em] uppercase md:text-[7.5vw]"
                segments={[
                  { text: "“It always seems" },
                  { text: "impossible", color: "var(--violet)" },
                  { text: "until it’s done.”" },
                ]}
              />
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-3 text-lg font-medium text-muted">
              <span aria-hidden className="h-px w-10" style={{ background: "var(--spectrum)" }} />
              {QUOTE.by}
            </figcaption>
          </figure>
        </section>

        {/* Bookshelf */}
        <section aria-labelledby="shelf-title" className="overflow-hidden pb-32 md:pb-48">
          <div className="flex flex-col gap-4 px-4 md:flex-row md:items-end md:justify-between md:px-10">
            <div>
              <Kicker>Reading</Kicker>
              <h2
                id="shelf-title"
                className="mt-6 font-display text-5xl leading-[0.9] font-bold tracking-[-0.04em] uppercase md:text-7xl"
              >
                On the
                <br />
                <span className="text-spectrum animate-shimmer">shelf</span>
              </h2>
            </div>
            <p className="max-w-xs text-lg text-muted md:text-right">{BOOKS.length} books that shaped how I work.</p>
          </div>

          <div className="mt-14 overflow-x-auto px-4 pt-8 [scrollbar-width:none] md:px-10">
            <ul className="flex h-[400px] w-max items-end gap-1.5 md:h-[460px] md:w-full md:justify-center">
              {BOOKS.map((book, i) => (
                <li
                  key={book.title}
                  className="book flex shrink-0 flex-col items-center justify-between rounded-t-[6px] rounded-b-[3px] px-1 py-4"
                  style={{
                    height: `${SPINE_HEIGHT[i]}%`,
                    width: SPINE_WIDTH[i],
                    background: book.bg,
                    color: book.ink,
                  }}
                >
                  <span className="font-display text-[13px] leading-tight font-bold tracking-[-0.01em] uppercase [writing-mode:vertical-rl] md:text-sm">
                    {book.title}
                  </span>
                  <span className="text-[10px] font-semibold opacity-75 [writing-mode:vertical-rl]">{book.author}</span>
                </li>
              ))}
            </ul>
            <div aria-hidden className="h-3 w-max min-w-full rounded-full bg-surface-2 shadow-[0_18px_40px_-10px_rgb(0_0_0/0.8)]" />
          </div>
        </section>

        {/* Toolkit */}
        <section aria-labelledby="kit-title" className="px-4 pb-16 md:px-10">
          <Kicker>Toolkit</Kicker>
          <h2 id="kit-title" className="sr-only">
            Toolkit
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {PROCESS.map((step) => {
              const color = DISCIPLINE_COLOR[step.name];
              return (
                <div key={step.verb} className="border-t pt-6" style={{ borderColor: color }}>
                  <h3 className="font-display text-3xl font-bold tracking-[-0.04em] uppercase" style={{ color }}>
                    {step.verb}
                  </h3>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {step.kit.map((item) => (
                      <li key={item} className="rounded-full border border-line px-4 py-2 text-sm font-medium">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Contact />
    </>
  );
}
