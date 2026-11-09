import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import BeltSignature from "@/components/case/BeltSignature";
import BlipSignature from "@/components/case/BlipSignature";
import CaseBlocks from "@/components/case/CaseBlocks";
import DiveSignature from "@/components/case/DiveSignature";
import OrbitSignature from "@/components/case/OrbitSignature";
import PulseSignature from "@/components/case/PulseSignature";
import SparkSignature from "@/components/case/SparkSignature";
import SpiralSignature from "@/components/case/SpiralSignature";
import SprintSignature from "@/components/case/SprintSignature";
import ToolLogo from "@/components/case/ToolLogo";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import JsonLd from "@/components/JsonLd";
import Nav from "@/components/Nav";
import { ProjectCard } from "@/components/work/ProjectCard";
import WorkLink from "@/components/work/WorkLink";
import { casesFor, disciplineLabel, kindLabel, siteFor } from "@/content";
import { CASES } from "@/content/cases";
import { COVER_HEIGHT, COVER_WIDTH, DISCIPLINE_COLOR, type Project } from "@/content/site";
import { localePath, type Lang } from "@/i18n/lang";
import { ui } from "@/i18n/ui";
import { fitLetters } from "@/lib/fit";
import { absoluteUrl, breadcrumbs, PERSON_ID, pageMetadata, WEBSITE_ID } from "@/lib/seo";

/** Every case study, the same in both languages */
export function caseStaticParams() {
  return CASES.map(({ slug }) => ({ slug }));
}

type Props = { lang: Lang; params: Promise<{ slug: string }> };

