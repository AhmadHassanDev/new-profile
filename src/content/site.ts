export type Discipline = "UX research" | "UI design" | "Front-end";

export const DISCIPLINE_COLOR: Record<Discipline, string> = {
  "UX research": "var(--cyan)",
  "UI design": "var(--violet)",
  "Front-end": "var(--coral)",
};

export type Project = {
  slug: string;
  name: string;
  kind: string;
  year: string;
  summary: string;
  disciplines: Discipline[];
  /** Cover in /public/work, always COVER_WIDTH × COVER_HEIGHT */
  cover?: string;
};

// Every project cover shares this size, so cards can show it whole
export const COVER_WIDTH = 2000;
export const COVER_HEIGHT = 1565;

// Every project, including ones still waiting on their cover
const ALL_PROJECTS: Project[] = [
  {
    slug: "anubis",
    name: "Anubis",
    kind: "Mobile app · Martial arts",
    year: "2025",
    summary: "Class packages, sessions, coaches and QR check-in for Anubis Martial Arts across its branches.",
    disciplines: ["UI design"],
    cover: "/work/anubis.webp",
  },
  {
    slug: "finsync",
    name: "FinSync",
    kind: "Landing page · Fintech",
    year: "2025",
    summary: "Connects banks with SMEs, simplifying loan access and financial services for faster, smarter funding.",
    disciplines: ["UX research", "UI design"],
    cover: "/work/finsync.webp",
  },
  {
    slug: "ezeats",
    name: "EZeats",
    kind: "Landing page · Food & beverage",
    year: "2025",
    summary:
      "Digital menus, ordering, payment and reviews in one flow for restaurants across Egypt and Morocco: shorter waits, smoother service.",
    disciplines: ["UX research", "UI design", "Front-end"],
  },
  {
    slug: "beltone-mortgage",
    name: "Beltone Mortgage",
    kind: "Mobile app · Fintech",
    year: "2024",
    summary:
      "A new way to sell mortgage solutions for Beltone Mortgage Finance, regulated by the Financial Regulatory Authority.",
    disciplines: ["UX research", "UI design"],
    cover: "/work/beltone.webp",
  },
  {
    slug: "swiftminis",
    name: "SwiftMinis",
    kind: "Web app · Verto Technologies",
    year: "2024",
    summary:
      "Virtual greeting cards for every occasion. Clients add their people and let them design and share custom cards.",
    disciplines: ["UI design", "Front-end"],
    cover: "/work/swiftminis.webp",
  },
];

// A project goes live once it has a cover; until then it stays out of every grid and list
export const PROJECTS = ALL_PROJECTS.filter((p) => p.cover);

/** "Mobile app · Fintech" → "Mobile app" */
export const typeOf = (kind: string) => kind.split(" · ")[0];

/**
 * What Ahmed does. Most are tied to the projects that show them and link to the work page filtered;
 * one with no published project yet links straight to contact instead.
 */
export const SERVICES: { title: string; type?: string; tag?: Discipline; contact?: string }[] = [
  { title: "Landing pages", type: "Landing page" },
  { title: "Web apps", type: "Web app" },
  { title: "UX research", tag: "UX research" },
  { title: "Branding & logos", contact: "Ask for samples" },
  { title: "Mobile apps", type: "Mobile app" },
];

/** The three steps of the process, named like the hero's verbs, each with what it uses. */
export const PROCESS: { verb: string; name: Discipline; line: string; body: string; kit: string[] }[] = [
  {
    verb: "Research",
    name: "UX research",
    line: "Find out what people actually need.",
    body: "No product wins without understanding its users, its market and its competitors. I learn what people need, and what they think of what's already out there.",
    kit: ["User interviews", "Market research", "Competitor audits"],
  },
  {
    verb: "Design",
    name: "UI design",
    line: "Make it the one they choose.",
    body: "A good interface is the difference between a great experience and a forgettable one. People pick the beautiful product, even when both do the same job.",
    kit: ["Figma", "Adobe XD", "Illustrator"],
  },
  {
    verb: "Build",
    name: "Front-end",
    line: "Ship exactly what was designed.",
    body: "Turning designs into a fast, live product is the last mile. I build it myself with modern frameworks, so nothing gets lost in hand-off.",
    kit: ["React", "Next.js", "Vue", "Tailwind", "Bootstrap", "Node.js", "Flutter", "Git"],
  },
];

