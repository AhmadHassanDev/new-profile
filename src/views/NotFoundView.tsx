import Link from "next/link";
import Contact from "@/components/Contact";
import Nav from "@/components/Nav";
import { localePath, type Lang } from "@/i18n/lang";
import { ui } from "@/i18n/ui";

/** The 404, inside each language's own layout: a big headline, a line, and two ways back in */
export default function NotFoundView({ lang }: { lang: Lang }) {
  const t = ui(lang).notFound;
  return (
    <>
      <Nav />
      <main id="top" className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-4 pt-32 pb-20 md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-1/4 -right-1/4 h-[90vmax] w-[90vmax] rounded-full opacity-20 blur-[140px]"
          style={{ background: "var(--spectrum)" }}
        />
        <p className="relative flex items-center gap-3 font-display text-sm font-semibold text-muted">
          <span aria-hidden className="h-px w-10 bg-line" />
          {t.kicker}
        </p>
        <h1 className="relative mt-6 font-display text-[length:calc((15vw)*var(--ds))] leading-[0.86] font-bold uppercase md:text-[length:calc((10vw)*var(--ds))]">
          {t.top}
          <br />
          <span className="text-spectrum animate-shimmer">{t.bottom}</span>
        </h1>
        <p className="relative mt-8 max-w-xl text-xl leading-snug font-medium text-muted md:text-2xl">{t.body}</p>
        <div className="relative mt-10 flex flex-wrap gap-3">
          <Link
            href={localePath(lang, "/")}
            className="inline-flex items-center rounded-full bg-ink px-6 py-[15px] text-base font-semibold text-bg transition-transform duration-300 hover:scale-[1.04]"
          >
            {t.home}
          </Link>
          <Link
            href={localePath(lang, "/work")}
            className="inline-flex items-center rounded-full border border-line bg-bg/40 px-6 py-[15px] text-base font-semibold backdrop-blur-md transition-colors duration-300 hover:border-ink"
          >
            {t.work}
          </Link>
        </div>
      </main>
      <Contact minimal lang={lang} />
    </>
  );
}
