"use client";

import { useEffect, useState } from "react";

type Cue = { number: string; title: string; say: string };

/**
 * The avatar's column on wide screens: its dock (the travelling avatar parks here and rides down the
 * page with it), the chapter it's showing you, and a line it says about it. Chapters are sections
 * marked `data-chapter` with a `data-title`, a `data-say` and a `data-react` (the avatar's reaction
 * as the chapter reaches the middle of the screen). An `avatar:say` event puts other words in its mouth,
 * like an answer from Ask me anything.
 */
export default function AboutGuide() {
  const [cue, setCue] = useState<Cue | null>(null);

  useEffect(() => {
    const chapters = [...document.querySelectorAll<HTMLElement>("[data-chapter]")];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const number = String(chapters.indexOf(el) + 1).padStart(2, "0");
          setCue({ number, title: el.dataset.title ?? "", say: el.dataset.say ?? "" });
          if (el.dataset.react) window.dispatchEvent(new CustomEvent("avatar:react", { detail: el.dataset.react }));
        }
      },
      // A chapter counts once it crosses the middle of the screen
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const chapter of chapters) observer.observe(chapter);
    const onSay = (e: Event) => {
      const { say, react } = (e as CustomEvent<{ say: string; react?: string }>).detail;
      setCue((current) => (current ? { ...current, say } : current));
      if (react) window.dispatchEvent(new CustomEvent("avatar:react", { detail: react }));
    };
    window.addEventListener("avatar:say", onSay);
    return () => {
      observer.disconnect();
      window.removeEventListener("avatar:say", onSay);
    };
  }, []);

  return (
    <aside aria-hidden className="hidden lg:col-span-4 lg:block">
      <div className="sticky top-[14vh]">
        <div data-avatar-slot="dock" className="mx-auto aspect-[4/5] w-[min(19vw,36vh)]" />
        <div
          className={`mx-auto mt-6 w-[min(25vw,24rem)] transition-[opacity,transform] duration-500 ${cue ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
        >
          <p className="flex items-center gap-3 font-display text-sm font-semibold text-muted">
            <span className="text-spectrum">{cue?.number}</span>
            <span aria-hidden className="h-px w-8 bg-line" />
            {cue?.title}
          </p>
          {/* Keyed so each new line reads in fresh */}
          <p key={cue?.say} className="animate-rise mt-3 rounded-[20px] bg-surface/70 px-5 py-4 text-base leading-snug font-medium xl:text-lg backdrop-blur-xl">
            {cue?.say}
          </p>
        </div>
      </div>
    </aside>
  );
}
