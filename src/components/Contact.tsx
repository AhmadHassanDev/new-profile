import Image from "next/image";
import { SOCIALS } from "@/content/site";

export default function Contact() {
  return (
    <footer id="contact" className="relative overflow-hidden px-4 pt-32 pb-10 md:px-10 md:pt-48">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-1/2 left-1/2 h-[80vmax] w-[80vmax] -translate-x-1/2 rounded-full opacity-25 blur-[140px]"
        style={{ background: "var(--spectrum)" }}
      />

      <div className="relative">
        <p className="mb-8 text-sm font-semibold text-muted">Got a product in mind?</p>
        <h2 className="font-display text-[13vw] leading-[0.85] font-bold tracking-[-0.05em] uppercase md:text-[10vw]">
          Let&apos;s make
          <br />
          <span className="text-spectrum animate-shimmer">it real</span>
        </h2>

        <div className="mt-16 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <a
            href={SOCIALS[0].href}
            target="_blank"
            rel="noreferrer"
            data-cursor="Hello"
            className="group inline-flex w-fit items-center gap-4 rounded-full bg-ink py-3 pr-3 pl-8 text-lg font-semibold text-bg transition-transform hover:scale-[1.03]"
          >
            Say hello
            <span
              className="grid h-12 w-12 place-items-center rounded-full text-ink transition-transform duration-500 group-hover:rotate-45"
              style={{ background: "var(--spectrum)" }}
            >
              ↗
            </span>
          </a>
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-lg font-medium">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer" className="group relative">
                  {s.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-ink transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-24 flex items-center justify-between border-t border-line pt-6 text-sm text-muted">
          <Image src="/logo.svg" alt="" width={40} height={31} />
          <span>© 2021–2026 Ahmed Hassan</span>
          <a href="#top" className="transition-colors hover:text-ink">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
