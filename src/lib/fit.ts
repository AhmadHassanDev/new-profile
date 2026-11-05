import type { CSSProperties } from "react";

// The display face's capitals measure 0.77–0.9em a letter in real words; a little over, so the longest
// word always fits
const PER_LETTER = 0.92;

/**
 * For a `.fit-heading` (globals.css): the size at which the longest word across its lines just fits its
 * container's width, as a container-relative length. Worked out here rather than in CSS, because the
 * production CSS minifier drops a calc() that divides by a variable.
 */
export function fitLetters(...lines: string[]) {
  const longest = Math.max(...lines.join(" ").split(/\s+/).map((word) => word.length));
  return { "--fit": `${(100 / (longest * PER_LETTER)).toFixed(3)}cqw` } as CSSProperties;
}
