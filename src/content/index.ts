// The content in either language. English is the source (./site, ./cases); Arabic mirrors it shape for shape
// (./ar/site, ./ar/cases), keeping names, slugs, images and lookup keys identical.
import type { Lang } from "@/i18n/lang";
import * as arCases from "./ar/cases";
import * as arSite from "./ar/site";
import * as enCases from "./cases";
import * as enSite from "./site";

export const siteFor = (lang: Lang): typeof enSite => (lang === "ar" ? arSite : enSite);
export const casesFor = (lang: Lang): typeof enCases => (lang === "ar" ? arCases : enCases);

/** A project's kind ("Website · Diving") as shown to visitors; the English value stays the filter key */
export const kindLabel = (lang: Lang, kind: string) => (lang === "ar" ? (arSite.KIND_AR[kind] ?? kind) : kind);

/** A discipline's display name ("UX research"); the English name stays the key for colours and filters */
export const disciplineLabel = (lang: Lang, discipline: string) => (lang === "ar" ? (arSite.DISCIPLINE_AR[discipline] ?? discipline) : discipline);

/** A project type ("Website", "Web app"…) as the Work filters show it; the English value stays the filter key */
export const typeLabel = (lang: Lang, type: string) => (lang === "ar" ? (arSite.TYPE_AR[type] ?? type) : type);
