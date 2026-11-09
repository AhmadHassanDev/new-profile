import type { Metadata, Viewport } from "next";
import { Cairo, Figtree, Unbounded } from "next/font/google";
import RootShell from "@/components/RootShell";
import { rootMetadata } from "@/lib/seo";
import "../globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
});

// Only for the bits of Arabic on English pages (the language switch): not preloaded, so it's fetched when one shows
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  preload: false,
});

export const metadata: Metadata = rootMetadata("en");

export const viewport: Viewport = { themeColor: "#0a0a0d" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootShell lang="en" fonts={`${figtree.variable} ${unbounded.variable} ${cairo.variable}`}>
      {children}
    </RootShell>
  );
}
