"use client";

import { useEffect, useRef } from "react";
import { SMOOTH_SCROLL } from "@/lib/scroll";
import Avatar from "./Avatar";

const clamp = (v: number, lo = -1, hi = 1) => Math.max(lo, Math.min(hi, v));
// Scroll-driven animations, which TypeScript's DOM types don't include yet
declare const ScrollTimeline: new (options: { source: Element; axis?: "block" | "inline" }) => AnimationTimeline;

type Size = { width: number; height: number };
type Box = Size & { left: number; top: number };

const smooth = (v: number) => {
  const t = clamp(v, 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * The 3D me, travelling down the page. It's one fixed frame that follows two placeholders: the hero's
 * spot (`data-avatar-slot="hero"`) and a dock (`data-avatar-slot="dock"`: a sticky column on wide
 * screens, a corner on phones). As the hero scrolls away it leaves on an arc, lifting, tilting into the
 * turn and shrinking, and lands in the dock, then rides along with it. Only one scene ever runs, rendered at the hero's size so it stays
 * crisp when small. The frame tilts toward the cursor; the circle clips the shoulders round (see
 * `.avatar-frame`), while the head can rise above it.
 */
export default function AvatarFrame() {
  const travellerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // Follow the slots
  useEffect(() => {
    const traveller = travellerRef.current;
    const hero = document.querySelector<HTMLElement>('[data-avatar-slot="hero"]');
    if (!traveller || !hero) return;
    const docks = [...document.querySelectorAll<HTMLElement>('[data-avatar-slot="dock"]')];
    const end = document.querySelector<HTMLElement>("[data-avatar-end]");
    const section = hero.closest("section") ?? hero;
    let frame = 0;
    // The flight as a scroll-driven animation (phones), when the browser can run one
    let flight: Animation | undefined;

    // Whichever dock is showing at this width; a corner one (phones) is fixed to the screen
    const currentDock = () => docks.find((d) => d.getClientRects().length > 0);
    const isCorner = (dock?: HTMLElement) => !!dock && getComputedStyle(dock).position === "fixed";

    /** Where it sits `t` of the way from the hero spot `a` to the dock `b`: centre to centre, on an arc that lifts mid-flight, tilting into the turn */
    const pose = (t: number, a: Box, b: Box, base: Size, lift: number) => {
      const arc = Math.sin(Math.PI * t);
      const cx = a.left + a.width / 2 + (b.left + b.width / 2 - (a.left + a.width / 2)) * t;
      const cy = a.top + a.height / 2 + (b.top + b.height / 2 - (a.top + a.height / 2)) * t - arc * window.innerHeight * lift;
      const scale = (a.width + (b.width - a.width) * t) / base.width;
      return `translate3d(${cx - base.width / 2}px, ${cy - base.height / 2}px, 0) rotate(${-arc * 9}deg) scale(${scale})`;
    };

    // A corner dock bows out as the page ends, rather than sit over the footer
    const gone = () => (end ? end.getBoundingClientRect().top < window.innerHeight * 0.75 : false);
    const setGone = (out: boolean) => {
      if (frameRef.current) frameRef.current.style.pointerEvents = out ? "none" : "";
    };

    /**
     * Phones scroll natively, and anything moved from a scroll listener trails the finger. So there the
     * whole flight is handed to the browser as an animation on the page's scroll, sampled from the
     * same path, which it plays in step with the scroll itself.
     */
    const fly = (dock: HTMLElement, base: Size) => {
      const y0 = window.scrollY;
      const rect = hero.getBoundingClientRect();
      const top = rect.top + y0;
      const b = dock.getBoundingClientRect();
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      // Lands by the time the hero spot is mostly scrolled away
      const range = Math.min(max, Math.max(1, top + rect.height - window.innerHeight * 0.2));
      const keyframes: Keyframe[] = [];
      for (let i = 0; i <= 30; i++) {
        const y = (range * i) / 30;
        const a = { left: rect.left, top: top - y, width: rect.width, height: rect.height };
        keyframes.push({ offset: y / max, transform: pose(smooth(y / range), a, b, base, 0.05), opacity: 1 });
      }
      const landed = keyframes[keyframes.length - 1].transform;
      const out = end ? end.getBoundingClientRect().top + y0 - window.innerHeight * 0.75 : Infinity;
      if (out > range && out < max) {
        keyframes.push({ offset: out / max, transform: landed, opacity: 1 });
        keyframes.push({ offset: Math.min(1, (out + 80) / max), transform: landed, opacity: 0 });
      }
      if (keyframes[keyframes.length - 1].offset !== 1) keyframes.push({ offset: 1, transform: landed, opacity: keyframes[keyframes.length - 1].opacity });
      flight?.cancel();
      flight = traveller.animate(keyframes, { timeline: new ScrollTimeline({ source: document.documentElement }), fill: "both" });
    };

    const place = () => {
      frame = 0;
      // Its size is the hero spot's own layout size, which never changes as the hero recedes, so the 3D
      // canvas never resizes mid-scroll; the shrinking is all done by `scale`
      const base = { width: hero.offsetWidth, height: hero.offsetHeight };
      traveller.style.width = `${base.width}px`;
      traveller.style.height = `${base.height}px`;
      traveller.style.opacity = "1";
      const dock = currentDock();
      if (dock && isCorner(dock) && "ScrollTimeline" in window) {
        fly(dock, base);
        setGone(gone());
        return;
      }
      flight?.cancel();
      flight = undefined;
      follow();
    };

    /** Everywhere else, it's placed on each scroll step (smooth scrolling announces those before it paints) */
    const follow = () => {
      if (flight) {
        setGone(gone());
        return;
      }
      const base = { width: hero.offsetWidth, height: hero.offsetHeight };
      const a = hero.getBoundingClientRect();
      const dock = currentDock();
      const b = dock?.getBoundingClientRect() ?? a;
      // From the first scroll until most of the hero has gone
      const t = smooth(window.scrollY / (section.offsetHeight * 0.75));
      traveller.style.transform = pose(t, a, b, base, 0.14);
      const out = isCorner(dock) && gone();
      traveller.style.opacity = out ? "0" : "1";
      setGone(out);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };

    place();
    window.addEventListener(SMOOTH_SCROLL, follow);
    window.addEventListener("scroll", follow, { passive: true });
    window.addEventListener("resize", schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(hero);
    // The page growing (images, fonts) moves where the flight's scroll range ends
    resize.observe(document.body);
    for (const dock of docks) resize.observe(dock);
    return () => {
      cancelAnimationFrame(frame);
      flight?.cancel();
      window.removeEventListener(SMOOTH_SCROLL, follow);
      window.removeEventListener("scroll", follow);
      window.removeEventListener("resize", schedule);
      resize.disconnect();
    };
  }, []);

  // Tilt toward the cursor, like a card held up to you
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: PointerEvent) => {
      const rect = frame.getBoundingClientRect();
      const x = clamp((e.clientX - (rect.left + rect.width / 2)) / window.innerWidth);
      const y = clamp((e.clientY - (rect.top + rect.height / 2)) / window.innerHeight);
      frame.style.setProperty("--tilt-x", `${(-y * 10).toFixed(2)}deg`);
      frame.style.setProperty("--tilt-y", `${(x * 12).toFixed(2)}deg`);
    };
    const onLeave = () => {
      frame.style.setProperty("--tilt-x", "0deg");
      frame.style.setProperty("--tilt-y", "0deg");
    };
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={travellerRef}
      className="pointer-events-none fixed top-0 left-0 z-40 origin-center opacity-0 transition-opacity duration-500 [perspective:900px]"
    >
      <div
        ref={frameRef}
        className="pointer-events-auto relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] [transform:rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))]"
      >
        <div aria-hidden className="avatar-circle absolute inset-x-0 bottom-0 aspect-square rounded-full" />
        <div className="avatar-frame absolute inset-0">
          <Avatar variant="student" />
        </div>
      </div>
    </div>
  );
}
