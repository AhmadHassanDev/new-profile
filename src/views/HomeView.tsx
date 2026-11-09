import About from "@/components/About";
import Clients from "@/components/Clients";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import Hero from "@/components/Hero";
import JsonLd from "@/components/JsonLd";
import Loader from "@/components/Loader";
import Marquee from "@/components/Marquee";
import Nav from "@/components/Nav";
import Services from "@/components/Services";
import Work from "@/components/Work";
import WorkLink from "@/components/work/WorkLink";
import { siteFor } from "@/content";
import type { Lang } from "@/i18n/lang";
import { ui } from "@/i18n/ui";
import { AR, absoluteUrl, NAME, PERSON_ID, SITE_DESCRIPTION, SITE_TITLE, SITE_URL, webPage } from "@/lib/seo";

/** What Ahmed offers, as a service run by the person in the root layout's structured data */
function service(lang: Lang) {
  return {
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#service`,
    name: NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    image: absoluteUrl("/opengraph-image"),
    founder: { "@id": PERSON_ID },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services",
      itemListElement: siteFor(lang).SERVICES.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title, provider: { "@id": PERSON_ID } },
      })),
    },
  };
}

export default function HomeView({ lang }: { lang: Lang }) {
  const title = lang === "ar" ? AR.title : SITE_TITLE;
  const description = lang === "ar" ? AR.description : SITE_DESCRIPTION;
  return (
    <>
      <JsonLd graph={[{ ...webPage("WebPage", { path: "/", name: title, description, lang }), about: { "@id": PERSON_ID } }, service(lang)]} />
      <Loader />
      <Cursor />
      <Nav />
      <main id="top">
        <Hero />
        <Clients />
        <Marquee lang={lang} />
        <Work action={<WorkLink href="/work" lang={lang}>{ui(lang).common.allWork}</WorkLink>} />
        <About />
        <Services />
      </main>
      <Contact lang={lang} />
    </>
  );
}
