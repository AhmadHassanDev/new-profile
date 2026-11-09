import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import RootShell from "@/components/RootShell";
import { rootMetadata } from "@/lib/seo";
import "../globals.css";

// Cairo carries both the body and the display type in Arabic (globals.css points the English font variables at it)
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = rootMetadata("ar");

export const viewport: Viewport = { themeColor: "#0a0a0d" };

export default function ArabicRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootShell lang="ar" fonts={cairo.variable}>
      {children}
    </RootShell>
  );
}
