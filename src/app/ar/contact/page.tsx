import type { Metadata } from "next";
import ContactView, { CONTACT_DESCRIPTION } from "@/views/ContactView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "كلمني", description: CONTACT_DESCRIPTION.ar, path: "/contact", lang: "ar" });

export default function ArabicContactPage() {
  return <ContactView lang="ar" />;
}
