import type { Metadata } from "next";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import Work from "@/components/Work";
import WorkIndex from "@/components/work/WorkIndex";
import WorkLink from "@/components/work/WorkLink";

export const metadata: Metadata = {
  title: "Work — Ahmed Hassan",
  description: "Projects by Ahmed Hassan: UX research, UI design and front-end development for apps, platforms and websites.",
};

export default function WorkPage() {
  return (
    <>
      <Cursor />
      <Nav />
      <main id="top">
        <Work
          as="h1"
          title={["All", "work"]}
          action={
            <WorkLink href="#projects" arrow="↓">
              Browse &amp; filter
            </WorkLink>
          }
        />
        <WorkIndex />
      </main>
      <Contact />
    </>
  );
}
