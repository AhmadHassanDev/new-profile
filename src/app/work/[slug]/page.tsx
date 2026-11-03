import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import BeltSignature from "@/components/case/BeltSignature";
import BlipSignature from "@/components/case/BlipSignature";
import CaseBlocks from "@/components/case/CaseBlocks";
import DiveSignature from "@/components/case/DiveSignature";
import PulseSignature from "@/components/case/PulseSignature";
import ToolLogo from "@/components/case/ToolLogo";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import JsonLd from "@/components/JsonLd";
import Nav from "@/components/Nav";
import { ProjectCard } from "@/components/work/ProjectCard";
import WorkLink from "@/components/work/WorkLink";
import { CASES, caseFor } from "@/content/cases";
import { COVER_HEIGHT, COVER_WIDTH, DISCIPLINE_COLOR, type Project, PROJECTS } from "@/content/site";
import { absoluteUrl, breadcrumbs, PERSON_ID, pageMetadata, WEBSITE_ID } from "@/lib/seo";

const longestWord = (name: string) => Math.max(...name.split(/\s+/).map((word) => word.length));

export function generateStaticParams() {
  return CASES.map(({ slug }) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project || !caseFor(slug)) return {};
  return pageMetadata({
    title: project.name,
    description: project.summary,
    path: `/work/${slug}`,
    // The project's own cover makes a truer share card than the generic one
    image: project.cover
      ? { url: project.cover, width: COVER_WIDTH, height: COVER_HEIGHT, alt: `${project.name}, ${project.kind}`, type: "image/webp" }
      : undefined,
  });
}

/** The case study as a creative work by Ahmed, with where it sits in the site */
function caseJsonLd(project: Project) {
  const path = `/work/${project.slug}`;
  return [
    {
      "@type": "CreativeWork",
      "@id": `${absoluteUrl(path)}#work`,
      name: project.name,
      headline: `${project.name}: ${project.kind}`,
      description: project.summary,
      url: absoluteUrl(path),
      ...(project.cover ? { image: absoluteUrl(project.cover) } : {}),
      genre: project.kind,
      keywords: project.disciplines.join(", "),
      dateCreated: project.year,
      inLanguage: "en",
      creator: { "@id": PERSON_ID },
      isPartOf: { "@id": WEBSITE_ID },
    },
    breadcrumbs([
      { name: "Work", path: "/work" },
      { name: project.name, path },
    ]),
  ];
}

// The frame (nav, footer) renders straight away; the case itself reads the URL, so it streams in
// behind a boundary and page-to-page navigation stays instant.
export default function CasePage({ params }: Props) {
  return (
    <>
      <Cursor />
      <Nav />
      <Suspense fallback={<main id="top" className="min-h-[100svh]" />}>
        <CaseStudy params={params} />
      </Suspense>
      <Contact />
    </>
  );
}

async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  const study = caseFor(slug);
  const index = PROJECTS.findIndex((p) => p.slug === slug);
  const project = PROJECTS[index];
  if (!study || !project) notFound();

  // Keep exploring: the next few projects, wrapping around
  const more = [1, 2, 3].map((k) => PROJECTS[(index + k) % PROJECTS.length]).filter((p) => p.slug !== slug);

  return (
    <main
      id="top"
      // On wide screens the right margin is kept clear for a signature's side instruments (e.g. the dive gauge;
      // the belt and its upright rank card need a little more)
      className={`case relative isolate ${study.signature === "belt" ? "md:pr-20" : study.signature ? "md:pr-14" : ""}`}
      style={{ "--accent": study.accent[0], "--accent-2": study.accent[1] } as React.CSSProperties}
    >
      <JsonLd graph={caseJsonLd(project)} />
      {study.signature === "dive" ? (
        <DiveSignature />
      ) : study.signature === "pulse" ? (
        <PulseSignature />
      ) : study.signature === "blip" ? (
        <BlipSignature />
      ) : study.signature === "belt" ? (
        <BeltSignature />
      ) : null}

      {/* Opener */}
      <section className="relative px-4 pt-32 pb-16 md:px-10 md:pt-40 md:pb-24">
        <Link href="/work" className="text-sm font-semibold text-muted transition-colors hover:text-ink">
          <span aria-hidden>←</span> All work
        </Link>
        <p className="mt-10 flex flex-wrap items-center gap-3 text-sm font-semibold text-muted">
          <span aria-hidden className="h-px w-10" style={{ background: "var(--accent-2)" }} />
          {project.kind} · {project.year}
        </p>
        {/* A name with a long word shrinks until that word fits the width (the display face runs ~0.9em a letter) */}
        <h1
          className="mt-6 font-display text-[15.5vw] leading-[0.84] font-bold tracking-[-0.055em] uppercase md:text-[13vw]"
          style={longestWord(project.name) > 7 ? { fontSize: `min(13vw, calc((100vw - 2rem) / ${(longestWord(project.name) * 0.9).toFixed(2)}))` } : undefined}
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
              className="group inline-flex w-fit shrink-0 items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-6 text-base font-semibold text-bg transition-transform duration-300 hover:scale-[1.04]"
            >
              <span>
                Visit website<span className="sr-only"> (opens in a new tab)</span>
              </span>
              <span
                aria-hidden
                className="grid size-10 place-items-center rounded-full text-white transition-transform duration-500 group-hover:rotate-45"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
              >
                ↗
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
                  // Stacked on phones, so a wide logo never pushes the name into the next column
                  <span className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                    {/* White, as in the clients carousel */}
                    <Image
                      src={fact.logo.src}
                      alt=""
                      width={fact.logo.width}
                      height={fact.logo.height}
                      unoptimized
                      className="h-9 w-auto max-w-full brightness-0 invert"
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
              {d}
            </li>
          ))}
        </ul>
      </section>

      <CaseBlocks blocks={study.blocks} />

      {/* Keep exploring */}
      <section aria-labelledby="more-title" className="px-4 pt-24 pb-8 md:px-10 md:pt-40">
        <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
          <h2 id="more-title" className="font-display text-5xl leading-[0.9] font-bold tracking-[-0.04em] uppercase md:text-7xl">
            Keep
            <br />
            <span className="text-spectrum animate-shimmer">exploring</span>
          </h2>
          <WorkLink href="/work">All work</WorkLink>
        </div>
        <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
          {more.map((p) => (
            <li key={p.slug}>
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
