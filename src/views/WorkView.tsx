import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import JsonLd from "@/components/JsonLd";
import Nav from "@/components/Nav";
import Work from "@/components/Work";
import WorkIndex from "@/components/work/WorkIndex";
import WorkLink from "@/components/work/WorkLink";
import { casesFor, kindLabel, siteFor } from "@/content";
import { localePath, type Lang } from "@/i18n/lang";
import { ui } from "@/i18n/ui";
import { absoluteUrl, breadcrumbs, nameIn, PERSON_ID, webPage } from "@/lib/seo";

export const WORK_DESCRIPTION = {
  en: "Projects by Ahmed Hassan: UX research, UI design and front-end development for apps, platforms and websites.",
  ar: "مشاريع أحمد حسن: أبحاث مستخدم، تصميم واجهات وتطوير فرونت إند لتطبيقات ومنصات ومواقع.",
};

/** Every published project, linked to its case study where there is one */
function jsonLd(lang: Lang) {
  const { PROJECTS } = siteFor(lang);
  const { caseFor } = casesFor(lang);
  const t = ui(lang);
  return [
    {
      ...webPage("CollectionPage", { path: "/work", name: `${t.nav.work} — ${nameIn(lang)}`, description: WORK_DESCRIPTION[lang], lang }),
      mainEntity: {
        "@type": "ItemList",
        itemListElement: PROJECTS.map((project, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "CreativeWork",
            name: project.name,
            description: project.summary,
            genre: kindLabel(lang, project.kind),
            creator: { "@id": PERSON_ID },
            ...(caseFor(project.slug) ? { url: absoluteUrl(localePath(lang, `/work/${project.slug}`)) } : {}),
          },
        })),
      },
    },
    breadcrumbs([{ name: t.nav.work, path: "/work" }], lang),
  ];
}

export default function WorkView({ lang }: { lang: Lang }) {
  const t = ui(lang);
  return (
    <>
      <JsonLd graph={jsonLd(lang)} />
      <Cursor />
      <Nav />
      <main id="top">
        <Work
          as="h1"
          title={t.work.allTitle}
          vignette
          scrollCue
          listedBelow
          action={
            <WorkLink href="#projects" arrow="↓" lang={lang}>
              {t.work.browse}
            </WorkLink>
          }
        />
        <WorkIndex />
      </main>
      <Contact lang={lang} />
    </>
  );
}
