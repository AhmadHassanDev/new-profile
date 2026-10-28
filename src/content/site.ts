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
};

// Carried over from the old site. More projects to come.
export const PROJECTS: Project[] = [
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
  },
  {
    slug: "swiftminis",
    name: "SwiftMinis",
    kind: "Web app · Verto Technologies",
    year: "2024",
    summary:
      "Virtual greeting cards for every occasion. Clients add their people and let them design and share custom cards.",
    disciplines: ["UI design", "Front-end"],
  },
];

export const SKILLS: { name: Discipline; body: string }[] = [
  {
    name: "UX research",
    body: "No product wins without a real understanding of its users, its market and its competitors. I find out what people actually need, and what they think of what's already out there.",
  },
  {
    name: "UI design",
    body: "A good interface is the difference between a great experience and a forgettable one. People choose beautiful products over plain ones, even when both do the same job.",
  },
  {
    name: "Front-end",
    body: "Turning designs into a fast, live product is the last mile. I build with modern frameworks so what ships matches what was designed.",
  },
];

export const TOOLS = [
  "Figma",
  "Adobe XD",
  "Illustrator",
  "React",
  "Next.js",
  "Vue",
  "Tailwind",
  "Bootstrap",
  "Node.js",
  "Flutter",
  "Git",
  "GitHub",
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
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ahmed-hassan-30550b1b6/" },
  { label: "Behance", href: "https://www.behance.net/ahdev" },
  { label: "GitHub", href: "https://github.com/AhmadHassanDev" },
  { label: "Instagram", href: "https://www.instagram.com/ahmaddhassan_/" },
];
