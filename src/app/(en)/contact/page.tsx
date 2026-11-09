import type { Metadata } from "next";
import ContactView, { CONTACT_DESCRIPTION } from "@/views/ContactView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Contact", description: CONTACT_DESCRIPTION.en, path: "/contact" });

export default function ContactPage() {
  return <ContactView lang="en" />;
}
