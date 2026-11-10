import type * as EN from "../site";
import type { Project } from "../site";

/**
 * The Arabic (Egyptian) counterpart of ../site, drop-in interchangeable with it.
 *
 * Fields that code uses as keys or parses stay in English, byte-identical to ../site:
 * discipline names, `Project.kind` (parsed by `typeOf`), `SERVICES[].type`/`tag`, social labels.
 * Their Arabic display text lives in KIND_AR, TYPE_AR and DISCIPLINE_AR below.
 */

export type { Discipline, Project, Client } from "../site";

// Nothing in these is shown as translatable text, so they come straight from the English module
export { DISCIPLINE_COLOR, COVER_WIDTH, COVER_HEIGHT, CLIENTS, CONTACT } from "../site";

/** Display text for the four discipline names, which stay in English as keys */
export const DISCIPLINE_AR: Record<string, string> = {
  "UX research": "أبحاث المستخدم",
  "UI design": "تصميم الواجهات",
  "Front-end": "تطوير الواجهات الأمامية",
  Branding: "براندينج",
};

/** Display text for every `Project.kind`, which stays in English because `typeOf` parses it */
export const KIND_AR: Record<string, string> = {
  "Website · Healthcare": "موقع · رعاية صحية",
  "Website · Diving": "موقع · غطس",
  "Landing page · Sports & activities": "لاندينج بيدج · رياضة وأنشطة",
  "Branding · Real estate": "براندينج · عقارات",
  "Branding & website · Healthcare": "براندينج وموقع · رعاية صحية",
  "Website · Venture studio": "موقع · ستوديو مشاريع",
  "Website · Marketing agency": "موقع · وكالة ماركتنج",
  "Mobile app · Martial arts": "تطبيق موبايل · فنون قتالية",
  "Mobile app · Healthcare": "تطبيق موبايل · رعاية صحية",
  "Landing page · Fintech": "لاندينج بيدج · فينتك",
  "Landing page · Food & beverage": "لاندينج بيدج · أكل ومشروبات",
  "Mobile app · Fintech": "تطبيق موبايل · فينتك",
  "Web app · Verto Technologies": "تطبيق ويب · Verto Technologies",
};

/** Display text for what `typeOf` returns (the Work filter's "Type" options, `SERVICES[].type`) */
export const TYPE_AR: Record<string, string> = {
  Website: "موقع",
  "Web app": "تطبيق ويب",
  "Mobile app": "تطبيق موبايل",
  Branding: "براندينج",
};

