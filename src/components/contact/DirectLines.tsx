"use client";

import { useState } from "react";
import { CONTACT, CV } from "@/content/site";
import SocialIcon from "../SocialIcon";

/** The fastest ways to reach Ahmed (WhatsApp, and email with a one-tap copy), and his CV */
export default function DirectLines() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${CONTACT.email}`;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <a
        href={`https://wa.me/${CONTACT.whatsapp.number}`}
        target="_blank"
        rel="noreferrer"
        className="group relative flex items-center gap-4 overflow-hidden rounded-[28px] bg-surface/50 p-5 backdrop-blur-xl transition-colors duration-500 sm:gap-5 sm:p-6 md:p-7"
      >
        {/* A soft green glow spreads from behind the icon; the text stays as it is */}
        <span
          aria-hidden
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(70% 140% at 0% 50%, rgb(37 211 102 / 0.22), transparent 70%)" }}
        />
        <span className="relative grid size-12 shrink-0 place-items-center rounded-full bg-[#25d366] text-bg transition-transform duration-500 group-hover:scale-110 sm:size-14">
          <SocialIcon name="WhatsApp" className="size-7" />
        </span>
        <span className="@container relative min-w-0 flex-1">
          <span className="block text-sm font-semibold text-muted">WhatsApp</span>
          {/* On one line, sized to the card: the number runs about 10.5em wide */}
          <span className="mt-1 block font-display text-[min(1.125rem,9.4cqw)] font-bold whitespace-nowrap sm:text-[min(1.25rem,9.4cqw)] md:text-[min(1.5rem,9.4cqw)]">
            {CONTACT.whatsapp.display}
          </span>
          <span className="sr-only"> (opens in a new tab)</span>
        </span>
        <span aria-hidden className="relative text-2xl transition-all duration-500 group-hover:rotate-45 group-hover:text-[#25d366]">
          ↗
        </span>
      </a>

      <div className="flex items-center gap-4 rounded-[28px] bg-surface/50 p-5 sm:gap-5 sm:p-6 backdrop-blur-xl md:p-7">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-bg sm:size-14">
          <SocialIcon name="Email" className="size-7" />
        </span>
        <a href={`mailto:${CONTACT.email}`} className="min-w-0 flex-1 transition-colors hover:text-violet">
          <span className="block text-sm font-semibold text-muted">Email</span>
          <span className="mt-1 block font-display text-xs font-bold break-all sm:text-sm md:text-base">
            {CONTACT.email}
          </span>
        </a>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy email address"
          className="shrink-0 rounded-full border border-line px-4 py-2 text-sm font-semibold transition-colors duration-300 hover:border-transparent hover:bg-ink hover:text-bg"
        >
          <span aria-hidden>{copied ? "Copied ✓" : "Copy"}</span>
        </button>
        {/* Announced once on copy; it empties silently, so the label flipping back to "Copy" isn't read out */}
        <span role="status" className="sr-only">
          {copied ? "Email address copied" : ""}
        </span>
      </div>

      {/* The CV, for anyone hiring */}
      <a
        href={CV.href}
        download={CV.file}
        className="group relative flex items-center gap-4 overflow-hidden rounded-[28px] bg-surface/50 p-5 backdrop-blur-xl sm:gap-5 sm:p-6 md:p-7"
      >
        <span
          aria-hidden
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(70% 140% at 0% 50%, color-mix(in srgb, var(--violet) 22%, transparent), transparent 70%)" }}
        />
        <span className="relative grid size-12 shrink-0 place-items-center rounded-full text-bg transition-transform duration-500 group-hover:scale-110 sm:size-14" style={{ background: "var(--spectrum)" }}>
          <SocialIcon name="Download" className="size-6" />
        </span>
        <span className="relative min-w-0 flex-1">
          <span className="block text-sm font-semibold text-muted">CV · {CV.note}</span>
          <span className="mt-1 block font-display text-[1.125rem] font-bold sm:text-xl md:text-2xl">Download my CV</span>
        </span>
        <span aria-hidden className="relative text-2xl transition-transform duration-500 group-hover:translate-y-1">
          ↓
        </span>
      </a>
    </div>
  );
}
