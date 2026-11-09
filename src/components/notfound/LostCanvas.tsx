"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLang } from "@/i18n/LangProvider";
import { localePath, splitPath } from "@/i18n/lang";
import { ui } from "@/i18n/ui";

/**
 * The 404 as a design file: the page you asked for is an empty frame nobody ever designed, and its "404" has fallen
 * apart. Each digit is a layer you can drag (or nudge with the arrow keys) back into place, with the selection box,
 * distance measurements and snap guides of a design tool. Line them up and the frame ships. Meanwhile Ahmed's cursor
 * drifts in and leaves a comment with the ways back.
 */

const CHARS = ["4", "0", "4"] as const;
// Where the digits lie at first, as fractions of the frame (centres; past 1 is outside it), and how they're tipped
const SCATTER = [
  { u: 0.15, v: 0.84 },
  { u: 0.56, v: 0.64 },
  { u: 1.02, v: 0.06 },
];
const TILT = [-17, 9, 26];
const SNAP = 12; // px
const EASE = "cubic-bezier(.2,.8,.2,1)";

type Pt = { x: number; y: number };
type Spot = "away" | "zero" | "pin" | "frame"; // where Ahmed's cursor is
type Geo = {
  cw: number; // canvas
  ch: number;
  fx: number; // frame, relative to the canvas
  fy: number;
  fw: number;
  fh: number;
  sizes: { w: number; h: number }[];
  slots: Pt[]; // where each digit belongs, canvas px
  pin: Pt; // the comment's pin
};

