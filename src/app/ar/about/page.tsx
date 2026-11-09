import type { Metadata } from "next";
import AboutView, { ABOUT_DESCRIPTION } from "@/views/AboutView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "عني", description: ABOUT_DESCRIPTION.ar, path: "/about", lang: "ar" });

export default function ArabicAboutPage() {
  return <AboutView lang="ar" />;
}
