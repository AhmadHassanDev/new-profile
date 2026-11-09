import { notFound } from "next/navigation";

// Any address this language doesn't have lands here, so the 404 renders inside its own layout (each language has a
// root layout of its own, so there's no app-wide one to fall back to). It only ever 404s: nothing to validate.
export const instant = false;

export default function Missing() {
  notFound();
}