export async function caseMetadata({ lang, params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = siteFor(lang).PROJECTS.find((p) => p.slug === slug);
  if (!project || !casesFor(lang).caseFor(slug)) return {};
  return pageMetadata({
    title: project.name,
    description: project.summary,
    path: `/work/${slug}`,
    lang,
    // The project's own cover makes a truer share card than the generic one
    image: project.cover
      ? { url: project.cover, width: COVER_WIDTH, height: COVER_HEIGHT, alt: `${project.name}, ${kindLabel(lang, project.kind)}`, type: "image/webp" }
      : undefined,
  });
}

/** The case study as a creative work by Ahmed, with where it sits in the site */
function caseJsonLd(project: Project, lang: Lang) {
  const path = `/work/${project.slug}`;
  const url = absoluteUrl(localePath(lang, path));
  return [
    {
      "@type": "CreativeWork",
      "@id": `${url}#work`,
      name: project.name,
      headline: `${project.name}: ${kindLabel(lang, project.kind)}`,
      description: project.summary,
      url,
      ...(project.cover ? { image: absoluteUrl(project.cover) } : {}),
      genre: kindLabel(lang, project.kind),
      keywords: project.disciplines.map((d) => disciplineLabel(lang, d)).join(", "),
      dateCreated: project.year,
      inLanguage: lang,
      creator: { "@id": PERSON_ID },
      isPartOf: { "@id": WEBSITE_ID },
    },
    breadcrumbs(
      [
        { name: ui(lang).nav.work, path: "/work" },
        { name: project.name, path },
      ],
      lang,
    ),
  ];
}

// The frame (nav, footer) renders straight away; the case itself reads the URL, so it streams in
// behind a boundary and page-to-page navigation stays instant.

/** Text that reads on the accent: near-black on a light accent (ORBS cyan, Spark lime), white on a dark one (Anubis red) */
function inkOn(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.3 ? "#0a0a0d" : "#ffffff";
}

export default function CaseView({ lang, params }: Props) {
  return (
    <>
      <Cursor />
      <Nav />
      <Suspense fallback={<main id="top" className="min-h-[100svh]" />}>
        <CaseStudy lang={lang} params={params} />
      </Suspense>
      <Contact lang={lang} />
    </>
  );
}

async function CaseStudy({ lang, params }: Props) {
  const { slug } = await params;
  const { PROJECTS } = siteFor(lang);
  const study = casesFor(lang).caseFor(slug);
  const t = ui(lang);
  const index = PROJECTS.findIndex((p) => p.slug === slug);
  const project = PROJECTS[index];
  if (!study || !project) notFound();

  // Keep exploring: the next few projects, wrapping around
  const more = [1, 2, 3].map((k) => PROJECTS[(index + k) % PROJECTS.length]).filter((p) => p.slug !== slug);

  return (
    <main
      id="top"
      // On wide screens the right margin is kept clear for a signature's side instruments (e.g. the dive gauge;
      // the belt's upright rank card and the sprint's stopwatch need a little more)
      className={`case relative isolate ${study.signature === "spiral" ? "md:pr-28" : study.signature === "belt" ? "md:pr-20" : study.signature === "sprint" || study.signature === "spark" || study.signature === "orbit" ? "md:pr-24" : study.signature ? "md:pr-14" : ""}`}
      style={{ "--accent": study.accent[0], "--accent-2": study.accent[1], "--accent-ink": inkOn(study.accent[1]) } as React.CSSProperties}
    >
      <JsonLd graph={caseJsonLd(project, lang)} />
      {study.signature === "dive" ? (
        <DiveSignature />
      ) : study.signature === "pulse" ? (
        <PulseSignature />
      ) : study.signature === "blip" ? (
        <BlipSignature />
      ) : study.signature === "belt" ? (
        <BeltSignature />
      ) : study.signature === "sprint" ? (
        <SprintSignature />
      ) : study.signature === "spark" ? (
        <SparkSignature />
      ) : study.signature === "spiral" ? (
        <SpiralSignature />
      ) : study.signature === "orbit" ? (
        <OrbitSignature />
      ) : null}

      {/* Opener */}
      <section className="@container relative px-4 pt-32 pb-16 md:px-10 md:pt-40 md:pb-24">
        <Link href={localePath(lang, "/work")} className="text-sm font-semibold text-muted transition-colors hover:text-ink">
          <span aria-hidden className="arrow">←</span> {t.common.allWork}
        </Link>
        <p className="mt-10 flex flex-wrap items-center gap-3 text-sm font-semibold text-muted">
          <span aria-hidden className="h-px w-10" style={{ background: "var(--accent-2)" }} />
          {kindLabel(lang, project.kind)} · {project.year}
        </p>
        {/* As big as the screen allows, shrinking only as far as its longest word needs to fit */}
        <h1
          className="fit-heading mt-6 font-display leading-[0.84] font-bold uppercase [--fit-max:15.5vw] md:[--fit-max:13vw]"
          style={fitLetters(project.name)}
        >
          <span className="reveal block">
            <span className="animate-rise block">{project.name}</span>
          </span>
        </h1>
        <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-2xl text-xl leading-snug font-medium text-muted md:text-2xl">{project.summary}</p>
          {study.site ? (
            <a
              href={study.site}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex w-fit shrink-0 items-center gap-3 rounded-full bg-ink py-2 pe-2 ps-6 text-base font-semibold text-bg transition-transform duration-300 hover:scale-[1.04]"
            >
              <span>
                {t.caseStudy.visit}<span className="sr-only">{t.common.newTab}</span>
              </span>
              <span
                aria-hidden
                className="grid size-10 place-items-center rounded-full text-white transition-transform duration-500 group-hover:rotate-45 rtl:group-hover:-rotate-45"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
              >
                <span className="arrow">↗</span>
              </span>
            </a>
          ) : null}
        </div>

        {/* Snapshot */}
        <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8 md:mt-20 md:grid-cols-4">
          {study.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-sm font-semibold text-muted">{fact.label}</dt>
              <dd className="mt-3 text-lg font-semibold md:text-xl">
                {fact.tools ? (
                  // The stack as its own logos, with the names kept for screen readers and tooltips
                  <span className="flex flex-wrap gap-2">
                    <span className="sr-only">{fact.value}</span>
                    {fact.tools.map((tool) => (
                      <span key={tool} title={tool}>
                        <ToolLogo name={tool} className="size-11 rounded-xl" />
                      </span>
                    ))}
                  </span>
                ) : fact.logo ? (
                  // Stacked until the columns are wide, so a wide logo never pushes the name into the next column
                  <span className="flex flex-col items-start gap-2 xl:flex-row xl:items-center xl:gap-3">
                    {/* White, as in the clients carousel */}
                    <Image
                      src={fact.logo.src}
                      alt=""
                      width={fact.logo.width}
                      height={fact.logo.height}
                      unoptimized
                      className="h-9 w-auto max-w-full object-contain object-left brightness-0 invert"
                    />
                    {fact.value}
                  </span>
                ) : (
                  fact.value
                )}
              </dd>
            </div>
          ))}
        </dl>
        <ul className="mt-8 flex flex-wrap gap-2">
          {project.disciplines.map((d) => (
            <li
              key={d}
              className="rounded-full border px-4 py-1.5 text-sm font-semibold"
              style={{ color: DISCIPLINE_COLOR[d], borderColor: `color-mix(in srgb, ${DISCIPLINE_COLOR[d]} 40%, transparent)` }}
            >
              {disciplineLabel(lang, d)}
            </li>
          ))}
        </ul>
      </section>

      <CaseBlocks blocks={study.blocks} lang={lang} />

      {/* Keep exploring */}
      <section aria-labelledby="more-title" className="@container px-4 pt-24 pb-8 md:px-10 md:pt-40">
        <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
          <h2 id="more-title" className="fit-heading font-display leading-[0.9] font-bold uppercase [--fit-max:3rem] md:[--fit-max:4.5rem]" style={fitLetters(`${t.caseStudy.keep} ${t.caseStudy.exploring}`)}>
            {t.caseStudy.keep}
            <br />
            <span className="text-spectrum animate-shimmer">{t.caseStudy.exploring}</span>
          </h2>
          <WorkLink href="/work" lang={lang}>
            {t.common.allWork}
          </WorkLink>
        </div>
        <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
          {more.map((p) => (
            <li key={p.slug}>
              <ProjectCard project={p} lang={lang} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
