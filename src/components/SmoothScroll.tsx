"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { whenLoaderDone } from "@/lib/loader";
import { SCROLL_LOCK, SMOOTH_SCROLL } from "@/lib/scroll";

/**
 * Eased, weighty wheel scrolling for the whole site (touch keeps the phone's native scroll), and every
 * new page starting at its top.
 */
export default function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const firstPage = useRef(true);
  const goingBack = useRef(false);

  useEffect(() => {
    // Back and forward return to where you were, so they're left alone
    const onPop = () => (goingBack.current = true);
    window.addEventListener("popstate", onPop);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => window.removeEventListener("popstate", onPop);

    const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.09 });
    lenisRef.current = lenis;
    // Lets anything pinned to the scroll position move in the same frame as the page
    lenis.on("scroll", () => window.dispatchEvent(new Event(SMOOTH_SCROLL)));

    // The page holds still while the loader plays and while the menu is open.
    if (document.querySelector(".site-loader")) {
      lenis.stop();
      whenLoaderDone().then(() => lenis.start());
    }
    const onLock = (e: Event) => ((e as CustomEvent<boolean>).detail ? lenis.stop() : lenis.start());
    window.addEventListener(SCROLL_LOCK, onLock);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener(SCROLL_LOCK, onLock);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // A new page starts at the top. Next only scrolls when the new page's first element is out of view,
  // and every page here opens with the fixed nav, which always is in view, so it never would; the smooth
  // scroll could also still be gliding from the last page. Links to a #section keep their own scroll.
  useEffect(() => {
    if (firstPage.current) {
      firstPage.current = false;
      return;
    }
    if (goingBack.current) {
      goingBack.current = false;
      return;
    }
    if (window.location.hash) return;
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
