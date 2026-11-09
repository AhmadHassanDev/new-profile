"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PrototypeFlow } from "@/content/cases";

/**
 * Clickable prototypes, drawn the way Figma shows them: screens on a canvas, each with the hotspot
 * that was wired, and a noodle from that hotspot to the screen it opens. A tap walks the flow on a
 * loop: the hotspot pulses, the noodle draws, a dot runs along it and the next screen lights up.
 */

// The canvas, in its own pixels; it's scaled to fit the column (and scrolls sideways on phones)
const SW = 172; // a screen's width
const SH = (SW * 852) / 393;
const GAP = 82;
const PAD = 48;
const TOP = 104; // room for the flow's header and the frame names
const LOOP = 64; // room under the screens for a flow that loops back
const STEP = 1500; // ms per tap

type Pt = { x: number; y: number };

export default function Prototypes({ title, flows }: { title?: string; flows: PrototypeFlow[] }) {
  return (
    <section className="py-8 md:py-12">
      {title && <h2 className="mb-6 px-4 font-display text-sm font-semibold tracking-wide text-muted uppercase md:mb-8 md:px-10">{title}</h2>}
      <div className="flex flex-col gap-6 px-4 md:gap-8 md:px-10">
        {flows.map((flow, i) => (
          <Flow key={flow.label} flow={flow} slots={Math.max(...flows.map((f) => f.screens.length))} delay={i * 700} />
        ))}
      </div>
    </section>
  );
}

