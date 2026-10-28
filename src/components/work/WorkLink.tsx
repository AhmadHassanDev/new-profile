import Link from "next/link";

/** The pill that leads from a work grid onward: to the full list, or down to it. */
export default function WorkLink({ href, arrow = "→", children }: { href: string; arrow?: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group pointer-events-auto inline-flex items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-6 text-base font-semibold text-bg transition-transform duration-300 hover:scale-[1.04]"
    >
      {children}
      <span
        aria-hidden
        className="grid size-10 place-items-center rounded-full text-ink transition-transform duration-500 group-hover:rotate-[-45deg]"
        style={{ background: "var(--spectrum)" }}
      >
        {arrow}
      </span>
    </Link>
  );
}