/** The about page, from Ahmed's own words on the old site. */
export const STORY = [
  { when: "Early on", title: "Hooked on design", body: "Fell for design and creative coding before college, and kept taking every course and tutorial I could find." },
  { when: "2021", title: "Computer science", body: "Graduated from Misr International University (MIU) with a CS degree, and the habit of caring how things work." },
  { when: "Then", title: "Users first", body: "Freelance projects and internships taught me a product only works when it's planned around its users. So I learned research and design." },
  { when: "Now", title: "60+ clients later", body: "Research, design and build for government authorities, funds, agencies and startups across 5+ regions." },
];

export const PASSIONS = [
  { title: "Code", color: "var(--cyan)", body: "I genuinely love opening the IDE and watching it come alive. A new framework is a welcome challenge." },
  { title: "UX & UI", color: "var(--violet)", body: "Good UX makes or breaks a product, and it goes hand in hand with a beautiful, seamless UI." },
  { title: "Arsenal", color: "var(--coral)", body: "A Gooner, die-hard since the Invincibles' unbeaten 2003–04 season." },
  { title: "Growth", color: "var(--ink)", body: "Always working on a better me: a new book, a new skill, a new hobby. Atomic Habits started it." },
];

export const QUOTE = { text: "It always seems impossible until it's done.", by: "Nelson Mandela" };

/** Spine colours borrowed from each cover. */
export const BOOKS = [
  { title: "The User Experience Team of One", author: "Leah Buley", bg: "#d8434e", ink: "#fff4ea" },
  { title: "Lean UX", author: "Jeff Gothelf", bg: "#f1f1ef", ink: "#1b7fc4" },
  { title: "Hooked", author: "Nir Eyal", bg: "#f6dc35", ink: "#141414" },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", bg: "#f3efe5", ink: "#1b1b1b" },
  { title: "The 48 Laws of Power", author: "Robert Greene", bg: "#e0482b", ink: "#f2c94c" },
  { title: "Sprint", author: "Jake Knapp", bg: "#4cb6e6", ink: "#f8d63b" },
  { title: "Refactoring UI", author: "Adam Wathan & Steve Schoger", bg: "#1c2232", ink: "#e9eefc" },
  { title: "Atomic Habits", author: "James Clear", bg: "#f4efe3", ink: "#b8923f" },
  { title: "The Design of Everyday Things", author: "Don Norman", bg: "#f1d24a", ink: "#b3372a" },
  { title: "Don't Make Me Think", author: "Steve Krug", bg: "#8e2522", ink: "#fbefe6" },
  { title: "Ego Is the Enemy", author: "Ryan Holiday", bg: "#1f3b5b", ink: "#f4f1ea" },
];

export const STATS = [
  { value: 6, suffix: "+", label: "Years of experience" },
  { value: 5, suffix: "+", label: "Regions" },
  { value: 60, suffix: "+", label: "Clients" },
];

export type Client = {
  name: string;
  /** File in /public/logos, sized by its own width/height */
  logo: { src: string; width: number; height: number };
  /** Display height in px, tuned per logo so they look the same size */
  size?: number;
  /** How the logo is muted until lit: flat white (default), or grayscale for logos whose coloured parts overlap */
  tone?: "white" | "gray";
};

