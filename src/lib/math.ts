/** Small easing and smoothing helpers shared by the 3D scenes and scroll effects. */

export const clamp = (v: number, lo = -1, hi = 1) => Math.max(lo, Math.min(hi, v));
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Eases 0..1 in and out (clamped outside that range) */
export const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

/** 0 below `a`, 1 above `b`, eased in between (GLSL's smoothstep) */
export const smoothstep = (a: number, b: number, x: number) => smooth((x - a) / (b - a));

/** Moves `from` toward `to` at `rate` per second, the same however long the frame took */
export const damp = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.exp(-rate * dt));
