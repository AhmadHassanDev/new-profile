import type { MetadataRoute } from "next";
import { CASES } from "@/content/cases";
import { PROJECTS } from "@/content/site";
import { LANGS, localePath } from "@/i18n/lang";
import { absoluteUrl } from "@/lib/seo";

/** Each page in both languages, every entry naming its twin (hreflang), English the default */
function both(path: string, images?: string[]): MetadataRoute.Sitemap {
  const languages = { en: absoluteUrl(path), ar: absoluteUrl(localePath("ar", path)), "x-default": absoluteUrl(path) };
  return LANGS.map((lang) => ({ url: absoluteUrl(localePath(lang, path)), alternates: { languages }, ...(images ? { images } : {}) }));
}

// No lastModified: the content carries no edit dates, and a made-up one would mislead crawlers
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/work", "/about", "/contact"].flatMap((path) => both(path));
  // A case study is live once its project is (see PROJECTS); its cover rides along for image search
  const cases = PROJECTS.filter((project) => CASES.some((study) => study.slug === project.slug)).flatMap((project) =>
    both(`/work/${project.slug}`, project.cover ? [absoluteUrl(project.cover)] : undefined),
  );
  return [...pages, ...cases];
}
