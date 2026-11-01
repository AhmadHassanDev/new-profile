import type { Metadata } from "next";
import AboutGuide from "@/components/about/AboutGuide";
import AskMeAnything from "@/components/about/AskMeAnything";
import AvatarFrame from "@/components/about/AvatarFrame";
import HeroRecede from "@/components/about/HeroRecede";
import PassionCard from "@/components/about/PassionCard";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import ScrollWords from "@/components/ScrollWords";
import { DISCIPLINE_COLOR, PASSIONS, PROCESS, QUOTE, STORY } from "@/content/site";

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

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-sm font-semibold text-muted">
      <span aria-hidden className="h-px w-10 bg-line" />
      {children}
    </p>
  );
}

/**
 * A chapter of the tour: the avatar beside it says `say` and reacts with `react` as it arrives (see
 * AboutGuide). On phones, where the avatar sits in a corner, the line shows above the chapter instead.
 */
function Chapter({
  id,
  title,
  say,
  react,
  children,
}: {
  id: string;
  title: string;
  say: string;
  react: "nod" | "wink" | "laugh" | "doubletake";
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      data-chapter
      data-title={title}
      data-say={say}
      data-react={react}
      className="py-20 md:py-28"
    >
      <p className="mb-6 text-lg font-medium text-muted lg:hidden">“{say}”</p>
      {children}
    </section>
  );
}

function ChapterTitle({ id, top, bottom }: { id: string; top: string; bottom: string }) {
  return (
    <h2 id={`${id}-title`} className="font-display text-5xl leading-[0.9] font-bold tracking-[-0.04em] uppercase md:text-7xl">
      {top}
      <br />
      <span className="text-spectrum animate-shimmer">{bottom}</span>
    </h2>
  );
}

export default function AboutPage() {
  return (
    <>
      <Cursor />
      <Nav />
      <main id="top">
        {/* Hello */}
        {/* On wide screens the hero pins in place and the page rises over it like a sheet, while the hero
            shrinks, dims and splits its headline apart (driven by HeroRecede) */}
        <section className="hero-recede relative flex min-h-[100svh] flex-col overflow-hidden px-4 pt-32 pb-10 md:px-10 md:pb-12 lg:sticky lg:top-0 lg:h-[100svh]">
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
          {/* The glow fades out into the page, so the hero doesn't end in a hard edge */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-b from-transparent to-bg" />
          {/* Darkens as the page rises over it */}
          <div aria-hidden className="hero-dim pointer-events-none absolute inset-0 z-10 bg-bg" />

          <Kicker>About</Kicker>
          <h1 className="relative mt-8 font-display leading-[0.84] font-bold tracking-[-0.055em] uppercase">
            <span className="hero-split-left reveal block text-[17vw] md:text-[13vw] lg:text-[10vw]">
              <span className="animate-rise block">Hi, I&apos;m</span>
            </span>
            <span className="hero-split-right reveal block text-[17vw] md:text-[13vw] lg:text-[10vw]">
              <span className="text-spectrum animate-shimmer animate-rise block" style={{ animationDelay: "110ms" }}>
                Ahmed.
              </span>
            </span>
          </h1>

          {/* Where the 3D me starts: between the name and the intro on phones, beside the name on wide screens */}
          <div
            data-avatar-slot="hero"
            aria-hidden
            className="relative mx-auto mt-8 aspect-[4/5] w-[min(84vw,26rem)] lg:absolute lg:top-[9vh] lg:right-[4vw] lg:mt-0 lg:w-[min(34vw,52vh)]"
          />

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

        <HeroRecede />
        {/* The tour, on a sheet that rises over the hero: the avatar's column on the left, the chapters beside it */}
        <div className="relative z-10 -mt-10 rounded-t-[40px] bg-bg px-4 pt-6 shadow-[0_-40px_80px_-30px_rgb(0_0_0/0.9)] md:-mt-16 md:rounded-t-[64px] md:px-10 lg:mt-0 lg:grid lg:grid-cols-12 lg:gap-10">
          <AboutGuide />
          <div className="lg:col-span-8">
            <Chapter id="story" title="The story" say="Here's how it started." react="nod">
              <ChapterTitle id="story" top="The short" bottom="version" />
              <ol className="mt-12">
                {STORY.map((step, i) => (
                  <li
                    key={step.when}
                    className="grid gap-3 border-t border-line py-8 md:grid-cols-8 md:gap-8 md:py-10"
                    style={{ "--c": STORY_COLORS[i] } as React.CSSProperties}
                  >
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
            </Chapter>

            <Chapter id="work" title="How I work" say="What I actually do." react="wink">
              <ChapterTitle id="work" top="How I" bottom="work" />
              <div className="mt-12">
                {PROCESS.map((step) => {
                  const color = DISCIPLINE_COLOR[step.name];
                  return (
                    <div key={step.verb} className="grid gap-4 border-t border-line py-10 md:grid-cols-8 md:gap-8">
                      <h3 className="font-display text-5xl leading-none font-bold tracking-[-0.05em] uppercase md:col-span-3 md:text-[clamp(2rem,3.3vw,3.5rem)]" style={{ color }}>
                        {step.verb}
                      </h3>
                      <div className="md:col-span-5">
                        <p className="font-display text-2xl font-semibold tracking-[-0.02em] md:text-3xl">{step.line}</p>
                        <p className="mt-3 text-lg leading-relaxed text-muted">{step.body}</p>
                        <ul className="mt-6 flex flex-wrap gap-2">
                          {step.kit.map((item) => (
                            <li key={item} className="rounded-full bg-surface px-4 py-2 text-sm font-medium">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Chapter>

            <Chapter id="clock" title="Off the clock" say="Gooner for life." react="laugh">
              <ChapterTitle id="clock" top="Off the" bottom="clock" />
              <ul className="mt-16 grid gap-4 md:grid-cols-2">
                {PASSIONS.map((passion, i) => (
                  <PassionCard key={passion.title} index={i} {...passion} />
                ))}
              </ul>
            </Chapter>

            <Chapter id="ask" title="Ask me anything" say="Go on, ask me something." react="nod">
              <ChapterTitle id="ask" top="Ask me" bottom="anything" />
              <AskMeAnything />
            </Chapter>

            <Chapter id="quote" title="Words I go by" say="The one I keep coming back to." react="nod">
              <h2 id="quote-title" className="sr-only">
                Words I go by
              </h2>
              <figure>
                <blockquote>
                  <ScrollWords
                    className="font-display text-[11vw] leading-[0.92] font-bold tracking-[-0.05em] uppercase md:text-[5.6vw]"
                    segments={[{ text: "“It always seems" }, { text: "impossible", color: "var(--violet)" }, { text: "until it’s done.”" }]}
                  />
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3 text-lg font-medium text-muted">
                  <span aria-hidden className="h-px w-10" style={{ background: "var(--spectrum)" }} />
                  {QUOTE.by}
                </figcaption>
              </figure>
            </Chapter>
          </div>
        </div>
        {/* Where the tour ends; on phones the docked avatar bows out here */}
        <div data-avatar-end aria-hidden />

        {/* On phones the avatar docks in this corner */}
        <div data-avatar-slot="dock" aria-hidden className="pointer-events-none fixed right-4 bottom-4 aspect-[4/5] w-[84px] lg:hidden" />
        <AvatarFrame />
      </main>
      <Contact />
    </>
  );
}
