import type { Metadata } from "next";
import { CONTACT, PROCESS, SERVICES, SOCIALS } from "@/content/site";
import { localePath, type Lang } from "@/i18n/lang";

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

/** The same, for the Arabic pages (Egyptian, as the site speaks it) */
export const AR = {
  name: "أحمد حسن",
  title: "أحمد حسن — أبحاث المستخدم، تصميم الواجهات والفرونت إند",
  description: "أحمد حسن مصمم ومطوّر فرونت إند مصري: بيفهم المستخدم، بيصمم الواجهة، وبيبنيها بنفسه، من أول مقابلة لحد ما المنتج ينزل للناس.",
};
export const nameIn = (lang: Lang) => (lang === "ar" ? AR.name : NAME);

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
const OG_LOCALE: Record<Lang, string> = { en: "en_US", ar: "ar_EG" };

type OgImage = { url: string; width: number; height: number; alt: string; type?: string };

/** Both languages of a path, for hreflang: English is also the default for anyone else */
export const languageAlternates = (path: string) => ({
  en: path,
  ar: localePath("ar", path),
  "x-default": path,
});

/**
 * A page's title, description, canonical URL, language twins and share card. `path` is the English path ("/work");
 * the Arabic page passes `lang: "ar"` and gets "/ar/work". `title` goes through the root template
 * ("Work" → "Work — Ahmed Hassan"); leave it out to keep the site's default title.
 */
export function pageMetadata({
  title,
  description,
  path,
  lang = "en",
  image = DEFAULT_OG_IMAGE,
}: {
  title?: string;
  description: string;
  path: string;
  lang?: Lang;
  image?: OgImage;
}): Metadata {
  const url = localePath(lang, path);
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      ...OPEN_GRAPH,
      locale: OG_LOCALE[lang],
      title: title ? `${title} — ${nameIn(lang)}` : lang === "ar" ? AR.title : SITE_TITLE,
      description,
      url,
      images: [image],
    },
  };
}

/** The root layout's metadata, per language */
export function rootMetadata(lang: Lang): Metadata {
  const ar = lang === "ar";
  const title = ar ? AR.title : SITE_TITLE;
  const description = ar ? AR.description : SITE_DESCRIPTION;
  return {
    metadataBase: new URL(SITE_URL),
    // Pages give just their own name ("Work"); the template adds who it's by
    title: { default: title, template: `%s — ${nameIn(lang)}` },
    description,
    applicationName: NAME,
    authors: [{ name: NAME, url: SITE_URL }],
    creator: NAME,
    publisher: NAME,
    keywords: [NAME, JOB_TITLE, "Egyptian designer", ...(ar ? [AR.name, "مصمم مصري", "تصميم مواقع", "تصميم واجهات"] : []), ...KNOWS_ABOUT],
    // The share image comes from app/opengraph-image.tsx; each page adds its own title, URL and canonical
    openGraph: { ...OPEN_GRAPH, locale: OG_LOCALE[lang], title, description, images: [DEFAULT_OG_IMAGE] },
    twitter: { card: "summary_large_image" },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    // Named one by one: the square PNG first (the one Google uses in search results), the logo as an SVG for
    // browser tabs, and the iOS home-screen icon
    icons: {
      icon: [
        { url: "/icon", sizes: "480x480", type: "image/png" },
        { url: "/logo.svg", type: "image/svg+xml" },
      ],
      apple: { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    },
    // Keep iOS from turning the phone number and email into its own blue links
    formatDetection: { telephone: false, email: false, address: false },
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
  inLanguage: ["en", "ar"],
  author: { "@id": PERSON_ID },
  publisher: { "@id": PERSON_ID },
};

/** Home first, then each crumb by name and (English) path */
export const breadcrumbs = (trail: { name: string; path: string }[], lang: Lang = "en") => ({
  "@type": "BreadcrumbList",
  itemListElement: [{ name: lang === "ar" ? "الرئيسية" : "Home", path: "/" }, ...trail].map((crumb, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: crumb.name,
    item: absoluteUrl(localePath(lang, crumb.path)),
  })),
});

/** A page's own node, tied to the site and the person it's by */
export const webPage = (
  type: string,
  { path, name, description, lang = "en" }: { path: string; name: string; description: string; lang?: Lang },
) => ({
  "@type": type,
  "@id": `${SITE_URL}${localePath(lang, path) === "/" ? "/" : localePath(lang, path)}#webpage`,
  url: absoluteUrl(localePath(lang, path)),
  name,
  description,
  inLanguage: lang,
  isPartOf: { "@id": WEBSITE_ID },
  author: { "@id": PERSON_ID },
});
