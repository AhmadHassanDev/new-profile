import type { Lang } from "@/i18n/lang";
import { ui } from "@/i18n/ui";

function Track({ items, outline = false }: { items: string[]; outline?: boolean }) {
  // Two identical halves so the -50% loop is seamless.
  const run = [...items, ...items, ...items];
  return (
    <div className="flex w-max">
      {[0, 1].map((half) => (
        <div key={half} className="flex shrink-0 items-center">
          {run.map((item, i) => (
            <span key={i} className="flex items-center">
              <span className={`marquee-word px-6 font-display text-4xl font-bold uppercase md:px-10 md:text-7xl ${outline ? "text-muted" : ""}`}>
                {item}
              </span>
              <span className={`font-display text-4xl font-light md:text-7xl ${outline ? "text-muted" : ""}`}>/</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Marquee({ lang = "en" }: { lang?: Lang }) {
  const { label, words: ITEMS } = ui(lang).marquee;
  return (
    <section aria-label={label} className="relative -my-6 overflow-hidden py-24 md:py-32">
      {/* Read once: both belts repeat the list for the loop, so they're decoration only */}
      <ul className="sr-only">
        {ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {/* Both belts run left to right in either language: the track overflows to the right and loops from there */}
      <div aria-hidden dir="ltr" className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 rotate-[3deg] border-y border-line bg-surface py-4 md:py-6">
        <div className="animate-marquee-reverse">
          <Track items={ITEMS} outline />
        </div>
      </div>
      <div aria-hidden dir="ltr" className="relative mx-[-5%] -rotate-[4deg] py-4 text-bg md:py-6" style={{ background: "var(--spectrum)" }}>
        <div className="animate-marquee">
          <Track items={ITEMS} />
        </div>
      </div>
    </section>
  );
}
