import Link from "next/link";
import { localePath, type Lang } from "@/i18n/lang";

/** The pill that leads from a work grid onward: to the full list, or down to it. */
export default function WorkLink({
  href,
  arrow = "→",
  lang = "en",
  children,
}: {
  href: string;
  arrow?: string;
  lang?: Lang;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={localePath(lang, href)}
      className="group pointer-events-auto inline-flex w-fit items-center gap-3 rounded-full bg-ink py-2 pe-2 ps-6 text-base font-semibold text-bg transition-transform duration-300 hover:scale-[1.04]"
    >
      {children}
      <span
        aria-hidden
        className="grid size-10 place-items-center rounded-full text-ink transition-transform duration-500 group-hover:rotate-[-45deg] rtl:group-hover:rotate-[45deg]"
        style={{ background: "var(--spectrum)" }}
      >
        {/* A sideways arrow points the way you read */}
        <span className={arrow === "→" ? "arrow" : undefined}>{arrow}</span>
      </span>
    </Link>
  );
}
