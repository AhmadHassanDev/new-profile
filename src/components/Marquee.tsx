const ITEMS = ["UX research", "UI design", "Front-end"];

function Track({ outline = false }: { outline?: boolean }) {
  // Two identical halves so the -50% loop is seamless.
  const run = [...ITEMS, ...ITEMS, ...ITEMS];
  return (
    <div className="flex w-max">
      {[0, 1].map((half) => (
        <div key={half} aria-hidden={half === 1} className="flex shrink-0 items-center">
          {run.map((item, i) => (
            <span key={i} className="flex items-center">
              <span className={`px-6 font-display text-4xl font-bold uppercase tracking-[-0.03em] md:px-10 md:text-7xl ${outline ? "text-muted" : ""}`}>
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

export default function Marquee() {
  return (
    <section aria-label="Disciplines" className="relative -my-6 overflow-hidden py-24 md:py-32">
      <div className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 rotate-[3deg] border-y border-line bg-surface py-4 md:py-6">
        <div className="animate-marquee-reverse">
          <Track outline />
        </div>
      </div>
      <div className="relative mx-[-5%] -rotate-[4deg] py-4 text-bg md:py-6" style={{ background: "var(--spectrum)" }}>
        <div className="animate-marquee">
          <Track />
        </div>
      </div>
    </section>
  );
}
