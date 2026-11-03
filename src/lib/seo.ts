import type { Metadata } from "next";
import { CONTACT, PROCESS, SERVICES, SOCIALS } from "@/content/site";

/**
 * The site's own address, for canonical URLs, the sitemap, structured data and llms.txt. It's the www
 * domain: the bare ahmedhassan.dev redirects there, and canonicals should point at the final address, not
 * a redirect (so not Vercel's VERCEL_PROJECT_PRODUCTION_URL, which picks the bare one). NEXT_PUBLIC_SITE_URL
 * overrides it; the dev server uses itself.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "production" ? "https://www.ahmedhassan.dev" : "http://localhost:3001")
).replace(/\/+$/, "");

/** "/work" → "https://…/work" */
export const absoluteUrl = (path = "/") => `${SITE_URL}${path === "/" ? "" : path}`;

export const NAME = "Ahmed Hassan";
export const SITE_TITLE = "Ahmed Hassan — UX research, UI design & front-end";
export const SITE_DESCRIPTION =
  "Ahmed Hassan is a designer and front-end developer: UX research, UI design and front-end development, from the first interview to the shipped interface.";
/** As the hero signs it */
export const JOB_TITLE = "Product designer & front-end developer";

/** Every discipline, tool and service named on the site, once each */
export const KNOWS_ABOUT = [
  ...new Set([...PROCESS.flatMap((step) => [step.name, ...step.kit]), ...SERVICES.map((service) => service.title)]),
];

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = "Ahmed Hassan: Research. Design. Build.";

// The generated card in app/opengraph-image.tsx. A page that sets its own openGraph replaces the whole
// object (metadata merges shallowly), so pages name it again rather than lose it.
const DEFAULT_OG_IMAGE = { url: "/opengraph-image", ...OG_SIZE, alt: OG_ALT, type: "image/png" };

export const OPEN_GRAPH = { type: "website", siteName: NAME, locale: "en_US" } as const;

type OgImage = { url: string; width: number; height: number; alt: string; type?: string };

/**
 * A page's title, description, canonical URL and share card. `title` goes through the root template
 * ("Work" → "Work — Ahmed Hassan"); leave it out to keep the site's default title.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
}: {
  title?: string;
  description: string;
  path: string;
  image?: OgImage;
}): Metadata {
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      ...OPEN_GRAPH,
      title: title ? `${title} — ${NAME}` : SITE_TITLE,
      description,
      url: path,
      images: [image],
    },
  };
}

// Stable ids, so every page's structured data points at the same person and site
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const PERSON = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: NAME,
  url: SITE_URL,
  jobTitle: JOB_TITLE,
  description: SITE_DESCRIPTION,
  nationality: { "@type": "Country", name: "Egypt" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "Misr International University", alternateName: "MIU" },
  knowsAbout: KNOWS_ABOUT,
  email: `mailto:${CONTACT.email}`,
  telephone: `+${CONTACT.whatsapp.number}`,
  sameAs: SOCIALS.map((social) => social.href),
};

export const WEBSITE = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE_URL,
  name: NAME,
  description: SITE_DESCRIPTION,
  inLanguage: "en",
  author: { "@id": PERSON_ID },
  publisher: { "@id": PERSON_ID },
};

/** Home first, then each crumb by name and path */
export const breadcrumbs = (trail: { name: string; path: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: [{ name: "Home", path: "/" }, ...trail].map((crumb, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.path),
  })),
});

/** A page's own node, tied to the site and the person it's by */
export const webPage = (type: string, { path, name, description }: { path: string; name: string; description: string }) => ({
  "@type": type,
  "@id": `${SITE_URL}${path === "/" ? "/" : path}#webpage`,
  url: absoluteUrl(path),
  name,
  description,
  inLanguage: "en",
  isPartOf: { "@id": WEBSITE_ID },
  author: { "@id": PERSON_ID },
});
