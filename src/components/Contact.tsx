import Image from "next/image";
import { SOCIALS } from "@/content/site";
import MakeItReal from "./MakeItReal";
import SocialIcon from "./SocialIcon";

export default function Contact() {
  return (
    <footer id="contact" className="relative overflow-hidden px-4 pt-32 pb-10 md:px-10 md:pt-48">
      {/* The glow fades in from nothing at the top, so there's no hard line where the footer starts */}
      <div aria-hidden className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,#000_45%)]">
        <div
          className="absolute -bottom-1/2 left-1/2 h-[80vmax] w-[80vmax] -translate-x-1/2 rounded-full opacity-25 blur-[140px]"
          style={{ background: "var(--spectrum)" }}
        />
      </div>

      <div className="relative">
        <p className="mb-8 text-sm font-semibold text-muted">Got a product in mind?</p>
        <MakeItReal href={SOCIALS[0].href}>
          <ul className="flex gap-3">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="grid size-14 place-items-center rounded-full border border-line bg-bg/40 text-ink backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:bg-ink hover:text-bg md:size-16"
                >
                  <SocialIcon name={s.label} className="size-5 md:size-6" />
                </a>
              </li>
            ))}
          </ul>
        </MakeItReal>

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
