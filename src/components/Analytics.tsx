"use client";

import Script from "next/script";
import { useEffect } from "react";
import { SOCIALS } from "@/content/site";
import { CONSENT_DEFAULTS, GTM_ID, track } from "@/lib/analytics";

const SOCIAL_HOSTS = new Map(SOCIALS.map((s) => [new URL(s.href).hostname.replace(/^www\./, ""), s.label]));

/**
 * Sets the consent defaults, loads the Tag Manager container and reports the clicks that matter for leads, from one listener on the page
 * instead of a handler on every link: email and WhatsApp, the CV, the socials and any other link out.
 */
export default function Analytics({ load }: { load: boolean }) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.href;
      if (href.startsWith("mailto:")) return track("contact_click", { method: "email" });
      if (href.startsWith("tel:")) return track("contact_click", { method: "phone" });
      const url = new URL(href, location.href);
      const host = url.hostname.replace(/^www\./, "");
      if (host === "wa.me" || host === "api.whatsapp.com") return track("contact_click", { method: "whatsapp" });
      if (a.hasAttribute("download") || url.pathname.endsWith(".pdf")) return track("cv_download", { file: url.pathname });
      if (url.origin === location.origin) return;
      const network = SOCIAL_HOSTS.get(host);
      if (network) return track("social_click", { network, link_url: href });
      track("outbound_click", { link_url: href });
    };
    // Capture, so a link whose own handler stops the event is still counted
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // The consent defaults go first in the same script, so they're always in the dataLayer before the container reads it.
  // Without the container (dev and previews) events and consent still land in the dataLayer, where nothing reads them.
  return (
    <Script id="gtm" strategy="afterInteractive">
      {CONSENT_DEFAULTS + (load ? GTM_SNIPPET : "")}
    </Script>
  );
}

const GTM_SNIPPET = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`;
