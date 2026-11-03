import type { Metadata } from "next";
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
import { SERVICES } from "@/content/site";
import { absoluteUrl, NAME, PERSON_ID, SITE_DESCRIPTION, SITE_TITLE, SITE_URL, pageMetadata, webPage } from "@/lib/seo";

// Keeps the site's default title, untouched by the template
export const metadata: Metadata = pageMetadata({ description: SITE_DESCRIPTION, path: "/" });

// What Ahmed offers, as a service run by the person in the root layout's structured data
const SERVICE = {
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
    itemListElement: SERVICES.map((service) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: service.title, provider: { "@id": PERSON_ID } },
    })),
  },
};

export default function Home() {
  return (
    <>
      <JsonLd
        graph={[{ ...webPage("WebPage", { path: "/", name: SITE_TITLE, description: SITE_DESCRIPTION }), about: { "@id": PERSON_ID } }, SERVICE]}
      />
      <Loader />
      <Cursor />
      <Nav />
      <main id="top">
        <Hero />
        <Clients />
        <Marquee />
        <Work
          action={
            <WorkLink href="/work">
              All work
            </WorkLink>
          }
        />
        <About />
        <Services />
      </main>
      <Contact />
    </>
  );
}
