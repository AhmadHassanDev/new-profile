import type { Metadata, Viewport } from "next";
import { Figtree, Unbounded } from "next/font/google";
import JsonLd from "@/components/JsonLd";
import SmoothScroll from "@/components/SmoothScroll";
import { JOB_TITLE, KNOWS_ABOUT, NAME, OPEN_GRAPH, PERSON, SITE_DESCRIPTION, SITE_TITLE, SITE_URL, WEBSITE } from "@/lib/seo";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Pages give just their own name ("Work"); the template adds who it's by
  title: { default: SITE_TITLE, template: `%s — ${NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: NAME,
  authors: [{ name: NAME, url: SITE_URL }],
  creator: NAME,
  publisher: NAME,
  keywords: [NAME, JOB_TITLE, "Egyptian designer", ...KNOWS_ABOUT],
  // The share image comes from ./opengraph-image.tsx; each page adds its own title, URL and canonical
  openGraph: { ...OPEN_GRAPH, title: SITE_TITLE, description: SITE_DESCRIPTION },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  // Setting icons here turns off the file-based icons, so each is named: the square PNG first (the one
  // Google uses in search results), the logo as an SVG for browser tabs, and the iOS home-screen icon
  icons: {
    icon: [
      { url: "/icon", sizes: "480x480", type: "image/png" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: { url: "/apple-icon", sizes: "180x180", type: "image/png" },
  },
  // Keep iOS from turning the phone number and email into its own blue links
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = { themeColor: "#0a0a0d" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${figtree.variable} ${unbounded.variable} antialiased`}>
      <body className="min-h-full">
        {/* Without JavaScript, copy that scrolling would reveal shows straight away */}
        <noscript>
          <style>{`.scroll-word{opacity:1!important;color:var(--word,inherit)!important}.pipeline-step{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a href="#top" className="skip-link rounded-full bg-ink px-5 py-3 text-base font-semibold text-bg">
          Skip to content
        </a>
        <JsonLd graph={[PERSON, WEBSITE]} />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