export const CLIENTS: Client[] = [
  { name: "Zakat, Tax and Customs Authority (ZATCA)", logo: { src: "/logos/zatca.svg", width: 215, height: 48 }, size: 40 },
  { name: "Public Investment Fund (PIF)", logo: { src: "/logos/pif.svg", width: 170, height: 76 }, size: 58 },
  { name: "Hewar Group", logo: { src: "/logos/hewar.svg", width: 202, height: 60 }, size: 46 },
  { name: "General Entertainment Authority (GEA)", logo: { src: "/logos/gea.svg", width: 718, height: 395 }, size: 68 },
  { name: "Richard Attias & Associates", logo: { src: "/logos/richard-attias.png", width: 368, height: 107 }, size: 54 },
  { name: "Showtime", logo: { src: "/logos/showtime.svg", width: 163, height: 60 }, size: 44 },
  { name: "Multilem", logo: { src: "/logos/multilem.svg", width: 326, height: 61 }, size: 30 },
  { name: "Beltone", logo: { src: "/logos/beltone.svg", width: 124, height: 64 }, size: 64 },
  { name: "EZeats", logo: { src: "/logos/ezeats.svg", width: 1652, height: 406 }, size: 34, tone: "gray" },
  { name: "DTech", logo: { src: "/logos/dtech.svg", width: 104, height: 28 }, size: 30 },
  { name: "Sharjah Roads and Transport Authority (SRTA)", logo: { src: "/logos/srta.svg", width: 435, height: 88 }, size: 46 },
  { name: "Emirates Nuclear Energy Company (ENEC)", logo: { src: "/logos/enec.svg", width: 158, height: 79 }, size: 56 },
  { name: "Blackstone eIT", logo: { src: "/logos/blackstone-eit.webp", width: 739, height: 88 }, size: 28 },
  { name: "Sure Global Tech", logo: { src: "/logos/sure.svg", width: 116, height: 65 }, size: 50 },
  { name: "Kingdom Centre", logo: { src: "/logos/kingdom-centre.svg", width: 165, height: 225 }, size: 78 },
  { name: "Meska", logo: { src: "/logos/meska.svg", width: 381, height: 61 }, size: 30 },
  { name: "Techno & Chill", logo: { src: "/logos/techno-and-chill.svg", width: 474, height: 306 }, size: 54 },
  { name: "Al Jazeera", logo: { src: "/logos/aljazeera.svg", width: 133, height: 212 }, size: 72 },
  { name: "Ajyal Film Academy", logo: { src: "/logos/afa.svg", width: 766, height: 89 }, size: 26 },
  { name: "Union of Video & Filmmakers", logo: { src: "/logos/uvf.svg", width: 801, height: 280 }, size: 48 },
  { name: "Beyon Experiences", logo: { src: "/logos/beyon.svg", width: 879, height: 239 }, size: 38 },
  { name: "Orbs Emergency Care (RBS)", logo: { src: "/logos/rbs.svg", width: 833, height: 162 }, size: 34 },
  { name: "Vektu", logo: { src: "/logos/vektu.svg", width: 690, height: 312 }, size: 48 },
  { name: "Anubis Martial Arts", logo: { src: "/logos/anubis.svg", width: 199, height: 329 }, size: 80 },
  { name: "VPadel", logo: { src: "/logos/vpadel.svg", width: 771, height: 113 }, size: 28 },
  { name: "SlyDive", logo: { src: "/logos/slydive.svg", width: 389, height: 215 }, size: 60 },
  { name: "Prime Hills Properties", logo: { src: "/logos/prime-hills.svg", width: 861, height: 252 }, size: 44 },
  { name: "London DBS", logo: { src: "/logos/london-dbs.svg", width: 1343, height: 314 }, size: 36 },
  { name: "PMG Healthcare", logo: { src: "/logos/pmg.svg", width: 512, height: 169 }, size: 38 },
  { name: "Bliphub", logo: { src: "/logos/bliphub.svg", width: 984, height: 230 }, size: 34 },
  { name: "Spark", logo: { src: "/logos/spark.svg", width: 172, height: 42 }, size: 30 },
  { name: "Verto Technologies", logo: { src: "/logos/verto.svg", width: 70, height: 61 }, size: 44 },
];

export const SOCIALS = [
  { label: "LinkedIn", handle: "Ahmed Hassan", note: "Career & experience", href: "https://www.linkedin.com/in/ahmed-hassan-30550b1b6/" },
  { label: "Behance", handle: "ahdev", note: "Case studies & visuals", href: "https://www.behance.net/ahdev" },
  { label: "GitHub", handle: "AhmadHassanDev", note: "Code & side projects", href: "https://github.com/AhmadHassanDev" },
  { label: "Instagram", handle: "@ahmaddhassan_", note: "Behind the scenes", href: "https://www.instagram.com/ahmaddhassan_/" },
];

/** Direct lines, shown on the contact page. The form's inbox is set by CONTACT_TO (see .env.example). */
export const CONTACT = {
  email: "ahmad.hassan.abdelmoaty@gmail.com",
  whatsapp: { number: "201119523790", display: "+20 111 952 3790" },
};
