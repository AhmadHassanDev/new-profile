import type { MetadataRoute } from "next";
import { CASES } from "@/content/cases";
import { PROJECTS } from "@/content/site";
import { absoluteUrl } from "@/lib/seo";

// No lastModified: the content carries no edit dates, and a made-up one would mislead crawlers
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/work", "/about", "/contact"].map((path) => ({ url: absoluteUrl(path) }));
  // A case study is live once its project is (see PROJECTS); its cover rides along for image search
  const cases = PROJECTS.filter((project) => CASES.some((study) => study.slug === project.slug)).map((project) => ({
    url: absoluteUrl(`/work/${project.slug}`),
    ...(project.cover ? { images: [absoluteUrl(project.cover)] } : {}),
  }));
  return [...pages, ...cases];
}
