"use client";

import { useEffect } from "react";
import { SMOOTH_SCROLL } from "@/lib/scroll";

/**
 * Feeds `--recede` (0 at the top, 1 one screen down) to the About hero, which shrinks, dims and splits
 * its headline apart as the page rises over it (see `.hero-recede` in globals.css).
 */
export default function HeroRecede() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Updated in step with the scroll itself (not a frame later), so the hero and the avatar stay in sync
    const update = () => root.style.setProperty("--recede", Math.min(1, Math.max(0, window.scrollY / window.innerHeight)).toFixed(4));
    update();
    window.addEventListener(SMOOTH_SCROLL, update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener(SMOOTH_SCROLL, update);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      root.style.removeProperty("--recede");
    };
  }, []);

  return null;
}