// Every project, including ones still waiting on their cover
const ALL_PROJECTS: Project[] = [
  {
    slug: "pmg",
    name: "PMG",
    kind: "Website · Healthcare",
    year: "2026",
    summary:
      "موقع و Sanity CMS لـPMG، اللي بتدير العيادات الخاصة للاستشاريين المستقلين في بريطانيا: الفواتير والتحصيل، الكودينج الطبي، التسجيل مع السفارات وحاجات تانية.",
    disciplines: ["UX research", "UI design", "Front-end"],
    cover: "/work/pmg.webp",
  },
  {
    slug: "slydive",
    name: "SlyDive",
    kind: "Website · Diving",
    year: "2026",
    summary:
      "ريديزاين لموقع SlyDive، الدايف سنتر بتاع دهب: كورسات PADI، تدريب TDI التقني، غطسات مع جايد ورحلات مركب في البحر الأحمر، كله في مكان واحد.",
    disciplines: ["UI design", "Front-end"],
    cover: "/work/slydive.webp",
  },
  {
    slug: "spark",
    name: "Spark",
    kind: "Landing page · Sports & activities",
    year: "2026",
    summary:
      "تصميم لاندينج بيدج لـSpark، الأبلكيشن المصري لحجز البادل والكورة والبطولات والتجارب، ومعاها صفحة تانية بتضم الأماكن اللي وراها.",
    disciplines: ["UI design"],
    cover: "/work/spark.webp",
  },
  {
    slug: "prime-hills",
    name: "Prime Hills",
    kind: "Branding · Real estate",
    year: "2026",
    summary: "لوجو وعلامة براند لـPrime Hills Properties.",
    disciplines: ["Branding"],
    cover: "/work/primehills.webp",
  },
  {
    slug: "london-dbs",
    name: "London DBS",
    kind: "Branding & website · Healthcare",
    year: "2025",
    summary:
      "براند وموقع و Sanity CMS لـLondon DBS، عيادة التحفيز العميق للمخ اللي بيقودها أ.د. إيرليك بيريرا وأ.د. فرانشيسكا مورجانتي، من اللوجو لحد الموقع اللايف.",
    disciplines: ["Branding", "UX research", "UI design", "Front-end"],
    cover: "/work/london-dbs.webp",
  },
  {
    slug: "blacksprint",
    name: "Blacksprint",
    kind: "Website · Venture studio",
    year: "2025",
    summary:
      "تصميم وتنفيذ موقع Blacksprint، ستوديو المنتجات بتاع كريم نجيب، وبيعرض مشاريعه وهي شغالة: EZeats و Techno & Chill و ¡Salud! و RSRVIT وغيرهم.",
    disciplines: ["UI design", "Front-end"],
    cover: "/work/blacksprint-cover.webp",
  },
  {
    slug: "bliphub",
    name: "Bliphub",
    kind: "Website · Marketing agency",
    year: "2025",
    summary:
      "تصميم موقع Bliphub، وكالة ديجيتال كرييتيف متكاملة: UGC، سوشيال ميديا، كونتنت، إنتاج وشراء ميديا، براندينج واستشارات.",
    disciplines: ["UX research", "UI design"],
    cover: "/work/bliphub.webp",
  },
  {
    slug: "orbs",
    name: "ORBS",
    kind: "Mobile app · Healthcare",
    year: "2025",
    summary:
      "أبلكيشن تيليهيلث بالعربي والإنجليزي لـORBS في الرياض: المريض يوصل لاستشاري طوارئ في مكالمة فيديو، والدكتور يستقبل كل استشارة ويكتبها ويتابعها.",
    disciplines: ["UX research", "UI design"],
    cover: "/work/orbs-cover.webp",
  },
  {
    slug: "anubis",
    name: "Anubis",
    kind: "Mobile app · Martial arts",
    year: "2025",
    summary: "باكدجات الكلاسات والسيشنز والكوتشز والتشيك إن بالـQR لـAnubis Martial Arts في كل فروعها.",
    disciplines: ["UX research", "UI design"],
    cover: "/work/anubis.webp",
  },
  {
    slug: "finsync",
    name: "FinSync",
    kind: "Landing page · Fintech",
    year: "2025",
    summary: "بتوصّل البنوك بالشركات الصغيرة والمتوسطة، وبتسهّل الوصول للقروض والخدمات المالية عشان التمويل يبقى أسرع وأذكى.",
    disciplines: ["UX research", "UI design"],
    cover: "/work/finsync.webp",
  },
  {
    slug: "ezeats",
    name: "EZeats",
    kind: "Landing page · Food & beverage",
    year: "2025",
    summary:
      "منيو ديجيتال وطلب ودفع وتقييمات في فلو واحد للمطاعم في مصر والمغرب: انتظار أقل وخدمة أسلس.",
    disciplines: ["UX research", "UI design", "Front-end"],
  },
  {
    slug: "beltone-mortgage",
    name: "Beltone Mortgage",
    kind: "Mobile app · Fintech",
    year: "2024",
    summary:
      "طريقة جديدة لبيع حلول التمويل العقاري لـBeltone Mortgage Finance، تحت رقابة الهيئة العامة للرقابة المالية.",
    disciplines: ["UX research", "UI design"],
    cover: "/work/beltone.webp",
  },
  {
    slug: "swiftminis",
    name: "SwiftMinis",
    kind: "Web app · Verto Technologies",
    year: "2024",
    summary:
      "كروت تهنئة أونلاين لكل مناسبة. العملاء بيضيفوا الناس بتوعهم ويخلّوهم يصمموا ويشاركوا كروت على مزاجهم.",
    disciplines: ["UI design", "Front-end"],
    cover: "/work/swiftminis.webp",
  },
];

// A project goes live once it has a cover; until then it stays out of every grid and list
export const PROJECTS: typeof EN.PROJECTS = ALL_PROJECTS.filter((p): p is Project & { cover: string } => !!p.cover);

// Websites and landing pages are one kind of work: they're listed, counted and filtered together
const WEBSITE = ["Website", "Landing page", "Branding & website"];

/** "Mobile app · Fintech" → "Mobile app"; any website or landing page → "Website" (English keys; see TYPE_AR) */
export const typeOf: typeof EN.typeOf = (kind: string) => {
  const type = kind.split(" · ")[0];
  return WEBSITE.includes(type) ? "Website" : type;
};

/**
 * What Ahmed does. Most are tied to the projects that show them and link to the work page filtered;
 * one with no published project yet links straight to contact instead.
 */
export const SERVICES: typeof EN.SERVICES = [
  { title: "مواقع", type: "Website" },
  { title: "تطبيقات ويب", type: "Web app" },
  { title: "أبحاث المستخدم", tag: "UX research" },
  { title: "براندينج ولوجوهات", type: "Branding" },
  { title: "تطبيقات موبايل", type: "Mobile app" },
];

