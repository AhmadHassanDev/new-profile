import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import LostCanvas from "@/components/notfound/LostCanvas";
import type { Lang } from "@/i18n/lang";
import { ui } from "@/i18n/ui";

/** The 404, inside each language's own layout: an empty design frame with its "404" to put back together */
export default function NotFoundView({ lang }: { lang: Lang }) {
  return (
    <>
      <Cursor />
      <Nav />
      <main id="top">
        <h1 className="sr-only">{ui(lang).notFound.title}</h1>
        <LostCanvas />
      </main>
      <Contact minimal lang={lang} />
    </>
  );
}
