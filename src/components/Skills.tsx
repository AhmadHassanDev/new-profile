import { DISCIPLINE_COLOR, SKILLS, TOOLS } from "@/content/site";

export default function Skills() {
  return (
    <section id="about" className="px-4 py-32 md:px-10 md:py-48">
      <div className="mb-20 grid gap-8 md:grid-cols-12">
        <h2 className="font-display text-5xl leading-[0.9] font-bold tracking-[-0.04em] uppercase md:col-span-7 md:text-7xl">
          Real full-stack <span className="text-muted">front-end</span>
        </h2>
        <p className="max-w-lg self-end text-lg leading-relaxed text-muted md:col-span-5">
          I&apos;m a computer science graduate, so the technical side matters to me. Then I learned that a product only
          succeeds when it&apos;s planned around its users. So I learned{" "}
          <span className="text-ink">research and design, and I build what I design.</span>
        </p>
      </div>

      <ol>
        {SKILLS.map((skill, i) => {
          const color = DISCIPLINE_COLOR[skill.name];
          return (
            <li
              key={skill.name}
              className="group relative grid gap-4 border-t border-line py-10 md:grid-cols-12 md:items-center md:py-14"
              style={{ "--c": color } as React.CSSProperties}
            >
              <span
                aria-hidden
                className="absolute top-[-1px] left-0 h-px w-0 bg-[var(--c)] transition-all duration-700 ease-out group-hover:w-full"
              />
              <span className="font-display text-sm font-medium text-muted md:col-span-1">0{i + 1}</span>
              <h3 className="font-display text-5xl leading-none font-bold tracking-[-0.04em] uppercase transition-colors duration-500 md:col-span-6 md:text-8xl">
                <span className="text-muted transition-colors duration-500 group-hover:text-[var(--c)]">
                  {skill.name}
                </span>
              </h3>
              <p className="max-w-md text-lg leading-relaxed text-muted transition-colors duration-500 group-hover:text-ink md:col-span-5">
                {skill.body}
              </p>
            </li>
          );
        })}
      </ol>

      <div className="mt-16 flex flex-wrap gap-2 border-t border-line pt-10">
        <span className="mr-4 self-center text-sm font-semibold text-muted">Toolkit</span>
        {TOOLS.map((tool) => (
          <span
            key={tool}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-ink hover:bg-ink hover:text-bg"
          >
            {tool}
          </span>
        ))}
      </div>
    </section>
  );
}
