"use client";

import { useEffect, useRef } from "react";
import { isLoaderDone, LOADER_PROGRESS, whenLoaderDone } from "@/lib/loader";

export const EXCITE_EVENT = "hero:excite";

type Scene = import("./SpectrumScene").SpectrumScene;

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let cleanup = () => {};

    // Loaded on demand so three.js stays out of the first paint.
    import("./SpectrumScene").then(({ SpectrumScene }) => {
      if (disposed) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // If the loader is still up, the particles play its intro: dust gathering into the logo.
      const intro = !isLoaderDone();
      let scene: Scene;
      try {
        scene = new SpectrumScene(canvas, reduced, intro);
      } catch {
        return; // No WebGL: the CSS glow behind the canvas stays as the visual.
      }

      // The hero reserves a box for the particles (beside the headline, or above it in portrait);
      // whichever one is showing tells the scene where to sit and how big to be.
      const zones = [...(canvas.parentElement?.querySelectorAll<HTMLElement>("[data-particle-zone]") ?? [])];
      const size = () => {
        const frame = canvas.getBoundingClientRect();
        const zone = zones.map((el) => el.getBoundingClientRect()).find((box) => box.width > 0 && box.height > 0);
        scene.setZone(zone ? { x: zone.left - frame.left, y: zone.top - frame.top, w: zone.width, h: zone.height } : null);
        scene.resize(canvas.clientWidth, canvas.clientHeight);
      };
      const onPointer = (e: PointerEvent) =>
        scene.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
      const onScroll = () => scene.setScroll(Math.min(1, window.scrollY / window.innerHeight));
      const onExcite = (e: Event) => scene.setExcite((e as CustomEvent<boolean>).detail);
      const onProgress = (e: Event) => scene.setIntroProgress((e as CustomEvent<number>).detail);

      const resizeObserver = new ResizeObserver(size);
      resizeObserver.observe(canvas);
      zones.forEach((zone) => resizeObserver.observe(zone));
      const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? scene.start() : scene.stop()));
      visibility.observe(canvas);

      window.addEventListener("pointermove", onPointer);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener(EXCITE_EVENT, onExcite);
      window.addEventListener(LOADER_PROGRESS, onProgress);
      if (intro) whenLoaderDone().then(() => scene.endIntro());
      size();
      onScroll();
      canvas.dataset.ready = "true";

      cleanup = () => {
        resizeObserver.disconnect();
        visibility.disconnect();
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener(EXCITE_EVENT, onExcite);
        window.removeEventListener(LOADER_PROGRESS, onProgress);
        scene.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-[1.6s] ease-out data-[ready=true]:opacity-100"
    />
  );
}
