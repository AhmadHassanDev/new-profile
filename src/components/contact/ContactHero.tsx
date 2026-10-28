"use client";

import { useEffect, useRef } from "react";
import { CONTACT } from "@/content/site";
import SocialIcon from "../SocialIcon";

type Scene = import("./HandsScene").HandsScene;

/** Fired with `detail: true` while a call to action is hovered: the hands close the gap. */
const TOUCH_EVENT = "contact:touch";
const touch = (on: boolean) => () => window.dispatchEvent(new CustomEvent(TOUCH_EVENT, { detail: on }));

/**
 * The contact page's opening: two particle hands reaching for each other between the headline and
 * the buttons. Scrolling draws them together; hovering "Start a conversation" closes the gap.
 */
export default function ContactHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    let disposed = false;
    let cleanup = () => {};

    import("./HandsScene").then(({ HandsScene }) => {
      if (disposed) return;
      let scene: Scene;
      try {
        scene = new HandsScene(canvas, window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      } catch {
        return; // No WebGL: the headline and buttons stand on their own.
      }
      const size = () => scene.resize(canvas.clientWidth, canvas.clientHeight);
      const onScroll = () => scene.setReach(Math.min(1, Math.max(0, window.scrollY / (section.offsetHeight * 0.6))));
      const onPointer = (e: PointerEvent) =>
        scene.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
      const onTouch = (e: Event) => scene.setTouch((e as CustomEvent<boolean>).detail);
      const resize = new ResizeObserver(size);
      resize.observe(canvas);
      const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? scene.start() : scene.stop()));
      visibility.observe(section);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("pointermove", onPointer);
      window.addEventListener(TOUCH_EVENT, onTouch);
      size();
      onScroll();
      canvas.dataset.ready = "true";

      cleanup = () => {
        resize.disconnect();
        visibility.disconnect();
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener(TOUCH_EVENT, onTouch);
        scene.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative flex min-h-[100svh] flex-col px-4 pt-32 pb-10 md:px-10 md:pt-36 md:pb-12">
      <p className="flex items-center gap-3 text-sm font-semibold text-muted">
        <span aria-hidden className="h-px w-10 bg-line" />
        Contact
      </p>
      <h1 className="mt-6 font-display text-[19vw] leading-[0.84] font-bold tracking-[-0.055em] uppercase md:text-[9.5vw]">
        <span className="reveal block md:inline-block">
          <span className="animate-rise block">Let&apos;s&nbsp;</span>
        </span>
        <span className="reveal block md:inline-block">
          <span className="text-spectrum animate-shimmer animate-rise block" style={{ animationDelay: "110ms" }}>
            talk.
          </span>
        </span>
      </h1>

      {/* The hands get their own band between the headline and the buttons, edges fading out */}
      <div className="relative -mx-4 my-6 min-h-[34svh] flex-1 [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)] md:-mx-10">
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000 data-[ready=true]:opacity-100"
        />
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <p className="max-w-md text-xl leading-snug font-medium text-muted md:text-2xl">
          Every product starts with one message. <span className="text-ink">Close the gap.</span>
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#message"
            onPointerEnter={touch(true)}
            onPointerLeave={touch(false)}
            onFocus={touch(true)}
            onBlur={touch(false)}
            className="group inline-flex items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-6 text-base font-semibold text-bg transition-transform duration-300 hover:scale-[1.04] md:text-lg"
          >
            Start a conversation
            <span
              aria-hidden
              className="grid size-11 place-items-center rounded-full text-ink transition-transform duration-500 group-hover:translate-y-0.5"
              style={{ background: "var(--spectrum)" }}
            >
              ↓
            </span>
          </a>
          <a
            href={`https://wa.me/${CONTACT.whatsapp.number}`}
            target="_blank"
            rel="noreferrer"
            onPointerEnter={touch(true)}
            onPointerLeave={touch(false)}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-bg/40 px-5 py-[15px] text-base font-semibold backdrop-blur-md transition-colors duration-300 hover:border-[#25d366] hover:text-[#25d366]"
          >
            <SocialIcon name="WhatsApp" className="size-5" />
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
