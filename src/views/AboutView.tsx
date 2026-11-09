import AboutGuide from "@/components/about/AboutGuide";
import AskMeAnything from "@/components/about/AskMeAnything";
import AvatarFrame from "@/components/about/AvatarFrame";
import HeroRecede from "@/components/about/HeroRecede";
import PassionCard from "@/components/about/PassionCard";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import JsonLd from "@/components/JsonLd";
import Nav from "@/components/Nav";
import ScrollWords from "@/components/ScrollWords";
import SocialIcon from "@/components/SocialIcon";
import { siteFor } from "@/content";
import { DISCIPLINE_COLOR } from "@/content/site";
import type { Lang } from "@/i18n/lang";
import { ui } from "@/i18n/ui";
import { fitLetters } from "@/lib/fit";
import { breadcrumbs, nameIn, PERSON_ID, webPage } from "@/lib/seo";

export const ABOUT_DESCRIPTION = {
  en: "Ahmed Hassan is an Egyptian designer and front-end developer: a computer science graduate who researches, designs and builds digital products.",
  ar: "أحمد حسن مصمم ومطوّر فرونت إند مصري، خريج علوم حاسب، بيفهم المستخدم وبيصمم وبيبني المنتجات الرقمية بنفسه.",
};

// The person itself is described once, in the root layout; this page is its profile
const jsonLd = (lang: Lang) => [
  {
    ...webPage("ProfilePage", { path: "/about", name: `${ui(lang).nav.about} — ${nameIn(lang)}`, description: ABOUT_DESCRIPTION[lang], lang }),
    mainEntity: { "@id": PERSON_ID },
  },
  breadcrumbs([{ name: ui(lang).nav.about, path: "/about" }], lang),
];

const FACT_VALUES = ["6+", "60+", "5+", "’21"];

// The word in the quote that lights up violet
const QUOTE_HIGHLIGHT: Record<Lang, string> = { en: "impossible", ar: "مستحيل" };

// Arabic quotes with guillemets
const QUOTE_MARKS: Record<Lang, [string, string]> = { en: ["“", "”"], ar: ["«", "»"] };

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
  lang,
  children,
}: {
  id: string;
  title: string;
  say: string;
  react: "nod" | "wink" | "laugh" | "doubletake";
  lang: Lang;
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
      <p className="mb-6 text-lg font-medium text-muted lg:hidden">{QUOTE_MARKS[lang][0]}{say}{QUOTE_MARKS[lang][1]}</p>
      {children}
    </section>
  );
}

/** The quote, curly-quoted, with one word in violet (the whole quote plain if the word isn't in it) */
function quoteSegments(text: string, highlight: string, lang: Lang) {
  const quoted = lang === "ar" ? `«${text}»` : `“${text.replace("'", "’")}”`;
  if (!quoted.includes(highlight)) return [{ text: quoted }];
  const [before, after] = quoted.split(highlight);
  return [{ text: before.trim() }, { text: highlight, color: "var(--violet)" }, { text: after.trim() }];
}

function ChapterTitle({ id, top, bottom }: { id: string; top: string; bottom: string }) {
  return (
    <div className="@container">
      <h2 id={`${id}-title`} className="fit-heading font-display leading-[0.9] font-bold uppercase [--fit-max:3rem] md:[--fit-max:4.5rem]" style={fitLetters(top, bottom)}>
        {top}
        <br />
        <span className="text-spectrum animate-shimmer">{bottom}</span>
      </h2>
    </div>
  );
}

