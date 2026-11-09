import { Suspense } from "react";
import Analytics from "@/components/Analytics";
import CookieBanner from "@/components/CookieBanner";
import JsonLd from "@/components/JsonLd";
import SmoothScroll from "@/components/SmoothScroll";
import { dirOf, type Lang } from "@/i18n/lang";
import { LangProvider } from "@/i18n/LangProvider";
import { LOW_POWER_CHECK } from "@/lib/motion";
import { PERSON, WEBSITE } from "@/lib/seo";

/**
 * The <html> and <body> both root layouts share: English at app/(en)/layout.tsx and Arabic at app/ar/layout.tsx.
 * Each passes its own fonts; the language sets lang and dir from the first byte.
 */
export default function RootShell({ lang, fonts, children }: { lang: Lang; fonts: string; children: React.ReactNode }) {
  return (
    // The low-power check below may mark <html> before React takes over
    <html lang={lang} dir={dirOf(lang)} className={`${fonts} antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: LOW_POWER_CHECK }} />
        {/* Without JavaScript, copy that scrolling would reveal shows straight away */}
        <noscript>
          <style>{`.scroll-word{opacity:1!important;color:var(--word,inherit)!important}.pipeline-step{opacity:1!important;transform:none!important}.timeline-fill{transform:none!important}.timeline-copy{opacity:1!important}`}</style>
        </noscript>
        <a href="#top" className="skip-link rounded-full bg-ink px-5 py-3 text-base font-semibold text-bg">
          {lang === "ar" ? "اتنقل للمحتوى" : "Skip to content"}
        </a>
        <JsonLd graph={[PERSON, WEBSITE]} />
        <LangProvider lang={lang}>
          {/* It reads the pathname, which can't always be known while prerendering; it renders nothing anyway */}
          <Suspense fallback={null}>
            <SmoothScroll />
          </Suspense>
          {children}
          {/* Tag Manager loads on the live site only, so local dev and Vercel previews don't count as visits */}
          <Analytics load={process.env.VERCEL_ENV === "production"} />
          <CookieBanner />
        </LangProvider>
      </body>
    </html>
  );
}
