import type { Metadata } from "next";
import Contact from "@/components/Contact";
import ContactForm from "@/components/contact/ContactForm";
import ContactHero from "@/components/contact/ContactHero";
import DirectLines from "@/components/contact/DirectLines";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import SocialIcon from "@/components/SocialIcon";
import { SOCIALS } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact — Ahmed Hassan",
  description: "Start a project with Ahmed Hassan: send a message, WhatsApp, email, or find him on LinkedIn, Behance, GitHub and Instagram.",
};

// Each network's own colour floods its tile on hover, with text that reads on it
const BRAND: Record<string, { fill: string; text: string }> = {
  LinkedIn: { fill: "#0a66c2", text: "#ffffff" },
  Behance: { fill: "#1769ff", text: "#ffffff" },
  GitHub: { fill: "#edecf2", text: "#0a0a0d" },
  Instagram: { fill: "linear-gradient(135deg, #feda75, #fa7e1e 25%, #d62976 50%, #962fbf 75%, #4f5bd5)", text: "#ffffff" },
};

export default function ContactPage() {
  return (
    <>
      <Cursor />
      <Nav />
      <main id="top" className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[120vh] [mask-image:linear-gradient(to_bottom,#000_40%,transparent)]">
          <div
            className="absolute -top-1/3 -right-1/4 h-[90vmax] w-[90vmax] rounded-full opacity-20 blur-[140px]"
            style={{ background: "var(--spectrum)" }}
          />
        </div>

        <ContactHero />

        {/* Form and direct lines */}
        <section id="message" aria-label="Send a message" className="relative grid scroll-mt-28 gap-6 px-4 pt-16 pb-24 md:px-10 md:pt-24 lg:grid-cols-12 lg:gap-8">
          <div className="rounded-[32px] border border-line bg-surface/50 p-6 backdrop-blur-xl md:p-10 lg:col-span-7">
            <ContactForm />
          </div>
          <div className="lg:col-span-5">
            <DirectLines />
          </div>
        </section>

        {/* Socials, front and centre */}
        <section aria-labelledby="socials-title" className="relative px-4 pb-32 md:px-10 md:pb-48">
          <h2 id="socials-title" className="mb-10 font-display text-5xl leading-[0.9] font-bold tracking-[-0.04em] uppercase md:mb-14 md:text-7xl">
            Find me
            <br />
            <span className="text-spectrum animate-shimmer">online</span>
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {SOCIALS.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="social-tile group relative flex aspect-[16/9] flex-col sm:aspect-[4/3] justify-between overflow-hidden rounded-[28px] border border-line bg-surface/50 p-6 backdrop-blur-xl transition-[color,border-color] duration-500 hover:border-transparent md:p-8"
                  style={{ "--brand": BRAND[social.label].fill, "--on-brand": BRAND[social.label].text } as React.CSSProperties}
                >
                  <span aria-hidden className="direct-flood absolute inset-0 [background:var(--brand)]" />
                  <span className="relative flex items-start justify-between">
                    <SocialIcon name={social.label} className="size-10 md:size-12" />
                    <span aria-hidden className="text-2xl transition-transform duration-500 group-hover:rotate-45">
                      ↗
                    </span>
                  </span>
                  <span className="relative">
                    <span className="block font-display text-3xl font-bold tracking-[-0.03em] uppercase md:text-4xl">{social.label}</span>
                    <span className="mt-2 block text-base font-semibold opacity-80">{social.handle}</span>
                    <span className="mt-1 block text-sm opacity-60">{social.note}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Contact minimal />
    </>
  );
}
