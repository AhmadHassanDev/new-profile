"use client";

import { useEffect, useRef } from "react";
import { SMOOTH_SCROLL } from "@/lib/scroll";
import Avatar from "./Avatar";
import { clamp, smooth } from "@/lib/math";

// Scroll-driven animations, which TypeScript's DOM types don't include yet
declare const ScrollTimeline: new (options: { source: Element; axis?: "block" | "inline" }) => AnimationTimeline;

type Size = { width: number; height: number };

/**
 * The 3D me, travelling down the page. It's one fixed frame that follows two placeholders: the hero's
 * spot (`data-avatar-slot="hero"`) and a dock (`data-avatar-slot="dock"`: a sticky column on wide
 * screens, a corner on phones). As the hero scrolls away it leaves on an arc, lifting, tilting into the
 * turn and shrinking, and lands in the dock, then rides along with it. Only one scene ever runs,
 * rendered at the hero's size so it stays crisp when small. The frame tilts toward the cursor; the
 * circle clips the shoulders round (see `.avatar-frame`), while the head can rise above it.
 *
 * It lives in a full-screen fixed layer: a mover inside it carries it across the screen, and the box
 * inside that turns and scales it about its centre.
 */
export default function AvatarFrame() {
  const layerRef = useRef<HTMLDivElement>(null);
  const moverRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // Follow the slots
  useEffect(() => {
    const layer = layerRef.current;
    const mover = moverRef.current;
    const box = boxRef.current;
    const hero = document.querySelector<HTMLElement>('[data-avatar-slot="hero"]');
    if (!layer || !mover || !box || !hero) return;
    const docks = [...document.querySelectorAll<HTMLElement>('[data-avatar-slot="dock"]')];
    const end = document.querySelector<HTMLElement>("[data-avatar-end]");
    const section = hero.closest("section") ?? hero;
    let frame = 0;
    // The flight as scroll-driven animations (phones), when the browser can run them
    let flight: Animation[] = [];
    const ground = () => {
      for (const animation of flight) animation.cancel();
      flight = [];
    };

    // Whichever dock is showing at this width; a corner one (phones) is fixed to the screen
    const currentDock = () => docks.find((d) => d.getClientRects().length > 0);
    const isCorner = (dock?: HTMLElement) => !!dock && getComputedStyle(dock).position === "fixed";

    /** `t` of the way from the hero spot to the dock: centre to centre, on an arc that lifts mid-flight, tilting into the turn */
    // With reduced motion it still follows the page to its dock, but without the arc and the tilt
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const turn = (t: number, from: Size, to: Size, base: Size) => {
      const arc = still ? 0 : Math.sin(Math.PI * t);
      return { arc, transform: `rotate(${-arc * 9}deg) scale(${(from.width + (to.width - from.width) * t) / base.width})` };
    };

    // A corner dock bows out as the page ends, rather than sit over the footer
    const gone = () => (end ? end.getBoundingClientRect().top < window.innerHeight * 0.75 : false);
    let wasGone = false;
    const setGone = (out: boolean) => {
      if (frameRef.current) frameRef.current.style.pointerEvents = out ? "none" : "";
      // Faded out, it can stop drawing too (see Avatar)
      if (out !== wasGone) window.dispatchEvent(new CustomEvent("avatar:bowed", { detail: out }));
      wasGone = out;
    };

    /**
     * Phones scroll natively, and anything moved from a scroll listener trails the finger. So there the
     * whole flight is handed to the browser as animations on the page's scroll, which it plays in step
     * with the scroll itself. Phones also show and hide their address bar as you scroll, which changes
     * the screen's height and moves the corner dock with it; so the flight is measured partly in
     * percentages of the full-screen layer, which is the very box the dock hangs in, and the landed
     * frame moves with the dock without anything being re-measured.
     */
    const fly = (dock: HTMLElement, base: Size) => {
      const y0 = window.scrollY;
      const rect = hero.getBoundingClientRect();
      const top = rect.top + y0;
      const b = dock.getBoundingClientRect();
      const screen = layer.getBoundingClientRect().height;
      // The dock's centre, from the bottom of the screen
      const gap = screen - (b.top + b.height / 2);
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      // Lands by the time the hero spot is mostly scrolled away
      const range = Math.min(max, Math.max(1, top + rect.height - window.innerHeight * 0.2));
      const at = (y: number) => {
        const t = smooth(y / range);
        const { arc, transform } = turn(t, rect, b, base);
        const cx = rect.left + rect.width / 2 + (b.left + b.width / 2 - (rect.left + rect.width / 2)) * t;
        // Centre to centre: from the hero spot (from the top, in px) to the dock (from the bottom, as a
        // share of the screen), lifting a little mid-flight
        const heroY = top + rect.height / 2 - y;
        const share = (t - arc * 0.05) * 100;
        const px = (1 - t) * heroY - t * gap - base.height / 2;
        return { move: `translate3d(${cx - base.width / 2}px, calc(${share}% + ${px}px), 0)`, transform };
      };
      const moves: Keyframe[] = [];
      const turns: Keyframe[] = [];
      for (let i = 0; i <= 30; i++) {
        const y = (range * i) / 30;
        const { move, transform } = at(y);
        moves.push({ offset: y / max, transform: move, opacity: 1 });
        turns.push({ offset: y / max, transform });
      }
      const landed = at(range);
      const out = end ? end.getBoundingClientRect().top + y0 - window.innerHeight * 0.75 : Infinity;
      if (out > range && out < max) {
        moves.push({ offset: out / max, transform: landed.move, opacity: 1 });
        moves.push({ offset: Math.min(1, (out + 80) / max), transform: landed.move, opacity: 0 });
      }
      if (moves[moves.length - 1].offset !== 1) moves.push({ offset: 1, transform: landed.move, opacity: moves[moves.length - 1].opacity });
      turns.push({ offset: 1, transform: landed.transform });
      ground();
      const timeline = new ScrollTimeline({ source: document.documentElement });
      flight = [mover.animate(moves, { timeline, fill: "both" }), box.animate(turns, { timeline, fill: "both" })];
    };

    const place = () => {
      frame = 0;
      width = window.innerWidth;
      // Its size is the hero spot's own layout size, which never changes as the hero recedes, so the 3D
      // canvas never resizes mid-scroll; the shrinking is all done by `scale`
      const base = { width: hero.offsetWidth, height: hero.offsetHeight };
      box.style.width = `${base.width}px`;
      box.style.height = `${base.height}px`;
      layer.style.opacity = "1";
      const dock = currentDock();
      if (dock && isCorner(dock) && "ScrollTimeline" in window) {
        fly(dock, base);
        setGone(gone());
        return;
      }
      ground();
      follow();
    };

    /** Everywhere else, it's placed on each scroll step (smooth scrolling announces those before it paints) */
    const follow = () => {
      if (flight.length) return;
      const base = { width: hero.offsetWidth, height: hero.offsetHeight };
      const a = hero.getBoundingClientRect();
      const dock = currentDock();
      const b = dock?.getBoundingClientRect() ?? a;
      // From the first scroll until most of the hero has gone
      const t = smooth(window.scrollY / (section.offsetHeight * 0.75));
      const { arc, transform } = turn(t, a, b, base);
      const cx = a.left + a.width / 2 + (b.left + b.width / 2 - (a.left + a.width / 2)) * t;
      const cy = a.top + a.height / 2 + (b.top + b.height / 2 - (a.top + a.height / 2)) * t - arc * window.innerHeight * 0.14;
      mover.style.transform = `translate3d(${cx - base.width / 2}px, ${cy - base.height / 2}px, 0)`;
      box.style.transform = transform;
      const out = isCorner(dock) && gone();
      layer.style.opacity = out ? "0" : "1";
      setGone(out);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };
    // The address bar coming and going only changes the height, which the flight already allows for
    let width = window.innerWidth;
    const onResize = () => {
      if (!flight.length || window.innerWidth !== width) schedule();
    };

    // While it's flying on its own, whether it has bowed out (so it stops catching taps and drawing) is
    // watched without listening to the scroll at all
    const ending = end
      ? new IntersectionObserver(([entry]) => flight.length && setGone(entry.isIntersecting || entry.boundingClientRect.top < 0), {
          rootMargin: "0px 0px -25% 0px",
        })
      : undefined;
    if (end) ending?.observe(end);

    // Once the hero spot has gone and it's flying on its own (phones), it's small in the corner
    const docked = new IntersectionObserver(([entry]) =>
      window.dispatchEvent(new CustomEvent("avatar:power", { detail: !!flight.length && !entry.isIntersecting })),
    );
    docked.observe(hero);

    place();
    window.addEventListener(SMOOTH_SCROLL, follow);
    window.addEventListener("scroll", follow, { passive: true });
    window.addEventListener("resize", onResize);
    const resize = new ResizeObserver(schedule);
    resize.observe(hero);
    // The page growing (images, fonts) moves where the flight's scroll range ends
    resize.observe(document.body);
    for (const dock of docks) resize.observe(dock);
    return () => {
      cancelAnimationFrame(frame);
      ground();
      ending?.disconnect();
      docked.disconnect();
      window.removeEventListener(SMOOTH_SCROLL, follow);
      window.removeEventListener("scroll", follow);
      window.removeEventListener("resize", onResize);
      resize.disconnect();
    };
  }, []);

  // Tilt toward the cursor, like a card held up to you
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: PointerEvent) => {
      // A finger dragging to scroll isn't a cursor to lean towards
      if (e.pointerType !== "mouse") return;
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
    <div ref={layerRef} className="pointer-events-none fixed inset-0 z-40 opacity-0 transition-opacity duration-500">
      <div ref={moverRef} className="absolute inset-0">
        <div ref={boxRef} className="absolute top-0 left-0 origin-center [perspective:900px]">
          <div
            ref={frameRef}
            className="pointer-events-auto relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] [transform:rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))]"
          >
            <div aria-hidden className="avatar-circle absolute inset-x-0 bottom-0 aspect-square rounded-full" />
            <div className="avatar-frame absolute inset-0">
              <Avatar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
