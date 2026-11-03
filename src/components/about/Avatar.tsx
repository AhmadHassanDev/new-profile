"use client";

import { useEffect, useRef } from "react";
import { freshCanvas } from "@/lib/canvas";

type Scene = import("./CharacterScene").CharacterScene;

/**
 * On phones, the 3D scene waits until the page has loaded and the browser is idle, so the text and layout
 * are usable first and the character arrives a beat later. Elsewhere it starts straight away.
 */
function afterSettling() {
  if (!window.matchMedia("(hover: none), (max-width: 767px)").matches) return Promise.resolve();
  const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => window.addEventListener("load", r, { once: true }));
  return loaded.then(() => new Promise<void>((r) => (window.requestIdleCallback ?? ((run) => window.setTimeout(run, 200)))(() => r(), { timeout: 1500 })));
}

/**
 * The 3D me: the rigged student character. It follows the cursor, reacts to scrolling, and does a trick
 * when clicked or tapped. The scene loads on its own after the page, and the page reads fine without it.
 */
export default function Avatar({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const placeholder = canvasRef.current;
    if (!placeholder) return;
    // A new canvas each time, never one whose context a previous run already gave back
    const { canvas, release } = freshCanvas(placeholder);
    let disposed = false;
    let cleanup = () => {};

    afterSettling().then(() => import("./CharacterScene")).then(({ CharacterScene, CHARACTERS }) => {
      if (disposed) return;
      let scene: Scene;
      try {
        scene = new CharacterScene(canvas, window.matchMedia("(prefers-reduced-motion: reduce)").matches, CHARACTERS.student);
      } catch {
        return; // No WebGL
      }
      // Pointer position in the canvas's own -1..1 space, even when it's outside the canvas
      const local = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        return [((e.clientX - rect.left) / rect.width) * 2 - 1, -(((e.clientY - rect.top) / rect.height) * 2 - 1)] as const;
      };
      const onMove = (e: PointerEvent) => {
        // Only a real cursor: a finger dragging to scroll shouldn't turn its head
        if (e.pointerType !== "mouse") return;
        const [x, y] = local(e);
        scene.setPointer(x, y);
        const over = scene.hit(x, y);
        canvas.style.cursor = over ? "pointer" : "";
        scene.setHover(over);
      };
      const onDown = (e: PointerEvent) => {
        const [x, y] = local(e);
        scene.setPointer(x, y);
        if (scene.hit(x, y)) scene.react();
      };
      // Chapters cue a reaction as they arrive (see AboutGuide)
      const onCue = (e: Event) => scene.react((e as CustomEvent<Parameters<typeof scene.react>[0]>).detail);
      window.addEventListener("avatar:react", onCue);
      // The page's scroll length is measured on resize, not on every scroll (that would force a layout each time)
      let lastY = window.scrollY;
      let max = 1;
      const measure = () => (max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
      const onScroll = () => {
        scene.setScroll(window.scrollY / max, window.scrollY - lastY);
        lastY = window.scrollY;
      };
      // Docked small in a phone's corner it doesn't need every frame (see AvatarFrame)
      const onPower = (e: Event) => scene.setLowPower((e as CustomEvent<boolean>).detail);
      window.addEventListener("avatar:power", onPower);
      const size = () => {
        measure();
        scene.resize(canvas.clientWidth, canvas.clientHeight);
      };
      const resize = new ResizeObserver(size);
      resize.observe(canvas);
      // Draws only while it's on screen and not faded out (the travelling frame bows out by the footer)
      let onScreen = false;
      let bowedOut = false;
      const run = () => (onScreen && !bowedOut ? scene.start() : scene.stop());
      const onBow = (e: Event) => {
        bowedOut = (e as CustomEvent<boolean>).detail;
        run();
      };
      window.addEventListener("avatar:bowed", onBow);
      const visibility = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        run();
      });
      visibility.observe(canvas);
      window.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerdown", onDown);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", measure);
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
        window.removeEventListener("resize", measure);
        window.removeEventListener("avatar:power", onPower);
        window.removeEventListener("avatar:bowed", onBow);
        window.removeEventListener("avatar:react", onCue);
        scene.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup();
      release();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-label="A cartoon 3D version of Ahmed"
      role="img"
      className={`block h-full w-full touch-pan-y opacity-0 transition-opacity duration-700 data-[ready=true]:opacity-100 ${className}`}
    />
  );
}
