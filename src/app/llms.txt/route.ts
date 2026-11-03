import { CASES } from "@/content/cases";
import { CLIENTS, CONTACT, PROCESS, PROJECTS, SERVICES, SOCIALS, STATS, STORY } from "@/content/site";
import { absoluteUrl, JOB_TITLE, NAME, SITE_DESCRIPTION } from "@/lib/seo";

/**
 * /llms.txt (https://llmstxt.org): a plain summary for AI assistants of who Ahmed is, what he offers and
 * where to read more. Built from the same content as the pages, with links from the site URL, so it
 * never drifts from the site.
 */
export function GET() {
  const hasCase = (slug: string) => CASES.some((study) => study.slug === slug);
  const caseStudies = PROJECTS.filter((p) => hasCase(p.slug));
  const otherProjects = PROJECTS.filter((p) => !hasCase(p.slug));

  const text = [
    `# ${NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    `${NAME} is an Egyptian ${JOB_TITLE.toLowerCase()}. He researches what people need, designs what they'll choose, and builds it himself, so nothing gets lost in hand-off.`,
    "",
    "## His story, in his words",
    "",
    ...STORY.map((step) => `- ${step.when}: ${step.body}`),
    `- In numbers: ${STATS.map((stat) => `${stat.value}${stat.suffix} ${stat.label.toLowerCase()}`).join(", ")}.`,
    "",
    "## Services",
    "",
    ...SERVICES.map((service) => `- ${service.title}`),
    "",
    "## How he works",
    "",
    ...PROCESS.map((step) => `- ${step.verb} (${step.name}): ${step.line} ${step.body} Tools: ${step.kit.join(", ")}.`),
    "",
    "## Pages",
    "",
    `- [Home](${absoluteUrl("/")}): who he is, selected work, clients and services`,
    `- [Work](${absoluteUrl("/work")}): every published project, filterable by type and discipline`,
    `- [About](${absoluteUrl("/about")}): his story, how he works, and life off the clock`,
    `- [Contact](${absoluteUrl("/contact")}): message form, WhatsApp, email and social profiles`,
    "",
    "## Case studies",
    "",
    ...caseStudies.map((p) => `- [${p.name}](${absoluteUrl(`/work/${p.slug}`)}): ${p.summary} (${p.kind}, ${p.year}; ${p.disciplines.join(", ")})`),
    "",
    ...(otherProjects.length
      ? [
          "## Other projects",
          "",
          ...otherProjects.map((p) => `- ${p.name}: ${p.summary} (${p.kind}, ${p.year}; ${p.disciplines.join(", ")})`),
          "",
        ]
      : []),
    "## Clients",
    "",
    `${CLIENTS.map((client) => client.name).join("; ")}.`,
    "",
    "## Contact",
    "",
    `- Email: ${CONTACT.email}`,
    `- WhatsApp: ${CONTACT.whatsapp.display} (https://wa.me/${CONTACT.whatsapp.number})`,
    `- Contact form: ${absoluteUrl("/contact")}`,
    ...SOCIALS.map((social) => `- ${social.label}: ${social.href}`),
    "",
    "## Optional",
    "",
    `- [Sitemap](${absoluteUrl("/sitemap.xml")})`,
    "",
  ].join("\n");

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
