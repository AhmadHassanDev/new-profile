import type { Discipline } from "./site";

/**
 * Case studies. Every one shares the same skeleton (opener, snapshot, story, next project), and
 * stands apart through its own accent colours, the blocks it picks and their order, and an
 * optional signature moment that belongs to that project alone.
 */

export type Block =
  /** One big sentence: the problem, or a turning point */
  | { kind: "statement"; text: string }
  /** A statement and an image side by side */
  | { kind: "feature"; text: string; src: string; alt: string }
  /**
   * A chapter of the story, in its discipline's colour; without a body it shows as "coming soon".
   * Blank lines split the body into paragraphs; `findings` are key figures and `sources` back them up.
   */
  | {
      kind: "chapter";
      discipline: Discipline;
      title: string;
      body?: string;
      findings?: { value: string; label: string }[];
      sources?: Source[];
    }
  /** The journey from first sketch to live site, tool by tool */
  | { kind: "pipeline"; title: string; steps: { tool: string; does: string }[] }
  /** A single image; `full` runs it edge to edge */
  | { kind: "image"; src: string; alt: string; caption?: string; full?: boolean }
  /** Full pages in browser windows that scroll on hover; a screen without `src` holds its place until it lands */
  | { kind: "screens"; title: string; screens: Screen[] }
  /**
   * Outcomes as big numbers, each optionally against where it started; with no items yet, three empty
   * slots hold the space. `body` tells the story behind them and `sources` back them up.
   */
  | {
      kind: "results";
      title: string;
      body?: string;
      /** `before` is where a figure started and `change` the jump, e.g. "+35" */
      items: { value: string; label: string; before?: string; change?: string }[];
      /** The tool the figures came from, shown with its logo */
      measuredWith?: { name: string; logo: string; detail?: string };
      sources?: Source[];
    };

export type Source = { label: string; href: string };

export type Screen = { label: string; src?: string; width?: number; height?: number };

export type CaseStudy = {
  slug: string;
  /** Two colours from the project's own brand; they tint the whole page */
  accent: [string, string];
  /** The live site, for projects that shipped as a website */
  site?: string;
  /** A bespoke interaction, loaded on this page only */
  signature?: "dive" | "pulse";
  /** Quick facts; a fact can show a logo (the client's) or a row of tool logos instead of plain text */
  facts: { label: string; value: string; logo?: { src: string; width: number; height: number }; tools?: string[] }[];
  blocks: Block[];
};

