"use client";

import { useEffect, useRef } from "react";
import { SMOOTH_SCROLL } from "@/lib/scroll";
import Avatar from "./Avatar";

const clamp = (v: number, lo = -1, hi = 1) => Math.max(lo, Math.min(hi, v));
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

    const place = () => {
      frame = 0;
      // Its size is the hero spot's own layout size, which never changes as the hero recedes, so the 3D
      // canvas never resizes mid-scroll; the shrinking is all done by `scale`
      const base = { width: hero.offsetWidth, height: hero.offsetHeight };
      const a = hero.getBoundingClientRect();
      // Whichever dock is showing at this width
      const dock = docks.find((d) => d.getClientRects().length > 0);
      const b = dock?.getBoundingClientRect() ?? a;
      // From the first scroll until most of the hero has gone
      const t = smooth(window.scrollY / (section.offsetHeight * 0.75));
      // Centre to centre, on an arc that lifts mid-flight, tilting into the turn
      const flight = Math.sin(Math.PI * t);
      const cx = a.left + a.width / 2 + (b.left + b.width / 2 - (a.left + a.width / 2)) * t;
      const cy = a.top + a.height / 2 + (b.top + b.height / 2 - (a.top + a.height / 2)) * t - flight * window.innerHeight * 0.14;
      const scale = (a.width + (b.width - a.width) * t) / base.width;
      const tilt = -flight * 9;
      traveller.style.width = `${base.width}px`;
      traveller.style.height = `${base.height}px`;
      traveller.style.transform = `translate3d(${cx - base.width / 2}px, ${cy - base.height / 2}px, 0) rotate(${tilt}deg) scale(${scale})`;
      // A corner dock (phones) bows out as the page ends, rather than sit over the footer
      const corner = dock && getComputedStyle(dock).position === "fixed";
      const gone = corner && end ? end.getBoundingClientRect().top < window.innerHeight * 0.75 : false;
      traveller.style.opacity = gone ? "0" : "1";
      if (frameRef.current) frameRef.current.style.pointerEvents = gone ? "none" : "";
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };

    place();
    // Placed in step with the scroll itself, so it moves with the page rather than a frame behind it
    window.addEventListener(SMOOTH_SCROLL, place);
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(hero);
    for (const dock of docks) resize.observe(dock);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(SMOOTH_SCROLL, place);
      window.removeEventListener("scroll", place);
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
