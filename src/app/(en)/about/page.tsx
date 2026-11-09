import type { Metadata } from "next";
import AboutView, { ABOUT_DESCRIPTION } from "@/views/AboutView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "About", description: ABOUT_DESCRIPTION.en, path: "/about" });

export default function AboutPage() {
  return <AboutView lang="en" />;
}
