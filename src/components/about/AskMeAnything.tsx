"use client";

import { useEffect, useRef, useState } from "react";

type Reaction = "nod" | "wink" | "laugh" | "doubletake";

/** Questions people ask, and how I'd answer: drafts from the rest of the site, to be put in my own words */
const QUESTIONS: { q: string; a: string; react: Reaction }[] = [
  {
    q: "How did you get into design?",
    a: "I fell for design and creative coding before college, and never stopped. Every course, every tutorial I could find. A CS degree later, I'm still at it, and still learning.",
    react: "nod",
  },
  {
    q: "Designer or developer?",
    a: "Both, on purpose. I research it, design it and build it myself, so nothing gets lost in hand-off. The thing you approve in Figma is the thing that ships.",
    react: "wink",
  },
  {
    q: "Figma or code first?",
    a: "Figma first, always. I'd rather solve the hard problems while they're cheap to change. Once the design is right, I build exactly that, down to the last pixel.",
    react: "nod",
  },
  {
    q: "What does your process look like?",
    a: "Research, design, build. First I find out what people actually need and what they think of what's already out there. Then I design the version they'll choose, and build it fast and live.",
    react: "nod",
  },
  {
    q: "What do you build with?",
    a: "Figma for design. React and Next.js for most builds, with Tailwind, Vue, Node.js or Flutter when the project calls for it. Picking up a new framework is half the fun.",
    react: "nod",
  },
  {
    q: "Who have you worked with?",
    a: "60+ clients across 5+ regions: government authorities, funds, agencies and startups. Big or small, the brief is always the same. Make something people want to use.",
    react: "wink",
  },
  {
    q: "Why does research matter so much?",
    a: "Freelancing taught me the hard way. A product only works when it's planned around its users, not around what we assume they want. Research is how you stop guessing.",
    react: "doubletake",
  },
  {
    q: "Why Arsenal?",
    a: "The Invincibles, 2003–04. A whole season unbeaten, and I was hooked for life. It's been a rollercoaster since, but I'm a Gooner through and through.",
    react: "laugh",
  },
  {
    q: "A book you'd recommend?",
    a: "Atomic Habits. Tiny changes, done every day, add up to a different you. It started my whole “better me” thing: a new book, a new skill, a new hobby.",
    react: "nod",
  },
  {
    q: "What do you do off the clock?",
    a: "Gaming, mostly, which is sneaky research too. Great games are masterclasses in how an interaction should feel. Then football, books, and whatever I'm learning that month.",
    react: "laugh",
  },
  {
    q: "Favourite project?",
    a: "Whichever I'm building right now. Today, that's SlyDive: moving it off an old WordPress site onto Next.js took it to a 92 mobile score on PageSpeed.",
    react: "wink",
  },
  {
    q: "Can we work together?",
    a: "Yes, I'd love that. Landing pages, web apps, mobile apps, branding or research. Tell me about it on the contact page and I'll get back to you.",
    react: "wink",
  },
];

/**
 * Ask me anything: pick a question and the avatar answers it, in its speech line beside the page (see
 * AboutGuide) with a reaction to match. On phones, where the avatar sits in a corner, the answer shows
 * here under the questions.
 */
export default function AskMeAnything() {
  const [asked, setAsked] = useState<number | null>(null);
  const answerRef = useRef<HTMLParagraphElement>(null);

  // On phones the answer shows under the questions, so bring it into view (clear of the docked avatar)
  useEffect(() => {
    if (asked === null || window.matchMedia("(min-width: 1024px)").matches) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    answerRef.current?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [asked]);

  const ask = (i: number) => {
    setAsked(i);
    const { a, react } = QUESTIONS[i];
    window.dispatchEvent(new CustomEvent("avatar:say", { detail: { say: a, react } }));
  };

  return (
    <div className="mt-12">
      <ul className="flex flex-wrap gap-3">
        {QUESTIONS.map((question, i) => (
          <li key={question.q}>
            <button
              type="button"
              onClick={() => ask(i)}
              aria-pressed={asked === i}
              className={`rounded-full px-5 py-3 text-base font-semibold transition-[background-color,color,transform] duration-300 hover:-translate-y-0.5 md:px-6 md:py-3.5 md:text-lg ${
                asked === i ? "bg-ink text-bg" : "bg-surface text-ink hover:bg-surface-2"
              }`}
            >
              {question.q}
            </button>
          </li>
        ))}
      </ul>
      {/* Read out for screen readers, shown on phones */}
      <p ref={answerRef} aria-live="polite" className={`mt-8 scroll-mb-32 rounded-[24px] bg-surface/70 px-6 py-5 text-xl leading-snug font-medium backdrop-blur-xl lg:sr-only ${asked === null ? "hidden" : ""}`}>
        {asked !== null ? QUESTIONS[asked].a : ""}
      </p>
      <p className="mt-8 hidden text-sm text-muted lg:block">Pick one. I&apos;ll answer on the left.</p>
    </div>
  );
}
