"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { whenLoaderDone } from "@/lib/loader";
import { SCROLL_LOCK } from "@/lib/scroll";

/** Eased, weighty wheel scrolling for the whole site. Touch keeps the phone's native scroll. */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.09 });

    // The page holds still while the loader plays and while the menu is open.
    if (document.querySelector(".site-loader")) {
      lenis.stop();
      whenLoaderDone().then(() => lenis.start());
    }
    const onLock = (e: Event) => ((e as CustomEvent<boolean>).detail ? lenis.stop() : lenis.start());
    window.addEventListener(SCROLL_LOCK, onLock);
    return () => {
      window.removeEventListener(SCROLL_LOCK, onLock);
      lenis.destroy();
    };
  }, []);

  return null;
}
