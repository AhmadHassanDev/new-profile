"use client";

import { useEffect, useRef } from "react";

type Scene = import("./BustScene").BustScene | import("./CharacterScene").CharacterScene;

// Each version of the 3D me, loaded only when it's used
const SCENES = {
  bust: () => import("./BustScene").then((m) => m.BustScene),
  character: () => import("./CharacterScene").then((m) => m.CharacterScene),
  student: () =>
    import("./CharacterScene").then(
      (m) =>
        class extends m.CharacterScene {
          constructor(canvas: HTMLCanvasElement, reducedMotion: boolean) {
            super(canvas, reducedMotion, m.CHARACTERS.student);
          }
        },
    ),
};

/**
 * The 3D me: the rigged student character in the hero, with the sculpted bust and the "father"
 * character as alternatives. It follows the cursor, reacts to scrolling, and does a trick when clicked
 * or tapped. The scene loads on its own after the page, and the page reads fine without it.
 */
export default function Avatar({ variant = "bust", className = "" }: { variant?: keyof typeof SCENES; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let cleanup = () => {};

    SCENES[variant]().then((Scene) => {
      if (disposed) return;
      let scene: Scene;
      try {
        scene = new Scene(canvas, window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      } catch {
        return; // No WebGL
      }
      // Pointer position in the canvas's own -1..1 space, even when it's outside the canvas
      const local = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        return [((e.clientX - rect.left) / rect.width) * 2 - 1, -(((e.clientY - rect.top) / rect.height) * 2 - 1)] as const;
      };
      const onMove = (e: PointerEvent) => {
        const [x, y] = local(e);
        scene.setPointer(x, y);
        const over = scene.hit(x, y);
        canvas.style.cursor = over ? "pointer" : "";
        if ("setHover" in scene) scene.setHover(over);
      };
      const onDown = (e: PointerEvent) => {
        const [x, y] = local(e);
        scene.setPointer(x, y);
        if (scene.hit(x, y)) scene.react();
      };
      // Chapters cue a reaction as they arrive (see AboutGuide)
      const onCue = (e: Event) => scene.react((e as CustomEvent<Parameters<typeof scene.react>[0]>).detail);
      window.addEventListener("avatar:react", onCue);
      let lastY = window.scrollY;
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        scene.setScroll(max > 0 ? window.scrollY / max : 0, window.scrollY - lastY);
        lastY = window.scrollY;
      };
      const size = () => scene.resize(canvas.clientWidth, canvas.clientHeight);
      const resize = new ResizeObserver(size);
      resize.observe(canvas);
      const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? scene.start() : scene.stop()));
      visibility.observe(canvas);
      window.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerdown", onDown);
      window.addEventListener("scroll", onScroll, { passive: true });
      size();
      onScroll();
      // Fade in once the model is in; if it can't load, the canvas just stays empty
      scene.ready.then(() => {
        if (disposed) return;
        size();
        canvas.dataset.ready = "true";
      }, (error) => console.error("Avatar failed to load", error));

      cleanup = () => {
        resize.disconnect();
        visibility.disconnect();
        window.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerdown", onDown);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("avatar:react", onCue);
        scene.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="A cartoon 3D version of Ahmed. Click it for a little trick."
      role="img"
      className={`block h-full w-full touch-pan-y opacity-0 transition-opacity duration-700 data-[ready=true]:opacity-100 ${className}`}
    />
  );
}
