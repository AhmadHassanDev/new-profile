import type { CSSProperties } from "react";

/**
 * For a `.fit-heading` (globals.css): the length of the longest word across its lines, so the heading
 * sizes itself to fit that word in its container instead of breaking it or spilling out.
 */
export const fitLetters = (...lines: string[]) =>
  ({ "--letters": Math.max(...lines.join(" ").split(/\s+/).map((word) => word.length)) }) as CSSProperties;
