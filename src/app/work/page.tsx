import type { Metadata } from "next";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import JsonLd from "@/components/JsonLd";
import Nav from "@/components/Nav";
import Work from "@/components/Work";
import WorkIndex from "@/components/work/WorkIndex";
import WorkLink from "@/components/work/WorkLink";
import { caseFor } from "@/content/cases";
import { PROJECTS } from "@/content/site";
import { absoluteUrl, breadcrumbs, PERSON_ID, pageMetadata, webPage } from "@/lib/seo";

const DESCRIPTION = "Projects by Ahmed Hassan: UX research, UI design and front-end development for apps, platforms and websites.";

export const metadata: Metadata = pageMetadata({ title: "Work", description: DESCRIPTION, path: "/work" });

// Every published project, linked to its case study where there is one
const JSON_LD = [
  {
    ...webPage("CollectionPage", { path: "/work", name: "Work — Ahmed Hassan", description: DESCRIPTION }),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: PROJECTS.map((project, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "CreativeWork",
          name: project.name,
          description: project.summary,
          genre: project.kind,
          creator: { "@id": PERSON_ID },
          ...(caseFor(project.slug) ? { url: absoluteUrl(`/work/${project.slug}`) } : {}),
        },
      })),
    },
  },
  breadcrumbs([{ name: "Work", path: "/work" }]),
];

export default function WorkPage() {
  return (
    <>
      <JsonLd graph={JSON_LD} />
      <Cursor />
      <Nav />
      <main id="top">
        <Work
          as="h1"
          title={["All", "work"]}
          vignette
          scrollCue
          listedBelow
          action={
            <WorkLink href="#projects" arrow="↓">
              Browse &amp; filter
            </WorkLink>
          }
        />
        <WorkIndex />
      </main>
      <Contact />
    </>
  );
}
