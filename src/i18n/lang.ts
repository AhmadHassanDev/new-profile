// The site's two languages. English lives at the root (/work), Arabic under /ar (/ar/work), each with its own
// root layout (app/(en) and app/ar), so <html lang dir> is right from the first byte.

export type Lang = "en" | "ar";
export const LANGS: Lang[] = ["en", "ar"];

export const dirOf = (lang: Lang) => (lang === "ar" ? "rtl" : "ltr");

/** "/work" in this language: "/work" or "/ar/work" (hashes and outside links pass through) */
export function localePath(lang: Lang, path: string) {
  if (lang === "en" || !path.startsWith("/")) return path;
  return path === "/" ? "/ar" : `/ar${path}`;
}

/** The language a pathname is in, and the path with the prefix removed */
export function splitPath(pathname: string): { lang: Lang; path: string } {
  if (pathname === "/ar" || pathname.startsWith("/ar/")) return { lang: "ar", path: pathname.slice(3) || "/" };
  return { lang: "en", path: pathname };
}