export default function AboutView({ lang }: { lang: Lang }) {
  const { CV, PASSIONS, PROCESS, QUOTE, STORY } = siteFor(lang);
  const t = ui(lang).aboutPage;
  const c = t.chapters;
  return (
    <>
      <JsonLd graph={jsonLd(lang)} />
      <Cursor />
      <Nav />
      <main id="top">
        {/* Hello */}
        {/* On wide screens the hero pins in place and the page rises over it like a sheet, while the hero
            shrinks, dims and splits its headline apart (driven by HeroRecede) */}
        <section className="hero-recede relative flex min-h-[100svh] flex-col overflow-hidden px-4 pt-32 pb-20 md:px-10 md:pb-28 lg:sticky lg:top-0 lg:h-[100svh] lg:pb-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-1/4 -end-1/4 h-[90vmax] w-[90vmax] rounded-full opacity-25 blur-[140px]"
            style={{ background: "var(--spectrum)" }}
          />
          <span
            aria-hidden
            className="text-spectrum animate-shimmer pointer-events-none absolute -top-[8vh] end-[2vw] hidden font-display text-[length:calc((120vh)*var(--ds))] leading-none font-bold opacity-[0.08] md:block"
          >
            /
          </span>
          {/* The glow fades out into the page, so the hero doesn't end in a hard edge */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-b from-transparent to-bg" />
          {/* Darkens as the page rises over it */}
          <div aria-hidden className="hero-dim pointer-events-none absolute inset-0 z-10 bg-bg" />

          <Kicker>{t.kicker}</Kicker>
          <h1 className="relative mt-8 font-display leading-[0.84] font-bold uppercase">
            <span className="hero-split-left reveal block text-[length:calc((17vw)*var(--ds))] md:text-[length:calc((13vw)*var(--ds))] lg:text-[length:calc((10vw)*var(--ds))]">
              <span className="animate-rise block">{t.hi}</span>
            </span>
            <span className="hero-split-right reveal block text-[length:calc((17vw)*var(--ds))] md:text-[length:calc((13vw)*var(--ds))] lg:text-[length:calc((10vw)*var(--ds))]">
              <span className="text-spectrum animate-shimmer animate-rise block" style={{ animationDelay: "110ms" }}>
                {t.name}
              </span>
            </span>
          </h1>

          {/* Where the 3D me starts: between the name and the intro on phones, beside the name on wide screens */}
          <div
            data-avatar-slot="hero"
            aria-hidden
            className="relative mx-auto -mt-2 aspect-[4/5] w-[min(84vw,26rem)] lg:absolute lg:end-[4vw] lg:top-[9vh] lg:mt-0 lg:w-[min(34vw,52vh)]"
          />

          <div className="relative mt-auto grid gap-10 pt-16 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-5">
              <p className="max-w-xl text-xl leading-snug font-medium text-muted md:text-2xl">
                {t.lead}
                <span className="text-ink">{t.leadTail}</span>
              </p>
              {/* The whole career on two pages, for anyone hiring */}
              <a
                href={CV.href}
                download={CV.file}
                className="group mt-8 inline-flex items-center gap-3 rounded-full bg-ink py-3 pe-6 ps-3 font-semibold text-bg transition-transform duration-300 hover:scale-[1.03]"
              >
                <span className="grid size-9 place-items-center rounded-full" style={{ background: "var(--spectrum)" }}>
                  <SocialIcon name="Download" className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                </span>
                {t.downloadCv}
                <span className="text-sm font-medium opacity-60">{CV.note}</span>
              </a>
            </div>
            <dl className="grid grid-cols-4 md:flex lg:col-span-7 lg:justify-end">
              {t.facts.map((label, i) => (
                <div key={label} className={`@container flex flex-col-reverse gap-1 md:[container-type:normal] md:pe-10 md:last:pe-0 lg:pe-14 ${i > 0 ? "border-s border-line ps-3 md:ps-10 lg:ps-14" : ""}`}>
                  <dt className="text-xs font-medium text-muted md:text-sm">{label}</dt>
                  <dd dir="ltr" className="rtl:text-right font-display text-[length:calc((min(1.5rem,40cqw))*var(--ds))] leading-none font-bold md:text-[length:calc((min(2.25rem,40cqw))*var(--ds))] lg:text-[length:calc((min(3rem,40cqw))*var(--ds))]">{FACT_VALUES[i]}</dd>
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
            <Chapter id="story" title={c.story.title} say={c.story.say} react="nod" lang={lang}>
              <ChapterTitle id="story" top={c.story.top} bottom={c.story.bottom} />
              <ol className="mt-12">
                {STORY.map((step, i) => (
                  <li
                    key={step.when}
                    className="grid gap-3 border-t border-line py-8 md:grid-cols-8 md:gap-8 md:py-10"
                    style={{ "--c": STORY_COLORS[i] } as React.CSSProperties}
                  >
                    <p className="font-display text-4xl leading-none font-bold text-[var(--c)] md:col-span-3 md:text-5xl">
                      {step.when}
                    </p>
                    <div className="md:col-span-5">
                      <h3 className="font-display text-2xl font-semibold md:text-3xl">{step.title}</h3>
                      <p className="mt-3 text-lg leading-relaxed text-muted">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Chapter>

            <Chapter id="work" title={c.work.title} say={c.work.say} react="wink" lang={lang}>
              <ChapterTitle id="work" top={c.work.top} bottom={c.work.bottom} />
              <div className="mt-12">
                {PROCESS.map((step) => {
                  const color = DISCIPLINE_COLOR[step.name];
                  return (
                    <div key={step.verb} className="grid gap-4 border-t border-line py-10 md:grid-cols-8 md:gap-8">
                      <div className="@container md:col-span-3">
                        <h3
                          className="fit-heading font-display leading-none font-bold uppercase [--fit-max:3rem] md:[--fit-max:3.5rem]"
                          style={{ color, ...fitLetters(step.verb) }}
                        >
                          {step.verb}
                        </h3>
                      </div>
                      <div className="md:col-span-5">
                        <p className="font-display text-2xl font-semibold md:text-3xl">{step.line}</p>
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

            <Chapter id="clock" title={c.clock.title} say={c.clock.say} react="laugh" lang={lang}>
              <ChapterTitle id="clock" top={c.clock.top} bottom={c.clock.bottom} />
              <ul className="mt-16 grid gap-4 md:grid-cols-2">
                {PASSIONS.map((passion, i) => (
                  <PassionCard key={passion.title} index={i} {...passion} />
                ))}
              </ul>
            </Chapter>

            <Chapter id="ask" title={c.ask.title} say={c.ask.say} react="nod" lang={lang}>
              <ChapterTitle id="ask" top={c.ask.top} bottom={c.ask.bottom} />
              <AskMeAnything />
            </Chapter>

            <Chapter id="quote" title={c.quote.title} say={c.quote.say} react="nod" lang={lang}>
              <h2 id="quote-title" className="sr-only">
                {c.quote.title}
              </h2>
              <figure>
                <blockquote>
                  <ScrollWords
                    className="font-display text-[length:calc((11vw)*var(--ds))] leading-[0.92] font-bold uppercase md:text-[length:calc((5.6vw)*var(--ds))]"
                    segments={quoteSegments(QUOTE.text, QUOTE_HIGHLIGHT[lang], lang)}
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
      <Contact lang={lang} />
    </>
  );
}