export default function LostCanvas() {
  const lang = useLang();
  const t = ui(lang).notFound;
  const pathname = usePathname() ?? "/";
  const asked = decodePath(splitPath(pathname).path);

  const canvas = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const comment = useRef<HTMLDivElement>(null);
  const digits = useRef<(HTMLDivElement | null)[]>([]);
  const grab = useRef<{ i: number; dx: number; dy: number } | null>(null);

  const [geo, setGeo] = useState<Geo | null>(null);
  const [pos, setPos] = useState(SCATTER); // frame fractions, so a resize keeps the arrangement
  const [tilt, setTilt] = useState(TILT);
  const [selected, setSelected] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});
  const [touched, setTouched] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [open, setOpen] = useState(false);
  const [mate, setMate] = useState<{ spot: Spot; click: boolean; on: boolean }>({ spot: "away", click: false, on: false });

  // Measure the frame, size the digits to it, and work out where they belong
  const measure = useCallback(() => {
    const c = canvas.current;
    const f = frame.current;
    const k = comment.current;
    if (!c || !f || !k) return;
    const cr = c.getBoundingClientRect();
    const fr = f.getBoundingClientRect();
    const kr = k.getBoundingClientRect();
    c.style.setProperty("--digit", `${Math.min(fr.height * 0.6, fr.width * 0.29)}px`);
    const sizes = digits.current.map((d) => ({ w: d?.offsetWidth ?? 0, h: d?.offsetHeight ?? 0 }));
    const gap = sizes[0].h * 0.02;
    const total = sizes.reduce((s, d) => s + d.w, 0) + gap * 2;
    const fx = fr.left - cr.left;
    const fy = fr.top - cr.top;
    let x = fx + (fr.width - total) / 2;
    const slots = sizes.map((d) => {
      const slot = { x: x + d.w / 2, y: fy + fr.height / 2 };
      x += d.w + gap;
      return slot;
    });
    setGeo({
      cw: cr.width,
      ch: cr.height,
      fx,
      fy,
      fw: fr.width,
      fh: fr.height,
      sizes,
      slots,
      // The pin sits at the comment's start corner: top left, or top right in Arabic
      pin: {
        x: getComputedStyle(k).direction === "rtl" ? kr.right - cr.left - 16 : kr.left - cr.left + 16,
        y: kr.top - cr.top + 16,
      },
    });
  }, []);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(measure);
    if (canvas.current) observer.observe(canvas.current);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [measure]);

  // A digit's centre in canvas px, kept on the canvas
  const centre = (i: number, p = pos[i], g = geo): Pt => {
    if (!g) return { x: 0, y: 0 };
    const { w, h } = g.sizes[i];
    return {
      x: clamp(g.fx + p.u * g.fw, w / 2 + 8, g.cw - w / 2 - 8),
      y: clamp(g.fy + p.v * g.fh, h / 2 + 8, g.ch - h / 2 - 8),
    };
  };

  // Snap a centre onto a matching slot (the two 4s can swap) when it's close
  const snap = (i: number, p: Pt, g: Geo, reach = SNAP) => {
    const out = { ...p };
    const lines: { x?: number; y?: number } = {};
    for (const [j, s] of g.slots.entries()) {
      if (CHARS[j] !== CHARS[i]) continue;
      if (Math.abs(p.x - s.x) < reach) [out.x, lines.x] = [s.x, s.x];
      if (Math.abs(p.y - s.y) < reach) [out.y, lines.y] = [s.y, s.y];
    }
    return { p: out, lines };
  };

  const place = (i: number, p: Pt, g: Geo) =>
    setPos((all) => all.map((q, j) => (j === i ? { u: (p.x - g.fx) / g.fw, v: (p.y - g.fy) / g.fh } : q)));

  // Fixed once every slot holds the right digit
  useEffect(() => {
    if (!geo || dragging !== null || fixed) return;
    const filled = new Set<number>();
    pos.forEach((p, i) => {
      const c = { x: geo.fx + p.u * geo.fw, y: geo.fy + p.v * geo.fh };
      geo.slots.forEach((s, j) => {
        if (CHARS[j] === CHARS[i] && Math.hypot(c.x - s.x, c.y - s.y) < 1.5) filled.add(j);
      });
    });
    if (filled.size !== CHARS.length) return;
    const id = setTimeout(() => {
      setFixed(true);
      setSelected(null);
    }, 120);
    return () => clearTimeout(id);
  }, [pos, geo, dragging, fixed]);

  const pick = (i: number) => {
    setSelected(i);
    setTouched(true);
    setTilt((all) => all.map((a, j) => (j === i ? 0 : a)));
  };

  const onDown = (i: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (!geo || fixed) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const c = centre(i);
    const r = canvas.current!.getBoundingClientRect();
    grab.current = { i, dx: e.clientX - r.left - c.x, dy: e.clientY - r.top - c.y };
    pick(i);
    setDragging(i);
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = grab.current;
    if (!g || !geo) return;
    const r = canvas.current!.getBoundingClientRect();
    const { p, lines } = snap(g.i, { x: e.clientX - r.left - g.dx, y: e.clientY - r.top - g.dy }, geo);
    setGuides(lines);
    place(g.i, p, geo);
  };

  const onUp = () => {
    grab.current = null;
    setDragging(null);
    setGuides({});
  };

  // Arrow keys nudge the layer a pixel (ten with Shift), like any design tool
  const onKey = (i: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!step || !geo || fixed) return;
    e.preventDefault();
    pick(i);
    const n = e.shiftKey ? 10 : 1;
    const c = centre(i);
    place(i, snap(i, { x: c.x + step[0] * n, y: c.y + step[1] * n }, geo, 3).p, geo);
  };

  const scatter = () => {
    setFixed(false);
    setPos(SCATTER);
    setTilt(TILT);
    setSelected(null);
  };

  // Ahmed drops in: looks over the broken 404, then pins the comment. Reduced motion skips straight to the comment.
  const ready = geo !== null;
  useEffect(() => {
    if (!ready) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    if (still) {
      at(0, () => setOpen(true));
      return () => timers.forEach(clearTimeout);
    }
    at(500, () => setMate((m) => ({ ...m, on: true, spot: "zero" })));
    at(2100, () => setMate((m) => ({ ...m, spot: "pin" })));
    at(3300, () => setMate((m) => ({ ...m, click: true })));
    at(3450, () => {
      setOpen(true);
      setMate((m) => ({ ...m, click: false }));
    });
    return () => timers.forEach(clearTimeout);
  }, [ready]);

  // Fixed: Ahmed comes over to look, then goes back to his comment
  useEffect(() => {
    if (!fixed) return;
    const a = setTimeout(() => setMate((m) => ({ ...m, spot: "frame" })), 250);
    const b = setTimeout(() => setMate((m) => ({ ...m, spot: "pin" })), 1900);
    return () => [a, b].forEach(clearTimeout);
  }, [fixed]);

  const mateAt = (): Pt => {
    if (!geo) return { x: -80, y: -80 };
    if (mate.spot === "zero") return { x: centre(1).x + 30, y: centre(1).y + 20 };
    if (mate.spot === "pin") return geo.pin;
    if (mate.spot === "frame") return { x: geo.fx + geo.fw * 0.62, y: geo.fy + geo.fh * 0.22 };
    return { x: geo.cw + 60, y: geo.ch * 0.8 };
  };

  const box = selected !== null && geo ? rect(centre(selected), geo.sizes[selected]) : null;
  const drag = dragging !== null && geo ? rect(centre(dragging), geo.sizes[dragging]) : null;
  const [before, after] = (fixed ? t.fixedBody : t.body).split("{path}");

  return (
    <div
      ref={canvas}
      dir={lang === "ar" ? "rtl" : "ltr"}
      onPointerDown={(e) => e.target === e.currentTarget && setSelected(null)}
      className="lost-canvas relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pt-32 pb-24 md:px-10"
    >
      {/* Layers */}
      <aside
        aria-hidden
        className="absolute start-6 top-1/2 hidden w-56 -translate-y-1/2 rounded-2xl border border-line bg-surface/80 p-3 text-[13px] backdrop-blur-md xl:block"
      >
        <p className="px-2 pt-1 pb-3 text-[11px] font-semibold tracking-wide text-muted uppercase rtl:tracking-normal">{t.layers}</p>
        <p className="flex items-center gap-2 rounded-lg px-2 py-1.5 font-medium">
          <FrameIcon />
          <span dir="ltr" className="truncate">
            {asked}
          </span>
        </p>
        <ul className="ms-4 border-s border-line ps-2">
          {CHARS.map((ch, i) => (
            <li key={i}>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => !fixed && pick(i)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start transition-colors ${
                  selected === i ? "bg-violet/20 text-ink" : "text-muted hover:bg-white/5 hover:text-ink"
                }`}
              >
                <span className="font-display text-[11px] text-muted">T</span>
                {ch}
              </button>
            </li>
          ))}
          <li className="flex items-center gap-2 px-2 py-1.5 text-muted/60" title={t.hidden}>
            <span className="h-3 w-3 rounded-[3px] border border-dashed border-current" />
            <span className="truncate line-through">{t.wanted}</span>
            <EyeOff />
          </li>
        </ul>
      </aside>

      <div className="relative w-full max-w-[760px] xl:max-w-[min(760px,calc(100vw-660px))]">
        {/* The frame */}
        <div className="mb-2 flex items-center justify-between gap-4 text-xs text-muted">
          <span className={`flex min-w-0 items-center gap-1.5 ${fixed ? "text-ink" : ""}`}>
            <FrameIcon />
            <span dir="ltr" className="truncate">
              {asked}
            </span>
          </span>
          {geo && (
            <span dir="ltr" className="shrink-0 tabular-nums">
              {Math.round(geo.fw)} × {Math.round(geo.fh)}
            </span>
          )}
        </div>
        <div
          ref={frame}
          className={`relative h-[clamp(220px,44svh,440px)] w-full rounded-[4px] bg-surface transition-[box-shadow,background-color] duration-700 ${
            fixed ? "lost-shipped" : "ring-1 ring-line"
          }`}
        >
          <p
            aria-hidden
            className={`absolute inset-x-0 bottom-4 text-center text-xs text-muted/70 transition-opacity duration-500 ${touched ? "opacity-0" : ""}`}
          >
            {t.hint}
          </p>
        </div>

        {/* Ahmed's comment: beside the frame on wide screens, under it otherwise */}
        <div
          ref={comment}
          className="relative mt-8 w-full max-w-sm xl:absolute xl:start-[calc(100%-28px)] xl:top-[54%] xl:mt-0 xl:w-[300px]"
        >
          <span
            aria-hidden
            className="absolute top-0 start-0 z-10 grid h-8 w-8 place-items-center rounded-full rounded-ss-none bg-violet text-[13px] font-bold text-bg ring-2 ring-bg"
          >
            {t.name.slice(0, 1)}
          </span>
          <div
            inert={!open}
            className={`ms-5 mt-5 origin-top-left rounded-2xl rounded-ss-sm border border-line bg-surface-2/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-md transition-[opacity,transform] duration-500 rtl:origin-top-right ${
              open ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
            style={{ transitionTimingFunction: EASE }}
          >
            <p className="flex items-baseline gap-2 text-sm">
              <span className="font-semibold">{t.name}</span>
              <span className="text-xs text-muted">{t.time}</span>
            </p>
            <p aria-live="polite" className="mt-1.5 text-[15px] leading-relaxed text-ink/90">
              {before}
              {after !== undefined && (
                <>
                  <code dir="ltr" className="rounded bg-white/5 px-1.5 py-0.5 text-[13px] text-violet">
                    {asked}
                  </code>
                  {after}
                </>
              )}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={localePath(lang, "/work")}
                className="inline-flex items-center rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-bg transition-transform duration-300 hover:scale-[1.04]"
              >
                {t.work}
              </Link>
              <Link
                href={localePath(lang, "/")}
                className="inline-flex items-center rounded-full border border-line px-4 py-2.5 text-sm font-semibold transition-colors duration-300 hover:border-ink"
              >
                {t.home}
              </Link>
              {fixed && (
                <button
                  type="button"
                  onClick={scatter}
                  className="inline-flex items-center px-2 py-2.5 text-sm font-medium text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
                >
                  {t.again}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Snap guides */}
      {geo && guides.x !== undefined && (
        <span aria-hidden className="pointer-events-none absolute w-px bg-coral" style={{ left: guides.x, top: geo.fy, height: geo.fh }} />
      )}
      {geo && guides.y !== undefined && (
        <span aria-hidden className="pointer-events-none absolute h-px bg-coral" style={{ top: guides.y, left: geo.fx, width: geo.fw }} />
      )}

      {/* Distances from the frame's edges while dragging */}
      {geo && drag && <Measure from={geo.fx} to={drag.l} at={drag.y} axis="x" />}
      {geo && drag && <Measure from={geo.fy} to={drag.t} at={drag.x} axis="y" />}

      {/* The digits */}
      {CHARS.map((ch, i) => {
        const c = centre(i);
        const s = geo?.sizes[i] ?? { w: 0, h: 0 };
        return (
          <div
            key={i}
            ref={(el) => {
              digits.current[i] = el;
            }}
            role="button"
            tabIndex={fixed ? -1 : 0}
            aria-label={`${t.layer} ${ch}`}
            data-cursor={fixed ? undefined : t.drag}
            onPointerDown={onDown(i)}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onKeyDown={onKey(i)}
            onFocus={() => !fixed && pick(i)}
            className="lost-layer absolute top-0 left-0 z-10 touch-none select-none outline-none"
            style={{
              transform: `translate(${c.x - s.w / 2}px, ${c.y - s.h / 2}px)`,
              transition: dragging === i ? "none" : `transform .55s ${EASE}`,
              opacity: geo ? 1 : 0,
            }}
          >
            <span
              className={`block px-[0.04em] font-display text-[length:var(--digit)] leading-none font-bold ${
                fixed ? "text-spectrum animate-shimmer" : "text-ink"
              }`}
              style={{ transform: `rotate(${tilt[i]}deg)`, transition: `transform .45s ${EASE}` }}
            >
              {ch}
            </span>
          </div>
        );
      })}

      {/* Selection: box, handles and size */}
      {box && geo && (
        <div
          aria-hidden
          className="pointer-events-none absolute z-20 border border-violet"
          style={{ left: box.l, top: box.t, width: box.w, height: box.h, transition: dragging !== null ? "none" : `all .55s ${EASE}` }}
        >
          {["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map((p) => (
            <span key={p} className={`absolute h-2 w-2 border border-violet bg-ink ${p}`} />
          ))}
          <span
            dir="ltr"
            className="absolute -bottom-7 left-1/2 -translate-x-1/2 rounded bg-violet px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-bg tabular-nums"
          >
            {Math.round(box.w)} × {Math.round(box.h)}
          </span>
        </div>
      )}

      {/* Ahmed's cursor */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-30"
        style={{
          transform: `translate(${mateAt().x}px, ${mateAt().y}px)`,
          transition: `transform 1.25s cubic-bezier(.65,0,.35,1), opacity .4s`,
          opacity: mate.on ? 1 : 0,
        }}
      >
        <svg
          width="22"
          height="24"
          viewBox="0 0 22 24"
          className="drop-shadow-lg transition-transform duration-150"
          style={{ transform: mate.click ? "scale(.82)" : "none" }}
        >
          <path d="M2 2l17 8.5-7.4 2.1L8.4 21z" fill="var(--violet)" stroke="var(--ink)" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
        {/* Its name tag hides once it rests on the comment, which already says who it is */}
        <span
          className={`absolute top-5 left-4 rounded-full rounded-tl-sm bg-violet px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-bg transition-opacity duration-300 ${
            mate.spot === "pin" && open ? "opacity-0" : ""
          }`}
        >
          {t.name}
        </span>
      </div>
    </div>
  );
}

/** A red distance line with its value, between a frame edge and the dragged layer */
function Measure({ from, to, at, axis }: { from: number; to: number; at: number; axis: "x" | "y" }) {
  const d = Math.round(to - from);
  if (d <= 0) return null;
  const line = axis === "x" ? { left: from, top: at, width: d, height: 1 } : { left: at, top: from, width: 1, height: d };
  return (
    <span aria-hidden className="pointer-events-none absolute z-20 bg-coral" style={line}>
      <span
        dir="ltr"
        className={`absolute rounded bg-coral px-1 py-px text-[10px] font-semibold text-ink tabular-nums ${
          axis === "x" ? "-top-5 left-1/2 -translate-x-1/2" : "top-1/2 left-2 -translate-y-1/2"
        }`}
      >
        {d}
      </span>
    </span>
  );
}

function FrameIcon() {
  return (
    <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" className="shrink-0" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M3.5 0v12M8.5 0v12M0 3.5h12M0 8.5h12" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg aria-hidden width="14" height="14" viewBox="0 0 16 16" className="ms-auto shrink-0" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M2 8s2.2-4 6-4 6 4 6 4-2.2 4-6 4-6-4-6-4z" />
      <circle cx="8" cy="8" r="1.8" />
      <path d="M2.5 13.5l11-11" />
    </svg>
  );
}

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), Math.max(lo, hi));

const rect = (c: Pt, s: { w: number; h: number }) => ({ l: c.x - s.w / 2, t: c.y - s.h / 2, w: s.w, h: s.h, x: c.x, y: c.y });

function decodePath(path: string) {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}
