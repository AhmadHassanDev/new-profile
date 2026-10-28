import Clients from "@/components/Clients";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import Hero from "@/components/Hero";
import Loader from "@/components/Loader";
import Marquee from "@/components/Marquee";
import Nav from "@/components/Nav";
import Skills from "@/components/Skills";
import Work from "@/components/Work";

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
        <Work />
        <Skills />
      </main>
      <Contact />
    </>
  );
}
