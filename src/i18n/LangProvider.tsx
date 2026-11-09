"use client";

import { createContext, useContext } from "react";
import type { Lang } from "./lang";

const LangContext = createContext<Lang>("en");

/** Set once in each root layout; client components read it with useLang() */
export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext value={lang}>{children}</LangContext>;
}

export const useLang = () => useContext(LangContext);