export const CASES: CaseStudy[] = [
  {
    slug: "pmg",
    accent: ["#4e7f7a", "#5cc78d"],
    signature: "pulse",
    site: "https://pmghealthcare.co.uk/",
    facts: [
      { label: "Client", value: "PMG Healthcare, London", logo: { src: "/logos/pmg.svg", width: 512, height: 169 } },
      { label: "Role", value: "Research, design & development" },
      { label: "Scope", value: "Website & CMS" },
      { label: "Stack", value: "Figma · Next.js · Sanity · Vercel", tools: ["Figma", "Next.js", "Sanity", "Vercel"] },
    ],
    blocks: [
      {
        kind: "feature",
        text: "Consultants are paid to treat patients, not to chase invoices. PMG takes that work off their hands, and its site has to earn a consultant's trust in the first few seconds.",
        src: "/work/pmg.webp",
        alt: "The PMG Healthcare homepage on a laptop",
      },
      {
        kind: "chapter",
        discipline: "UX research",
        title: "Research",
        body: "UK private practice is busier than ever: PHIN counted a record of nearly 13,400 active consultants in 2025. Behind every one of them sits the same paperwork: diaries, coding against the insurers' shared CCSD schedule, invoices to Bupa, AXA Health, Aviva, Vitality and self-pay patients, and the chasing that follows. Healthcode processed 11.8 million private healthcare invoices in 2025 alone.\n\nPMG runs that side of a practice: operations, billing and collections, coding, transcription, embassy registration for sponsored international patients, marketing, tax and accounting. The audience is a consultant deciding who to trust with their income, so the site had to answer three questions fast: what PMG takes off their plate, where the money goes, and what it costs.",
        findings: [
          { value: "13.4k", label: "Private consultants in the UK" },
          { value: "£5.7bn", label: "Clinics & private doctors" },
          { value: "11.8m", label: "Private invoices in 2025" },
          { value: "£337m", label: "Embassy-funded care, London" },
        ],
        sources: [
          { label: "PHIN", href: "https://www.phin.org.uk/news/private-market-update-june-2026-uk" },
          {
            label: "LaingBuisson",
            href: "https://www.laingbuisson.com/press-releases/private-healthcare-growth-weakens-as-the-market-is-hit-by-individual-cutting-back-on-out-of-pocket-spending-on-healthcare/",
          },
          { label: "Healthcode via COVER", href: "https://www.covermagazine.co.uk/news/4524599/record-q4-pmi-healthcode" },
          {
            label: "LaingBuisson, London",
            href: "https://www.laingbuisson.com/press-releases/new-report-shows-rising-demand-for-private-healthcare-in-central-london-market-over-2-billion/",
          },
          { label: "CCSD", href: "https://www.ccsd.org.uk/" },
        ],
      },
      { kind: "statement", text: "Don't ask consultants for trust. Show them where every payment goes." },
      {
        kind: "chapter",
        discipline: "UI design",
        title: "Designed in Figma",
        body: "The design pairs a calm sage and off-white palette with PMG's mint for every call to action: clinical without feeling cold. Each service is shown at work rather than described: an invoice table with what's collected and outstanding, a coding episode checked against the insurer's schedule, an embassy guarantee approved before the first appointment.\n\nThe trust section maps the money: the patient or insurer pays straight into the consultant's account, and PMG never sits in the payment path. Eight services sit behind one mega menu, each with its own panel, so a consultant can go straight to the part of the practice they need help with.",
      },
      {
        kind: "screens",
        title: "The pages",
        screens: [
          { label: "Home", src: "/work/pmg/home.webp", width: 1200, height: 6994 },
          { label: "Services", src: "/work/pmg/services.webp", width: 1200, height: 2669 },
          { label: "About", src: "/work/pmg/about.webp", width: 1200, height: 5010 },
          { label: "Contact", src: "/work/pmg/contact.webp", width: 1200, height: 2696 },
        ],
      },
      {
        kind: "chapter",
        discipline: "Front-end",
        title: "Built in Next.js, run on Sanity",
        body: "The site is built in Next.js with its content in Sanity CMS, so PMG's team can update services and pages without touching code. It's prerendered and served from Vercel's edge, so it loads fast wherever a consultant opens it.",
      },
      {
        kind: "pipeline",
        title: "From Figma to live",
        steps: [
          { tool: "Figma", does: "Design & prototype" },
          { tool: "Next.js", does: "Front-end build" },
          { tool: "Sanity", does: "Content management" },
          { tool: "Vercel", does: "Deployment" },
        ],
      },
      {
        kind: "results",
        title: "Results",
        body: "Built to be fast and accessible from day one. The live site scores at the top of Google's Lighthouse audit on both phones and desktops:",
        items: [
          { value: "95", label: "Performance on mobile" },
          { value: "100", label: "Performance on desktop" },
          { value: "100", label: "Accessibility" },
          { value: "100", label: "SEO" },
        ],
        measuredWith: {
          name: "Google PageSpeed Insights",
          logo: "/logos/lighthouse.svg",
          detail: "Lighthouse 13.6 audit, mobile and desktop",
        },
      },
    ],
  },
  {
    slug: "slydive",
    accent: ["#a742b5", "#33c1a4"],
    signature: "dive",
    site: "https://slydive-six.vercel.app/",
    facts: [
      { label: "Client", value: "SlyDive, Dahab", logo: { src: "/logos/slydive.svg", width: 389, height: 215 } },
      { label: "Role", value: "Design & development" },
      { label: "Scope", value: "Website redesign" },
      { label: "Stack", value: "Figma · Next.js · Sanity · Vercel", tools: ["Figma", "Next.js", "Sanity", "Vercel"] },
    ],
    blocks: [
      {
        kind: "feature",
        text: "A dive centre's site should feel like the water: open, bright and easy to move through, from the first course to the next boat trip.",
        src: "/work/slydive.webp",
        alt: "The redesigned SlyDive homepage on a laptop",
      },
      {
        kind: "chapter",
        discipline: "UX research",
        title: "Research",
        body: "Dahab is one of the Red Sea's busiest dive towns, with dozens of centres along the same stretch of coast, most of them PADI. For a visiting diver, the website is often where that choice gets made.\n\nSlyDive is a PADI 5 Star IDC centre in Mashraba. It runs scuba, freediving and snorkelling courses, conservation dives and EFR first aid from its own classroom and boat. Guides on choosing a centre in Dahab keep naming the same three things: clear prices, a booking process with no confusion, and safety you can see. The redesign is built around them.",
        findings: [
          { value: "5★", label: "PADI IDC centre" },
          { value: "6", label: "PADI instructors" },
          { value: "3", label: "Languages taught in" },
          { value: "31", label: "Dive sites nearby" },
        ],
        sources: [
          { label: "PADI", href: "https://travel.padi.com/dive-center/egypt/sly-dive/" },
          { label: "DivePlannerPro", href: "https://www.diveplannerpro.com/dive-centers/eg/eg-sly-dive/sites" },
          { label: "Circle Divers", href: "https://www.circledivers.com/blog/best-dive-center-dahab" },
        ],
      },
      {
        kind: "chapter",
        discipline: "UI design",
        title: "Designed in Figma",
        body: "The redesign started in Figma: a clean, bright layout that lets the underwater photography lead, with SlyDive's purple and teal carrying the brand from the hero to every call to action.",
      },
      {
        kind: "screens",
        title: "The pages",
        screens: [
          { label: "Home", src: "/work/slydive/landing.webp", width: 1200, height: 3983 },
          { label: "Trips", src: "/work/slydive/trips.webp", width: 1200, height: 1840 },
          { label: "Trip details", src: "/work/slydive/trip-details.webp", width: 1200, height: 3229 },
          { label: "Courses", src: "/work/slydive/courses.webp", width: 1200, height: 2156 },
          { label: "Course details", src: "/work/slydive/course-detail.webp", width: 1200, height: 2723 },
          { label: "Pricing", src: "/work/slydive/pricing.webp", width: 1200, height: 2119 },
          { label: "About", src: "/work/slydive/about.webp", width: 1200, height: 3724 },
        ],
      },
      {
        kind: "chapter",
        discipline: "Front-end",
        title: "Built in Next.js, run on Sanity",
        body: "The site is built in Next.js with its content in Sanity CMS, so trips, courses and pricing can be updated by the team without touching code.",
      },
      {
        kind: "pipeline",
        title: "From Figma to live",
        steps: [
          { tool: "Figma", does: "Design & prototype" },
          { tool: "Next.js", does: "Front-end build" },
          { tool: "Sanity", does: "Content management" },
          { tool: "Vercel", does: "Deployment" },
        ],
      },
      {
        kind: "results",
        title: "Results",
        body: "The old site ran on WordPress 6.2, held up by Elementor, Slider Revolution and WooCommerce. Moving it to Next.js on Vercel, with content in Sanity, made it faster, cleaner and easier to keep up to date. Here's the old site against the new one:",
        items: [
          { value: "92", before: "45", change: "+47", label: "Performance on mobile" },
          { value: "93", before: "66", change: "+27", label: "Performance on desktop" },
          { value: "100", before: "73", change: "+27", label: "Best practices" },
          { value: "10 ms", before: "530 ms", change: "−98%", label: "Blocking time on mobile" },
        ],
        measuredWith: {
          name: "Google PageSpeed Insights",
          logo: "/logos/lighthouse.svg",
          detail: "Lighthouse 13.6 audit, mobile and desktop",
        },
      },
    ],
  },
];

export const caseFor = (slug: string) => CASES.find((c) => c.slug === slug);
