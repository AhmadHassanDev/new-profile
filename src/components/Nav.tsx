"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SOCIALS } from "@/content/site";
import { SCROLL_LOCK } from "@/lib/scroll";

// Each link takes one of the hero's discipline colours in the mobile menu, on hover and while you're on its page.
const LINKS = [
  { href: "/work", label: "Work", hover: "group-hover:text-cyan", here: "text-cyan" },
  { href: "/about", label: "About", hover: "group-hover:text-violet", here: "text-violet" },
  { href: "/contact", label: "Contact", hover: "group-hover:text-coral", here: "text-coral" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const current = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  // Frosted once the page moves under it; tucked away while scrolling down, back on the way up
  const [scrolled, setScrolled] = useState(false);
  const [tucked, setTucked] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - last) > 6) {
        setTucked(y > last && y > 240);
        last = y;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    // The page behind the menu can't be tabbed into or read out while it's open
    const behind = [...document.querySelectorAll<HTMLElement>("body > :not(header), main, footer")].filter((el) => !el.closest("header"));
    for (const el of behind) el.inert = true;
    window.dispatchEvent(new CustomEvent(SCROLL_LOCK, { detail: true }));
    firstLinkRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    // Rotating to a wide screen swaps in the desktop nav, so the menu has nothing left to cover.
    const wide = window.matchMedia("(min-width: 768px)");
    const onWide = () => wide.matches && setOpen(false);

    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      root.style.overflow = "";
      for (const el of behind) el.inert = false;
      window.dispatchEvent(new CustomEvent(SCROLL_LOCK, { detail: false }));
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 [&>*]:pointer-events-auto">
      {/* Mobile menu: three colour sheets slash across the screen, then the panel lands on top (each sheet
          slides in after the one before, and out in reverse: `--open` and `--close` are their delays) */}
      <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" data-open={open} inert={!open} className="menu fixed inset-0 md:hidden">
        <div aria-hidden className="menu-sheet bg-cyan" style={{ "--open": "0s", "--close": "0.15s" } as React.CSSProperties} />
        <div aria-hidden className="menu-sheet bg-violet" style={{ "--open": "0.05s", "--close": "0.1s" } as React.CSSProperties} />
        <div aria-hidden className="menu-sheet bg-coral" style={{ "--open": "0.1s", "--close": "0.05s" } as React.CSSProperties} />
        <div className="absolute inset-0 flex flex-col overflow-hidden px-4 pt-28 pb-8">
          <div aria-hidden className="menu-sheet bg-bg" style={{ "--open": "0.15s", "--close": "0s" } as React.CSSProperties} />
          {/* A soft glow from the corner, painted as a gradient (a blur this size is costly to redraw on a phone) */}
          <div
            aria-hidden
            className="menu-glow pointer-events-none absolute -right-1/3 -bottom-1/4 h-[80vmax] w-[80vmax] rounded-full"
            style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--violet) 55%, transparent), color-mix(in srgb, var(--coral) 20%, transparent) 55%, transparent)" }}
          />
          <span
            aria-hidden
            className="menu-slash pointer-events-none absolute -top-[6vh] -right-[18vw] font-display text-[95vh] leading-none font-bold"
            style={{ backgroundImage: "var(--spectrum)", backgroundClip: "text", color: "transparent" }}
          >
            /
          </span>

          <nav aria-label="Main" className="relative my-auto">
            <ul className="flex flex-col gap-1">
              {LINKS.map((link, i) => (
                <li key={link.href} className="reveal">
                  <Link
                    ref={i === 0 ? firstLinkRef : undefined}
                    href={link.href}
                    aria-current={current(link.href) ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className="menu-item group flex items-start gap-2 py-1"
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    <span
                      className={`font-display text-[13.5vw] leading-[0.95] font-bold tracking-[-0.05em] uppercase transition-colors duration-300 ${current(link.href) ? link.here : link.hover}`}
                    >
                      {link.label}
                    </span>
                    <span className="mt-[0.4em] font-display text-xs font-semibold text-muted">0{i + 1}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="menu-foot relative flex flex-col gap-5">
            <span aria-hidden className="h-px w-full" style={{ background: "var(--spectrum)" }} />
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-base font-medium">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="transition-colors hover:text-violet">
                    {s.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted">Ahmed Hassan · Portfolio ©2026</p>
          </div>
        </div>
      </div>

      <div
        data-scrolled={scrolled}
        data-tucked={tucked && !open}
        data-open={open}
        className="nav-bar relative mx-2 mt-3 flex items-center justify-between rounded-full py-2 pr-2 pl-2 md:mx-6 md:mt-4 md:pl-4"
      >
        <Link href="/" aria-label="Ahmed Hassan, home" className="relative" onClick={() => setOpen(false)}>
          <Image src="/logo.svg" alt="" width={58} height={45} priority />
        </Link>

        <nav aria-label="Main" className="nav-links hidden items-center gap-2 rounded-full border border-line bg-bg/60 p-1.5 text-sm font-medium backdrop-blur-xl transition-colors duration-500 md:flex">
          {/* The filled pill marks the page you're on; Contact stands out on its own with a dot and an arrow */}
          {LINKS.map((link) => {
            const here = current(link.href);
            const cta = link.href === "/contact";
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={here ? "page" : undefined}
                className={`group flex items-center gap-2 rounded-full px-4 py-2 transition-colors duration-300 ${here ? "bg-ink text-bg" : "hover:bg-white/10"}`}
              >
                {cta && !here && <span aria-hidden className="size-1.5 rounded-full" style={{ background: "var(--spectrum)" }} />}
                {link.label}
                {cta && !here && (
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    ↗
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
          data-open={open}
          className="burger relative grid size-12 place-items-center rounded-full border border-line bg-bg/60 backdrop-blur-xl transition-colors duration-500 data-[open=true]:border-transparent data-[open=true]:bg-ink md:hidden"
        >
          <span aria-hidden className="burger-bar" />
          <span aria-hidden className="burger-bar" />
        </button>
      </div>
    </header>
  );
}