/** The three steps of the process, named like the hero's verbs, each with what it uses. */
export const PROCESS: typeof EN.PROCESS = [
  {
    verb: "بحث",
    name: "UX research",
    line: "افهم الناس محتاجة إيه بجد.",
    body: "مفيش منتج بيكسب من غير ما يفهم مستخدمينه والسوق والمنافسين. بعرف الناس محتاجة إيه، ورأيهم إيه في الموجود دلوقتي.",
    kit: ["مقابلات مع المستخدمين", "أبحاث السوق", "تحليل المنافسين"],
  },
  {
    verb: "تصميم",
    name: "UI design",
    line: "خلّيه الاختيار الأول.",
    body: "الواجهة الحلوة هي الفرق بين تجربة تفتكرها وتجربة تنساها. الناس بتختار المنتج الأحلى، حتى لو الاتنين بيعملوا نفس الحاجة.",
    kit: ["Figma", "Adobe XD", "Illustrator"],
  },
  {
    verb: "تنفيذ",
    name: "Front-end",
    line: "سلّم بالظبط اللي اتصمم.",
    body: "تحويل التصميم لمنتج لايف وسريع هو آخر خطوة في السكة. بنفّذه بنفسي بفريموركس حديثة، عشان مفيش حاجة تضيع في التسليم.",
    kit: ["React", "Next.js", "Vue", "Tailwind", "Bootstrap", "Node.js", "Flutter", "Git"],
  },
];

/** The about page, from Ahmed's own words on the old site. */
export const STORY: typeof EN.STORY = [
  { when: "في الأول", title: "اتشدّيت للتصميم", body: "حبيت التصميم والكرييتيف كودينج قبل الجامعة، وفضلت آخد كل كورس وتيوتوريال أوصله." },
  { when: "2021", title: "علوم الحاسب", body: "اتخرجت من جامعة مصر الدولية (MIU) بشهادة في علوم الحاسب، وطلعت بعادة إني أهتم الحاجة شغالة إزاي." },
  { when: "بعدها", title: "المستخدم الأول", body: "مشاريع الفريلانس والتدريب علّموني إن المنتج مبينجحش غير لما يتخطط حوالين مستخدمينه. فاتعلمت أبحاث المستخدم والتصميم." },
  { when: "دلوقتي", title: "بعد أكتر من 60 عميل", body: "بحث وتصميم وتنفيذ لهيئات حكومية وصناديق ووكالات وستارت أبس في أكتر من 5 مناطق." },
];

/** What I love outside work; each pops up its own little 3D object on hover (see PassionCard) */
export const PASSIONS: typeof EN.PASSIONS = [
  { title: "الجيمنج", color: "var(--cyan)", object: "controller", body: "المكان اللي بفصل فيه، واللي بذاكر فيه إحساس التفاعلات الحلوة." },
  { title: "التصميم", color: "var(--violet)", object: "pencil", body: "الـUX الكويس يا يعمل المنتج يا يهدّه، وماشي إيد في إيد مع UI حلو وسلس." },
  { title: "Arsenal", color: "var(--coral)", object: "ball", body: "جونر للنخاع، من موسم الـInvincibles اللي محدش هزمهم فيه 2003–04." },
  { title: "التطوير", color: "var(--ink)", object: "sprout", body: "دايمًا شغال على نسخة أحسن مني: كتاب جديد، مهارة جديدة، هواية جديدة. Atomic Habits هو اللي بدأ ده." },
];

export const QUOTE: typeof EN.QUOTE = { text: "دايمًا بيبان مستحيل لحد ما يتعمل.", by: "نيلسون مانديلا" };
export const STATS: typeof EN.STATS = [
  { value: 6, suffix: "+", label: "سنين خبرة" },
  { value: 5, suffix: "+", label: "مناطق" },
  { value: 60, suffix: "+", label: "عميل" },
];

export const SOCIALS: typeof EN.SOCIALS = [
  { label: "LinkedIn", handle: "Ahmed Hassan", note: "الخبرة والمسيرة المهنية", href: "https://www.linkedin.com/in/ahmed-hassan-30550b1b6/" },
  { label: "Behance", handle: "ahdev", note: "كيس ستديز وفيجوالز", href: "https://www.behance.net/ahdev" },
  { label: "Dribbble", handle: "AhmadHassanDev", note: "شوتس وتفاصيل UI", href: "https://dribbble.com/AhmadHassanDev" },
  { label: "GitHub", handle: "AhmadHassanDev", note: "كود ومشاريع جانبية", href: "https://github.com/AhmadHassanDev" },
  { label: "Instagram", handle: "@ahmedhdev", note: "ورا الكواليس", href: "https://www.instagram.com/ahmedhdev/" },
];

/** The CV, downloadable from the nav, the About hero and the contact page */
export const CV: typeof EN.CV = { href: "/ahmed-hassan-cv.pdf", file: "Ahmed Hassan - CV.pdf", note: "PDF · صفحتين" };
