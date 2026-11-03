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
    // Only wide screens pin the hero; elsewhere this would just restyle the whole page on every scroll
    const wide = window.matchMedia("(min-width: 1024px)");
    // Updated in step with the scroll itself (not a frame later), so the hero and the avatar stay in sync
    const update = () => root.style.setProperty("--recede", Math.min(1, Math.max(0, window.scrollY / window.innerHeight)).toFixed(4));
    const listen = (on: boolean) => {
      const method = on ? "addEventListener" : "removeEventListener";
      window[method](SMOOTH_SCROLL, update);
      window[method]("scroll", update, { passive: true });
      window[method]("resize", update);
      if (on) update();
      else root.style.removeProperty("--recede");
    };
    const onWidth = () => listen(wide.matches);
    if (wide.matches) listen(true);
    wide.addEventListener("change", onWidth);
    return () => {
      wide.removeEventListener("change", onWidth);
      listen(false);
    };
  }, []);

  return null;
}
