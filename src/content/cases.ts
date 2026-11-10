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
  /** A single image; `full` runs it edge to edge. Without a size it's cropped to the cover's shape */
  | { kind: "image"; src: string; alt: string; caption?: string; full?: boolean; width?: number; height?: number }
  /** Full pages in browser windows that scroll on hover; a screen without `src` holds its place until it lands */
  | { kind: "screens"; title: string; screens: Screen[] }
  /** How the project ran, step by step (`unit` names a step: "Week", "Sprint") */
  | { kind: "timeline"; title: string; body?: string; unit: string; steps: { title: string; items: string[] }[] }
  /** Wireframes against the finished screens, compared in one handset with a split */
  | { kind: "evolution"; title: string; body?: string; pairs: { label: string; wire: string; final: string }[] }
  /** Design directions explored side by side, the one that shipped marked */
  | {
      kind: "directions";
      title: string;
      body?: string;
      options: { label: string; idea: string; src: string; width: number; height: number; chosen?: boolean }[];
    }
  /** A strip of wide images, e.g. one per product, to scroll through */
  | { kind: "gallery"; title: string; body?: string; items: { label: string; detail?: string; src: string; width: number; height: number }[] }
  /** The same pages on phones, each in a handset that scrolls on hover */
  | { kind: "phones"; title: string; screens: Screen[] }
  /** Clickable prototypes as Figma draws them: screens, the hotspot wired on each, and noodles to the next */
  | { kind: "prototypes"; title?: string; flows: PrototypeFlow[] }
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

/**
 * One prototype's path, screen by screen. `tap` is the hotspot (x, y, width, height on the 393×852 frame)
 * that opens the next screen; with `loop`, the last one leads back to the first.
 */
export type PrototypeFlow = {
  label: string;
  detail: string;
  loop?: boolean;
  screens: { label: string; src: string; tap?: [number, number, number, number] }[];
};