// Every flow is laid out on the same width (`slots` screens), so they share one scale
function Flow({ flow, slots, delay }: { flow: PrototypeFlow; slots: number; delay: number }) {
  const n = flow.screens.length;
  const width = PAD * 2 + slots * SW + (slots - 1) * GAP;
  const height = TOP + SH + (flow.loop ? LOOP : 0) + PAD;
  const s = SW / 393;
  const x = (i: number) => PAD + i * (SW + GAP);

  // Each link starts at its hotspot's right edge (or the screen's, when the whole screen is the hotspot)
  const links = flow.screens.flatMap((screen, i) => {
    if (!screen.tap || (i === n - 1 && !flow.loop)) return [];
    const [hx, hy, hw, hh] = screen.tap;
    const whole = hw >= 390;
    const a: Pt = { x: x(i) + (whole ? SW : (hx + hw) * s), y: TOP + (whole ? SH / 2 : (hy + hh / 2) * s) };
    if (i < n - 1) {
      const b: Pt = { x: x(i + 1), y: TOP + 34 };
      const dx = Math.max(36, (b.x - a.x) / 2);
      return [{ from: i, to: i + 1, d: `M${a.x} ${a.y}C${a.x + dx} ${a.y} ${b.x - dx} ${b.y} ${b.x} ${b.y}`, start: a, end: b, up: false }];
    }
    // The way back: down under the row and along to the first screen, up into its bottom edge
    const floor = TOP + SH + LOOP * 0.62;
    const b: Pt = { x: x(0) + SW / 2, y: TOP + SH + 2 };
    return [
      {
        from: i,
        to: 0,
        d: `M${a.x} ${a.y}C${a.x + 70} ${a.y} ${a.x + 70} ${floor} ${a.x} ${floor}L${b.x + 40} ${floor}C${b.x} ${floor} ${b.x} ${floor} ${b.x} ${b.y}`,
        start: a,
        end: b,
        up: true,
      },
    ];
  });

  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [step, setStep] = useState(-1); // the link being tapped; -1 before it starts
  const [still, setStill] = useState(false);
  const dot = useRef<SVGCircleElement>(null);
  const paths = useRef<(SVGPathElement | null)[]>([]);

  // Fit the canvas to the column, but never so small it can't be read: phones scroll it instead
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(Math.max(0.56, Math.min(1, el.clientWidth / width)));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  // Tap through the flow while it's on screen
  useEffect(() => {
    const el = box.current;
    if (!el || !links.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = setTimeout(() => setStill(true), 0);
      return () => clearTimeout(id);
    }
    let timer = 0;
    let start = 0;
    const run = () => {
      setStep((current) => (current + 1) % links.length);
      timer = window.setTimeout(run, STEP);
    };
    const observer = new IntersectionObserver(([entry]) => {
      window.clearTimeout(timer);
      window.clearTimeout(start);
      if (entry.isIntersecting) start = window.setTimeout(run, 400 + delay);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      window.clearTimeout(start);
    };
  }, [links.length, delay]);

  // The dot runs the length of the noodle being tapped
  useEffect(() => {
    const path = paths.current[step];
    const circle = dot.current;
    if (!path || !circle) return;
    const length = path.getTotalLength();
    let frame = 0;
    const began = performance.now() + 180;
    const move = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - began) / 700));
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const p = path.getPointAtLength(eased * length);
      circle.setAttribute("cx", String(p.x));
      circle.setAttribute("cy", String(p.y));
      circle.style.opacity = t > 0 && t < 1 ? "1" : "0";
      if (t < 1) frame = requestAnimationFrame(move);
    };
    frame = requestAnimationFrame(move);
    return () => cancelAnimationFrame(frame);
  }, [step]);

  const active = step >= 0 ? links[step] : null;
  const here = active ? active.to : -1;

  return (
    <div
      ref={box}
      dir="ltr"
      className="proto-canvas relative overflow-x-auto overflow-y-hidden rounded-[28px] border border-line bg-surface/50 [scrollbar-width:none]"
    >
      <div style={{ width: width * scale, height: height * scale }}>
        <div
          role="img"
          aria-label={`${flow.label}: ${flow.screens.map((screen) => screen.label).join(" → ")}`}
          className="relative origin-top-left"
          style={{ width, height, transform: `scale(${scale})` }}
        >
          {/* The flow's header, like a prototype's name in Figma */}
          <div className="absolute flex items-center gap-3" style={{ left: PAD, top: 30 }}>
            <span className="grid size-7 place-items-center rounded-full bg-[var(--accent-2)] text-[#061417]">
              <svg aria-hidden width="10" height="12" viewBox="0 0 10 12">
                <path d="M1 1l8 5-8 5z" fill="currentColor" />
              </svg>
            </span>
            <span dir="auto" className="font-display text-[15px] font-semibold">{flow.label}</span>
            <span dir="auto" className="text-[13px] text-muted">{flow.detail}</span>
          </div>

          {/* Screens, their names and the hotspots that were wired */}
          {flow.screens.map((screen, i) => (
            <div key={screen.label + i} className="absolute" style={{ left: x(i), top: TOP, width: SW, height: SH }}>
              <span dir="auto" className="absolute -top-6 left-0 truncate text-[11px] font-medium text-muted" style={{ maxWidth: SW }}>
                {screen.label}
              </span>
              <div
                className={`relative h-full w-full overflow-hidden rounded-[18px] bg-bg shadow-[0_24px_50px_-20px_rgb(0_0_0/0.8)] ring-1 transition-[box-shadow] duration-500 ${
                  here === i ? "ring-2 ring-[var(--accent-2)] shadow-[0_0_0_6px_rgb(1_255_255/0.12),0_24px_50px_-20px_rgb(0_0_0/0.8)]" : "ring-white/10"
                }`}
              >
                <Image src={screen.src} alt="" width={393} height={852} sizes="180px" className="h-full w-full object-cover" />
                {screen.tap && (i < n - 1 || flow.loop) && (
                  <span
                    key={active?.from === i ? `tap-${step}` : "idle"}
                    className={`absolute rounded-[5px] ${screen.tap[2] >= 390 ? "proto-hotspot-whole" : "proto-hotspot"} ${active?.from === i ? "proto-tap" : ""}`}
                    style={{ left: screen.tap[0] * s, top: screen.tap[1] * s, width: screen.tap[2] * s, height: screen.tap[3] * s }}
                  />
                )}
              </div>
            </div>
          ))}

          {/* The noodles: all of them faint, the one being tapped drawn bright with the dot running it */}
          <svg aria-hidden className="pointer-events-none absolute inset-0 overflow-visible" width={width} height={height}>
            {links.map((link, i) => (
              <g key={i} className={still || step === i ? "proto-noodle-on" : ""}>
                <path ref={(el) => void (paths.current[i] = el)} d={link.d} className="proto-noodle" fill="none" />
                {step === i && <path key={`draw-${step}`} d={link.d} pathLength={1} className="proto-draw" fill="none" />}
                <circle cx={link.start.x} cy={link.start.y} r="3.5" className="proto-end" />
                <path
                  d={link.up ? `M${link.end.x - 5} ${link.end.y + 8}L${link.end.x} ${link.end.y}L${link.end.x + 5} ${link.end.y + 8}` : `M${link.end.x - 8} ${link.end.y - 5}L${link.end.x} ${link.end.y}L${link.end.x - 8} ${link.end.y + 5}`}
                  className="proto-arrow"
                  fill="none"
                />
              </g>
            ))}
            <circle ref={dot} r="5" className="proto-dot" style={{ opacity: 0 }} />
          </svg>
        </div>
      </div>
    </div>
  );
}
