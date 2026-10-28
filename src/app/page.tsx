import About from "@/components/About";
import Clients from "@/components/Clients";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import Hero from "@/components/Hero";
import Loader from "@/components/Loader";
import Marquee from "@/components/Marquee";
import Nav from "@/components/Nav";
import Services from "@/components/Services";
import Work from "@/components/Work";
import WorkLink from "@/components/work/WorkLink";

export default function Home() {
  return (
    <>
      <Loader />
      <Cursor />
      <Nav />
      <main id="top">
        <Hero />
        <Clients />
        <Marquee />
        <Work
          action={
            <WorkLink href="/work">
              All work
            </WorkLink>
          }
        />
        <About />
        <Services />
      </main>
      <Contact />
    </>
  );
}
