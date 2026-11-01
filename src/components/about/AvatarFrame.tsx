"use client";

import { useEffect, useRef } from "react";
import Avatar from "./Avatar";

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

/**
 * The 3D me standing in its circle. The frame tilts toward the cursor like a card held up to you, and
 * the bust inside follows with its eyes and head. The circle clips the shoulders round (see
 * `.avatar-frame`), while the head is free to rise above it.
 */
export default function AvatarFrame({ className = "" }: { className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);

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
    <div className={`aspect-[4/5] [perspective:900px] ${className}`}>
      <div
        ref={frameRef}
        className="relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] [transform:rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))]"
      >
        <div aria-hidden className="avatar-circle absolute inset-x-0 bottom-0 aspect-square rounded-full" />
        <div className="avatar-frame absolute inset-0">
          <Avatar variant="student" />
        </div>
      </div>
    </div>
  );
}