export type CaseStudy = {
  slug: string;
  /** Two colours from the project's own brand; they tint the whole page */
  accent: [string, string];
  /** The live site, for projects that shipped as a website */
  site?: string;
  /** A bespoke interaction, loaded on this page only */
  signature?: "dive" | "pulse" | "blip" | "belt" | "sprint" | "spark" | "spiral" | "orbit";
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
    slug: "london-dbs",
    accent: ["#0077b6", "#9ae3d1"],
    signature: "spiral",
    site: "https://www.london-dbs.com/",
    facts: [
      { label: "Client", value: "London DBS", logo: { src: "/logos/london-dbs.svg", width: 1343, height: 314 } },
      { label: "Role", value: "Brand, research, design & build" },
      { label: "Scope", value: "Brand, website & CMS" },
      { label: "Stack", value: "Figma · Next.js · Sanity · Vercel", tools: ["Figma", "Next.js", "Sanity", "Vercel"] },
    ],
    blocks: [
      {
        kind: "feature",
        text: "Deep brain stimulation is brain surgery, and the people considering it are frightened. London DBS needed a brand and a site that feel like the first calm conversation: who the team is, what DBS can do, and exactly what happens next.",
        src: "/work/london-dbs.webp",
        alt: "The London DBS homepage on a laptop",
      },
      {
        kind: "chapter",
        discipline: "UX research",
        title: "Research",
        body: "London DBS is a clinic dedicated to deep brain stimulation, led by neurosurgeon Prof. Erlick Pereira and neurologist Prof. Francesca Morgante. It treats movement disorders, chiefly Parkinson's disease, essential tremor and dystonia, and sees patients at St George's on the NHS and at six private hospitals across London.\n\nIts visitors are patients and, as often, the families researching on their behalf: people living with a condition that hasn't responded to medication, weighing an operation. What they need first is trust: who will operate, whether DBS suits their condition, and what the process really involves.",
        findings: [
          { value: "80%", label: "Typical arm-tremor improvement" },
          { value: "7", label: "London hospitals, NHS & private" },
          { value: "3", label: "Movement disorders treated" },
          { value: "2 mm", label: "Skull openings in surgery" },
        ],
        sources: [{ label: "London DBS", href: "https://www.london-dbs.com/" }],
      },
      {
        kind: "chapter",
        discipline: "UX research",
        title: "Benchmarking",
        body: "Melbourne DBS, one of the most established DBS clinics online, was the benchmark, alongside other clinics' sites. It got the structure right: a page for every condition, the process laid out step by step, the research and the full team behind it, and London DBS keeps that backbone.\n\nWhere it fell short was warmth and pace: grey pages, long walls of text, consultants who appear only further down, and a closing line telling visitors they need a GP referral first. London DBS answers each of those: the founders by name and face on the first screen, the clinic's blue and mint in place of grey, the process in four short steps, risks in pop-ups rather than paragraphs, and the opposite message at the end: no referral needed.",
      },
      {
        kind: "screens",
        title: "Benchmark: Melbourne DBS",
        screens: [
          { label: "Home", src: "/work/london-dbs/benchmark-home.webp", width: 1200, height: 5274 },
          { label: "About DBS", src: "/work/london-dbs/benchmark-about.webp", width: 1200, height: 2684 },
          { label: "Parkinson's disease", src: "/work/london-dbs/benchmark-parkinsons.webp", width: 1200, height: 2401 },
          { label: "The team", src: "/work/london-dbs/benchmark-team.webp", width: 1200, height: 2857 },
        ],
      },
      {
        kind: "chapter",
        discipline: "Branding",
        title: "The brand",
        body: "It started with a moodboard of MRI scans, electrodes and quiet clinical light, then three rounds of marks. The first explored a scan's crosshair over a brain cell, one half of a brain, and a head with a pulse inside it. The second gave the brain a charge, as lightning. The third set the brain on a pulse line, and its bolder version became the mark: unmistakably neurological, and steady rather than dramatic.\n\nThe wordmark pairs London DBS with a spelled-out \"Deep brain stimulation\" so nobody has to know the acronym. The palette is a clinical blue with a soft mint and warm white on near-black, chosen to read as cutting-edge and caring at once, and the type pairs Helvetica Neue's extended cuts for headings with SF Pro for reading.",
      },
      {
        kind: "gallery",
        title: "From moodboard to mark",
        items: [
          { label: "Moodboard", detail: "Scans, electrodes, clinical light", src: "/work/london-dbs/brand-moodboard.webp", width: 1600, height: 900 },
          { label: "Round 1", detail: "Three directions", src: "/work/london-dbs/brand-round-1.webp", width: 1600, height: 900 },
          { label: "Round 2", detail: "A brain with a charge", src: "/work/london-dbs/brand-round-2.webp", width: 1600, height: 900 },
          { label: "Round 3", detail: "The brain on a pulse line", src: "/work/london-dbs/brand-mark.webp", width: 1600, height: 900 },
          { label: "The lockup", detail: "With the name spelled out", src: "/work/london-dbs/brand-lockup.webp", width: 1600, height: 900 },
          { label: "Colourways", detail: "For light and dark", src: "/work/london-dbs/brand-alt.webp", width: 1600, height: 900 },
          { label: "Colours", detail: "Blue, mint, warm white", src: "/work/london-dbs/brand-colours.webp", width: 1600, height: 900 },
          { label: "Type", detail: "Helvetica Neue & SF Pro", src: "/work/london-dbs/brand-type.webp", width: 1600, height: 900 },
          { label: "In use", detail: "Signage, coats, packaging", src: "/work/london-dbs/brand-usage.webp", width: 1600, height: 900 },
        ],
      },
      { kind: "statement", text: "Calm first, clever second. A patient should feel looked after before they feel impressed." },
      {
        kind: "chapter",
        discipline: "UI design",
        title: "Designed in Figma",
        body: "The site follows a patient's questions in order. The homepage introduces the founders by name and face, the conditions DBS treats, the four steps from first consultation to recovery, and why a clinic that does only DBS is different. Each condition has its own page, written for the person living with it.\n\nAbout walks through the process in detail, with the risks and side effects one tap away in clear pop-ups: honest, but never a wall of warnings. The team page carries every consultant's credentials, research and media keep the clinic's work current, and contact says up front what matters most: you don't need a GP referral, and here are the NHS and private hospitals where you'll be seen.",
      },
      {
        kind: "screens",
        title: "The pages",
        screens: [
          { label: "Home", src: "/work/london-dbs/home.webp", width: 1200, height: 6053 },
          { label: "About", src: "/work/london-dbs/about.webp", width: 1200, height: 3585 },
          { label: "Team", src: "/work/london-dbs/team.webp", width: 1200, height: 2911 },
          { label: "Conditions", src: "/work/london-dbs/conditions.webp", width: 1200, height: 2073 },
          { label: "A condition", src: "/work/london-dbs/condition.webp", width: 1200, height: 1684 },
          { label: "Media", src: "/work/london-dbs/media.webp", width: 1200, height: 2129 },
          { label: "Contact", src: "/work/london-dbs/contact.webp", width: 1200, height: 1669 },
        ],
      },
      {
        kind: "chapter",
        discipline: "Front-end",
        title: "Built in Next.js, run on Sanity",
        body: "I built the site in Next.js with its content in Sanity CMS, so the clinic can publish news, media appearances and research, and keep the team and conditions current, without touching code. Pages are prerendered and served from Vercel's edge, with the metadata search engines need for people looking for DBS in London.",
      },
      {
        kind: "phones",
        title: "Live, on phones",
        screens: [
          { label: "Home", src: "/work/london-dbs/phone/home.webp", width: 786, height: 1704 },
          { label: "About", src: "/work/london-dbs/phone/about.webp", width: 786, height: 1704 },
          { label: "Team", src: "/work/london-dbs/phone/team.webp", width: 786, height: 1704 },
          { label: "Conditions", src: "/work/london-dbs/phone/conditions.webp", width: 786, height: 1704 },
          { label: "News & media", src: "/work/london-dbs/phone/news.webp", width: 786, height: 1704 },
          { label: "Contact", src: "/work/london-dbs/phone/contact.webp", width: 786, height: 1704 },
        ],
      },
      {
        kind: "pipeline",
        title: "From Figma to live",
        steps: [
          { tool: "Figma", does: "Brand & design" },
          { tool: "Next.js", does: "Front-end build" },
          { tool: "Sanity", does: "Content management" },
          { tool: "Vercel", does: "Deployment" },
        ],
      },
      {
        kind: "results",
        title: "Results",
        body: "Live at london-dbs.com, from the first sketch of the mark to the deployed site. On Google's Lighthouse audit of the live site:",
        items: [
          { value: "93", label: "Performance on desktop" },
          { value: "96", label: "Accessibility on mobile" },
          { value: "96", label: "Best practices" },
          { value: "1.4 s", label: "Largest paint on desktop" },
        ],
        measuredWith: {
          name: "Google Lighthouse",
          logo: "/logos/lighthouse.svg",
          detail: "Lighthouse 13 audit of the live site",
        },
      },
    ],
  },
  {
    slug: "spark",
    accent: ["#004ab5", "#d3fc64"],
    signature: "spark",
    site: "https://sparkplatform.app/",
    facts: [
      { label: "Client", value: "Spark, Egypt", logo: { src: "/logos/spark.svg", width: 172, height: 42 } },
      { label: "Role", value: "UI design" },
      { label: "Scope", value: "Landing page, desktop & mobile" },
      { label: "Tools", value: "Figma", tools: ["Figma"] },
    ],
    blocks: [
      {
        kind: "feature",
        text: "Booking a padel court in Egypt used to mean calls, DMs and Instagram posts. Spark puts every game, tournament and experience in one app, and its landing page had to sell that in a single scroll, to players and to the venues behind them.",
        src: "/work/spark.webp",
        alt: "The Spark landing page on a laptop",
      },
      {
        kind: "chapter",
        discipline: "UI design",
        title: "The brief",
        body: "Spark is a booking app for activities across Egypt: padel and football first, then tennis, esports, escape rooms, workshops and trips, with tournaments to enter and venues to book in a few taps. Its pitch is simple: stop jumping between posts, DMs and links.\n\nThe site speaks to two people. A player wants to know what they can book and how fast, then get the app. A venue, organiser or academy wants more bookings with less admin. So the design became two pages: the landing page for players, and Work with us for partners.",
        findings: [
          { value: "250k+", label: "Bookings made" },
          { value: "100k+", label: "People using Spark" },
          { value: "100+", label: "Activities listed" },
          { value: "2", label: "Audiences, players & partners" },
        ],
        sources: [{ label: "Spark", href: "https://sparkplatform.app/" }],
      },
      { kind: "statement", text: "Make booking fun feel as easy as having it." },
      {
        kind: "chapter",
        discipline: "UI design",
        title: "Designed in Figma",
        body: "The look is Spark's own energy: its royal blue and electric lime, a mint-to-sky hero and hand-drawn confetti in coral, teal and lime, like streamers at a match. The hero shows the real app in three phones, so the product sells itself before a word is read.\n\nThe page then answers a player's questions in order: how it works in three steps (discover, choose, book), what there is to do (play, experience, create, go), why it beats the back-and-forth, and the numbers and partners behind it. Work with us turns the same language to business: who Spark is for, why partner, four steps to go live, and a look at the admin app and dashboard venues run their bookings from.",
      },
      {
        kind: "screens",
        title: "The pages",
        screens: [
          { label: "Home", src: "/work/spark/home.webp", width: 1200, height: 4009 },
          { label: "Work with us", src: "/work/spark/partners.webp", width: 1200, height: 4755 },
        ],
      },
      {
        kind: "phones",
        title: "On phones",
        screens: [
          { label: "Home", src: "/work/spark/phone/home.webp", width: 393, height: 4485 },
          { label: "Work with us", src: "/work/spark/phone/partners.webp", width: 393, height: 6918 },
        ],
      },
      {
        kind: "results",
        title: "Live",
        body: "Designed in Figma for desktop and phones, and now live at sparkplatform.app.",
        items: [
          { value: "2", label: "Pages, for players & partners" },
          { value: "3", label: "Steps from browsing to booked" },
          { value: "4", label: "Ways in: play, experience, create, go" },
          { value: "2", label: "Layouts, desktop & phone" },
        ],
      },
    ],
  },
  {
    slug: "blacksprint",
    accent: ["#5d6b22", "#def665"],
    signature: "sprint",
    site: "https://www.blacksprint.com/",
    facts: [
      { label: "Client", value: "Blacksprint" },
      { label: "Role", value: "Design & development" },
      { label: "Scope", value: "Website" },
      { label: "Stack", value: "Figma · Next.js · Vercel", tools: ["Figma", "Next.js", "Vercel"] },
    ],
    blocks: [
      {
        kind: "feature",
        text: "Not an agency, not a VC: Blacksprint is a product studio that builds and backs its own ventures. Its site had to prove that the fastest way possible, by putting those ventures in motion on the first screen.",
        src: "/work/blacksprint-cover.webp",
        alt: "The Blacksprint homepage on a tablet, between two phones showing the mobile home and ventures pages",
      },
      {
        kind: "chapter",
        discipline: "UI design",
        title: "The brief",
        body: "Blacksprint is Kareem Naguib's studio. He has spent years building across nightlife, dining and entertainment tech, and the studio now builds and backs products of its own: EZeats for restaurant ordering, Techno & Chill for event ticketing, ¡Salud! for nightlife in Montréal and Ottawa, RSRVIT for reservations, Go Book! for sports bookings and Cinemawy for cinemas.\n\nThe people it speaks to are founders looking for a partner and companies looking for a builder. They don't need a pitch; they need to see the work, who it works with, and a fast way to start a conversation.",
        findings: [
          { value: "6", label: "Ventures on show" },
          { value: "10+", label: "Years building ventures" },
          { value: "50+", label: "Partners & clients" },
          { value: "2", label: "Countries, Egypt & Canada" },
        ],
      },
      {
        kind: "directions",
        title: "Three directions",
        body: "Before settling, the homepage went three ways in Figma. Each made a different first impression; the one that shipped leads with the products themselves.",
        options: [
          { label: "The founder", idea: "Kareem's story first, his ventures as proof.", src: "/work/blacksprint/direction-founder.webp", width: 1200, height: 5280 },
          { label: "Velocity", idea: "A bold promise, \"turning vision into velocity\", in a warm gold.", src: "/work/blacksprint/direction-velocity.webp", width: 1200, height: 5465 },
          {
            label: "Ventures in motion",
            idea: "The apps themselves on the first screen, in Blacksprint's lime.",
            src: "/work/blacksprint/home.webp",
            width: 1200,
            height: 4944,
            chosen: true,
          },
        ],
      },
      { kind: "statement", text: "Lead with the products. For a studio, the work is the credential." },
      {
        kind: "chapter",
        discipline: "UI design",
        title: "Designed in Figma",
        body: "Near-black, with Blacksprint's electric lime for every highlight and call to action. The hero sets a row of the ventures' own apps in phones, and the rest of the page earns trust in order: who's behind it, the numbers, each venture in full colour, the partners who work with them, and what the studio offers.\n\nEach venture got a showcase of its own app in its own colours, so on the ventures page every product reads as a brand, not a thumbnail: what it does, where it runs, when it launched and Blacksprint's role in it.",
      },
      {
        kind: "gallery",
        title: "The ventures",
        items: [
          { label: "EZeats", detail: "F&B tech · Egypt", src: "/work/blacksprint/venture-ezeats.webp", width: 1600, height: 960 },
          { label: "Techno & Chill", detail: "Ticketing · Events", src: "/work/blacksprint/venture-technochill.webp", width: 1600, height: 960 },
          { label: "¡Salud!", detail: "Nightlife · Canada", src: "/work/blacksprint/venture-salud.webp", width: 1600, height: 960 },
          { label: "RSRVIT", detail: "Reservations · Egypt", src: "/work/blacksprint/venture-rsrvit.webp", width: 1600, height: 960 },
          { label: "Go Book!", detail: "Sports bookings", src: "/work/blacksprint/venture-gobook.webp", width: 1600, height: 960 },
          { label: "Cinemawy", detail: "Cinema & food ordering", src: "/work/blacksprint/venture-cinemawy.webp", width: 1600, height: 960 },
        ],
      },
      {
        kind: "screens",
        title: "The pages",
        screens: [
          { label: "Home", src: "/work/blacksprint/home.webp", width: 1200, height: 4944 },
          { label: "Ventures", src: "/work/blacksprint/ventures.webp", width: 1200, height: 4429 },
        ],
      },
      {
        kind: "chapter",
        discipline: "Front-end",
        title: "Built in Next.js",
        body: "I built the site in Next.js and shipped it on Vercel, with no CMS this time: two pages that change rarely, so the content lives in code and every page is prerendered. The motion carries the brand's speed: a loader that counts up, the ventures' phones gliding across the hero, the founder's story lighting up word by word as you scroll, and the services stacking as cards.",
      },
      {
        kind: "phones",
        title: "On phones",
        screens: [
          { label: "Home", src: "/work/blacksprint/phone/home.webp", width: 786, height: 1704 },
          { label: "Ventures", src: "/work/blacksprint/phone/ventures.webp", width: 786, height: 1704 },
        ],
      },
      {
        kind: "pipeline",
        title: "From Figma to live",
        steps: [
          { tool: "Figma", does: "Design & prototype" },
          { tool: "Next.js", does: "Front-end build" },
          { tool: "Vercel", does: "Deployment" },
        ],
      },
      {
        kind: "results",
        title: "Results",
        body: "Live at blacksprint.com, and clean where it counts: the live site scores full marks on Google's Lighthouse audit for best practices and SEO, and runs without blocking the browser.",
        items: [
          { value: "100", label: "Best practices" },
          { value: "100", label: "SEO" },
          { value: "100", label: "Accessibility on desktop" },
          { value: "0 ms", label: "Blocking time on desktop" },
        ],
        measuredWith: {
          name: "Google Lighthouse",
          logo: "/logos/lighthouse.svg",
          detail: "Lighthouse 13 audit of the live site",
        },
      },
    ],
  },
  {
    slug: "bliphub",
    accent: ["#3557e8", "#6ee35f"],
    signature: "blip",
    facts: [
      { label: "Client", value: "Bliphub", logo: { src: "/logos/bliphub.svg", width: 984, height: 230 } },
      { label: "Role", value: "Research & UI design" },
      { label: "Scope", value: "Website design" },
      { label: "Tools", value: "Figma", tools: ["Figma"] },
    ],
    blocks: [
      {
        kind: "feature",
        text: "An agency's site is its first pitch: before a brand reads a word, the page itself has to prove Bliphub can make something people stop scrolling for.",
        src: "/work/bliphub.webp",
        alt: "The Bliphub homepage on a laptop and a phone",
      },
      {
        kind: "chapter",
        discipline: "UX research",
        title: "Research",
        body: "Bliphub's clients are brands in Egypt and across MENA: fashion, wellness, food, jewellery, solar, sport. Their audience lives on social media, with 51.6 million social media users in Egypt alone, and their budgets are following it there. Digital ad spend across MENA reached $8.2 billion in 2025, up 17.8% in a year, and Egypt grew fastest in the region.\n\nReach can be bought, but trust can't: people trust recommendations from people they know above any ad. That gap is what Bliphub sells, with UGC, content and production that feel human, and media buying to carry them. So the site had to show work before words: real campaigns, the service behind each one, and what it achieved.",
        findings: [
          { value: "51.6m", label: "Social media users in Egypt" },
          { value: "$8.2bn", label: "MENA digital ad spend, 2025" },
          { value: "23.1%", label: "Egypt's ad growth, the region's fastest" },
          { value: "88%", label: "Trust word of mouth most" },
        ],
        sources: [
          { label: "DataReportal", href: "https://datareportal.com/reports/digital-2026-egypt" },
          { label: "IAB MENA via Campaign Middle East", href: "https://campaignme.com/digital-ad-spend-in-mena-reaches-8b-in-2025-iab-report-reveals/" },
          {
            label: "Nielsen via Research Live",
            href: "https://www.research-live.com/article/news/nielsen-study-reveals-top-attributes-for-successful-adverts-/id/5093662",
          },
        ],
      },
      { kind: "statement", text: "Lead with the work. Let the numbers do the talking." },
      {
        kind: "chapter",
        discipline: "UI design",
        title: "Designed in Figma",
        body: "The look comes straight from the brand: a deep navy that melts into teal, liquid-glass forms drifting behind the type, and the logo's lime pixel picked out on every figure and call to action. It reads as a studio with taste, not a template.\n\nSeven services sit in one numbered list that opens in place, with a sheet for each on the services page. The portfolio tags every campaign by the service behind it, and each project page opens on its results before its gallery, so a brand sees what the work achieved, then how it looked. Clients, process and testimonials follow, and every page closes on the same invitation: ready to create something truly awesome?",
      },
      {
        kind: "screens",
        title: "The pages",
        screens: [
          { label: "Home", src: "/work/bliphub/home.webp", width: 1200, height: 6547 },
          { label: "About", src: "/work/bliphub/about.webp", width: 1200, height: 4068 },
          { label: "Services", src: "/work/bliphub/services.webp", width: 1200, height: 2477 },
          { label: "Portfolio", src: "/work/bliphub/projects.webp", width: 1200, height: 3865 },
          { label: "Project", src: "/work/bliphub/project.webp", width: 1200, height: 3444 },
          { label: "Contact", src: "/work/bliphub/contact.webp", width: 1200, height: 1872 },
        ],
      },
      {
        kind: "phones",
        title: "On phones",
        screens: [
          { label: "Home", src: "/work/bliphub/phone/home.webp", width: 393, height: 7379 },
          { label: "About", src: "/work/bliphub/phone/about.webp", width: 393, height: 4469 },
          { label: "Services", src: "/work/bliphub/phone/services.webp", width: 393, height: 3349 },
          { label: "Portfolio", src: "/work/bliphub/phone/projects.webp", width: 393, height: 3913 },
          { label: "Project", src: "/work/bliphub/phone/project.webp", width: 393, height: 3265 },
          { label: "Contact", src: "/work/bliphub/phone/contact.webp", width: 393, height: 2399 },
        ],
      },
      {
        kind: "results",
        title: "Handed over",
        body: "The work ended at a complete Figma file, ready to build: every page on desktop and on phones, with the service sheets and a project template the team can fill for each new campaign.",
        items: [
          { value: "6", label: "Pages on desktop" },
          { value: "6", label: "Layouts for phones" },
          { value: "7", label: "Services, each with a sheet" },
          { value: "1", label: "Template for every campaign" },
        ],
      },
    ],
  },
  {
    slug: "orbs",
    accent: ["#0b6470", "#01ffff"],
    signature: "orbit",
    facts: [
      { label: "Client", value: "ORBS, Riyadh", logo: { src: "/logos/rbs.svg", width: 833, height: 162 } },
      { label: "Role", value: "Research & UI design" },
      { label: "Scope", value: "Mobile app, patient & doctor" },
      { label: "Tools", value: "Figma", tools: ["Figma"] },
    ],
    blocks: [
      {
        kind: "feature",
        text: "Most emergencies need a doctor, not a hospital. ORBS puts an emergency consultant on a video call at any hour, and needed one app for both ends of that call: the worried patient, and the doctor answering.",
        src: "/work/orbs-cover.webp",
        alt: "The ORBS app on three phones: the home screen in English and in Arabic, and a video call",
      },
      {
        kind: "chapter",
        discipline: "UX research",
        title: "Research",
        body: "ORBS is a Riyadh medical company, licensed by the Saudi Ministry of Health, that runs remote emergency care: adult and paediatric emergency consultants available around the clock, for everything that doesn't need a trip to hospital, from fevers and infections to infant colic and high blood pressure.\n\nThat's two people with very different jobs on one call. The patient, often a parent, needs to reach a doctor fast and know what it costs before anything happens. The doctor needs to know who they're about to see. I mapped both journeys end to end, from the splash screen to logging out. They share sign-up, verification and settings, then split: the patient requests a consultation, answers the triage questions, pays and joins the call; the doctor accepts it, reads the patient's history, writes the consultation and any follow-up.",
        findings: [
          { value: "2", label: "Journeys, patient and doctor" },
          { value: "24/7", label: "Emergency consultants on call" },
          { value: "4", label: "Versions of every screen" },
        ],
        sources: [{ label: "About ORBS", href: "https://orbs.sa/en/about" }],
      },
      {
        kind: "image",
        src: "/work/orbs/journeys.webp",
        alt: "The patient and doctor user journeys, every screen and branch from the splash screen to logout",
        caption: "The two journeys: one shared front door, then the patient's path to a call and the doctor's path to a written consultation.",
        width: 2400,
        height: 1114,
      },
      {
        kind: "timeline",
        title: "Two months, journeys to handoff",
        body: "Both apps ran side by side, so every decision on the patient's side was checked against the doctor's.",
        unit: "Week",
        steps: [
          { title: "Discovery", items: ["ORBS's services", "Patient and doctor roles"] },
          { title: "User journeys", items: ["Patient journey", "Doctor journey"] },
          { title: "Patient wireframes", items: ["46 patient screens", "Triage and payment flow"] },
          { title: "Doctor wireframes", items: ["42 doctor screens", "Accept, write, follow up"] },
          { title: "Visual language", items: ["Colour, type and components", "Light mode"] },
          { title: "High fidelity", items: ["Every screen and state", "Dark mode"] },
          { title: "Arabic", items: ["Right-to-left layouts", "Arabic, light and dark"] },
          { title: "Handoff", items: ["Suggested features", "Dev-ready files"] },
        ],
      },
      { kind: "statement", text: "In an emergency, every extra screen is a wait. The shortest way to a doctor is the product." },
      {
        kind: "evolution",
        title: "From wireframe to final",
        body: "Every flow was settled in grey first, both sides of the call, before a single colour. Drag across the phone to see what each screen became.",
        pairs: [
          { label: "Home", wire: "/work/orbs/wire-home.webp", final: "/work/orbs/home.webp" },
          { label: "Triage", wire: "/work/orbs/wire-request.webp", final: "/work/orbs/triage.webp" },
          { label: "Price", wire: "/work/orbs/wire-pricing.webp", final: "/work/orbs/pricing.webp" },
          { label: "The call", wire: "/work/orbs/wire-call.webp", final: "/work/orbs/call.webp" },
          { label: "Rating", wire: "/work/orbs/wire-rating.webp", final: "/work/orbs/rating.webp" },
          { label: "Consultation", wire: "/work/orbs/wire-details.webp", final: "/work/orbs/details.webp" },
        ],
      },
      {
        kind: "chapter",
        discipline: "UI design",
        title: "Designed in Figma",
        body: "The app wears ORBS's own colours: an electric cyan for everything you can act on, against near-black, with the brand's brushstrokes moving through the cards. The home screen leads with one thing, a button to request a consultation now, with your consultations and follow-ups counted underneath.\n\nThe path to a doctor is short and honest. Triage questions come first, so the consultant knows what they're walking into before the call connects, and the price, 50 SAR, is confirmed before anything is charged through the Noon payment gateway. The call itself keeps everything under a thumb: camera, microphone, chat and hang up. Afterwards the patient rates the doctor, and every consultation, its write-up and its follow-ups stay in one history.\n\nOn the other end, the doctor's app opens on the consultations waiting to be accepted, with the patient's history one tap away and a write-up and follow-up form for when the call ends. Every screen exists four times: light and dark, English and Arabic, with the Arabic mirrored right to left rather than translated in place.",
      },
      {
        kind: "phones",
        title: "The patient app",
        screens: [
          { label: "Splash", src: "/work/orbs/phone/splash.webp", width: 393, height: 852 },
          { label: "Onboarding", src: "/work/orbs/phone/onboarding.webp", width: 393, height: 852 },
          { label: "Home", src: "/work/orbs/phone/home.webp", width: 393, height: 852 },
          { label: "Triage", src: "/work/orbs/phone/triage.webp", width: 393, height: 852 },
          { label: "Price", src: "/work/orbs/phone/pricing.webp", width: 393, height: 852 },
          { label: "The call", src: "/work/orbs/phone/call.webp", width: 393, height: 852 },
          { label: "Rating", src: "/work/orbs/phone/rating.webp", width: 393, height: 852 },
          { label: "Consultations", src: "/work/orbs/phone/consultations.webp", width: 393, height: 852 },
          { label: "Consultation", src: "/work/orbs/phone/details.webp", width: 393, height: 852 },
          { label: "Doctors", src: "/work/orbs/phone/doctors.webp", width: 393, height: 852 },
          { label: "Doctor", src: "/work/orbs/phone/doctor-profile.webp", width: 393, height: 852 },
        ],
      },
      {
        kind: "phones",
        title: "Light, dark, English, Arabic",
        screens: [
          { label: "Home, dark", src: "/work/orbs/phone/dark-home.webp", width: 393, height: 852 },
          { label: "Home, Arabic", src: "/work/orbs/phone/ar-home.webp", width: 393, height: 852 },
          { label: "Home, Arabic dark", src: "/work/orbs/phone/ar-dark-home.webp", width: 393, height: 852 },
          { label: "Triage, dark", src: "/work/orbs/phone/dark-triage.webp", width: 393, height: 852 },
          { label: "The call, dark", src: "/work/orbs/phone/dark-call.webp", width: 393, height: 852 },
          { label: "The call, Arabic", src: "/work/orbs/phone/ar-dark-call.webp", width: 393, height: 852 },
        ],
      },
      {
        kind: "phones",
        title: "The doctor app",
        screens: [
          { label: "Home", src: "/work/orbs/phone/doc-home.webp", width: 393, height: 852 },
          { label: "Waiting", src: "/work/orbs/phone/doc-accept.webp", width: 393, height: 852 },
          { label: "Consultations", src: "/work/orbs/phone/doc-write.webp", width: 393, height: 852 },
        ],
      },
      {
        kind: "chapter",
        discipline: "UI design",
        title: "Two clickable prototypes",
        body: "Both sides of the call were wired into clickable prototypes, so ORBS could tap through each journey on a phone before a line of code was written. The patient's runs in Arabic, in light mode, from the splash screen through triage, payment and the call to rating the doctor. The doctor's runs in English, in dark mode, from signing in to accepting a consultation and writing it up.",
        findings: [
          { value: "2", label: "Prototypes, patient and doctor" },
          { value: "91", label: "Screens linked" },
          { value: "246", label: "Interactions wired" },
        ],
      },
      {
        kind: "prototypes",
        flows: [
          {
            label: "Patient prototype",
            detail: "Arabic · light mode · 48 screens · 143 interactions",
            loop: true,
            screens: [
              { label: "Home", src: "/work/orbs/proto/p-home.webp", tap: [20, 90, 351, 160] },
              { label: "Triage questions", src: "/work/orbs/proto/p-triage.webp", tap: [20, 769, 351, 45] },
              { label: "Noon payment", src: "/work/orbs/proto/p-pay.webp", tap: [0, 0, 393, 852] },
              { label: "Waiting room", src: "/work/orbs/proto/p-wait.webp", tap: [0, 0, 393, 852] },
              { label: "On call", src: "/work/orbs/proto/p-call.webp", tap: [20, 773, 55, 55] },
              { label: "Rate your doctor", src: "/work/orbs/proto/p-rate.webp", tap: [202, 492, 149, 41] },
            ],
          },
          {
            label: "Doctor prototype",
            detail: "English · dark mode · 43 screens · 103 interactions",
            screens: [
              { label: "Home", src: "/work/orbs/proto/d-home.webp", tap: [20, 90, 351, 160] },
              { label: "Accept consultations", src: "/work/orbs/proto/d-accept.webp", tap: [233, 142, 129, 32] },
              { label: "On call", src: "/work/orbs/proto/d-call.webp", tap: [223, 40, 141, 36] },
              { label: "Patient profile", src: "/work/orbs/proto/d-prompt.webp", tap: [36, 513, 323, 45] },
              { label: "Patient's consultations", src: "/work/orbs/proto/d-write.webp" },
            ],
          },
        ],
      },
      {
        kind: "chapter",
        discipline: "UX research",
        title: "Beyond the brief",
        body: "The handoff came with three suggestions for what's next, each from a gap in the journeys. Categories, so doctors can list themselves under a speciality and patients can choose from each. Medical articles, to give patients a reason to open the app between emergencies and add to its credibility. And a minimal shop, so a patient can buy the medicine they were just prescribed without leaving the app.",
      },
      {
        kind: "results",
        title: "Handed over",
        body: "Two months after the first journey map, ORBS had both apps designed end to end, every screen and state in light and dark, English and Arabic, ready for development.",
        items: [
          { value: "348", label: "High-fidelity screens" },
          { value: "88", label: "Wireframes, patient and doctor" },
          { value: "4", label: "Versions of every screen" },
          { value: "2", label: "Months, journeys to handoff" },
        ],
      },
      { kind: "statement", text: "Design both ends of the call. The patient's answers are the doctor's first read." },
    ],
  },
  {
    slug: "anubis",
    accent: ["#8f121d", "#e5323f"],
    signature: "belt",
    facts: [
      { label: "Client", value: "Anubis Martial Arts, Egypt", logo: { src: "/logos/anubis.svg", width: 199, height: 329 } },
      { label: "Role", value: "Research & UI design" },
      { label: "Scope", value: "Mobile app" },
      { label: "Tools", value: "Figma", tools: ["Figma"] },
    ],
    blocks: [
      {
        kind: "feature",
        text: "Members train hard and want to see it: what they've attended, what's left on their package and which class is next. Anubis needed one app that shows them, and takes the admin off the front desk.",
        src: "/work/anubis.webp",
        alt: "The Anubis app's home screen on a phone",
      },
      {
        kind: "chapter",
        discipline: "UX research",
        title: "Research",
        body: "Anubis Martial Arts Academy trains Brazilian Jiu-Jitsu, submission grappling, MMA and Muay Thai in Egypt. Its head coach, Mohamed Omar, holds his black belt under world champion Roberto \"Cyborg\" Abreu and helped build the country's BJJ scene.\n\nBehind the mats, attendance, packages, private coaching requests and merch all ran by hand or across scattered chats, so members couldn't see where they stood and the academy did the same work twice. I benchmarked five fitness and gym apps for what they get right and what they miss, then mapped the member's journey and the flows that matter most: booking, checking in and tracking progress.",
        findings: [
          { value: "5", label: "Fitness apps benchmarked" },
          { value: "4", label: "Jobs pulled into one app" },
        ],
      },
      {
        kind: "timeline",
        title: "Six weeks, research to handoff",
        body: "One structured run from the first benchmark to files a developer can build from, each week ending in something the academy could see.",
        unit: "Week",
        steps: [
          { title: "Research & benchmarking", items: ["Competitor benchmarks", "Feature comparisons", "Opportunity notes"] },
          { title: "UX definition", items: ["Member journey maps", "Key experience flows"] },
          { title: "Wireframes & structure", items: ["App sitemap", "Wireframes for every flow"] },
          { title: "Design system", items: ["Colour, type and spacing", "Component library"] },
          { title: "High-fidelity design", items: ["Every screen and state", "Final layouts"] },
          { title: "Prototype & handoff", items: ["Clickable prototype", "Dev-ready files"] },
        ],
      },
      { kind: "statement", text: "Every member should see their progress, not have to ask for it." },
      {
        kind: "evolution",
        title: "From wireframe to final",
        body: "Every flow was settled in grey first: layout, hierarchy and navigation, before a single colour. Drag across the phone to see what each screen became.",
        pairs: [
          { label: "Login", wire: "/work/anubis/wire-login.webp", final: "/work/anubis/login.webp" },
          { label: "Verification", wire: "/work/anubis/wire-otp.webp", final: "/work/anubis/otp.webp" },
          { label: "Your details", wire: "/work/anubis/wire-details.webp", final: "/work/anubis/details.webp" },
          { label: "Your photo", wire: "/work/anubis/wire-photo.webp", final: "/work/anubis/photo.webp" },
          { label: "Home", wire: "/work/anubis/wire-home.webp", final: "/work/anubis/home.webp" },
          { label: "Profile", wire: "/work/anubis/wire-profile.webp", final: "/work/anubis/profile.webp" },
        ],
      },
      {
        kind: "chapter",
        discipline: "UI design",
        title: "Designed in Figma",
        body: "The app lives in the academy's colours: near-black, with Anubis red for every action and Helvetica Neue's extended cuts giving the titles a fighter's stance. The home screen answers a member's three questions at a glance: how long is left on their package, which class is next and with which coach, and what else is on this week.\n\nCheck-in is a QR code in the middle of the tab bar, one tap from anywhere. Belts unlock as achievements, discipline by discipline, so progress shows on the mat and in the app. Merch can be browsed and asked about, but not bought: checkout was kept out on purpose, so the first release stays focused on running the academy. Every screen is built from one component library, with variants for each state.",
      },
      {
        kind: "phones",
        title: "The app",
        screens: [
          { label: "Onboarding", src: "/work/anubis/phone/onboarding.webp", width: 393, height: 911 },
          { label: "Login", src: "/work/anubis/phone/login.webp", width: 393, height: 911 },
          { label: "Home", src: "/work/anubis/phone/home.webp", width: 393, height: 1920 },
          { label: "Sessions", src: "/work/anubis/phone/sessions.webp", width: 393, height: 911 },
          { label: "Calendar", src: "/work/anubis/phone/calendar-month.webp", width: 393, height: 911 },
          { label: "Session", src: "/work/anubis/phone/session.webp", width: 393, height: 911 },
          { label: "Packages", src: "/work/anubis/phone/packages-list.webp", width: 393, height: 911 },
          { label: "Package", src: "/work/anubis/phone/package.webp", width: 393, height: 911 },
          { label: "Coach", src: "/work/anubis/phone/coach.webp", width: 393, height: 911 },
          { label: "Achievements", src: "/work/anubis/phone/achievements.webp", width: 393, height: 911 },
          { label: "Merch", src: "/work/anubis/phone/merch.webp", width: 393, height: 911 },
          { label: "Profile", src: "/work/anubis/phone/profile.webp", width: 393, height: 911 },
        ],
      },
      {
        kind: "results",
        title: "Handed over",
        body: "Six weeks after the first benchmark, the academy had a clickable prototype and dev-ready files: every screen and every state, from signing up to a suspended account.",
        items: [
          { value: "46", label: "Screens, designed end to end" },
          { value: "6", label: "Weeks, research to handoff" },
          { value: "1", label: "Component library" },
          { value: "1", label: "Clickable prototype" },
        ],
      },
      { kind: "statement", text: "Scope is a design decision. Leaving checkout out made the first release sharper." },
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
